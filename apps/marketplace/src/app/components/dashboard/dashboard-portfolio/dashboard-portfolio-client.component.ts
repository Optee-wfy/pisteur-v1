import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AT_RISK_DPE_LABELS, QuoteStage, UserType } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import {
  IconAuditComponent,
  IconConditionalSuccessComponent,
  IconKeyComponent,
  IconLightHandshakeComponent,
} from "@optee/icons";
import { BubbleComponent } from "@optee/ui/components/atoms/bubble/bubble.component";
import { CirclePercentComponent } from "@optee/ui/components/atoms/circle-percent/circle-percent/circle-percent.component";
import { StockComponent } from "@optee/ui/components/molecules/stock/stock.component";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { isNotNullish } from "@optee/utils";
import { ProgressBar } from "primeng/progressbar";
import { Tooltip } from "primeng/tooltip";
import type { Observable } from "rxjs";
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  from,
  map,
  shareReplay,
} from "rxjs";
import trpcClient from "../../../../trpc-client";
import type { ExplorerPageQueryParams } from "../../../pages/logged/client/explorer.page";
import { OPERATIONS_PAGE_TYPE_QUERY_PARAM } from "../../../pages/logged/client/explorer.page";
import type { LocationsListPageQueryParams } from "../../../pages/logged/client/locations.page";
import {
  OPERATIONS_PAGE_PHASE_QUERY_PARAM,
  type PiloterPageQueryParams,
} from "../../../pages/logged/client/piloter.page";
import { AppService } from "../../../services/app.service";
import { LocationService } from "../../../services/location.service";
import { OperationService } from "../../../services/operation.service";
import { PermissionService } from "../../../services/permission.service";
import { MainNavIconComponent } from "../../layout/main-nav-icon.component";

import { LocationCreateFormDialogComponent } from "../../location/location-form-dialog/location-create-form-dialog.component";
import { GetFundingComponent } from "../../operation/get-funding/get-funding.component";
import { RightManagementFormComponent } from "../../permission/right-management.component";

@Component({
  selector: "mkp-dashboard-portfolio-client",
  host: {
    class: "flex flex-col lg:gap-10 gap-6",
  },
  template: `
    <oui-eve>
      <oui-title-tight
        class="mb-8"
        routerLink="/client/locations"
        [value]="(locationsCount$ | async) ?? 0"
      >
        Parc immobilier
      </oui-title-tight>

      <div class="grid grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-8">
        <oui-stock
          labelA="Opérations"
          labelB="en cours"
          routerLink="/client/piloter"
          (click)="operationService.activeLocationUuid.set(null)"
          [forceNewLine]="appService.isMobile$ | async"
          [value]="(inProgressOperationsCount$ | async) ?? 0"
        />

        <oui-stock
          labelA="Devis"
          labelB="à signer"
          routerLink="/client/quotes"
          [forceNewLine]="appService.isMobile$ | async"
          [value]="(quotesToSignCount$ | async) ?? 0"
        />

        <oui-stock
          class="col-span-2"
          labelA="Projets"
          labelB="finalisés"
          routerLink="/client/piloter"
          (click)="operationService.activeLocationUuid.set(null)"
          [forceNewLine]="appService.isMobile$ | async"
          [queryParams]="doneQueryParam"
          [value]="(finishedOperationsCount$ | async) ?? 0"
        />

        @if (permissionService.canCreateLocation()) {
          <oui-bubble (click)="addLocation()">
            <mkp-main-nav-icon class="size-5" headerIcon="sites" />
            Ajouter un site
          </oui-bubble>
        }

        <oui-bubble
          routerLink="/client/explorer"
          [class.lg:col-span-2]="!permissionService.canCreateLocation()"
        >
          <mkp-main-nav-icon class="size-5" headerIcon="opportunities" />
          <span>Explorer les opérations</span>
        </oui-bubble>

        @if (permissionService.can("DEAL_CREATE")) {
          <oui-bubble (click)="openFundingDialog()">
            <mkp-main-nav-icon class="size-5" headerIcon="consultations" />
            Financer un devis
          </oui-bubble>
        }

        @let hasLocations = this.locationService.hasLocations();
        <oui-bubble
          (click)="openRightManagementModal()"
          [class.!cursor-not-allowed]="!hasLocations"
          [class.!text-gray-300]="!hasLocations"
          [class.lg:col-span-2]="!permissionService.can('DEAL_CREATE')"
          [pTooltip]="
            !hasLocations
              ? 'Veuillez ajouter au moins un site pour accéder à cette fonctionnalité'
              : undefined
          "
        >
          <icon-key class="size-5" />
          Gérer les droits
        </oui-bubble>
      </div>
    </oui-eve>

    <div class="grid grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-8">
      <div
        class="card card--blue col-span-2 !p-6"
        routerLink="/client/explorer"
        (click)="operationService.activeLocationUuid.set(null)"
        [queryParams]="auditQueryParam"
      >
        <div class="flex items-center gap-2">
          <icon-audit class="size-5" />
          <div>
            <span class="font-semibold">Audits énergétiques</span>
            réalisés
          </div>
        </div>

        <div class="flex items-center gap-4">
          <p-progressbar
            class="w-3/4 flex-auto"
            styleClass="p-progressbar--dark"
            [showValue]="false"
            [value]="auditOperationsPercent$ | async"
          />

          <div class="font-semibold">
            {{ auditOperationsPercent$ | async }}%
          </div>
        </div>

        <div class="mt-4 flex items-center gap-2">
          <icon-light-handshake class="size-5" />
          <div>
            <span class="font-semibold">Rénovations</span>
            entamées
          </div>
        </div>

        <div class="flex items-center gap-4">
          <p-progressbar
            class="w-3/4 flex-auto"
            styleClass="p-progressbar--dark"
            [showValue]="false"
            [value]="locationsWithOperationsPercent$ | async"
          />

          <div class="font-semibold">
            {{ locationsWithOperationsPercent$ | async }}%
          </div>
        </div>
      </div>

      @let atRiskLocationsPercent = atRiskLocationsPercent$ | async;
      @if (
        typeof atRiskLocationsPercent === "number" &&
        atRiskLocationsPercent !== null
      ) {
        <div
          class="card col-span-2 flex items-center justify-between gap-6 bg-white !p-6"
          routerLink="/client/locations"
          [class.pointer-events-none]="
            !permissionService.can('LOCATION_READ_BY_CLIENT') &&
            !permissionService.can('LOCATION_READ_BY_LOCATION')
          "
          [queryParams]="atRiskLocationsQueryParam$ | async"
        >
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <icon-conditional-success
                class="size-8"
                colorMode="colored"
                [isSuccessful]="atRiskLocationsPercent === 0"
              />

              <oui-title-tight>Risque immobilier</oui-title-tight>
            </div>
            <div class="max-w-80">
              {{ atRiskLocationsPercent }}% de vos sites sont classés E, F ou G
              sur l'ensemble du parc intégré ({{
                atRiskLocationsCount$ | async
              }}/{{ locationsCount$ | async }})
            </div>
          </div>

          @if (atRiskLocationsPercent > 0) {
            <oui-circle-percent
              class="size-32 bg-white"
              higherIsWorse
              [value]="atRiskLocationsPercent"
            />
          }
        </div>
      }
    </div>
  `,
  styles: `
    .card {
      @apply font-display shadow-o hover:shadow-o2 flex-1 cursor-pointer rounded-2xl p-4 transition-all hover:-translate-y-1;
    }

    .card--blue {
      @apply bg-primary-900 text-white;
    }
  `,
  imports: [
    AsyncPipe,
    Tooltip,
    TitleTightComponent,
    MainNavIconComponent,
    IconKeyComponent,
    RouterModule,
    EveComponent,
    StockComponent,
    BubbleComponent,
    ProgressBar,
    CirclePercentComponent,
    IconAuditComponent,
    IconLightHandshakeComponent,
    IconConditionalSuccessComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPortfolioClientComponent {
  protected readonly operationService = inject(OperationService);
  protected readonly locationService = inject(LocationService);
  protected readonly permissionService = inject(PermissionService);
  protected readonly dialogService = inject(DialogService);
  protected readonly appService = inject(AppService);
  protected readonly router = inject(Router);

  UserType = UserType;

  locationsCount$ = this.locationService.allForClient$.pipe(
    map((locations) => locations.length),
    distinctUntilChanged(),
    shareReplay(1),
  );

  atRiskLocationsCount$ = this.locationService.allForClient$.pipe(
    map(
      (locations) =>
        locations
          .map((l) => l.dpeLabel)
          .filter(isNotNullish)
          .filter((l) => AT_RISK_DPE_LABELS.includes(l)).length,
    ),
    distinctUntilChanged(),
    shareReplay(1),
  );

  atRiskLocationsPercent$ = combineLatest([
    this.atRiskLocationsCount$,
    this.locationsCount$,
  ]).pipe(
    map(([atRiskLocationsCount, locationsCount]) => {
      const percent = (atRiskLocationsCount / locationsCount) * 100;
      return Math.round(percent);
    }),
    filter(isNotNullish),
    distinctUntilChanged(),
    shareReplay(1),
  );

  atRiskLocationsQueryParam$: Observable<LocationsListPageQueryParams> =
    this.atRiskLocationsCount$.pipe(
      map((atRiskLocationsCount) => ({
        showAtRiskLocations: atRiskLocationsCount > 0,
      })),
      shareReplay(1),
    );

  quotes$ = from(trpcClient.quotes.getAllForClientByLoggedUser.query()).pipe(
    shareReplay(1),
  );

  quotesToSignCount$ = this.quotes$.pipe(
    map((quotes) =>
      quotes.filter(
        (q) => q.hsQuote.stage === QuoteStage.EN_ATTENTE_DE_SIGNATURE,
      ),
    ),
    map((quotes) => quotes.length),
    distinctUntilChanged(),
    shareReplay(1),
  );

  operations$ = this.operationService.all$.pipe(
    map((rows) => rows.map((row) => row.operation)),
    shareReplay(1),
  );

  inProgressOperationsCount$ = this.operations$.pipe(
    map((operations) =>
      operations.filter(
        (operation) => operation.phase.category === "in_progress",
      ),
    ),
    map((operations) => operations.length),
    distinctUntilChanged(),
    shareReplay(1),
  );

  finishedOperations$ = this.operations$.pipe(
    map((operations) =>
      operations.filter(
        (operation) => operation.status.label === "✅ Projet clôturé",
      ),
    ),
    shareReplay(1),
  );

  finishedOperationsCount$ = this.finishedOperations$.pipe(
    map((operations) => operations.length),
    distinctUntilChanged(),
    shareReplay(1),
  );

  auditOperations$ = this.operations$.pipe(
    map((operations) =>
      operations.filter(
        (operation) =>
          operation.category === "Audit énergétique" && operation.started,
      ),
    ),
    shareReplay(1),
  );

  auditOperationsPercent$ = combineLatest([
    this.locationsCount$,
    this.auditOperations$,
  ]).pipe(
    map(([locationsCount, operations]) => {
      const percent = (operations.length / locationsCount) * 100;
      return Math.round(percent);
    }),
    filter(isNotNullish),
    distinctUntilChanged(),
    shareReplay(1),
  );

  locationsWithOperations$ = combineLatest([
    this.locationService.allForClient$,
    this.operations$,
  ]).pipe(
    map(([locations, operations]) => {
      return locations.filter((location) =>
        operations.some(
          (operation) =>
            operation.location.uuid === location.uuid &&
            operation.started &&
            operation.category !== "Audit énergétique",
        ),
      );
    }),
    shareReplay(1),
  );

  locationsWithOperationsPercent$ = combineLatest([
    this.locationsCount$,
    this.locationsWithOperations$,
  ]).pipe(
    map(([locationsCount, locationsWithOperations]) => {
      const percent = (locationsWithOperations.length / locationsCount) * 100;
      return Math.round(percent);
    }),
    filter(isNotNullish),
    distinctUntilChanged(),
    shareReplay(1),
  );

  doneQueryParam: PiloterPageQueryParams = {
    [OPERATIONS_PAGE_PHASE_QUERY_PARAM]: "✅ Projet clôturé",
    openArchived: true,
  };

  auditQueryParam: ExplorerPageQueryParams = {
    [OPERATIONS_PAGE_TYPE_QUERY_PARAM]: "Audit énergétique",
  };

  protected async addLocation() {
    const { res: locationUuid } = await this.dialogService.open(
      LocationCreateFormDialogComponent,
      {
        data: {
          mode: "create",
          source: "Dashboard",
        },
      },
    );

    if (locationUuid) {
      this.operationService.activeLocationUuid.set(locationUuid);
      this.router.navigate(["/client/explorer"]);
    }
  }

  protected openRightManagementModal() {
    if (!this.locationService.hasLocations()) {
      return;
    }
    this.dialogService.open(RightManagementFormComponent);
  }

  protected openFundingDialog() {
    this.dialogService.open(GetFundingComponent);
  }
}
