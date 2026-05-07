import { computed, inject, Injectable } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import type { OperationUuid } from "@optee/models";

import { UserType } from "@optee/constants";
import { ToastService } from "@optee/ui/services/toast.service";

import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from "rxjs";
import trpcClient from "../../trpc-client";
import { SupabaseService } from "../supabase.service";
import { AuthService } from "./auth.service";
import { TrackingService } from "./tracking.service";

@Injectable({ providedIn: "root" })
export class ProService {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly trackingService = inject(TrackingService);

  private readonly refresh$ = new Subject<void>();

  readonly pro$ = this.refresh$.pipe(
    startWith(undefined),
    switchMap(() => SupabaseService.isAuthenticated$),
    switchMap((isAuthenticated) =>
      isAuthenticated ? this.authService.loggedAs$ : of(null),
    ),
    switchMap((loggedAs) =>
      loggedAs === UserType.PRO
        ? trpcClient.pros.getByLoggedPro.query()
        : of(null),
    ),
    distinctUntilChanged(
      (prev, curr) =>
        prev?.uuid === curr?.uuid &&
        prev?.remainingCredits === curr?.remainingCredits &&
        prev?.subscription === curr?.subscription &&
        prev?.status === curr?.status &&
        prev?.prestations === curr?.prestations &&
        prev?.stripeSubscriptionStatus === curr?.stripeSubscriptionStatus &&
        prev?.stripeSubscriptionId === curr?.stripeSubscriptionId &&
        prev?.stripeCurrentPlanPriceId === curr?.stripeCurrentPlanPriceId,
    ),
    shareReplay(1),
  );

  readonly pro = toSignal(this.pro$, { initialValue: null });

  readonly currentProUuid = toSignal(
    this.pro$.pipe(map((pro) => pro?.uuid ?? null)),
    { initialValue: null },
  );

  readonly subscription = toSignal(
    this.pro$.pipe(map((pro) => pro?.subscription ?? null)),
    { initialValue: null },
  );

  readonly remainingCredits = toSignal(
    this.pro$.pipe(map((pro) => pro?.remainingCredits ?? 0)),
    {
      initialValue: null,
    },
  );

  readonly consumedAllCredits = computed(() => {
    const credits = this.remainingCredits();
    if (credits === null) {
      return false;
    }
    return credits <= 0;
  });

  private readonly subIdentify = combineLatest([
    this.authService.contact$,
    this.pro$,
  ])
    .pipe(debounceTime(1000), takeUntilDestroyed())
    .subscribe(([contact, pro]) => {
      if (!contact || !pro) {
        return;
      }

      this.trackingService.identifyAmplitude({
        contactUuid: contact.uuid,
        contactHsId: contact.id,
        firstname: contact.firstName,
        lastname: contact.lastName,
        email: contact.email,
        userUuid: contact.userUuid,
        proUuid: pro.uuid,
        proHsId: pro.id,
        proName: pro.name,
        credits: pro.remainingCredits,
        isAdminOptee: this.authService.isAdminOptee(),
        subscription: pro.subscription,
      });
    });

  private readonly clientsAndLocationsByPro$ = this.pro$.pipe(
    switchMap((pro) =>
      pro ? trpcClient.pros.getClientsAndLocationsByLoggedPro.query() : of([]),
    ),
    shareReplay(1),
  );

  readonly clientsAndLocationsByPro = toSignal(this.clientsAndLocationsByPro$, {
    initialValue: [],
  });

  readonly availableClients = computed(() => {
    const rows = this.clientsAndLocationsByPro();
    if (!rows || rows.length === 0) {
      return [];
    }
    const clientSet = new Set<string>();
    return rows
      .map((r) => r.client)
      .filter((client) => {
        if (clientSet.has(client.uuid)) {
          return false;
        }
        clientSet.add(client.uuid);
        return true;
      });
  });

  readonly proHasClients = computed(() => this.availableClients().length > 0);

  refresh() {
    this.refresh$.next();
  }

  async checkIfProLinkedToOperation(operationUuid: OperationUuid) {
    return trpcClient.pros.isProLinkedToOperation
      .query(operationUuid)
      .catch((error) => {
        this.toastService.openError(
          "Vérification des accès à l'opération",
          error,
        );
        return false;
      });
  }
}
