import {
  ChangeDetectionStrategy,
  Component,
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
  BuildingUsage,
  ClimateZone,
  Department,
  EmployeeRange,
  LocationBdnbLegalEntityFilterPro,
  LocationTypeNafCategory,
  NafCode,
} from "@optee/constants";
import {
  areSameNafCodes,
  buildActivitySectorGroups,
  BUILDING_USAGE,
  BUILDING_USAGE_LABELS,
  buildLocationBuildingTypeCodes,
  CLIMATE_ZONES,
  EMPLOYEE_RANGES,
  formatBuildingUsageValue,
  formatLocationBuildingTypeValue,
  FRENCH_REGION_DEPARTMENT_GROUPS,
  getDepartments,
  getLocationBuildingTypeSelection,
  GLOBAL_DATE_RANGE,
  LEGAL_ENTITY_FILTER_RANGES,
  locationBuildingTypeOptions,
} from "@optee/constants";
import { removeNullishProps } from "@optee/utils";
import { InputTextModule } from "primeng/inputtext";
import { SelectButtonModule } from "primeng/selectbutton";
import { debounceTime, map, startWith } from "rxjs";

import { DialogService } from "@optee/dialog";
import {
  IconBriefCaseComponent,
  IconCategoryComponent,
  IconCircularDiagramComponent,
  IconFiltersComponent,
  IconHomeComponent,
  IconLocationDotComponent,
  IconPeopleComponent,
  IconRefreshComponent,
  IconSearchComponent,
} from "@optee/icons";
import { PillOptionComponent } from "@optee/ui/components/atoms/pill/pill-option/pill-option.component";
import { createNumberRangeControl } from "@optee/ui/functions/create-number-range-control.fn";
import { CheckboxModule } from "primeng/checkbox";
import { SliderModule } from "primeng/slider";
import { Tooltip } from "primeng/tooltip";
import {
  OptionsGroupSelectorComponent,
  type OptionGroupSelectorGroup,
} from "../../../../../components/shared/options-group-selector/options-group-selector.component";
import { OptionsSelectorComponent } from "../../../../../components/shared/options-selector/options-selector.component";
import { FilterPermissionsService } from "../../../../../services/filter-permissions.service";
import { TrackingService } from "../../../../../services/tracking.service";
import { LegalEntitiesParamsService } from "../../../services/legal-entities-filters.service";
import { ButtonFilterPopoverComponent } from "../../button-filter-popover/button-filter-popover.component";
import { FiltersModalComponent } from "../../places-legal-entities-filters/places-legal-entities-filters-modal/places-legal-entities-filters.modal.component";

@Component({
  selector: "mkp-legal-entities-filters",
  host: {
    class:
      "border-granite-100 table-width-container flex h-12 w-full items-center gap-2 overflow-hidden border-b bg-white pl-4",
  },
  template: `
    @let hasActiveFilters = filtersCount() > 0;
    <button
      class="prospect-button"
      (click)="openFiltersDialog()"
      [disabled]="filterPermissions.isLoadingSubscription()"
    >
      <icon-filters class="size-4" />
      Filtrer
      @if (hasActiveFilters) {
        <span
          class="inline-flex size-4 items-center justify-center rounded-full bg-white p-1 text-xs text-green-600"
        >
          {{ filtersCount() }}
        </span>
      }
    </button>

    @if (hasActiveFilters) {
      <button
        class="border-granite-300 hover:border-granite-700 flex size-6 items-center justify-center rounded-lg border"
        pTooltip="Réinitialiser les filtres"
        tooltipPosition="bottom"
        (click)="filters.set(null)"
      >
        <icon-refresh class="text-granite-700 size-3" slot="icon" />
      </button>
    }

    @if (filterPermissions.isLoadingSubscription()) {
      <div class="ml-4 text-xs italic">Chargement des filtres...</div>
    } @else {
      <form
        class="flex flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden"
        style="scrollbar-width: thin;"
        [formGroup]="legalEntityFilterForm"
      >
        @if (
          showSearchLegalEntityFilter() &&
          filterPermissions.isFilterAccessible("name")
        ) {
          <!-- Search Company -->
          <div
            class="text-granite-900 border-granite-100 hover:border-granite-400 flex h-7 min-w-52 flex-shrink-0 items-center justify-start rounded-lg border py-1 pl-3 pr-1 transition-all"
          >
            <icon-search class="size-3" />
            <input
              class="placeholder-granite-900 h-full appearance-none border-none !pr-0.5 text-sm font-medium focus:outline-none"
              pInputText
              placeholder="Rechercher par entreprise"
              role="searchbox"
              size="small"
              type="search"
              [formControl]="legalEntityFilterForm.controls.name"
            />
          </div>
        }
        <mkp-button-filter-popover
          label="Tranche d’effectifs"
          (clear)="legalEntityFilterForm.controls.nbEmployeesRange.setValue([])"
          (clicked)="onPopoverClick('nbEmployeesRange', $event)"
          [hasSelected]="
            legalEntityFilterForm.controls.nbEmployeesRange.value.length > 0
          "
          [isFilterAccessible]="
            filterPermissions.isFilterAccessible('nbEmployeesRange')
          "
          [selectedValue]="formatNbEmployeesRangeValue()"
        >
          <icon-people class="size-4" iconSlot />
          <div class="max-h-52 overflow-y-auto">
            @for (
              nbEmployeesRange of nbEmployeesRangeOptions;
              track nbEmployeesRange;
              let i = $index
            ) {
              <div
                class="hover:bg-granite-100 text-granite-900 flex items-center rounded-lg p-2 text-sm font-medium transition-all"
              >
                <p-checkbox
                  [formControl]="
                    legalEntityFilterForm.controls.nbEmployeesRange
                  "
                  [inputId]="'nbEmployeesRange-' + i"
                  [value]="nbEmployeesRange"
                />
                <label
                  class="ml-2 w-full cursor-pointer"
                  [for]="'nbEmployeesRange-' + i"
                >
                  {{ nbEmployeesRange }}
                </label>
              </div>
            }
          </div>
        </mkp-button-filter-popover>

        <mkp-button-filter-popover
          label="Bâtiments gérés"
          (clear)="
            legalEntityFilterForm.controls.nbRelatedLocations.setValue(null)
          "
          (clicked)="onRelatedLocationsPopoverClick($event)"
          [hasSelected]="
            legalEntityFilterForm.controls.nbRelatedLocations.value !== null
          "
          [isFilterAccessible]="
            filterPermissions.isFilterAccessible('nbRelatedLocations')
          "
          [selectedValue]="formatRelatedLocationsValue()"
        >
          <icon-home class="size-4" iconSlot />
          <div class="flex w-64 flex-col gap-2 px-4 pt-2">
            <p-slider
              class="w-56"
              styleClass="w-full"
              [formControl]="legalEntityFilterForm.controls.nbRelatedLocations"
              [max]="legalEntityRanges.NB_RELATED_LOCATIONS[1]"
              [min]="legalEntityRanges.NB_RELATED_LOCATIONS[0]"
              [range]="true"
            />
            <div class="text-granite-600 flex justify-between gap-2 text-sm">
              <span class="w-20">
                {{
                  legalEntityFilterForm.controls.nbRelatedLocations.value?.[0]
                }}
                bâtiments
              </span>
              -
              <span class="w-20">
                {{
                  legalEntityFilterForm.controls.nbRelatedLocations.value?.[1]
                }}
                bâtiments
              </span>
            </div>
          </div>
        </mkp-button-filter-popover>

        <!-- Type d'entreprise -->
        <mkp-button-filter-popover
          label="Type d'entreprise"
          (clear)="locationBuildingTypeSelection.setValue([])"
          (clicked)="onPopoverClick('locationBuildingType', $event)"
          [hasSelected]="locationBuildingTypeSelection.value.length > 0"
          [isFilterAccessible]="
            filterPermissions.isFilterAccessible('locationBuildingType')
          "
          [selectedValue]="formatLocationBuildingTypeValue()"
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

        <!-- Usage Bâtiment -->
        <mkp-button-filter-popover
          label="Usage Bâtiment"
          (clear)="legalEntityFilterForm.controls.buildingUsage.setValue([])"
          (clicked)="onPopoverClick('buildingUsage', $event)"
          [hasSelected]="
            legalEntityFilterForm.controls.buildingUsage.value.length > 0
          "
          [isFilterAccessible]="
            filterPermissions.isFilterAccessible('buildingUsage')
          "
          [selectedValue]="formatBuildingUsageValue()"
        >
          <icon-circular-diagram class="size-4" iconSlot />
          <div class="max-w-prose px-2 py-2">
            <p-selectButton
              class="p-selectButton--transparent p-selectButton--pill"
              [formControl]="legalEntityFilterForm.controls.buildingUsage"
              [multiple]="true"
              [options]="buildingUsageOptions"
            >
              <ng-template let-option pTemplate="item">
                <oui-pill-option
                  class="font-sans"
                  [control]="legalEntityFilterForm.controls.buildingUsage"
                  [value]="option.value"
                >
                  {{ option.label }}
                </oui-pill-option>
              </ng-template>
            </p-selectButton>
          </div>
        </mkp-button-filter-popover>

        <!-- Secteur d'activité -->
        <mkp-button-filter-popover
          label="Secteur d'activité"
          (clear)="
            legalEntityFilterForm.controls.mainBusinessActivity.setValue([])
          "
          (clicked)="onPopoverClick('mainBusinessActivity', $event)"
          [hasSelected]="
            legalEntityFilterForm.controls.mainBusinessActivity.value.length > 0
          "
          [isFilterAccessible]="
            filterPermissions.isFilterAccessible('mainBusinessActivity')
          "
          [selectedValue]="formatMainBusinessActivityValue()"
        >
          <icon-category class="size-4" iconSlot />

          <div class="max-w-prose px-2 py-2">
            <mkp-options-group-selector
              searchPlaceholder="Rechercher un secteur d'activité..."
              [formControl]="
                legalEntityFilterForm.controls.mainBusinessActivity
              "
              [groups]="activitySectorGroups"
              [showSearch]="true"
            />
          </div>
        </mkp-button-filter-popover>

        <!-- Département -->
        <mkp-button-filter-popover
          label="Département"
          (clear)="clearDepartmentFilters()"
          (clicked)="onPopoverClick('legalEntityDepartment', $event)"
          [hasSelected]="
            legalEntityFilterForm.controls.legalEntityDepartment.value.length >
            0
          "
          [isFilterAccessible]="
            filterPermissions.isFilterAccessible('legalEntityDepartment')
          "
          [selectedValue]="formatDepartmentValue()"
        >
          <icon-location-dot class="size-4" iconSlot />
          <div class="flex flex-col gap-3 px-2 py-2">
            <mkp-options-group-selector
              searchPlaceholder="Rechercher un département..."
              [formControl]="
                legalEntityFilterForm.controls.legalEntityDepartment
              "
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
      </form>
    }
  `,
  imports: [
    CheckboxModule,
    ButtonFilterPopoverComponent,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    SelectButtonModule,
    SliderModule,
    PillOptionComponent,
    OptionsGroupSelectorComponent,
    OptionsSelectorComponent,
    IconFiltersComponent,
    IconLocationDotComponent,
    IconBriefCaseComponent,
    IconCategoryComponent,
    IconPeopleComponent,
    IconHomeComponent,
    IconCircularDiagramComponent,
    IconSearchComponent,
    IconRefreshComponent,
    Tooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntitiesFiltersComponent {
  readonly filters = model<LocationBdnbLegalEntityFilterPro | null>(null);
  readonly showSearchLegalEntityFilter = input(true);

  protected readonly legalEntityRanges = LEGAL_ENTITY_FILTER_RANGES;

  protected readonly filterPermissions = inject(FilterPermissionsService);
  private readonly trackingService = inject(TrackingService);
  protected readonly paramsService = inject(LegalEntitiesParamsService);
  private readonly dialogService = inject(DialogService);

  protected readonly minDate = GLOBAL_DATE_RANGE[0];
  protected readonly maxDate = GLOBAL_DATE_RANGE[1];

  protected readonly nbEmployeesRangeOptions = [...EMPLOYEE_RANGES];
  protected readonly activitySectorGroups: OptionGroupSelectorGroup<NafCode>[] =
    buildActivitySectorGroups();

  protected readonly buildingUsageOptions = BUILDING_USAGE.map((value) => ({
    label: BUILDING_USAGE_LABELS[value],
    value,
  }));

  protected readonly departmentOptions = FRENCH_REGION_DEPARTMENT_GROUPS;
  protected readonly climateZoneOptions = [...CLIMATE_ZONES];
  protected readonly climateZones = new FormControl<ClimateZone[]>([]);

  protected readonly locationBuildingTypeSelection = new FormControl<
    LocationTypeNafCategory[]
  >([], { nonNullable: true });

  protected readonly locationBuildingTypeOptions = locationBuildingTypeOptions;

  protected formatLocationBuildingTypeValue(): string {
    return formatLocationBuildingTypeValue(
      this.locationBuildingTypeSelection.value,
    );
  }

  private readonly syncClimateZoneWithDepartmentControl =
    this.climateZones.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((zones) => {
        if (!zones || zones.length === 0) {
          this.legalEntityFilterForm.controls.legalEntityDepartment.setValue(
            [],
          );
          return;
        }

        this.legalEntityFilterForm.controls.legalEntityDepartment.setValue(
          zones.map((zone) => getDepartments(zone)).flat(),
        );
      });

  protected readonly legalEntityFilterForm = new FormGroup({
    name: new FormControl<string | null>(null),
    nbEmployeesRange: new FormControl<EmployeeRange[]>([], {
      nonNullable: true,
    }),
    nbRelatedLocations: createNumberRangeControl([
      ...this.legalEntityRanges.NB_RELATED_LOCATIONS,
    ]),
    locationBuildingType: new FormControl<NafCode[]>([], { nonNullable: true }),
    buildingUsage: new FormControl<BuildingUsage[]>([], { nonNullable: true }),
    mainBusinessActivity: new FormControl<string[]>([], {
      nonNullable: true,
    }),
    legalEntityDepartment: new FormControl<Department[]>([], {
      nonNullable: true,
    }),
  });

  protected readonly filtersCount = signal(0);

  protected clearDepartmentFilters() {
    this.climateZones.setValue([]);
    this.legalEntityFilterForm.controls.legalEntityDepartment.setValue([]);
  }

  private readonly applyInitialFilter = effect(() => {
    const filters = this.filters();
    if (!filters) {
      this.resetAllFilters();
      return;
    }

    this.legalEntityFilterForm.patchValue(removeNullishProps(filters), {
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
      this.legalEntityFilterForm.controls.mainBusinessActivity.value;
    const hasChanged =
      currentMainBusinessActivity.length !== nextMainBusinessActivity.length ||
      currentMainBusinessActivity.some(
        (value, index) => value !== nextMainBusinessActivity[index],
      );
    if (hasChanged) {
      this.legalEntityFilterForm.controls.mainBusinessActivity.setValue(
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
        const control =
          this.legalEntityFilterForm.controls.locationBuildingType;
        if (!areSameNafCodes(control.value, nextCodes)) {
          control.setValue(nextCodes);
        }
      });

  private readonly syncInputWithFormValues =
    this.legalEntityFilterForm.valueChanges
      .pipe(
        debounceTime(800),
        takeUntilDestroyed(),
        map((filters) => {
          return removeNullishProps({
            ...this.filters(),
            ...filters,
          });
        }),
      )
      .subscribe((filters) => this.filters.set(filters));

  async openFiltersDialog() {
    this.trackFiltersUsage("legal_entities_filters");
    const { res: newFilters } = await this.dialogService.open(
      FiltersModalComponent,
      {
        data: { filters: this.filters(), filtersPageType: "legal-entities" },
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
    const filterKeys = Object.keys(cleanedFilters);
    this.trackingService.trackPro("pro_filters_used", {
      source_component: sourceComponent,
      filters_page_type: "legal-entities",
      ...(includeSnapshot
        ? {
            filters_count: filterKeys.length,
            global_filters_keys: filterKeys.join(","),
            global_filters_values: JSON.stringify(cleanedFilters),
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
      "legal_entities_filters_popover",
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

  protected onRelatedLocationsPopoverClick(event: "opened" | "closed") {
    this.setRelatedLocationsRange(event);
    this.onPopoverClick("nbRelatedLocations", event);
  }

  private buildFiltersSnapshot(): Record<string, unknown> {
    return removeNullishProps({
      ...(this.filters() ?? {}),
      ...this.legalEntityFilterForm.value,
      locationBuildingType: this.locationBuildingTypeSelection.value,
    }) as Record<string, unknown>;
  }

  private getFilterValue(filterKey: string): unknown | undefined {
    switch (filterKey) {
      case "nbEmployeesRange":
        return this.legalEntityFilterForm.controls.nbEmployeesRange.value;
      case "nbRelatedLocations":
        return this.legalEntityFilterForm.controls.nbRelatedLocations.value;
      case "locationBuildingType":
        return this.locationBuildingTypeSelection.value;
      case "buildingUsage":
        return this.legalEntityFilterForm.controls.buildingUsage.value;
      case "mainBusinessActivity":
        return this.truncateFilterValues(
          this.legalEntityFilterForm.controls.mainBusinessActivity.value,
        );
      case "legalEntityDepartment":
        return this.truncateFilterValues(
          this.legalEntityFilterForm.controls.legalEntityDepartment.value,
        );
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
    this.legalEntityFilterForm.reset();
    this.locationBuildingTypeSelection.setValue([]);
    this.climateZones.setValue([]);
    this.filtersCount.set(0);
  }

  protected formatNbEmployeesRangeValue(): string {
    const employeesRange =
      this.legalEntityFilterForm.controls.nbEmployeesRange.value;
    return !employeesRange || employeesRange.length === 0
      ? ""
      : employeesRange.slice(0, 2).join(", ") +
          (employeesRange.length > 2 ? "..." : "");
  }

  protected formatMainBusinessActivityValue(): string {
    const mainBusinessActivity =
      this.legalEntityFilterForm.controls.mainBusinessActivity.value;
    return !mainBusinessActivity || mainBusinessActivity.length === 0
      ? ""
      : mainBusinessActivity.length + " secteur(s) sélectionné(s)";
  }

  protected formatBuildingUsageValue(): string {
    return formatBuildingUsageValue(
      this.legalEntityFilterForm.controls.buildingUsage.value ?? null,
    );
  }

  protected setRelatedLocationsRange(event: "opened" | "closed"): void {
    if (
      event === "opened" &&
      this.legalEntityFilterForm.controls.nbRelatedLocations.value === null
    ) {
      this.legalEntityFilterForm.controls.nbRelatedLocations.setValue([
        ...this.legalEntityRanges.NB_RELATED_LOCATIONS,
      ]);
    }
  }

  protected formatRelatedLocationsValue(): string {
    const val = this.legalEntityFilterForm.controls.nbRelatedLocations.value;
    return !val ? "" : `${val[0]}-${val[1]} bâtiment(s)`;
  }

  protected formatDepartmentValue(): string {
    const deps =
      this.legalEntityFilterForm.controls.legalEntityDepartment.value;
    return !deps || deps.length === 0
      ? ""
      : deps.slice(0, 2).join(", ") + (deps.length > 2 ? "..." : "");
  }
}
