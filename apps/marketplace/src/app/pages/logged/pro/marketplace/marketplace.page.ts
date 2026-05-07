import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  signal,
} from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import type { CanActivateFn } from "@angular/router";
import { Router, RouterModule } from "@angular/router";
import type { OperationHubspotCategory } from "@optee/constants";
import {
  OperationPhaseEnum,
  PRO_MARKETPLACE_PHASES,
  UserType,
} from "@optee/constants";
import { IconRefreshComponent } from "@optee/icons";
import { SearchInputComponent } from "@optee/ui/components/molecules/form/search-input/search-input.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { OperationsFilterComponent } from "@optee/ui/components/organisms/operations-filter/operations-filter.component";
import { isNotNullish } from "@optee/utils";
import { Select } from "primeng/select";
import { TooltipModule } from "primeng/tooltip";
import {
  combineLatest,
  filter,
  firstValueFrom,
  map,
  of,
  shareReplay,
  switchMap,
} from "rxjs";
import type { OperationListColumn } from "../../../../components/operation/operations-group-row/operations-group-row.component";
import { OperationsGroupComponent } from "../../../../components/operation/operations-group/operations-group.component";
import { AuthService } from "../../../../services/auth.service";
import { OperationService } from "../../../../services/operation.service";
import { ProService } from "../../../../services/pro.service";

export const ProGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const proService = inject(ProService);

  const userTypes = await firstValueFrom(authService.userTypes$);
  if (!userTypes.includes(UserType.PRO)) {
    router.navigate(["/"]);
    return false;
  }

  const pro = await firstValueFrom(proService.pro$.pipe(filter(isNotNullish)));

  if (pro.status !== "Actif") {
    router.navigate([`/pro/onboarding`]);
    return false;
  }

  return true;
};

type PhaseFilterOption = {
  label: string;
  values: OperationPhaseEnum[];
  requireFromDtg?: boolean;
};

@Component({
  selector: "mkp-pro-marketplace",
  host: {
    class: "max-w-app flex flex-col gap-8 m-auto p-4 xl:p-10",
  },
  template: `
    <header class="flex flex-col gap-1">
      <h2 class="font-display text-primary-900 text-2xl font-semibold">
        Appels d’offres disponibles
      </h2>
      <p class="m-0 text-sm text-gray-600">
        Explorez les projets ouverts à la consultation, accédez à leurs détails
        techniques et positionnez-vous en quelques clics sur les opérations
        compatibles avec vos prestations
      </p>
    </header>

    <oui-eve class="flex flex-col gap-6">
      <div
        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <oui-search-input
          class="w-full"
          placeholder="Rechercher une opération ou une adresse"
          [(activeSearchTerm)]="activeSearchTerm"
        />

        <p-select
          class="max-w-80 flex-[2]"
          appendTo="body"
          emptyFilterMessage="Aucun résultat"
          optionLabel="label"
          placeholder="Sélectionner un type d’opération"
          [(ngModel)]="activeOperationPhase"
          [options]="OPERATION_PHASES_OPTIONS"
          [showClear]="true"
        />
      </div>

      <oui-title-tight [value]="(filteredOperations$ | async)?.length ?? 0">
        Opérations disponibles
      </oui-title-tight>

      <oui-operations-filter
        [(activeOperationTypes)]="activeOperationTypes"
        [operations]="(operations$ | async) ?? []"
      />

      @if (filteredOperations$ | async; as operations) {
        @if (operations.length > 0) {
          <mkp-operations-group
            hideLaunchDate
            hideTotal
            preventSimulation
            sortCriteria="createdAt"
            sortCriteriaDirection="desc"
            [actions]="['buy-lead']"
            [operations]="operations"
            [rowsPerPage]="10"
            [visibleColumns]="visibleColumns"
          />
        } @else {
          <oui-message severity="info">
            <strong>🔍 Aucune opération en ligne pour le moment</strong>
            <br />
            Tous les projets ont trouvé preneur ! De nouvelles opportunités
            arrivent très bientôt. Revenez régulièrement pour consulter les
            appels d’offres disponibles.
          </oui-message>
        }
      } @else {
        <div class="flex w-full items-center justify-center gap-2 py-3">
          <icon-refresh class="size-5 animate-spin" />
          <p class="text-lg font-medium">
            Chargement des opportunités en cours …
          </p>
        </div>
      }
    </oui-eve>
  `,
  imports: [
    OperationsGroupComponent,
    AsyncPipe,
    RouterModule,
    OperationsFilterComponent,
    TooltipModule,
    ReactiveFormsModule,
    FormsModule,
    EveComponent,
    MessageComponent,
    TitleTightComponent,
    SearchInputComponent,
    IconRefreshComponent,
    Select,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MarketplaceProComponent {
  protected readonly operationService = inject(OperationService);
  protected readonly authService = inject(AuthService);
  protected readonly proService = inject(ProService);

  protected readonly activeSearchTerm = signal<string>("");
  protected readonly activeOperationTypes = model<
    OperationHubspotCategory[] | null
  >(null);

  protected readonly activeOperationPhase = signal<PhaseFilterOption | null>(
    null,
  );

  protected readonly operations$ = this.proService.pro$.pipe(
    filter(isNotNullish),
    switchMap((pro) =>
      pro.uuid ? this.operationService.allDiscoverable$ : of([]),
    ),
  );

  protected readonly visibleColumns: OperationListColumn[] = [
    "phaseEnum",
    "plannedBudgetRange",
    "createdAt",
    "sortableSector",
    "locationCreationDate",
    "dpeLabel",
  ];

  protected readonly OPERATION_PHASES_OPTIONS: PhaseFilterOption[] = [
    {
      label: "Appel d'offres",
      values: PRO_MARKETPLACE_PHASES.filter(
        (phase) => phase !== OperationPhaseEnum.PROJECT_PHASE,
      ),
    },
    {
      label: "Opération préconisée",
      values: [OperationPhaseEnum.PROJECT_PHASE],
      requireFromDtg: true,
    },
    {
      label: "Opération prévue",
      values: [OperationPhaseEnum.PROJECT_PHASE],
      requireFromDtg: false,
    },
  ];

  protected readonly filteredOperations$ = combineLatest([
    this.operations$,
    toObservable(this.activeSearchTerm),
    toObservable(this.activeOperationTypes),
    toObservable(this.activeOperationPhase),
  ]).pipe(
    map(
      ([
        operations,
        searchTerm,
        activeOperationTypes,
        activeOperationPhase,
      ]) => {
        let filtered = operations;

        if (activeOperationTypes && activeOperationTypes.length > 0) {
          filtered = filtered.filter(
            (operation) =>
              operation.category !== null &&
              activeOperationTypes.includes(operation.category),
          );
        }

        if (activeOperationPhase) {
          filtered = filtered.filter((op) => {
            const phaseOk = activeOperationPhase.values.includes(op.phase.enum);
            const dtgOk =
              activeOperationPhase.requireFromDtg === undefined ||
              (op.isFromDtg && activeOperationPhase.requireFromDtg) ||
              (!op.isFromDtg && !activeOperationPhase.requireFromDtg);
            return phaseOk && dtgOk;
          });
        }

        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filtered = filtered.filter(
            (operation) =>
              operation.typeInfo.label.toLowerCase().includes(searchLower) ||
              operation.typeCategory.toLowerCase().includes(searchLower) ||
              (operation.name ?? "").toLowerCase().includes(searchLower),
          );
        }
        return filtered;
      },
    ),
    shareReplay(1),
  );
}
