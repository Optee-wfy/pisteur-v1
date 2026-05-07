import { effect, inject, Injectable, signal } from "@angular/core";
import {
  OPERATION_TYPES_ARR,
  OperationPipeline,
  OperationType,
  PRO_MARKETPLACE_PHASES_SHOULD_HAVE_QUOTES,
  QuoteStage,
  UserType,
  WAITING_FOR_QUOTE_LABEL,
  type OperationHubspotPrestationId,
} from "@optee/constants";
import type { OperationUuid, ProUuid } from "@optee/models";
import {
  Client,
  Location,
  LocationUuid,
  OperationFull,
  OperationRow,
  Pro,
} from "@optee/models";
import { ToastService } from "@optee/ui/services/toast.service";
import type { FileDto } from "@optee/utils";
import { dateOnly, isNotNullish } from "@optee/utils";

import { DatePipe } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DialogConfirmationComponent, DialogService } from "@optee/dialog";
import {
  filter,
  map,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  take,
} from "rxjs";
import { z } from "zod";
import trpcClient, { TRPC_SKIP_BATCH_KEY } from "../../trpc-client";
import { SupabaseService } from "../supabase.service";
import { AppService } from "./app.service";
import { AuthService } from "./auth.service";
import { LocalStorageService } from "./local-storage.service";
import { LocationService } from "./location.service";

export enum Tab {
  GENERAL_INFO = "general_info",
  SCORE = "score",
  DOCUMENTS = "documents",
}
type FetchedOperation = Awaited<
  ReturnType<
    | typeof trpcClient.operations.getAllHydratedForClient.query
    | typeof trpcClient.operations.getAllHydratedForPro.query
  >
>[number];

@Injectable({ providedIn: "root" })
export class OperationService {
  private readonly toastService = inject(ToastService);
  private readonly locationService = inject(LocationService);
  private readonly appService = inject(AppService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly dialogService = inject(DialogService);
  private readonly authService = inject(AuthService);

  readonly operation = signal<OperationRow | OperationFull | null>(null);
  readonly selectedTab = signal<Tab | null>(Tab.GENERAL_INFO);
  readonly briefPromises: Record<OperationUuid, Promise<boolean>> = {};

  private readonly refreshAll$ = new Subject<void>();

  private readonly storageKeys = {
    activeLocationUuid: "activeLocationUuid",
  } as const;

  readonly activeLocationUuid = signal<LocationUuid | null>(
    this.getStoredLocationUuid(),
  );

  private readonly syncActiveLocation = effect(() =>
    this.syncStorage(
      this.storageKeys.activeLocationUuid,
      this.activeLocationUuid(),
    ),
  );

  readonly all$ = this.refreshAll$.pipe(
    startWith(""),
    switchMap(() => SupabaseService.isAuthenticated$),
    switchMap((isAuthenticated) =>
      isAuthenticated ? this.authService.loggedAs$ : of(null),
    ),
    switchMap((loggedAs) =>
      loggedAs ? this.getAllByLoggedUser(loggedAs) : of([]),
    ),
    map((rows) => rows.filter(isNotNullish)),
    shareReplay(1),
  );

  readonly allDiscoverable$ = this.refreshAll$.pipe(
    startWith(""),
    switchMap(() => SupabaseService.isAuthenticated$),
    switchMap((isAuthenticated) =>
      isAuthenticated ? this.authService.loggedAs$ : of(null),
    ),
    switchMap((loggedAs) =>
      loggedAs && loggedAs === UserType.PRO ? this.discoverAllForPro() : of([]),
    ),
    map((rows) => rows.filter(isNotNullish)),
    shareReplay(1),
  );

  getCompatibleOperationsByLocation(location: Location) {
    if (!location) {
      return [];
    }

    const filteredOperationTypes = OPERATION_TYPES_ARR.filter(
      (ot) => ot.type !== OperationType.CONTRACT,
    ).map((ot) => ({
      ...ot,
      items: ot.subTypes.filter((st) =>
        location.isCompatibleWithOperation(st.hsPrestationId),
      ),
    }));

    return filteredOperationTypes.filter((ot) => ot.items.length);
  }

  readonly subInitActiveLocation = this.locationService.allForClient$
    .pipe(
      filter((locations) => locations.length > 0),
      take(1),
    )
    .subscribe((locations) => {
      const firstLocation = locations[0]?.uuid;

      if (
        !this.activeLocationUuid() &&
        locations.length === 1 &&
        firstLocation
      ) {
        this.activeLocationUuid.set(firstLocation);
      }
    });

  /**
   * Set the operation to show (used by operation panel)
   * @param operationUuid identifier of the operation
   */
  async showPanel(operation: OperationRow | OperationFull) {
    if (this.isOperationFull(operation) || operation.isSimulation) {
      this.operation.set(operation);
    } else {
      const hydratedOperation = await this.get(operation.uuid);

      if (!hydratedOperation) {
        return;
      }

      this.operation.set(hydratedOperation);
    }
  }

  async get(operationUuid: OperationUuid) {
    try {
      const res = await trpcClient.operations.get.query(operationUuid);

      if (!res) {
        throw new Error("Cette opération ne semble pas exister");
      }

      const { hsOperation, hsLocation, hsPro, signatoryContact } = res;

      if (!hsLocation) {
        throw new Error("Cette opération n'est liée à aucun site");
      }

      const location = Location.init(hsLocation);
      const pro = hsPro ? Pro.init(hsPro) : null;

      if (!location) {
        throw new Error(
          "Le site lié à cette opération semble invalide ou incomplet",
        );
      }

      const displayFor = this.localStorageService.safeGet(
        "loggedAs",
        z.nativeEnum(UserType),
      );

      const operationFull = new OperationFull(
        hsOperation,
        location,
        pro,
        signatoryContact,
        displayFor ?? undefined,
      );

      return operationFull;
    } catch (err) {
      this.toastService.openError("Récupération de l'opération", err);
      return null;
    }
  }

  async canLaunchOperation({
    hsPrestationId,
    locationUuid,
    operationUuid,
  }: {
    hsPrestationId: OperationHubspotPrestationId;
    locationUuid: LocationUuid;
    operationUuid?: OperationUuid | null;
  }) {
    const existingOperation =
      await trpcClient.operations.getByActivePrestationAndLocation.query({
        hsPrestationId,
        locationUuid,
        operationUuid,
      });

    if (!existingOperation) {
      return true;
    }

    const launchedDate = existingOperation.launchingDate
      ? ` le ${new DatePipe("fr-FR").transform(new Date(existingOperation.launchingDate), "dd/MM/yyyy")}`
      : "";

    const { res: confirmed } = await this.dialogService.open(
      DialogConfirmationComponent,
      {
        data: {
          title: "Lancer cette opération ?",
          description: `Cette opération a déjà été lancée${launchedDate}. Êtes-vous sûr de vouloir en commander une nouvelle ? Un nouvel appel d’offres sera déclenché.`,
          cancelButtonLabel: "Annuler la commande",
          action: "Lancer une seconde fois",
        },
      },
    );

    return !!confirmed;
  }

  clearActiveLocationUuid() {
    this.localStorageService.clear(this.storageKeys.activeLocationUuid);
    this.activeLocationUuid.set(null);
  }

  private async getAllByLoggedUser(loggedAs: UserType | null) {
    try {
      if (!loggedAs) {
        return [];
      }

      const rows =
        loggedAs === UserType.PRO
          ? await this.getAllForPro()
          : await this.getAllForClient();

      return rows;
    } catch (err) {
      this.toastService.openError("Récupération des opérations", err);
      return [];
    }
  }

  private async getAllForPro() {
    try {
      const rows = await trpcClient.operations.getAllHydratedForPro.query();
      return this.processRows(rows, UserType.PRO);
    } catch (err) {
      this.toastService.openError("Récupération des opérations", err);
      return [];
    }
  }

  private async getAllForClient() {
    try {
      const rows = await trpcClient.operations.getAllHydratedForClient.query();
      return this.processRows(rows, UserType.CLIENT);
    } catch (err) {
      this.toastService.openError("Récupération des opérations", err);
      return [];
    }
  }

  private async processRows(rows: FetchedOperation[], userType: UserType) {
    const proUuid =
      userType === UserType.PRO
        ? (await trpcClient.pros.getByLoggedPro.query())?.uuid
        : null;

    const uniqueOperationsUuids = Array.from(
      new Set(rows.map((row) => row.hsOperation.uuid)),
    );

    const uniqueRows = uniqueOperationsUuids
      .map((uuid) => rows.find((row) => row.hsOperation.uuid === uuid))
      .filter(isNotNullish);

    return uniqueRows
      .map((row) => {
        // Check valid location
        try {
          if (!row.hsLocation) {
            throw new Error(`L'opération  n'est liée à aucun site.`);
          }

          const location = Location.init(row.hsLocation);

          if (!location) {
            throw new Error(`Le bâtiment n'est pas valide.`);
          }

          // Set client if available
          const client =
            "hsClient" in row && row.hsClient
              ? Client.init(row.hsClient)
              : null;

          // Init operation for user
          const operation = OperationRow.initWithAssociations({
            input: row.hsOperation,
            location,
            displayFor: userType,
            client,
            proUuid: row.proUuid,
          });

          // Hide invalid or invisible operation (defined in operation phase)
          if (!operation || !operation.phase.visibleInApp) {
            return null;
          }

          if (
            userType === UserType.PRO &&
            operation.proUuid &&
            operation.proUuid !== proUuid
          ) {
            operation.phase.category = "archived";
          }

          if (
            PRO_MARKETPLACE_PHASES_SHOULD_HAVE_QUOTES.includes(
              operation.phase.enum,
            ) &&
            "quote" in row &&
            row.quote?.noteUuid === null &&
            row.quote.stage !== QuoteStage.EN_ATTENTE_DE_SIGNATURE // If there is no noteUuid but the quote is at "en attente de signature" stage, we consider the quote is there but normally it shouldn't happen
          ) {
            return { operation, missingProQuoteUuid: row.quote?.uuid };
          }

          return { operation, missingProQuoteUuid: null };
        } catch (error) {
          console.error(
            `Erreur lors du traitement de l'opération ${row.hsOperation.name} (${row.hsOperation.uuid}) ${error instanceof Error ? error.message : error}`,
          );
          return null;
        }
      })
      .filter(isNotNullish);
  }

  isOperationFull(
    operation: OperationRow | OperationFull,
  ): operation is OperationFull {
    return operation instanceof OperationFull;
  }

  async showSimulationLoader(operations: OperationRow[]) {
    const sortedOperations = this.sortForSimulation(operations);

    const simulableOperations = sortedOperations
      .filter((r) => r.hasRequiredDataForSimulation)
      .map((r) => r.operation);

    this.appService.isLoading.set(true);

    try {
      await trpcClient.operations.updateCalculations.mutate({
        operationUuids: simulableOperations.map((o) => o.uuid),
      });
    } catch (err) {
      this.toastService.openError("Mise à jour des calculs", err);
    } finally {
      this.appService.isLoading.set(false);
    }
  }

  sortForSimulation(operations: OperationRow[]) {
    return operations.map((o) => ({
      operation: o,
      needsSimulation: o.needsSimulation,
      hasRequiredDataForSimulation:
        !o.location.needsBdnbCheck &&
        !o.location.bdnbFailure &&
        o.missingXFactors.length === 0,
    }));
  }

  refresh() {
    this.refreshAll$.next();
  }

  closePanel() {
    this.operation.set(null);
    this.selectedTab.set(null);
  }

  async createByClient({
    hsPrestationId,
    isFunding,
    locationUuid,
    plannedLaunchDate,
    files,
  }: {
    hsPrestationId: OperationHubspotPrestationId;
    isFunding: boolean;
    locationUuid: LocationUuid;
    plannedLaunchDate?: Date;
    files?: FileDto[];
  }) {
    const result = await trpcClient.operations.createByClient.mutate({
      hsPrestationId,
      isFunding,
      locationUuid,
      plannedLaunchDate: plannedLaunchDate ? dateOnly(plannedLaunchDate) : null,
      files,
    });

    // Never add a "await" here. We don't want to wait for that
    this.updateMissingBrief(result.operationUuid);

    return result.operationUuid;
  }

  updateMissingBrief(operationUuid: OperationUuid) {
    // Never add a "await" here. We don't want to wait for that
    this.briefPromises[operationUuid] = trpcClient.operations.updateMissingBrief
      .mutate(
        {
          uuid: operationUuid,
        },
        {
          context: {
            [TRPC_SKIP_BATCH_KEY]: true,
          },
        },
      )
      .then(() => {
        delete this.briefPromises[operationUuid];
        return Promise.resolve(true);
      });

    return this.briefPromises[operationUuid];
  }

  getOperationStatusLabel({
    operation,
    loggedAsPro,
    currentProUuid,
    isMissingProQuote = false,
  }: {
    operation: OperationRow;
    loggedAsPro: boolean;
    currentProUuid: ProUuid | null;
    isMissingProQuote?: boolean;
  }) {
    if (loggedAsPro) {
      const isProAndRejected =
        currentProUuid &&
        operation.proUuid &&
        !operation.isRetainedPro(currentProUuid);
      if (isProAndRejected) {
        return "Opportunité perdue";
      }
      if (operation.phase.pipeline === OperationPipeline.FINALISATION_CEE) {
        return "📂 Traitement des aides";
      }
      if (isMissingProQuote) {
        return WAITING_FOR_QUOTE_LABEL;
      }
    }

    return operation.status.label;
  }

  async discoverAllForPro() {
    try {
      const rows = await trpcClient.operations.getAllCompatibleWithPro.query();

      const operations = rows.map((row) => {
        try {
          const location = Location.init(row.location);

          if (!location) {
            throw new Error(
              `Location with uuid ${row.location.uuid} could not be initialized.`,
            );
          }

          const operation = OperationRow.initWithAssociations({
            input: row,
            location,
            displayFor: UserType.PRO,
          });

          if (!operation) {
            throw new Error(
              `Operation with uuid ${row.uuid} could not be initialized.`,
            );
          }

          return operation;
        } catch (err) {
          console.error(`Error instantiating OperationRow ${row.uuid}:`, err);
          return null;
        }
      });

      return operations.filter(isNotNullish);
    } catch (err) {
      console.error(`Error while fetching operations for pro:`, err);
      return [];
    }
  }

  clearFilters() {
    Object.values(this.storageKeys).forEach((key) =>
      this.localStorageService.clear(key),
    );
    [this.activeLocationUuid].forEach((s) => s.set(null));
  }

  private readonly clearFiltersWhenLogOut = SupabaseService.isAuthenticated$
    .pipe(takeUntilDestroyed())
    .subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        this.clearFilters();
      }
    });

  private readonly clearFiltersWhenChangingAccount = this.authService.loggedAs$
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      this.clearFilters();
    });

  private getStoredLocationUuid(): LocationUuid | null {
    return this.localStorageService.safeGet(
      this.storageKeys.activeLocationUuid,
      LocationUuid,
    );
  }

  private syncStorage(
    key: keyof typeof this.storageKeys,
    value: unknown,
  ): void {
    if (value != null) {
      this.localStorageService.set(this.storageKeys[key], value);
    } else {
      this.localStorageService.clear(this.storageKeys[key]);
    }
  }
}
