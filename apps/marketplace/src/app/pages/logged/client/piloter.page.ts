import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  signal,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import type {
  InvoicePhaseLabelClient,
  OperationHubspotCategory,
  OperationPhaseLabelClient,
} from "@optee/constants";
import {
  CTA,
  findWeightClient,
  OPERATION_PHASES_LABELS_CLIENT,
  OPERATION_TYPES_ARR,
  OPERATION_TYPOLOGIES,
} from "@optee/constants";
import { DialogService } from "@optee/dialog";
import {
  IconLocationComponent,
  IconRefreshComponent,
  IconSearchComponent,
  IconSquareGridComponent,
} from "@optee/icons";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { OperationsFilterComponent } from "@optee/ui/components/organisms/operations-filter/operations-filter.component";
import { RadarMeetComponent } from "@optee/ui/components/organisms/radar-meet/radar-meet.component";
import { isNotNullish } from "@optee/utils";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { Select } from "primeng/select";
import { TooltipModule } from "primeng/tooltip";
import { filter, map, shareReplay } from "rxjs";

import { LocationCreateFormDialogComponent } from "../../../components/location/location-form-dialog/location-create-form-dialog.component";
import { LocationSelectComponent } from "../../../components/location/location-select/location-select.component";
import { GetFundingComponent } from "../../../components/operation/get-funding/get-funding.component";
import { OperationsListComponent } from "../../../components/operation/operation-list/operations-list.component";
import type { OperationListColumn } from "../../../components/operation/operations-group-row/operations-group-row.component";
import { AppService } from "../../../services/app.service";
import { LocationService } from "../../../services/location.service";
import { OperationService } from "../../../services/operation.service";
import { PermissionService } from "../../../services/permission.service";

export const OPERATIONS_PAGE_PHASE_QUERY_PARAM = "operationPhase";
export const OPERATIONS_PAGE_TOGGLE_ARCHIVED_QUERY_PARAM = "openArchived";

export type PiloterPageQueryParams = {
  [OPERATIONS_PAGE_PHASE_QUERY_PARAM]?:
    | OperationPhaseLabelClient
    | InvoicePhaseLabelClient;
  [OPERATIONS_PAGE_TOGGLE_ARCHIVED_QUERY_PARAM]?: boolean;
};

@Component({
  selector: "mkp-piloter-page",
  host: {
    class: "max-w-app flex flex-col gap-4 lg:gap-8 m-auto p-4 lg:p-10",
  },
  template: `
    <oui-eve
      class="flex flex-col gap-4 px-4 lg:flex-row lg:items-center lg:px-10"
    >
      <div class="text-primary-700 flex w-72 items-center gap-3 text-lg">
        <icon-square-grid class="size-4" />
        <div>
          <strong>Pilotez</strong>
          vos opérations
        </div>
      </div>

      <div class="flex flex-auto gap-4">
        <p-select
          class="p-select-round max-w-[calc(100%-56px)] flex-[2] font-semibold"
          appendTo="body"
          emptyFilterMessage="Aucun résultat"
          filter
          optionLabel="address"
          optionValue="uuid"
          placeholder="Tous mes sites"
          showClear
          [(ngModel)]="operationService.activeLocationUuid"
          [filterFields]="['name', 'address']"
          [options]="(availableLocations$ | async) ?? []"
        >
          <ng-template #selectedItem let-selectedOption>
            @if (selectedOption.hasSpecificName) {
              {{ selectedOption.name }}
            } @else {
              @if (appService.isMobile$ | async) {
                {{ selectedOption.shortAddress }}
              } @else {
                {{ selectedOption.address }}
              }
            }
          </ng-template>

          <ng-template #item let-location>
            <div class="flex flex-col">
              <div class="font-semibold">
                @if (location.hasSpecificName) {
                  {{ location.name }}
                } @else {
                  {{ location.shortAddress }}
                }
              </div>
              @if (location.hasSpecificName) {
                <div class="text-sm text-gray-300">
                  {{ location.shortAddress }}
                </div>
              }
            </div>
          </ng-template>
        </p-select>

        @if (permissionService.canCreateLocation()) {
          <oui-button-icon
            action="add"
            pTooltip="Ajouter un site"
            tooltipPosition="top"
            variant="primary"
            (click)="openAddLocationModal()"
          >
            <icon-location class="size-4" />
          </oui-button-icon>
        }
      </div>
    </oui-eve>

    @if ((appService.isMobile$ | async) === false) {
      <mkp-location-select
        class="px-6"
        intro="Visualisez les projets par site, suivez les actions engagées et impliquez les parties prenantes à chaque étape."
      />
    }
    @if (operations$ | async; as operations) {
      <oui-eve>
        <mkp-operations-list
          (operationClick)="operationService.showPanel($event)"
          [activeOperationTypes]="activeOperationTypes()"
          [activePhaseFilter]="activeOperationPhase()"
          [operations]="(operations$ | async) ?? []"
          [searchValue]="activeSearchTerm()"
          [selectedLocationUuid]="operationService.activeLocationUuid() ?? null"
          [visibleColumns]="visibleColumns"
        >
          <div class="flex justify-end gap-4" afterTitle>
            <p-iconfield class="max-w-96 flex-[3]">
              <p-inputicon class="size-4">
                <icon-search />
              </p-inputicon>

              <input
                class="p-inputnumber-gray"
                fluid
                pInputText
                placeholder="Rechercher une opération"
                role="searchbox"
                type="search"
                variant="filled"
                [(ngModel)]="activeSearchTerm"
              />
            </p-iconfield>

            <p-select
              class="max-w-60 flex-[2]"
              appendTo="body"
              emptyFilterMessage="Aucun résultat"
              placeholder="Tous les statuts"
              [(ngModel)]="activeOperationPhase"
              [options]="OPERATION_PHASES_LABELS_ORDERED"
              [showClear]="true"
            />
          </div>

          <oui-operations-filter
            hideCount
            underTitle
            [(activeOperationTypes)]="activeOperationTypes"
          />
        </mkp-operations-list>
      </oui-eve>
    } @else {
      <div class="flex w-full items-center justify-center gap-2 py-3">
        <icon-refresh class="size-5 animate-spin" />
        <p class="text-lg font-medium">Chargement de vos projets en cours …</p>
      </div>
    }
    <oui-radar-meet />
  `,
  imports: [
    AsyncPipe,
    RouterModule,
    EveComponent,
    TooltipModule,
    IconLocationComponent,
    IconSearchComponent,
    LocationSelectComponent,
    ButtonIconComponent,
    OperationsListComponent,
    OperationsFilterComponent,
    ReactiveFormsModule,
    FormsModule,
    RadarMeetComponent,
    InputText,
    IconField,
    InputIcon,
    Select,
    IconSquareGridComponent,
    IconRefreshComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PiloterPageComponent {
  protected readonly operationService = inject(OperationService);
  protected readonly dialogService = inject(DialogService);
  protected readonly locationService = inject(LocationService);
  protected readonly route = inject(ActivatedRoute);
  protected readonly appService = inject(AppService);
  protected readonly permissionService = inject(PermissionService);
  protected readonly router = inject(Router);

  CTA = CTA;

  readonly OPERATION_PHASES_LABELS_ORDERED = [
    ...new Set(
      OPERATION_PHASES_LABELS_CLIENT.sort(
        (a, b) => findWeightClient(a) - findWeightClient(b),
      ),
    ),
  ];

  activeOperationTypes = model<OperationHubspotCategory[] | null>(null);
  activeOperationPhase = signal<OperationPhaseLabelClient | null>(
    this.route.snapshot.queryParams[OPERATIONS_PAGE_PHASE_QUERY_PARAM] || null,
  );

  activeSearchTerm = signal<string>("");

  operationsOptions = OPERATION_TYPOLOGIES.map((typology) => {
    return {
      typology,
      items: OPERATION_TYPES_ARR.filter(
        (t) => t.typologie === typology && t.showAsMarketplaceFilter,
      ),
    };
  }).filter((ot) => ot.items.length);

  availableLocations$ = this.locationService.allForClient$.pipe(
    filter(isNotNullish),
    shareReplay(1),
  );

  operations$ = this.operationService.all$.pipe(
    map((rows) => rows.map((row) => row.operation)),
    shareReplay(1),
  );

  visibleColumns: OperationListColumn[] = [
    "sortableCost",
    "sortablePhase",
    "sortableFunding",
    "sortableRemainingAmount",
    "estimatedEnergyImpact",
  ];

  async openAddLocationModal() {
    const { res: locationUuid } = await this.dialogService.open(
      LocationCreateFormDialogComponent,
      {
        data: {
          mode: "create",
          source: "Piloter > Searchbar",
        },
      },
    );

    if (locationUuid) {
      this.operationService.activeLocationUuid.set(locationUuid);
      this.router.navigate(["/client/explorer"]);
    }
  }

  openFundingDialog() {
    this.dialogService.open(GetFundingComponent, {
      data: {
        selectedLocationUuid: this.operationService.activeLocationUuid(),
      },
    });
  }
}
