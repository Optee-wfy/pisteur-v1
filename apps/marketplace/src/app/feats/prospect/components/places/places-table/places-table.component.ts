import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  resource,
  signal,
} from "@angular/core";

import { DatePipe, DecimalPipe, LowerCasePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import type {
  BuildingOccupancyCounts,
  LocationBdnbLegalEntityFilterPro,
  NafCode,
  PaginationState,
} from "@optee/constants";
import {
  BUILDING_OCCUPANCY_STATUS_LABELS,
  BUILDING_USAGE_LABELS,
  CONTACT_CONNECTION_COST,
  defaultPagination,
  getBuildingOccupancyStatus,
  getDepartmentByCode,
  getIpeNormalizedScore,
  getLocationBuildingTypeLabelsFromNafCodes,
} from "@optee/constants";
import { DialogConfirmationComponent, DialogService } from "@optee/dialog";
import { environment } from "@optee/env";
import {
  IconBuildingComponent,
  IconCompanyComponent,
  IconRefreshComponent,
} from "@optee/icons";
import type {
  LegalEntityUuid,
  LocationBdnb,
  LocationBdnbUuid,
} from "@optee/models";
import { DpeLabelComponent } from "@optee/ui/components/atoms/dpe-label/dpe-label.component";
import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { FormatAddressPipe } from "@optee/ui/pipes/format-address.pipe";
import { RoundedNumberPipe } from "@optee/ui/pipes/rounded-number.pipe";
import { ToastService } from "@optee/ui/services/toast.service";
import { BadgeModule } from "primeng/badge";
import { ButtonModule } from "primeng/button";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import trpcClient from "../../../../../../trpc-client";
import { ProService } from "../../../../../services/pro.service";
import { TrackingService } from "../../../../../services/tracking.service";
import { PlacesNavigationService } from "../../../services/places-navigation.service";
import { PillCreditsComponent } from "../../pill-credits/pill-credits.component";
import { SolicitationIndicatorComponent } from "../../solicitation-indicator/solicitation-indicator.component";
import { PlacesFiltersComponent } from "../places-filters/places-filters.component";
import { PlacesSearchInputComponent } from "../places-search/places-search-input.component";

const placesSortFields = [
  "surfaceThatRequiresHeating",
  "dpeLabel",
  "creationDate",
  "nbUnits",
  "annualElectricityConsumption",
  "nbRelatedPros",
] as const;

type PlacesSortField = (typeof placesSortFields)[number];

const isPlacesSortField = (
  value: string | null | undefined,
): value is PlacesSortField =>
  placesSortFields.some((field) => field === value);

type PlacesRow = {
  location: LocationBdnb & { nbRelatedPros: number };
  legalEntities: { uuid: LegalEntityUuid; name: string | null }[];
  associations: string[];
};

@Component({
  selector: "mkp-places-table",
  host: {
    class: "flex h-full min-w-0 flex-col gap-3 overflow-hidden",
  },
  template: `
    @if (!hideHeader()) {
      <section
        class="border-granite-100 mx-4 mt-4 flex h-12 items-center gap-2 rounded-[16px] border bg-white px-4 shadow-sm md:mx-6"
      >
        <icon-building class="size-4" />
        <span class="text-granite-900 text-sm font-medium">Bâtiments</span>
        <span class="text-granite-400 text-sm font-normal">
          {{ totalCount() | roundedNumber }}
        </span>

        @if (!legalEntityUuid() && !hideSearch()) {
          <mkp-places-search-input class="ml-auto" />
        }
      </section>
    }

    @if (!hideFilters()) {
      <div
        class="border-granite-100 mx-4 overflow-hidden rounded-[16px] border bg-white shadow-sm md:mx-6"
      >
        <mkp-places-filters
          class="prospect-table"
          [(filters)]="filters"
          [showPlaceTypeFilter]="!legalEntityUuid()"
          [showSearchAddressFilter]="!legalEntityUuid()"
        />
      </div>
    }

    <div class="mx-4 flex w-full items-center px-2 md:mx-6">
      @if (
        showSelection() &&
        hasUnlockableLocations() &&
        selectedLocationsForUnlock().length >= 2
      ) {
        <button
          class="prospect-button flex w-full items-center px-3 py-4"
          (click)="unlockSelectedLocations()"
          [disabled]="!canUnlockSelectedLocations()"
          [pTooltip]="bulkUnlockDisabledTooltip()"
          [tooltipDisabled]="!bulkUnlockDisabledTooltip()"
        >
          @if (isBulkUnlocking()) {
            <icon-refresh class="size-3 animate-spin" />
            <span class="text-xs">Déblocage en cours...</span>
          } @else {
            Déblocage multiple
            <mkp-pill-credits
              colorVariant="green"
              [credits]="
                CONTACT_CONNECTION_COST * selectedLocationsForUnlock().length
              "
            />
          }
        </button>
      }
    </div>

    @if (locations.isLoading()) {
      <oui-loader label="Analyse des bâtiments correspondants..." />
    } @else if (locations.error()) {
      <div
        class="flex h-full w-full flex-1 flex-col items-center justify-center gap-2 py-6"
      >
        <p class="font-display text-red-500">
          Une erreur est survenue lors du chargement des bâtiments. Merci de
          réessayer plus tard.
        </p>
      </div>
    } @else if (totalCount() === 0) {
      <div
        class="flex h-full w-full flex-1 flex-col items-center justify-center gap-2 py-6"
      >
        <p class="text-granite-400 font-display">
          @if (hasSomeFiltersActive()) {
            Aucun bâtiment ne correspond aux filtres appliqués. Merci de les
            ajuster ou de les réinitialiser.
          } @else {
            {{
              emptyListMessage() ??
                "Aucun bâtiment disponible. Merci de réessayer plus tard. 🏗️"
            }}
          }
        </p>
      </div>
    } @else {
      <div
        class="border-granite-100 mx-4 mb-4 flex h-full flex-1 flex-col overflow-hidden rounded-[16px] border bg-white shadow-sm md:mx-6"
      >
        <p-table
          class="prospect-table h-full overflow-hidden"
          currentPageReportTemplate=""
          customSort
          lazy
          rowHover
          scrollable
          scrollHeight="flex"
          showCurrentPageReport
          sortMode="single"
          styleClass="text-sm text-granite-900 scrollbar-stable"
          (onPage)="onPageChange($event)"
          (onSort)="onSort($event)"
          (selectionChange)="onSelectionChange($event)"
          [first]="page() * pageSize()"
          [paginator]="!hidePaginator()"
          [rows]="pageSize()"
          [rowsPerPageOptions]="[10, 20, 50, 100]"
          [selection]="selectedLocationsForUnlock()"
          [sortField]="sortField()"
          [sortOrder]="sortOrder()"
          [style.scrollbar-color]="'#A3C0FF transparent'"
          [tableStyle]="{
            'min-width': legalEntityUuid()
              ? showSelection()
                ? '104rem'
                : '101rem'
              : showSelection()
                ? '114rem'
                : '111rem',
          }"
          [totalRecords]="totalCount()"
          [value]="locations.value()?.locations ?? []"
        >
          <ng-template #colgroup>
            @if (showSelection()) {
              <col style="width: 3rem" />
            }
            <col class="cell-grow" style="width: 24rem; min-width: 24rem" />
            <col style="width: 6.5rem" />
            <col style="width: 12rem" />
            <col style="width: 14rem" />
            <col style="width: 9rem" />
            <col style="width: 5rem" />
            <col style="width: 6rem" />
            <col style="width: 5rem" />
            <col style="width: 11rem" />
            <col style="width: 9rem" />
            @if (!legalEntityUuid()) {
              <col style="width: 10rem" />
            }
          </ng-template>
          <ng-template #header>
            <tr>
              @if (showSelection()) {
                <th alignFrozen="left" pFrozenColumn [frozen]="true">
                  <p-tableHeaderCheckbox binary intermediate />
                </th>
              }
              <th>Adresse</th>

              <th class="whitespace-nowrap" pSortableColumn="nbRelatedPros">
                Concurrence
                <p-sortIcon class="small-sort-icon" field="nbRelatedPros" />
              </th>

              <th>Département</th>

              <th>Type d'entreprise</th>

              <th
                class="whitespace-nowrap"
                pSortableColumn="surfaceThatRequiresHeating"
              >
                Surface chauffée
                <p-sortIcon
                  class="small-sort-icon"
                  field="surfaceThatRequiresHeating"
                />
              </th>

              <!-- <th class="whitespace-nowrap">Usage</th> -->

              <th class="whitespace-nowrap" pSortableColumn="nbUnits">
                Lots
                <p-sortIcon class="small-sort-icon" field="nbUnits" />
              </th>

              <th class="whitespace-nowrap" pSortableColumn="creationDate">
                Année
                <p-sortIcon class="small-sort-icon" field="creationDate" />
              </th>

              <th class="whitespace-nowrap" pSortableColumn="dpeLabel">
                DPE
                <p-sortIcon class="small-sort-icon" field="dpeLabel" />
              </th>
              <th
                class="whitespace-nowrap"
                pSortableColumn="annualElectricityConsumption"
              >
                Conso. énergétique
                <p-sortIcon
                  class="small-sort-icon"
                  field="annualElectricityConsumption"
                />
              </th>
              <th class="whitespace-nowrap">Chauffage</th>
              @if (!legalEntityUuid()) {
                <th alignFrozen="right" pFrozenColumn [frozen]="true">
                  Entreprises
                </th>
              }
            </tr>
          </ng-template>
          <ng-template #body let-row>
            @let isBuildingUnlocked = row.associations.includes("Débloqué");
            @let isBuildingPendingUnlock =
              !isBuildingUnlocked &&
              unlockedLocationUuids().has(row.location.uuid);
            @let buildingIsUnlocked =
              isBuildingUnlocked || isBuildingPendingUnlock;
            <tr>
              @if (showSelection()) {
                <td alignFrozen="left" pFrozenColumn [frozen]="true">
                  <p-tableCheckbox
                    [disabled]="buildingIsUnlocked || isBulkUnlocking()"
                    [pTooltip]="
                      buildingIsUnlocked ? 'Bâtiment déjà débloqué' : undefined
                    "
                    [value]="row"
                  />
                </td>
              }
              <td class="cell-grow max-w-xs">
                <span class="flex items-center justify-between gap-2">
                  @if (
                    !legalEntityUuid() ||
                    (legalEntityUuid() && buildingIsUnlocked)
                  ) {
                    @let address = row.location | formatAddress;
                    <a
                      class="pister-link flex-1"
                      [pTooltip]="
                        (address?.length ?? 0) > 35 ? address : undefined
                      "
                      [routerLink]="[
                        dataSource() === 'leadHistory'
                          ? '/pro/pisteur/leads/details'
                          : '/pro/pisteur/places/details',
                        row.location.uuid,
                      ]"
                    >
                      <icon-building
                        class="size-5 flex-shrink-0 rounded-[4px] p-[3px]"
                      />

                      <span class="line-clamp-1 min-w-0 font-medium">
                        {{ address }}
                      </span>
                    </a>
                  } @else {
                    <div class="flex w-60 items-center gap-1 px-2">
                      <icon-building
                        class="size-5 flex-shrink-0 rounded-[4px] p-[3px]"
                      />
                      Débloquez pour voir l'adresse
                    </div>
                  }
                  @if (!buildingIsUnlocked && dataSource() !== "leadHistory") {
                    <mkp-pill-credits
                      class="cursor-pointer"
                      pTooltip="Débloquer les entreprises associées"
                      (click)="buyLocationContact(row.location)"
                      [credits]="CONTACT_CONNECTION_COST"
                    />
                  }

                  @if (showDebugTooltips) {
                    @let ipeTooltip = buildIpeTooltip(row.location);
                    @if (ipeTooltip) {
                      <span
                        class="text-granite-400 flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-semibold"
                        tooltipPosition="right"
                        [pTooltip]="ipeTooltip"
                      >
                        ?
                      </span>
                    }
                  }
                </span>
              </td>

              <td>
                @let nbRelatedPros = row.location.nbRelatedPros;
                <mkp-solicitation-indicator
                  entityType="building"
                  [count]="nbRelatedPros"
                />
              </td>

              <td>
                @let department = getDepartmentCode(row.location.zipcode);
                <span
                  class="line-clamp-1 min-w-0"
                  [pTooltip]="
                    department && department.length > 20
                      ? department
                      : undefined
                  "
                >
                  @if (department) {
                    <span class="font-medium">{{ department }}</span>
                  } @else {
                    <span class="text-granite-300 text-sm italic">
                      Non connu
                    </span>
                  }
                </span>
              </td>

              <td>
                @let locationTypes =
                  getLocationBuildingTypes(row.legalEntities);
                @if (locationTypes.length > 0) {
                  <span
                    class="line-clamp-1 min-w-0"
                    [pTooltip]="
                      locationTypes.length >= 2
                        ? locationTypes.join(' | ')
                        : locationTypes[0]
                    "
                  >
                    {{ locationTypes.slice(0, 2).join(" | ") }}
                    @if (locationTypes.length >= 2) {
                      ...
                    }
                  </span>
                } @else {
                  <span class="text-granite-300 text-sm italic">Non connu</span>
                }
              </td>

              <td class="whitespace-nowrap">
                @let surfaceHeated = row.location.surfaceThatRequiresHeating;
                @if (surfaceHeated !== null && surfaceHeated !== undefined) {
                  {{ surfaceHeated | number: "1.0-0" }} m²
                } @else {
                  <span class="text-granite-300 text-sm italic">--</span>
                }
              </td>

              <!-- <td class="whitespace-nowrap">
                {{ row.location.sector | placeSector }}
              </td> -->
              <td class="whitespace-nowrap">
                @let nbUnits = row.location.nbUnits;
                @if (nbUnits !== null && nbUnits !== undefined) {
                  <span class="font-medium">
                    {{
                      (row.location.nbUnits | roundedNumber) +
                        " lot" +
                        (row.location.nbUnits > 1 ? "s" : "")
                    }}
                  </span>
                } @else {
                  <span class="text-granite-300 text-sm italic">--</span>
                }
              </td>
              <td>
                @let creationDate = row.location.creationDate;
                @if (creationDate) {
                  {{ creationDate | date: "yyyy" }}
                } @else {
                  <span class="text-granite-300 text-sm italic">--</span>
                }
              </td>

              <td>
                <oui-dpe-label
                  class="mx-auto"
                  size="sm"
                  [letter]="row.location.dpeLabel ?? 'NC'"
                />
              </td>

              <td>
                @let annualElectricityConsumption =
                  row.location.annualElectricityConsumption;
                @if (
                  annualElectricityConsumption !== null &&
                  annualElectricityConsumption !== undefined
                ) {
                  {{ annualElectricityConsumption / 1000 | number: "1.0-0" }}
                  MWh/an
                } @else {
                  <span class="text-granite-300 text-sm italic">Non connu</span>
                }
              </td>

              <td>
                @let heatingSystem = row.location.heatingSystem;
                @if (heatingSystem) {
                  {{ heatingSystem }}
                } @else {
                  <span class="text-granite-300 text-sm italic">Non connu</span>
                }
              </td>

              @if (!legalEntityUuid()) {
                <td
                  class="max-w-xs"
                  alignFrozen="right"
                  pFrozenColumn
                  [class.bg-primary-50]="
                    !row.legalEntities || row.legalEntities.length === 0
                  "
                  [frozen]="true"
                >
                  @if (row.legalEntities && row.legalEntities.length > 0) {
                    <div
                      class="scrollbar-custom line-clamp-1 flex h-full items-center gap-1 overflow-x-scroll"
                    >
                      @if (isBuildingUnlocked) {
                        @for (entity of row.legalEntities; track entity.name) {
                          <a
                            class="pister-link"
                            [routerLink]="[
                              '/pro/pisteur/legal-entities/details',
                              entity.uuid,
                            ]"
                          >
                            <icon-company class="size-4" />
                            <span class="truncate whitespace-nowrap">
                              {{ entity.name | lowercase }}
                            </span>
                          </a>
                        }
                      } @else {
                        <div
                          class="flex items-center gap-1 px-2 py-1 text-gray-600"
                          tooltipPosition="left"
                          [pTooltip]="
                            showDebugTooltips
                              ? buildOccupancyTooltip(row)
                              : 'Débloquez le bâtiment pour voir les entreprises liées'
                          "
                        >
                          <icon-company class="size-4" />
                          <span class="text-xs">
                            {{ row.legalEntities.length }} entreprise{{
                              row.legalEntities.length > 1 ? "s" : ""
                            }}
                            liée{{ row.legalEntities.length > 1 ? "s" : "" }}
                          </span>
                        </div>
                      }
                    </div>
                  } @else {
                    <span class="text-sm italic text-gray-300">Non connu</span>
                  }
                </td>
              }
            </tr>
          </ng-template>
        </p-table>
      </div>
    }
  `,
  imports: [
    BadgeModule,
    ButtonModule,
    DatePipe,
    DecimalPipe,
    DpeLabelComponent,
    IconBuildingComponent,
    IconCompanyComponent,
    LowerCasePipe,
    PaginatorModule,
    PlacesFiltersComponent,
    SolicitationIndicatorComponent,
    FormatAddressPipe,
    RoundedNumberPipe,
    RouterLink,
    TableModule,
    TooltipModule,
    PillCreditsComponent,
    RoundedNumberPipe,
    PlacesSearchInputComponent,
    LoaderComponent,
    IconRefreshComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlacesTableComponent {
  protected readonly showDebugTooltips =
    environment.slug === "development" || environment.slug === "preview";

  readonly dataSource = input<"default" | "leadHistory">("default");
  readonly showPlaces = input<"unlocked" | "new" | "all">("all");
  readonly hideFilters = input(false, { transform: booleanAttribute });
  readonly hideHeader = input(false, { transform: booleanAttribute });
  readonly hideSearch = input(false, { transform: booleanAttribute });
  readonly hidePaginator = input(false, { transform: booleanAttribute });
  readonly showSelection = input(false, { transform: booleanAttribute });

  readonly legalEntityUuid = input<LegalEntityUuid | null>(null);
  readonly filters = model<LocationBdnbLegalEntityFilterPro | null>(null);
  readonly pagination = model<PaginationState>({
    ...defaultPagination,
    sort: { sortBy: "dpeLabel", sortOrder: "asc" },
  });

  readonly emptyListMessage = input<string | undefined>();

  protected readonly page = computed(() => this.pagination().page);
  protected readonly pageSize = computed(() => this.pagination().pageSize);
  protected readonly sort = computed(() => this.pagination().sort);

  protected readonly sortField = computed(() => this.sort()?.sortBy ?? null);

  protected readonly sortOrder = computed(() => {
    const order = this.sort()?.sortOrder;
    if (order === "asc") {
      return 1;
    }
    if (order === "desc") {
      return -1;
    }
    return 0;
  });

  protected readonly proService = inject(ProService);
  private readonly trackingService = inject(TrackingService);
  private readonly toastService = inject(ToastService);
  private readonly dialogService = inject(DialogService);
  protected readonly placesNavigationService = inject(PlacesNavigationService);

  protected readonly hasSomeFiltersActive = computed(() => {
    const filters = this.normalizedFilters();
    if (!filters) {
      return false;
    }
    return Object.values(filters).some(
      (value) => value !== null && value !== undefined && value !== "",
    );
  });

  private previousFilters: LocationBdnbLegalEntityFilterPro | null | undefined;
  private previousLegalEntityUuid: LegalEntityUuid | null | undefined;

  private readonly resetPageOnFiltersChange = effect(() => {
    const currentFilters = this.filters();
    const currentLegalEntityUuid = this.legalEntityUuid();

    if (
      this.previousFilters === undefined &&
      this.previousLegalEntityUuid === undefined
    ) {
      this.previousFilters = currentFilters;
      this.previousLegalEntityUuid = currentLegalEntityUuid;
      return;
    }

    const hasChanged =
      JSON.stringify(currentFilters) !== JSON.stringify(this.previousFilters) ||
      currentLegalEntityUuid !== this.previousLegalEntityUuid;

    if (hasChanged) {
      this.pagination.update((state) => ({
        ...state,
        page: 0,
      }));
    }

    this.previousFilters = currentFilters;
    this.previousLegalEntityUuid = currentLegalEntityUuid;
  });

  protected readonly CONTACT_CONNECTION_COST = CONTACT_CONNECTION_COST;

  protected buildIpeTooltip(location: LocationBdnb): string | null {
    const buildingUsageLabel = location.buildingUsage
      ? BUILDING_USAGE_LABELS[location.buildingUsage]
      : "NC";
    const ipeUsageLabel = location.ipeUsage
      ? BUILDING_USAGE_LABELS[location.ipeUsage]
      : "NC";
    const ipeUsageReason =
      location.ipeUsageReason === "BUILDING_USAGE"
        ? "Usage bâtiment"
        : location.ipeUsageReason === "REFERENCE_COMPANY"
          ? "Entreprise de référence"
          : location.ipeUsageReason === "FALLBACK_TERTIARY"
            ? "Fallback tertiaire"
            : "NC";

    const referenceCompanyUuid = location.referenceCompanyUuid ?? "NC";
    const selectionReason = location.referenceCompanySelectionReason ?? "NC";
    const rawScore =
      typeof location.ipeRawScore === "number"
        ? location.ipeRawScore.toFixed(2)
        : "NC";
    const normalizedScore =
      typeof location.ipeRawScore === "number"
        ? String(getIpeNormalizedScore(location.ipeRawScore))
        : "NC";

    return [
      `Usage bâtiment: ${buildingUsageLabel}`,
      `Usage IPE: ${ipeUsageLabel}`,
      `Raison IPE: ${ipeUsageReason}`,
      `Entreprise ref: ${referenceCompanyUuid}`,
      `Raison sélection: ${selectionReason}`,
      `Score brut: ${rawScore}`,
      `Score normalisé: ${normalizedScore}`,
    ].join(" | ");
  }

  protected readonly previousTotal = signal<number | null>(null);
  protected readonly unlockedLocationUuids = signal(
    new Set<LocationBdnbUuid>(),
  );

  protected readonly selectedLocationsForUnlock = signal<PlacesRow[]>([]);

  protected readonly isBulkUnlocking = signal(false);

  protected readonly canAffordBulkUnlock = computed(() => {
    const credits = this.proService.remainingCredits();
    const selectedCount = this.selectedLocationsForUnlock().length;
    if (credits === null) {
      return false;
    }
    return credits >= this.CONTACT_CONNECTION_COST * selectedCount;
  });

  protected readonly canUnlockSelectedLocations = computed(
    () =>
      this.selectedLocationsForUnlock().length >= 2 &&
      this.canAffordBulkUnlock() &&
      !this.isBulkUnlocking(),
  );

  protected readonly bulkUnlockDisabledTooltip = computed(() => {
    const credits = this.proService.remainingCredits();
    const needed =
      this.CONTACT_CONNECTION_COST * this.selectedLocationsForUnlock().length;
    if (credits === null) {
      return "Crédits en cours de chargement...";
    }
    if (credits < needed) {
      return `Vous n'avez pas assez de crédits restants. Il vous faut au moins ${needed} crédits pour débloquer les adresses.`;
    }
    return undefined;
  });

  protected readonly hasUnlockableLocations = computed(() => {
    const locations = this.locations.value()?.locations ?? [];
    return locations.some(
      (row) =>
        !row.associations.includes("Débloqué") &&
        !this.unlockedLocationUuids().has(row.location.uuid),
    );
  });

  protected readonly normalizedFilters = computed(() => {
    const currentFilters = this.filters();

    // Ne pas passer de filtres si aucun filtre n'est défini
    return currentFilters && Object.keys(currentFilters).length > 0
      ? (() => {
          const { address, ...rest } = currentFilters;
          const normalizedAddress =
            address && address.trim().length >= 2 ? address.trim() : null;
          return {
            ...rest,
            ...(normalizedAddress ? { address: normalizedAddress } : {}),
          };
        })()
      : null;
  });

  protected readonly locations = resource({
    params: () => {
      const normalizedFilters = this.normalizedFilters();
      return {
        page: this.page(),
        pageSize: this.pageSize(),
        dataSource: this.dataSource(),
        showPlaces: this.showPlaces(),
        legalEntityUuid: this.legalEntityUuid(),
        sort: this.sort() ?? undefined,
        filters: normalizedFilters,
      };
    },
    loader: async ({ params, abortSignal }) => {
      const {
        page,
        pageSize,
        dataSource,
        sort,
        showPlaces,
        legalEntityUuid,
        filters,
      } = params;
      try {
        const response =
          dataSource === "leadHistory"
            ? await trpcClient.locationsBdnb.getLeadHistoryPaginatedForPro.query(
                {
                  page,
                  pageSize,
                },
                { signal: abortSignal },
              )
            : await trpcClient.locationsBdnb.getAllPaginatedForPro.mutate(
                {
                  ...(filters ?? {}),
                  page,
                  pageSize,
                  sort,
                  show: showPlaces,
                  legalEntityUuid,
                },
                { signal: abortSignal },
              );

        this.previousTotal.set(response.total);

        return {
          count: response.total,
          locations: response.items.map((row) => {
            return {
              location: row.location,
              legalEntities: row.legalEntities ?? [],
              associations: row.associations ?? [],
              occupancyCounts: row.occupancyCounts ?? null,
              // locationType: getLegalEntityTypeLabelFromArray(row.legalEntities),
            };
          }),
        };
      } catch (error) {
        this.toastService.openError("Récupération des bâtiments.", error);
        return { count: 0, locations: [] };
      }
    },
  });

  private readonly syncLocationsList = effect(() => {
    if (
      this.locations.isLoading() ||
      this.locations.error() ||
      !this.locations.value()
    ) {
      return;
    }

    const locationsUuids =
      this.locations.value()?.locations.map((loc) => loc.location.uuid) ?? [];

    const normalizedFilters = this.normalizedFilters();

    this.placesNavigationService.queryContext.set({
      page: this.page(),
      pageSize: this.pageSize(),
      sort: this.sort() ?? null,
      show: this.showPlaces(),
      legalEntityUuid: this.legalEntityUuid(),
      filters: normalizedFilters,
    });

    this.placesNavigationService.locationsList.set(locationsUuids);
  });

  protected onSort(event: { field?: string; order?: 1 | -1 }) {
    const nextField = isPlacesSortField(event.field) ? event.field : null;

    let newOrder: "asc" | "desc" | null = null;
    if (event.order === 1) {
      newOrder = "asc";
    } else if (event.order === -1) {
      newOrder = "desc";
    }

    this.pagination.update((state) => ({
      ...state,
      page: 0,
      sort:
        nextField && newOrder
          ? {
              sortBy: nextField,
              sortOrder: newOrder,
            }
          : null,
    }));
  }

  protected readonly totalCount = computed(() =>
    Number(this.locations.value()?.count ?? this.previousTotal() ?? 0),
  );

  protected onPageChange(event: { first: number; rows: number }) {
    const current = this.pagination();
    const newPageSize = event.rows ?? current.pageSize;
    const newPage = Math.floor((event.first ?? 0) / newPageSize);

    if (newPageSize === current.pageSize && newPage === current.page) {
      return;
    }

    this.pagination.update((state) => ({
      ...state,
      page: newPage,
      pageSize: newPageSize,
    }));
  }

  private readonly formatAddressPipe = new FormatAddressPipe();

  private applyUnlockSuccess(
    unlockedUuids: LocationBdnbUuid[],
    successCount: number,
    message: string,
  ) {
    if (successCount <= 0) {
      return;
    }

    this.unlockedLocationUuids.update((uuids) => {
      const next = new Set(uuids);
      for (const locationUuid of unlockedUuids) {
        next.add(locationUuid);
      }
      return next;
    });

    this.proService.refresh();
    this.toastService.open("success", "Déblocage entreprise", message);
  }

  protected async buyLocationContact(location: LocationBdnb) {
    try {
      await trpcClient.locationsBdnb.connectWithLocation.mutate(location.uuid);

      this.applyUnlockSuccess(
        [location.uuid],
        1,
        "Les entreprises associées ont bien été débloquées.",
      );
      this.locations.reload();
      const address = this.formatAddressPipe.transform(location);
      this.trackingService.trackPro("pro_credits_consumed", {
        credits_used: this.CONTACT_CONNECTION_COST,
        type: "entreprise",
        source_page: "batiment",
        entity_id: location.uuid,
        ...(address ? { entity_name: address } : {}),
        action: "Déblocage entreprises associées (bâtiment)",
      });

      return true;
    } catch (error) {
      this.toastService.openError("Demande de contact", error);
      return false;
    }
  }

  protected buildOccupancyTooltip(row: {
    occupancyCounts?: BuildingOccupancyCounts | null;
    legalEntities?: Array<{ type: string }> | null;
  }): string {
    if (!row.occupancyCounts) {
      return "Statut: NC | données d'occupation indisponibles";
    }
    const { siretCount, sirenOnlyCount } = row.occupancyCounts;
    const hasSyndic =
      row.legalEntities?.some((entity) => entity.type === "copro") ?? false;

    const status = getBuildingOccupancyStatus(
      siretCount,
      sirenOnlyCount,
      hasSyndic,
    );
    if (!status) {
      return (
        "Statut: NC" +
        `\nNb Siret: ${siretCount}` +
        `\nNb Siren Only: ${sirenOnlyCount}` +
        "\nRègle: aucune règle"
      );
    }
    let rule: string;
    switch (status) {
      case "OWNER_OCCUPANT":
        rule = "siretCount === 1";
        break;
      case "OWNER":
        rule = "sirenOnlyCount === 1";
        break;
      case "SYNDIC":
        rule = "legalEntityType === 'copro'";
        break;
      case "MIXED":
        rule = "siretCount >= 2";
        break;
      default:
        rule = "aucune règle";
    }

    return (
      `Statut: ${BUILDING_OCCUPANCY_STATUS_LABELS[status]}` +
      `\nNb Siret: ${siretCount}` +
      `\nNb Siren Only: ${sirenOnlyCount}` +
      `\nRègle: ${rule}`
    );
  }

  protected onSelectionChange(selection: PlacesRow[]) {
    const filteredSelection = selection.filter(
      (row) =>
        !row.associations.includes("Débloqué") &&
        !this.unlockedLocationUuids().has(row.location.uuid),
    );
    this.selectedLocationsForUnlock.set(filteredSelection);
  }

  protected async unlockSelectedLocations() {
    const selectedLocations = this.selectedLocationsForUnlock();
    if (selectedLocations.length < 2 || this.isBulkUnlocking()) {
      return;
    }

    const description =
      "Vous êtes sur le point de débloquer les entreprises associées à " +
      selectedLocations.length +
      " bâtiments.";
    const { res: confirmed } = await this.dialogService.open(
      DialogConfirmationComponent,
      {
        data: {
          icon: "company",
          title: "Débloquer les adresses ?",
          description,
          actionColor: "green",
        },
      },
    );

    if (!confirmed) {
      return;
    }

    this.isBulkUnlocking.set(true);
    try {
      const locationUuids = selectedLocations.map((row) => row.location.uuid);
      const { count, unlockedUuids } =
        await trpcClient.locationsBdnb.connectWithLocations.mutate(
          locationUuids,
        );

      this.applyUnlockSuccess(
        unlockedUuids,
        count,
        `${count} bâtiment(s) débloqué(s).`,
      );

      this.locations.reload();

      if (count > 0) {
        this.trackingService.trackPro("pro_credits_consumed", {
          credits_used: this.CONTACT_CONNECTION_COST * count,
          type: "entreprise",
          source_page: "batiment",
          entity_id:
            locationUuids.length > 10
              ? `${locationUuids.slice(0, 5).join(",")}...(${locationUuids.length} total)`
              : locationUuids.join(","),
          entity_name: `${count} bâtiment(s)`,
          action: "Déblocage entreprises associées (bâtiments multiples)",
          count,
        });
      }
    } catch (error) {
      this.toastService.openError("Demande de contact", error);
    } finally {
      this.selectedLocationsForUnlock.set([]);
      this.isBulkUnlocking.set(false);
    }
  }

  protected getDepartmentCode(zipcode: string | null | undefined) {
    return getDepartmentByCode(zipcode);
  }

  protected getLocationBuildingTypes(
    legalEntities:
      | Array<{ mainBusinessActivity?: string | null }>
      | null
      | undefined,
  ) {
    const codes =
      legalEntities
        ?.map((entity) => entity.mainBusinessActivity ?? null)
        .filter((code): code is NafCode => Boolean(code)) ?? [];

    return getLocationBuildingTypeLabelsFromNafCodes(codes);
  }
}
