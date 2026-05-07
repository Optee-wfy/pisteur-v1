import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import type {
  BuildingOccupancyStatus,
  BuildingUsage,
  ClimateZone,
  Department,
  DpeLabel,
  EnergyType,
  LocationBdnbLegalEntityFilterPro,
  LocationTypeNafCategory,
  NafCode,
  Sector,
} from "@optee/constants";
import {
  areSameNafCodes,
  buildActivitySectorGroups,
  BUILDING_OCCUPANCY_STATUS,
  BUILDING_OCCUPANCY_STATUS_LABELS,
  BUILDING_USAGE,
  BUILDING_USAGE_LABELS,
  buildLocationBuildingTypeCodes,
  CLIMATE_ZONES,
  DPE_LABELS,
  FILTERED_ENERGY_TYPES,
  formatBuildingUsageValue,
  formatLocationBuildingTypeValue,
  FRENCH_DEPARTMENTS,
  FRENCH_REGION_DEPARTMENT_GROUPS,
  getDepartments,
  getLocationBuildingTypeSelection,
  GLOBAL_DATE_RANGE,
  LOCATION_FILTER_RANGES,
  LOCATION_SECTORS,
  locationBuildingTypeOptions,
  SECTOR_DATA,
} from "@optee/constants";
import { DpeLabelComponent } from "@optee/ui/components/atoms/dpe-label/dpe-label.component";
import { removeNullishProps } from "@optee/utils";
import { SelectButtonModule } from "primeng/selectbutton";
import { debounceTime, map, startWith } from "rxjs";

import { DialogService } from "@optee/dialog";
import {
  IconBoltComponent,
  IconBriefCaseComponent,
  IconCategoryComponent,
  IconChartBisComponent,
  IconCircularDiagramComponent,
  IconFiltersComponent,
  IconHouseWithUserComponent,
  IconLocationDotComponent,
  IconRefreshComponent,
  IconSearchComponent,
  IconStarComponent,
} from "@optee/icons";
import { PillOptionComponent } from "@optee/ui/components/atoms/pill/pill-option/pill-option.component";
import { createNumberRangeControl } from "@optee/ui/functions/create-number-range-control.fn";
import { CheckboxModule } from "primeng/checkbox";
import { InputText } from "primeng/inputtext";
import { SliderModule } from "primeng/slider";
import { Tooltip } from "primeng/tooltip";
import {
  OptionsGroupSelectorComponent,
  type OptionGroupSelectorGroup,
} from "../../../../../components/shared/options-group-selector/options-group-selector.component";
import {
  OptionsSelectorComponent,
  type OptionSelectorOption,
} from "../../../../../components/shared/options-selector/options-selector.component";
import { FilterPermissionsService } from "../../../../../services/filter-permissions.service";
import { TrackingService } from "../../../../../services/tracking.service";
import { PlacesParamsService } from "../../../services/places-filters.service";
import { ButtonFilterPopoverComponent } from "../../button-filter-popover/button-filter-popover.component";
import { FiltersModalComponent } from "../../places-legal-entities-filters/places-legal-entities-filters-modal/places-legal-entities-filters.modal.component";
@Component({
  selector: "mkp-places-filters",
  host: {
    "[class]": "hostClass()",
  },
  template: `
    @let hasActiveFilters = filtersCount() > 0;
    <button
      (click)="openFiltersDialog()"
      [class]="filterButtonClass()"
      [disabled]="filterPermissions.isLoadingSubscription()"
    >
      @if (variant() === "leads") {
        <span class="flex size-8 items-center justify-center text-green-600">
          <icon-filters class="size-4" />
        </span>
      } @else {
        <icon-filters class="size-4" />
      }
      Filtrer
      @if (hasActiveFilters) {
        <span [class]="activeFiltersCountClass()">
          {{ filtersCount() }}
        </span>
      }
    </button>

    @if (hasActiveFilters) {
      <button
        pTooltip="Réinitialiser les filtres"
        tooltipPosition="bottom"
        (click)="filters.set(null)"
        [class]="resetButtonClass()"
      >
        <icon-refresh class="text-granite-700 size-3" slot="icon" />
      </button>
    }
    @if (filterPermissions.isLoadingSubscription()) {
      <div class="ml-4 text-xs italic">Chargement des filtres...</div>
    } @else {
      <form
        style="scrollbar-width: thin;"
        [class]="formClass()"
        [formGroup]="locationFilterForm"
      >
        @if (
          showSearchAddressFilter() &&
          filterPermissions.isFilterAccessible("address")
        ) {
          <!-- Search Adresse -->
          <div [class]="searchFieldClass()">
            <icon-search class="size-3" />
            <input
              class="placeholder-granite-900 h-full appearance-none border-none !pr-0.5 text-sm font-medium focus:outline-none"
              pInputText
              placeholder="Rechercher par adresse"
              role="searchbox"
              size="small"
              type="search"
              [formControl]="locationFilterForm.controls.address"
            />
          </div>
        }

        <!-- Usage Bâtiment -->
        <mkp-button-filter-popover
          label="Usage Bâtiment"
          (clear)="locationFilterForm.controls.buildingUsage.setValue([])"
          (clicked)="onPopoverClick('buildingUsage', $event)"
          [hasSelected]="
            locationFilterForm.controls.buildingUsage.value.length > 0
          "
          [isFilterAccessible]="
            filterPermissions.isFilterAccessible('buildingUsage')
          "
          [selectedValue]="formatBuildingUsageValue()"
          [variant]="variant()"
        >
          <icon-circular-diagram class="size-4" iconSlot />
          <div class="max-w-prose px-2 py-2">
            <p-selectButton
              class="p-selectButton--transparent p-selectButton--pill"
              [formControl]="locationFilterForm.controls.buildingUsage"
              [multiple]="true"
              [options]="buildingUsageOptions"
            >
              <ng-template let-option pTemplate="item">
                <oui-pill-option
                  class="font-sans"
                  [control]="locationFilterForm.controls.buildingUsage"
                  [value]="option.value"
                >
                  {{ option.label }}
                </oui-pill-option>
              </ng-template>
            </p-selectButton>
          </div>
        </mkp-button-filter-popover>

        <!-- Acteur bâtiment -->
        @if (showActeurBatimentFilter()) {
          <mkp-button-filter-popover
            label="Acteur bâtiment"
            (clear)="
              locationFilterForm.controls.buildingOccupancyStatus.setValue([])
            "
            (clicked)="onPopoverClick('buildingOccupancyStatus', $event)"
            [hasSelected]="
              locationFilterForm.controls.buildingOccupancyStatus.value.length >
              0
            "
            [isFilterAccessible]="
              filterPermissions.isFilterAccessible('buildingOccupancyStatus')
            "
            [selectedValue]="formatBuildingOccupancyStatusValue()"
            [variant]="variant()"
          >
            <icon-house-with-user class="size-4" iconSlot />
            <div class="max-w-prose px-2 py-2">
              <p-selectButton
                class="p-selectButton--transparent p-selectButton--pill"
                [formControl]="
                  locationFilterForm.controls.buildingOccupancyStatus
                "
                [multiple]="true"
                [options]="buildingOccupancyStatusOptions"
              >
                <ng-template let-option pTemplate="item">
                  <oui-pill-option
                    class="font-sans"
                    [control]="
                      locationFilterForm.controls.buildingOccupancyStatus
                    "
                    [value]="option.value"
                  >
                    {{ option.label }}
                  </oui-pill-option>
                </ng-template>
              </p-selectButton>
            </div>
          </mkp-button-filter-popover>
        }

        <!-- Département -->
        <mkp-button-filter-popover
          label="Département"
          (clear)="clearDepartmentFilters()"
          (clicked)="onPopoverClick('locationDepartment', $event)"
          [hasSelected]="
            (locationFilterForm.controls.locationDepartment.value?.length ??
              0) > 0
          "
          [isFilterAccessible]="
            filterPermissions.isFilterAccessible('locationDepartment')
          "
          [selectedValue]="formatDepartmentValue()"
          [variant]="variant()"
        >
          <icon-location-dot class="size-4" iconSlot />
          <div class="flex flex-col gap-3 px-2 py-2">
            <mkp-options-group-selector
              searchPlaceholder="Rechercher un département..."
              [formControl]="locationFilterForm.controls.locationDepartment"
              [groups]="departmentOptions"
              [showSearch]="true"
            />
            <p-selectButton
              class="p-selectButton--transparent p-selectButton--pill"
              [formControl]="climateZones"
              [multiple]="true"
              [options]="climateZoneOptions"
            >
              <ng-template let-option pTemplate="item">
                <oui-pill-option [control]="climateZones" [value]="option">
                  {{ option }}
                </oui-pill-option>
              </ng-template>
            </p-selectButton>
          </div>
        </mkp-button-filter-popover>

        <!-- Type d'énergie -->
        <mkp-button-filter-popover
          label="Énergie"
          (clear)="locationFilterForm.controls.energyType.setValue([])"
          (clicked)="onPopoverClick('energyType', $event)"
          [hasSelected]="
            locationFilterForm.controls.energyType.value.length > 0
          "
          [isFilterAccessible]="
            filterPermissions.isFilterAccessible('energyType')
          "
          [selectedValue]="formatEnergyTypeValue()"
          [variant]="variant()"
        >
          <icon-bolt class="size-4" iconSlot />
          <p-selectButton
            class="p-selectButton--transparent p-selectButton--pill"
            [formControl]="locationFilterForm.controls.energyType"
            [multiple]="true"
            [options]="energyTypeOptions"
          >
            <ng-template let-option pTemplate="item">
              <oui-pill-option
                class="font-sans"
                [control]="locationFilterForm.controls.energyType"
                [value]="option"
              >
                {{ option }}
              </oui-pill-option>
            </ng-template>
          </p-selectButton>
        </mkp-button-filter-popover>

        <!-- Consommation annuelle bâtiment -->
        <mkp-button-filter-popover
          label="Consommation"
          (clear)="
            locationFilterForm.controls.annualElectricityConsumption.setValue(
              null
            )
          "
          (clicked)="onAnnualElectricityPopoverClick($event)"
          [hasSelected]="
            locationFilterForm.controls.annualElectricityConsumption.value !==
            null
          "
          [isFilterAccessible]="
            filterPermissions.isFilterAccessible('annualElectricityConsumption')
          "
          [selectedValue]="formatAnnualElectricityConsumptionValue()"
          [variant]="variant()"
        >
          <icon-chart-bis class="size-4" iconSlot />
          <div class="flex w-64 flex-col gap-2 px-4 pt-2">
            <p-slider
              class="w-56"
              styleClass="w-full"
              [formControl]="
                locationFilterForm.controls.annualElectricityConsumption
              "
              [max]="locationRanges.ANNUAL_ELEC_CONSUMPTION_2020[1]"
              [min]="locationRanges.ANNUAL_ELEC_CONSUMPTION_2020[0]"
              [range]="true"
            />
            <div class="text-granite-600 flex justify-between gap-2 text-sm">
              <span class="w-20">
                {{
                  formatAnnualElectricityConsumptionNumber(
                    locationFilterForm.controls.annualElectricityConsumption
                      .value?.[0]
                  )
                }}
                MWh
              </span>
              -
              <span class="w-20">
                {{
                  formatAnnualElectricityConsumptionNumber(
                    locationFilterForm.controls.annualElectricityConsumption
                      .value?.[1]
                  )
                }}
                MWh
              </span>
            </div>
          </div>
        </mkp-button-filter-popover>

        <!-- Type d'entreprise -->
        @if (showPlaceTypeFilter()) {
          <mkp-button-filter-popover
            label="Type d'entreprise"
            (clear)="locationBuildingTypeSelection.setValue([])"
            (clicked)="onPopoverClick('locationBuildingType', $event)"
            [hasSelected]="locationBuildingTypeSelection.value.length > 0"
            [isFilterAccessible]="
              filterPermissions.isFilterAccessible('locationBuildingType')
            "
            [selectedValue]="formatLocationBuildingTypeValue()"
            [variant]="variant()"
          >
            <icon-brief-case class="size-4" iconSlot />
            <div class="max-w-prose px-2 py-2">
              <mkp-options-selector
                searchPlaceholder="Rechercher un type d'entreprise..."
                [formControl]="locationBuildingTypeSelection"
                [maxSelectable]="4"
                [options]="locationBuildingTypeOptions"
                [showSearch]="true"
              />
            </div>
          </mkp-button-filter-popover>
        }

        <!-- Secteur d'activité -->
        @if (showSecteurActiviteFilter()) {
          <mkp-button-filter-popover
            label="Secteur d'activité"
            (clear)="
              locationFilterForm.controls.mainBusinessActivity.setValue([])
            "
            (clicked)="onPopoverClick('mainBusinessActivity', $event)"
            [hasSelected]="
              locationFilterForm.controls.mainBusinessActivity.value.length > 0
            "
            [isFilterAccessible]="
              filterPermissions.isFilterAccessible('mainBusinessActivity')
            "
            [selectedValue]="formatMainBusinessActivityValue()"
            [variant]="variant()"
          >
            <icon-category class="size-4" iconSlot />
            <div class="max-w-prose px-2 py-2">
              <mkp-options-group-selector
                searchPlaceholder="Rechercher un secteur d'activité..."
                [formControl]="locationFilterForm.controls.mainBusinessActivity"
                [groups]="activitySectorGroups"
                [showSearch]="true"
              />
            </div>
          </mkp-button-filter-popover>
        }

        <!-- Score DPE -->
        <mkp-button-filter-popover
          label="Note énergétique"
          (clear)="locationFilterForm.controls.dpe.setValue([])"
          (clicked)="onPopoverClick('dpe', $event)"
          [hasSelected]="
            (locationFilterForm.controls.dpe.value?.length ?? 0) > 0
          "
          [isFilterAccessible]="filterPermissions.isFilterAccessible('dpe')"
          [selectedValue]="formatDpeValue()"
          [variant]="variant()"
        >
          <icon-star class="size-4" iconSlot [filled]="true" />
          @for (dpe of dpeLabels; track dpe; let i = $index) {
            <div
              class="hover:bg-granite-100 text-granite-900 flex items-center rounded-lg p-2 text-sm font-medium transition-all"
            >
              <p-checkbox
                [formControl]="locationFilterForm.controls.dpe"
                [inputId]="'dpe-' + i"
                [value]="dpe.value"
              />
              <label class="ml-2 cursor-pointer" [for]="'dpe-' + i">
                @if (dpe.value === "NC") {
                  <span class="leading-7">Non communiqué</span>
                } @else {
                  <oui-dpe-label size="sm" [letter]="dpe.label" />
                }
              </label>
            </div>
          }
        </mkp-button-filter-popover>
      </form>
    }
  `,
  imports: [
    CheckboxModule,
    DpeLabelComponent,
    ButtonFilterPopoverComponent,
    FormsModule,
    PillOptionComponent,
    ReactiveFormsModule,
    SelectButtonModule,
    SliderModule,
    OptionsGroupSelectorComponent,
    OptionsSelectorComponent,
    IconFiltersComponent,
    IconLocationDotComponent,
    IconBoltComponent,
    IconBriefCaseComponent,
    IconSearchComponent,
    IconCategoryComponent,
    IconStarComponent,
    IconChartBisComponent,
    InputText,
    IconCircularDiagramComponent,
    Tooltip,
    IconRefreshComponent,
    IconHouseWithUserComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlacesFiltersComponent {
  readonly variant = input<"default" | "leads">("default");
  readonly showPlaceTypeFilter = input(true);
  readonly showSearchAddressFilter = input(true);
  readonly showActeurBatimentFilter = input(true);
  readonly showSecteurActiviteFilter = input(true);
  readonly showSurfaceFilter = input(false);
  readonly filters = model<LocationBdnbLegalEntityFilterPro | null>(null);

  protected readonly locationRanges = LOCATION_FILTER_RANGES;
  protected readonly filterPermissions = inject(FilterPermissionsService);
  private readonly trackingService = inject(TrackingService);
  protected readonly paramsService = inject(PlacesParamsService);
  private readonly dialogService = inject(DialogService);

  protected readonly activitySectorGroups: OptionGroupSelectorGroup<NafCode>[] =
    buildActivitySectorGroups();

  protected readonly minDate = GLOBAL_DATE_RANGE[0];
  protected readonly maxDate = GLOBAL_DATE_RANGE[1];

  protected readonly departmentOptions = FRENCH_REGION_DEPARTMENT_GROUPS;
  protected readonly dpeLabels = [
    ...DPE_LABELS.map((dpe) => ({ label: dpe, value: dpe })),
    { value: "NC", label: "Non connu" },
  ] as const;

  protected readonly energyTypeOptions = FILTERED_ENERGY_TYPES;

  protected readonly buildingUsageOptions = BUILDING_USAGE.map((value) => ({
    label: BUILDING_USAGE_LABELS[value],
    value,
  }));

  protected readonly buildingOccupancyStatusOptions =
    BUILDING_OCCUPANCY_STATUS.map((value) => ({
      label: BUILDING_OCCUPANCY_STATUS_LABELS[value],
      value,
    }));

  protected readonly filteredSectorOptions = computed(() => {
    const search = this.searchSector().trim().toLowerCase();
    if (!search) {
      return this.sectorOptions;
    }
    return this.sectorOptions.filter((sector) =>
      sector.label.toLowerCase().includes(search),
    );
  });

  protected readonly sectorOptions = SECTOR_DATA.map((locationSector) => ({
    label: LOCATION_SECTORS[locationSector],
    value: locationSector,
  }));

  protected readonly locationBuildingTypeSelection = new FormControl<
    LocationTypeNafCategory[]
  >([], { nonNullable: true });

  protected readonly locationBuildingTypeOptions: OptionSelectorOption<LocationTypeNafCategory>[] =
    locationBuildingTypeOptions;

  protected readonly climateZoneOptions = [...CLIMATE_ZONES];
  protected readonly climateZones = new FormControl<ClimateZone[]>([]);
  private readonly syncClimateZoneWithDepartmentControl =
    this.climateZones.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((zones) => {
        if (
          !zones ||
          zones.length === 0 ||
          zones.length === CLIMATE_ZONES.length
        ) {
          this.locationFilterForm.controls.locationDepartment.setValue([]);
          return;
        }

        this.locationFilterForm.controls.locationDepartment.setValue(
          zones.map((zone) => getDepartments(zone)).flat(),
        );
      });

  protected readonly locationFilterForm = new FormGroup({
    locationDepartment: new FormControl<Department[]>([]),
    dpe: new FormControl<(DpeLabel | "NC")[]>([]),
    annualElectricityConsumption: createNumberRangeControl([
      ...this.locationRanges.ANNUAL_ELEC_CONSUMPTION_2020,
    ]),
    // legalEntityTypes: new FormControl<LegalEntityFilterType[]>([], {
    //   nonNullable: true,
    // }),
    locationBuildingType: new FormControl<NafCode[]>([], { nonNullable: true }),
    energyType: new FormControl<EnergyType[]>([], { nonNullable: true }),
    address: new FormControl<string | null>(null),
    sector: new FormControl<Sector[]>([], { nonNullable: true }),
    buildingUsage: new FormControl<BuildingUsage[]>([], { nonNullable: true }),
    buildingOccupancyStatus: new FormControl<BuildingOccupancyStatus[]>([], {
      nonNullable: true,
    }),
    mainBusinessActivity: new FormControl<string[]>([], {
      nonNullable: true,
    }),
  });

  protected readonly hostClass = computed(() =>
    this.variant() === "leads"
      ? "border-granite-100 mx-4 mt-1 flex w-auto items-center gap-2 overflow-hidden rounded-[16px] border bg-white px-3 py-2 shadow-sm"
      : "border-granite-100 table-width-container flex h-12 w-full items-center gap-2 overflow-hidden border-b bg-white px-4",
  );

  protected readonly filterButtonClass = computed(() =>
    this.variant() === "leads"
      ? "text-granite-900 flex h-8 shrink-0 items-center gap-2 rounded-full bg-white pl-1 pr-2 text-[0.9rem] font-semibold transition-all"
      : "prospect-button",
  );

  protected readonly activeFiltersCountClass = computed(() =>
    this.variant() === "leads"
      ? "bg-green-600 text-white inline-flex min-w-4 items-center justify-center rounded-full px-1.5 py-0 text-[10px] font-semibold"
      : "inline-flex size-4 items-center justify-center rounded-full bg-white p-1 text-xs text-green-600",
  );

  protected readonly resetButtonClass = computed(() =>
    this.variant() === "leads"
      ? "border-granite-200 hover:border-granite-300 flex size-7 shrink-0 items-center justify-center rounded-xl border bg-white"
      : "border-granite-300 hover:border-granite-700 flex size-6 items-center justify-center rounded-lg border",
  );

  protected readonly formClass = computed(() =>
    this.variant() === "leads"
      ? "flex flex-1 flex-wrap items-center gap-1 overflow-x-auto overflow-y-hidden"
      : "flex flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden",
  );

  protected readonly searchFieldClass = computed(() =>
    this.variant() === "leads"
      ? "text-granite-900 border-granite-200 hover:border-granite-300 flex h-8 min-w-52 flex-shrink-0 items-center justify-start rounded-full border bg-white py-1 pl-3 pr-2 transition-all"
      : "text-granite-900 border-granite-100 hover:border-granite-400 flex h-7 min-w-52 flex-shrink-0 items-center justify-start rounded-lg border py-1 pl-3 pr-1 transition-all",
  );

  protected readonly filtersCount = signal(0);
  protected readonly searchHeatingSystem = signal("");
  protected readonly searchSector = signal("");

  protected clearDepartmentFilters() {
    this.climateZones.setValue([]);
    this.locationFilterForm.controls.locationDepartment.setValue([]);
  }

  private readonly applyInitialFilter = effect(() => {
    const filters = this.filters();
    if (!filters) {
      this.resetAllFilters();
      return;
    }

    this.locationFilterForm.patchValue(removeNullishProps(filters), {
      emitEvent: false,
    });

    const { mainBusinessActivity, locationBuildingType } = filters;
    const nextLocationBuildingTypeSelection =
      getLocationBuildingTypeSelection(locationBuildingType);
    const currentLocationBuildingTypeSelection =
      this.locationBuildingTypeSelection.value;
    const hasLocationBuildingTypeSelectionChanged =
      nextLocationBuildingTypeSelection.length !==
        currentLocationBuildingTypeSelection.length ||
      nextLocationBuildingTypeSelection.some(
        (value) => !currentLocationBuildingTypeSelection.includes(value),
      );
    if (hasLocationBuildingTypeSelectionChanged) {
      this.locationBuildingTypeSelection.setValue(
        nextLocationBuildingTypeSelection,
        { emitEvent: false },
      );
    }
    const nextMainBusinessActivity = mainBusinessActivity ?? [];
    const currentMainBusinessActivity =
      this.locationFilterForm.controls.mainBusinessActivity.value;
    const hasChanged =
      nextMainBusinessActivity.length !== currentMainBusinessActivity.length ||
      nextMainBusinessActivity.some(
        (activity) => !currentMainBusinessActivity.includes(activity),
      );
    if (hasChanged) {
      this.locationFilterForm.controls.mainBusinessActivity.setValue(
        nextMainBusinessActivity,
      );
    }
    this.filtersCount.set(Object.keys(filters).length);
  });

  private readonly syncLocationBuildingTypeSelection =
    this.locationBuildingTypeSelection.valueChanges
      .pipe(
        startWith(this.locationBuildingTypeSelection.value),
        takeUntilDestroyed(),
      )
      .subscribe((categories) => {
        const nextCodes = buildLocationBuildingTypeCodes(categories);
        const control = this.locationFilterForm.controls.locationBuildingType;
        if (!areSameNafCodes(control.value, nextCodes)) {
          control.setValue(nextCodes);
        }
      });

  protected formatMainBusinessActivityValue(): string {
    const mainBusinessActivity =
      this.locationFilterForm.controls.mainBusinessActivity.value;
    return !mainBusinessActivity || mainBusinessActivity.length === 0
      ? ""
      : mainBusinessActivity.length + " secteur(s) sélectionné(s)";
  }

  protected formatBuildingUsageValue(): string {
    return formatBuildingUsageValue(
      this.locationFilterForm.controls.buildingUsage.value ?? null,
    );
  }

  protected formatLocationBuildingTypeValue(): string {
    return formatLocationBuildingTypeValue(
      this.locationBuildingTypeSelection.value,
    );
  }

  protected formatBuildingOccupancyStatusValue(): string {
    const values =
      this.locationFilterForm.controls.buildingOccupancyStatus.value ?? [];
    if (values.length === 0) {
      return "";
    }
    if (values.length === this.buildingOccupancyStatusOptions.length) {
      return "";
    }
    return (
      values
        .slice(0, 2)
        .map((value) => BUILDING_OCCUPANCY_STATUS_LABELS[value])
        .join(", ") + (values.length > 2 ? "..." : "")
    );
  }

  protected formatDepartmentValue(): string {
    const deps = this.locationFilterForm.controls.locationDepartment.value;
    return !deps ||
      deps.length === 0 ||
      deps.length === FRENCH_DEPARTMENTS.length
      ? ""
      : deps.slice(0, 2).join(", ") + (deps.length > 2 ? "..." : "");
  }

  // protected formatLegalEntityTypeValue(): string {
  //   const types = this.locationFilterForm.controls.legalEntityTypes.value;
  //   return !types || types.length === 0
  //     ? ""
  //     : types
  //         .slice(0, 2)
  //         .map((t) => this.getLegalEntityTypeLabel(t))
  //         .join(", ") + (types.length > 2 ? "..." : "");
  // }

  protected formatEnergyTypeValue(): string {
    const energies = this.locationFilterForm.controls.energyType.value;
    return !energies ||
      energies.length === 0 ||
      energies.length === this.energyTypeOptions.length
      ? ""
      : energies.slice(0, 2).join(", ") + (energies.length > 2 ? "..." : "");
  }

  protected formatSectorValue(): string {
    const sector = this.locationFilterForm.controls.sector.value;
    return !sector ||
      sector.length === 0 ||
      sector.length === this.sectorOptions.length
      ? ""
      : String(sector.length);
  }

  protected formatAnnualElectricityConsumptionValue(): string {
    const val =
      this.locationFilterForm.controls.annualElectricityConsumption.value;
    if (!val) {
      return "";
    }

    const minValue = this.formatAnnualElectricityConsumptionNumber(val[0]);
    const maxValue = this.formatAnnualElectricityConsumptionNumber(val[1]);
    return `${minValue}-${maxValue} MWh`;
  }

  protected formatAnnualElectricityConsumptionNumber(
    value: number | null | undefined,
  ): string {
    if (value === null || value === undefined) {
      return "";
    }

    // Convert to MWh
    const valueInMWh = value / 1000;

    return valueInMWh.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  protected formatDpeValue(): string {
    const dpes = this.locationFilterForm.controls.dpe.value;
    return !dpes || dpes.length === 0 || dpes.length === this.dpeLabels.length
      ? ""
      : dpes.slice(0, 3).join(", ") + (dpes.length > 3 ? "..." : "");
  }

  protected setAnnualElectricityConsumptionRange(
    event: "opened" | "closed",
  ): void {
    if (
      event === "opened" &&
      this.locationFilterForm.controls.annualElectricityConsumption.value ===
        null
    ) {
      this.locationFilterForm.controls.annualElectricityConsumption.setValue([
        ...this.locationRanges.ANNUAL_ELEC_CONSUMPTION_2020,
      ]);
    }
  }

  private readonly syncInputWithFormValues =
    this.locationFilterForm.valueChanges
      .pipe(
        debounceTime(800),
        takeUntilDestroyed(),
        map((filters) => {
          const address = filters.address ?? null;

          return removeNullishProps({
            ...(this.filters() ?? {}),
            ...filters,
            address,
          });
        }),
      )
      .subscribe((filters) => this.filters.set(filters));

  async openFiltersDialog() {
    this.trackFiltersUsage("places_filters");
    const { res: newFilters } = await this.dialogService.open(
      FiltersModalComponent,
      {
        data: { filters: this.filters(), filtersPageType: "places" },
      },
    );

    if (!newFilters) {
      return;
    } // Dialog closed without applying changes

    const cleanedNewFilters = removeNullishProps(newFilters || {});
    const nextFilters =
      Object.keys(cleanedNewFilters).length > 0 ? cleanedNewFilters : null;

    this.filtersCount.set(nextFilters ? Object.keys(nextFilters).length : 0);
    this.filters.set(nextFilters);
    if (!nextFilters) {
      this.resetAllFilters();
    }
  }

  private trackFiltersUsage(
    sourceComponent: string,
    extraProperties?: Record<string, string | number | boolean>,
    filtersSnapshot?: Record<string, unknown>,
    includeSnapshot = true,
  ) {
    const cleanedFilters = removeNullishProps(
      (filtersSnapshot ?? this.filters() ?? {}) as Record<string, unknown>,
    );
    const { address, ...safeFilters } = cleanedFilters;
    const filterKeys = Object.keys(safeFilters);
    this.trackingService.trackPro("pro_filters_used", {
      source_component: sourceComponent,
      filters_page_type: "places",
      ...(includeSnapshot
        ? {
            filters_count: filterKeys.length,
            global_filters_keys: filterKeys.join(","),
            global_filters_values: JSON.stringify(
              address ? { ...safeFilters, address_present: true } : safeFilters,
            ),
          }
        : {}),
      ...(extraProperties ?? {}),
    });
  }

  protected onPopoverClick(filterKey: string, event: "opened" | "closed") {
    if (event !== "closed") {
      return;
    }
    const filtersSnapshot = this.buildFiltersSnapshot();
    const filterValue = this.getFilterValue(filterKey);
    this.trackFiltersUsage(
      "places_filters_popover",
      {
        active_filter_key: filterKey,
        ...(filterValue !== undefined
          ? { active_filter_value: JSON.stringify(filterValue) }
          : {}),
      },
      filtersSnapshot,
      false,
    );
  }

  protected onAnnualElectricityPopoverClick(event: "opened" | "closed") {
    this.setAnnualElectricityConsumptionRange(event);
    this.onPopoverClick("annualElectricityConsumption", event);
  }

  private buildFiltersSnapshot(): Record<string, unknown> {
    const formValues = this.locationFilterForm.value;
    const address = formValues.address ?? null;
    return removeNullishProps({
      ...(this.filters() ?? {}),
      ...formValues,
      address,
      locationBuildingType: this.locationBuildingTypeSelection.value,
    }) as Record<string, unknown>;
  }

  private getFilterValue(filterKey: string): unknown | undefined {
    switch (filterKey) {
      case "buildingUsage":
        return this.locationFilterForm.controls.buildingUsage.value;
      case "buildingOccupancyStatus":
        return this.locationFilterForm.controls.buildingOccupancyStatus.value;
      case "locationDepartment":
        return this.truncateFilterValues(
          this.locationFilterForm.controls.locationDepartment.value ?? [],
        );
      case "energyType":
        return this.locationFilterForm.controls.energyType.value;
      case "annualElectricityConsumption":
        return this.locationFilterForm.controls.annualElectricityConsumption
          .value;
      case "locationBuildingType":
        return this.locationBuildingTypeSelection.value;
      case "mainBusinessActivity":
        return this.truncateFilterValues(
          this.locationFilterForm.controls.mainBusinessActivity.value,
        );
      case "dpe":
        return this.locationFilterForm.controls.dpe.value;
      default:
        return undefined;
    }
  }

  private truncateFilterValues(
    values: string[],
    limit = 10,
  ): { values: string[]; total_count: number } {
    return {
      values: values.slice(0, limit),
      total_count: values.length,
    };
  }

  private resetAllFilters() {
    this.locationFilterForm.reset();
    this.locationBuildingTypeSelection.setValue([]);
    this.climateZones.setValue([]);
    this.filtersCount.set(0);
  }
}
