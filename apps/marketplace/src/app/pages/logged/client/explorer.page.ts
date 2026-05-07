import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  model,
  signal,
  viewChildren,
} from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import type { OperationHubspotCategory } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import {
  IconLocationComponent,
  IconOpportunitiesComponent,
  IconSearchComponent,
} from "@optee/icons";
import { simulateOperationsFromLocation } from "@optee/models";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { OperationsFilterComponent } from "@optee/ui/components/organisms/operations-filter/operations-filter.component";
import { RadarMeetComponent } from "@optee/ui/components/organisms/radar-meet/radar-meet.component";
import { isNotNullish } from "@optee/utils";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { Select } from "primeng/select";
import { Tooltip } from "primeng/tooltip";
import { combineLatest, filter, map, shareReplay, tap } from "rxjs";
import { LocationCreateFormDialogComponent } from "../../../components/location/location-form-dialog/location-create-form-dialog.component";
import { LocationSelectComponent } from "../../../components/location/location-select/location-select.component";
import type { OperationListColumn } from "../../../components/operation/operations-group-row/operations-group-row.component";
import { OperationsGroupComponent } from "../../../components/operation/operations-group/operations-group.component";
import { AppService } from "../../../services/app.service";
import { LocationService } from "../../../services/location.service";
import { OperationService } from "../../../services/operation.service";
import { PermissionService } from "../../../services/permission.service";
export const OPERATIONS_PAGE_TYPE_QUERY_PARAM = "operationType";

export type ExplorerPageQueryParams = {
  [OPERATIONS_PAGE_TYPE_QUERY_PARAM]?: OperationHubspotCategory;
};

@Component({
  selector: "mkp-explorer-page",
  host: {
    class: "max-w-app flex flex-col gap-4 lg:gap-8 m-auto p-4 lg:p-10",
  },
  template: `
    <oui-eve
      class="flex flex-col gap-4 px-4 lg:flex-row lg:items-center lg:px-10"
    >
      <div class="text-primary-700 flex w-72 items-center gap-3 text-lg">
        <icon-opportunities class="size-4" />
        <div>
          <strong>Simulez</strong>
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
        intro="Simulez les opérations réalisables, visualisez les subventions et lancez vos travaux en toute autonomie"
      />
    }

    <oui-eve class="flex flex-col gap-6">
      <div class="flex lg:-mb-16 lg:justify-center">
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
      </div>

      <oui-title-tight [value]="(operationsToOrder$ | async)?.length ?? 0">
        Opérations
      </oui-title-tight>

      <oui-operations-filter
        hideCount
        [(activeOperationTypes)]="activeOperationTypes"
      />

      @if (operationsToOrder$ | async; as operations) {
        @if (operations.length > 0) {
          <mkp-operations-group
            hideLaunchDate
            hideTotal
            preventSimulation
            sortCriteria="score"
            sortCriteriaDirection="desc"
            [actions]="['details', 'launch']"
            [operations]="operations"
            [rowsPerPage]="10"
            [visibleColumns]="visibleColumns"
          />
        } @else {
          <oui-message severity="info">
            Aucune opération ne peut être simulée pour votre sélection de sites.
            Si vous pensez qu’il s’agit d’une erreur et que vous souhaitez
            lancer une opération de ce type, contactez notre équipe pour obtenir
            de l'aide.
          </oui-message>
        }
      }
    </oui-eve>

    <oui-bob class="flex flex-col gap-6" dropDown [isOpen]="false">
      <oui-title-tight
        preTitle
        [value]="(operationsOrdered$ | async)?.length ?? 0"
      >
        Opérations déjà commandées
      </oui-title-tight>

      @if (operationsOrdered$ | async; as operations) {
        @if (operations.length > 0) {
          <mkp-operations-group
            hideLaunchDate
            hideTotal
            preventSimulation
            sortCriteria="score"
            sortCriteriaDirection="desc"
            [actions]="['details']"
            [operations]="operations"
            [rowsPerPage]="10"
            [visibleColumns]="visibleColumns"
          />
        } @else {
          <oui-message severity="info">
            Vous n'avez aucune opération archivée.
          </oui-message>
        }
      }
    </oui-bob>

    <oui-radar-meet />
  `,
  imports: [
    AsyncPipe,
    RouterModule,
    EveComponent,
    BobComponent,
    ReactiveFormsModule,
    ButtonIconComponent,
    IconSearchComponent,
    FormsModule,
    LocationSelectComponent,
    Tooltip,
    IconLocationComponent,
    Select,
    OperationsGroupComponent,
    TitleTightComponent,
    OperationsFilterComponent,
    MessageComponent,
    IconOpportunitiesComponent,
    RadarMeetComponent,
    InputText,
    IconField,
    InputIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExplorerPageComponent {
  operationsGroups = viewChildren(OperationsGroupComponent);

  protected readonly operationService = inject(OperationService);
  protected readonly permissionService = inject(PermissionService);
  protected readonly locationService = inject(LocationService);
  protected readonly dialogService = inject(DialogService);
  protected readonly appService = inject(AppService);
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  activeSearchTerm = signal<string>("");

  activeOperationTypes = model<OperationHubspotCategory[] | null>(null);

  routeTypeEffect = effect(() => {
    const qp = this.route.snapshot.queryParamMap.get(
      OPERATIONS_PAGE_TYPE_QUERY_PARAM,
    );
    this.activeOperationTypes.set(qp ? [qp as OperationHubspotCategory] : null);
  });

  availableLocations$ = this.locationService.allForClient$.pipe(
    filter(isNotNullish),
    shareReplay(1),
  );

  visibleColumns: OperationListColumn[] = [
    "score",
    "sortableCost",
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
          source: "Explorer > Searchbar",
        },
      },
    );

    if (locationUuid) {
      this.operationService.activeLocationUuid.set(locationUuid);
      this.router.navigate(["/client/explorer"]);
    }
  }

  alreadyOrderedOperations$ = this.operationService.all$.pipe(
    map((rows) => rows.map((r) => r.operation)),
  );

  operations$ = combineLatest([
    this.locationService.allForClient$,
    toObservable(this.activeOperationTypes),
    toObservable(this.operationService.activeLocationUuid),
  ]).pipe(
    map(([locations, activeOperationTypes, activeLocationUuid]) =>
      locations
        .filter(
          (location) =>
            !activeLocationUuid || location.uuid === activeLocationUuid,
        )
        .map((location) => {
          try {
            return simulateOperationsFromLocation(
              location,
              activeOperationTypes,
            );
          } catch (e) {
            return null;
          }
        })
        .filter(isNotNullish),
    ),
    map((operations) => operations.flat()),
    shareReplay(1),
  );

  filteredOperations$ = combineLatest([
    this.operations$,
    toObservable(this.activeSearchTerm),
  ]).pipe(
    map(([operations, searchTerm]) => {
      return searchTerm
        ? operations.filter(
            (operation) =>
              operation.typeInfo.label
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              operation.typeCategory
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              (operation.name ?? "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
          )
        : operations;
    }),
    tap(() => {
      // Reset pagination when filters change
      this.operationsGroups().forEach((group) => group.currentPage.set(0));
    }),
    shareReplay(1),
  );

  operationsToOrder$ = combineLatest([
    this.filteredOperations$,
    this.alreadyOrderedOperations$,
  ]).pipe(
    map(([operations, alreadyOrderedOperations]) =>
      operations
        .filter(
          (operation) =>
            !alreadyOrderedOperations.find((orderedOperation) =>
              orderedOperation.isEqual(operation),
            ),
        )
        .map((operation) => {
          operation.isAlreadyOrdered = false;
          return operation;
        }),
    ),
  );

  operationsOrdered$ = combineLatest([
    this.filteredOperations$,
    this.alreadyOrderedOperations$,
  ]).pipe(
    map(([operations, alreadyOrderedOperations]) =>
      operations
        .filter((operation) =>
          alreadyOrderedOperations.find((orderedOperation) =>
            orderedOperation.isEqual(operation),
          ),
        )
        .map((operation) => {
          operation.isAlreadyOrdered = true;
          return operation;
        }),
    ),
  );
}
