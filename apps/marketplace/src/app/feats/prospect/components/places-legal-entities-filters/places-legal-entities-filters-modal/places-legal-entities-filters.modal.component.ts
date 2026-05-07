import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
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
  ECSGeneratorTypeCode,
  EmployeeRange,
  EnergyType,
  GlazingType,
  HeatingSystem,
  HeatingTypeCode,
  InertiaClass,
  InsulationType,
  LegalEntityType,
  LegalForm,
  LocationBdnbLegalEntityFilterPro,
  LocationTypeNafCategory,
  MaxConstructionPeriod,
  NafCode,
  Sector,
  VentilationTypeCode,
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
  COLLECTIVE_AND_INDIVIDUAL_HEATING_SYSTEMS,
  DPE_LABELS,
  ECS_GENERATOR_TYPE_GROUPS,
  EMPLOYEE_RANGES,
  ENERGY_TYPES,
  FILTERED_ENERGY_TYPES,
  FRENCH_REGION_DEPARTMENT_GROUPS,
  getDepartments,
  getLegalEntityTypeLabel,
  getLocationBuildingTypeSelection,
  GLAZING_TYPES,
  GLOBAL_DATE_RANGE,
  HEATING_TYPE_GROUPS,
  INERTIA_CLASS,
  INSULATION_TYPES,
  IPE_NORMALIZED_SCORE_RANGE,
  LEGAL_ENTITY_FILTER_RANGES,
  LEGAL_ENTITY_TYPES,
  LEGAL_FORM,
  LOCATION_FILTER_RANGES,
  locationBuildingTypeOptions,
  MAX_CONSTRUCTION_PERIOD,
  VENTILATION_TYPE_GROUPS,
} from "@optee/constants";
import { DialogWrapperComponent, StronglyTypedDialog } from "@optee/dialog";
import { IconBuildingComponent } from "@optee/icons";
import { DpeLabelComponent } from "@optee/ui/components/atoms/dpe-label/dpe-label.component";
import { GesLabelComponent } from "@optee/ui/components/atoms/ges-label/ges-label.component";
import { PillOptionComponent } from "@optee/ui/components/atoms/pill/pill-option/pill-option.component";
import { SliderComponent } from "@optee/ui/components/molecules/form/slider/slider.component";
import { createNumberRangeControl } from "@optee/ui/functions/create-number-range-control.fn";
import { CapitalizePipe } from "@optee/ui/pipes/capitalize.pipe";
import { isNotNullish } from "@optee/utils";
import { ButtonModule } from "primeng/button";
import { Checkbox } from "primeng/checkbox";
import { DatePicker } from "primeng/datepicker";
import { MultiSelectModule } from "primeng/multiselect";
import { SelectButtonModule } from "primeng/selectbutton";
import { SliderModule } from "primeng/slider";
import { map, startWith } from "rxjs";
import {
  OptionsGroupSelectorComponent,
  type OptionGroupSelectorGroup,
} from "../../../../../components/shared/options-group-selector/options-group-selector.component";
import { OptionsSelectorComponent } from "../../../../../components/shared/options-selector/options-selector.component";
import { FilterPermissionsService } from "../../../../../services/filter-permissions.service";
import { TrackingService } from "../../../../../services/tracking.service";
import { FilterRowComponent } from "../../filters/filter-row/filter-row.component";
import { FiltersGroupComponent } from "../../filters/filters-group/filters-group.component";

type FilterCategory =
  | "localisation"
  | "entreprise"
  | "characteristics"
  | "energyPerformance";

@Component({
  selector: "mkp-filters-modal",
  template: `
    <op-dialog-wrapper
      class="h-[70vh] !w-[600px] p-5"
      spaceless
      (crossClick)="dialogRef.close(null)"
      [fadedOut]="modalFadedOut()"
    >
      <h3 class="text-granite-900 text-center font-medium">Filtres</h3>

      <form
        class="scrollbar-stable flex max-h-full max-w-full flex-1 flex-col gap-4 overflow-auto py-2"
        [formGroup]="combinedFilterForm"
      >
        <!-- Section 1: Bâtiment -->
        <mkp-filters-group dropDown [isOpen]="true">
          <h3 class="flex items-center gap-2" heading>
            <icon-building
              class="bg-granite-100 size-5 rounded-full p-1"
              slot="icon"
            />
            Bâtiment
            @if (filtersCountByCategory().localisation; as localisationCount) {
              <span
                class="bg-granite-100 text-granite-900 flex size-6 items-center justify-center rounded-full text-center font-medium"
              >
                {{ localisationCount }}
              </span>
            }
          </h3>

          <section class="flex flex-col gap-3">
            <!-- Usage Bâtiment -->
            <mkp-filter-row filterKey="buildingUsage" label="Usage Bâtiment">
              <p-selectButton
                class="p-selectButton--transparent p-selectButton--pill"
                [formControl]="combinedFilterForm.controls.buildingUsage"
                [multiple]="true"
                [options]="buildingUsageOptions"
              >
                <ng-template let-option pTemplate="item">
                  <oui-pill-option
                    class="font-sans"
                    [control]="combinedFilterForm.controls.buildingUsage"
                    [value]="option.value"
                  >
                    {{ option.label }}
                  </oui-pill-option>
                </ng-template>
              </p-selectButton>
            </mkp-filter-row>

            <!-- Acteur bâtiment -->
            <mkp-filter-row
              filterKey="buildingOccupancyStatus"
              label="Acteur bâtiment"
            >
              <p-selectButton
                class="p-selectButton--transparent p-selectButton--pill"
                [formControl]="
                  combinedFilterForm.controls.buildingOccupancyStatus
                "
                [multiple]="true"
                [options]="buildingOccupancyStatusOptions"
              >
                <ng-template let-option pTemplate="item">
                  <oui-pill-option
                    class="font-sans"
                    [control]="
                      combinedFilterForm.controls.buildingOccupancyStatus
                    "
                    [value]="option.value"
                  >
                    {{ option.label }}
                  </oui-pill-option>
                </ng-template>
              </p-selectButton>
            </mkp-filter-row>

            <!--  Département  -->
            <mkp-filter-row filterKey="locationDepartment" label="Département">
              <mkp-options-group-selector
                searchPlaceholder="Rechercher un département..."
                [formControl]="combinedFilterForm.controls.locationDepartment"
                [groups]="departmentOptions"
                [showSearch]="true"
              />
              <p-selectButton
                class="p-selectButton--transparent p-selectButton--pill"
                [formControl]="combinedFilterForm.controls.climateZones"
                [multiple]="true"
                [options]="climateZoneOptions"
              >
                <ng-template let-option pTemplate="item">
                  <oui-pill-option
                    [control]="combinedFilterForm.controls.climateZones"
                    [value]="option"
                  >
                    {{ option }}
                  </oui-pill-option>
                </ng-template>
              </p-selectButton>
            </mkp-filter-row>
            <!-- Type de bâtiment -->
            <!-- <mkp-filter-row
              filterKey="legalEntityTypes"
              label="Type de bâtiment"
            >
              <p-selectButton
                class="p-selectButton--transparent p-selectButton--pill"
                multiple
                [formControl]="combinedFilterForm.controls.legalEntityTypes"
                [options]="legalEntityTypesOptions"
              >
                <ng-template let-option pTemplate="item">
                  <oui-pill-option
                    class="font-sans"
                    [control]="combinedFilterForm.controls.legalEntityTypes"
                    [value]="option"
                  >
                    {{ getLegalEntityTypeLabel(option) }}
                  </oui-pill-option>
                </ng-template>
              </p-selectButton>
            </mkp-filter-row> -->

            <!-- Période de construction -->
            <!-- <mkp-filter-row
              filterKey="maxConstructionPeriod"
              label="Période de construction"
            >
              <p-multiselect
                class="w-full md:w-80"
                appendTo="body"
                formControlName="maxConstructionPeriod"
                placeholder="Choisissez une ou plusieurs options"
                showClear
                [options]="maxConstructionPeriodOptions"
              />
            </mkp-filter-row> -->

            <!-- Année de construction -->
            <mkp-filter-row
              filterKey="creationDate"
              label="Année de construction"
            >
              <p-datepicker
                class="w-full md:w-80"
                appendTo="body"
                dateFormat="yy"
                placeholder="Choisissez une période"
                readonlyInput
                selectionMode="range"
                showClear
                size="small"
                view="year"
                [formControl]="combinedFilterForm.controls.creationDate"
                [maxDate]="maxDate"
                [minDate]="minDate"
              />
            </mkp-filter-row>

            <!-- Nombre de bâtiments -->
            <mkp-filter-row filterKey="nbBuildings" label="Nombre de bâtiments">
              <oui-slider
                suffix="bât."
                [control]="combinedFilterForm.controls.nbBuildings"
                [max]="locationRanges.NB_BUILDINGS[1]"
                [min]="locationRanges.NB_BUILDINGS[0]"
              />
            </mkp-filter-row>

            <!-- Nombre de lots -->
            <mkp-filter-row filterKey="nbUnits" label="Nombre de lots">
              <oui-slider
                suffix="lot(s)"
                [control]="combinedFilterForm.controls.nbUnits"
                [max]="locationRanges.NB_UNITS[1]"
                [min]="locationRanges.NB_UNITS[0]"
              />
            </mkp-filter-row>

            <!-- Surface habitable -->
            <mkp-filter-row
              filterKey="habitableSurfaceArea"
              label="Surface habitable"
            >
              <oui-slider
                suffix="m²"
                [control]="combinedFilterForm.controls.habitableSurfaceArea"
                [max]="locationRanges.HABITABLE_SURFACE_AREA[1]"
                [min]="locationRanges.HABITABLE_SURFACE_AREA[0]"
              />
            </mkp-filter-row>

            <!-- Nombre de niveaux -->
            <mkp-filter-row filterKey="nbStoreys" label="Nombre de niveaux">
              <oui-slider
                suffix="niveaux"
                [control]="combinedFilterForm.controls.nbStoreys"
                [max]="locationRanges.NB_STOREYS[1]"
                [min]="locationRanges.NB_STOREYS[0]"
              />
            </mkp-filter-row>

            <!-- Emprise au sol -->
            <mkp-filter-row filterKey="surfaceArea" label="Emprise au sol">
              <oui-slider
                suffix="m²"
                [control]="combinedFilterForm.controls.surfaceArea"
                [max]="locationRanges.SURFACE_AREA[1]"
                [min]="locationRanges.SURFACE_AREA[0]"
              />
            </mkp-filter-row>

            <!-- Présence dans un quartier prioritaire -->
            <mkp-filter-row
              filterKey="isInQpv"
              label="Présence dans un quartier prioritaire"
            >
              <div class="flex items-center gap-2">
                <p-checkbox
                  binary
                  indeterminate
                  [formControl]="combinedFilterForm.controls.isInQpv"
                />
                <label class="cursor-pointer text-sm">
                  {{
                    combinedFilterForm.controls.isInQpv.value === null
                      ? "Indifférent"
                      : combinedFilterForm.controls.isInQpv.value === true
                        ? "Oui"
                        : "Non"
                  }}
                </label>
              </div>
            </mkp-filter-row>
          </section>
        </mkp-filters-group>

        <!-- Section 2: Entreprise -->
        <mkp-filters-group dropDown [isOpen]="true">
          <h3 class="flex items-center gap-2" heading>
            <icon-building
              class="bg-granite-100 size-5 rounded-full p-1"
              slot="icon"
            />
            Entreprise
            @if (filtersCountByCategory().entreprise; as entrepriseCount) {
              <span
                class="bg-granite-100 text-granite-900 flex size-6 items-center justify-center rounded-full text-center font-medium"
              >
                {{ entrepriseCount }}
              </span>
            }
          </h3>

          <section class="flex flex-col gap-3">
            <!-- Type d'entreprise -->
            <mkp-filter-row
              filterKey="locationBuildingType"
              label="Type d'entreprise"
            >
              <mkp-options-selector
                searchPlaceholder="Rechercher un type d'entreprise..."
                [formControl]="locationBuildingTypeSelection"
                [maxSelectable]="4"
                [options]="locationBuildingTypeOptions"
                [showSearch]="true"
              />
            </mkp-filter-row>

            <!-- Secteur d'activité -->
            <mkp-filter-row
              filterKey="tertiaryActivityType"
              label="Secteur d'activité"
            >
              <mkp-options-group-selector
                searchPlaceholder="Rechercher un secteur d'activité..."
                [formControl]="combinedFilterForm.controls.mainBusinessActivity"
                [groups]="activitySectorGroups"
                [showSearch]="true"
              />
            </mkp-filter-row>

            <!--  Département  -->
            <mkp-filter-row
              filterKey="legalEntityDepartment"
              label="Département"
            >
              <mkp-options-group-selector
                searchPlaceholder="Rechercher un département..."
                [formControl]="
                  combinedFilterForm.controls.legalEntityDepartment
                "
                [groups]="departmentOptions"
                [showSearch]="true"
              />
            </mkp-filter-row>

            <!--  Tranche d'effectifs  -->
            <mkp-filter-row
              filterKey="nbEmployeesRange"
              label="Tranche d'effectifs"
            >
              <p-multiselect
                class="w-full md:w-80"
                appendTo="body"
                formControlName="nbEmployeesRange"
                placeholder="Choisissez une ou plusieurs options"
                showClear
                [options]="nbEmployeesRangeOptions"
              />
            </mkp-filter-row>

            <!--  Forme juridique  -->
            <mkp-filter-row filterKey="legalForm" label="Forme juridique">
              <p-multiselect
                class="w-full md:w-80"
                appendTo="body"
                formControlName="legalForm"
                placeholder="Choisissez une ou plusieurs options"
                showClear
                [options]="legalFormOptions"
              />
            </mkp-filter-row>

            <mkp-filter-row
              filterKey="nbPremises"
              label="Nombre de lots tertiaires"
            >
              <oui-slider
                suffix="lot(s)"
                [control]="combinedFilterForm.controls.nbPremises"
                [max]="legalEntityRanges.NB_PREMISES[1]"
                [min]="legalEntityRanges.NB_PREMISES[0]"
              />
            </mkp-filter-row>

            @if (filtersPageType === "legal-entities") {
              <!-- Entreprise -->
              <mkp-filter-row filterKey="type" label="Entreprise">
                <p-selectButton
                  class="p-selectButton--transparent p-selectButton--pill"
                  [formControl]="combinedFilterForm.controls.type"
                  [multiple]="true"
                  [options]="typesOptions"
                >
                  <ng-template let-option pTemplate="item">
                    <oui-pill-option
                      class="font-sans"
                      [control]="combinedFilterForm.controls.type"
                      [value]="option.value"
                    >
                      {{ option.label }}
                    </oui-pill-option>
                  </ng-template>
                </p-selectButton>
              </mkp-filter-row>
            }

            @if (filtersPageType === "places") {
              <!-- Nombre d'entreprises par adresse -->
              <mkp-filter-row
                filterKey="nbLegalEntitiesPerLocation"
                label="Nombre d'entreprises par adresse"
              >
                <oui-slider
                  suffix="entreprise(s)"
                  [control]="
                    combinedFilterForm.controls.nbLegalEntitiesPerLocation
                  "
                  [max]="locationRanges.RELATED_LEGAL_ENTITIES[1]"
                  [min]="locationRanges.RELATED_LEGAL_ENTITIES[0]"
                />
              </mkp-filter-row>
            } @else {
              <!-- Bâtiments gérés -->
              <mkp-filter-row
                filterKey="nbRelatedLocations"
                label="Nombre de bâtiments gérés"
              >
                <oui-slider
                  suffix="bâtiment(s)"
                  [control]="combinedFilterForm.controls.nbRelatedLocations"
                  [max]="legalEntityRanges.NB_RELATED_LOCATIONS[1]"
                  [min]="legalEntityRanges.NB_RELATED_LOCATIONS[0]"
                />
              </mkp-filter-row>
            }
          </section>
        </mkp-filters-group>

        <!-- Section 3: Caractéristiques -->
        <mkp-filters-group dropDown>
          <h3 class="flex items-center gap-2" heading>
            <icon-building
              class="bg-granite-100 size-5 rounded-full p-1"
              slot="icon"
            />
            Caractéristiques Techniques
            @if (
              filtersCountByCategory().characteristics;
              as characteristicsCount
            ) {
              <span
                class="bg-granite-100 text-granite-900 flex size-6 items-center justify-center rounded-full text-center font-medium"
              >
                {{ characteristicsCount }}
              </span>
            }
          </h3>

          <div class="flex flex-col gap-8">
            <div class="flex flex-col gap-8">
              <!-- Category: Chauffage et ECS -->
              <div class="flex flex-col gap-3">
                <h4 class="text-granite-500 font-semibold">Chauffage et ECS</h4>
                <section class="flex flex-col gap-3 pl-2">
                  <!-- Type de chauffage -->
                  <mkp-filter-row
                    filterKey="heatingType"
                    label="Type de chauffage"
                  >
                    <mkp-options-group-selector
                      searchPlaceholder="Rechercher un type de chauffage..."
                      [formControl]="combinedFilterForm.controls.heatingType"
                      [groups]="heatingTypeGroups"
                      [showSearch]="true"
                    />
                  </mkp-filter-row>
                  <!-- Type d'eau chaude sanitaire -->
                  <mkp-filter-row
                    filterKey="ecsGeneratorType"
                    label="Type d'eau chaude sanitaire"
                  >
                    <mkp-options-group-selector
                      searchPlaceholder="Rechercher un type d'eau chaude sanitaire..."
                      [formControl]="
                        combinedFilterForm.controls.ecsGeneratorType
                      "
                      [groups]="ecsGeneratorTypeGroups"
                      [showSearch]="true"
                    />
                  </mkp-filter-row>

                  <!-- Présence de la climatisation -->
                  <mkp-filter-row
                    filterKey="hasAirConditioning"
                    label="Présence de climatisation"
                  >
                    <div class="flex items-center gap-2">
                      <p-checkbox
                        binary
                        indeterminate
                        [formControl]="
                          combinedFilterForm.controls.hasAirConditioning
                        "
                      />
                      <label class="cursor-pointer text-sm">
                        {{
                          combinedFilterForm.controls.hasAirConditioning
                            .value === null
                            ? "Indifférent"
                            : combinedFilterForm.controls.hasAirConditioning
                                  .value === true
                              ? "Oui"
                              : "Non"
                        }}
                      </label>
                    </div>
                  </mkp-filter-row>

                  <!-- Type de ventilation -->
                  <mkp-filter-row
                    filterKey="ventilationType"
                    label="Type de ventilation"
                  >
                    <mkp-options-group-selector
                      searchPlaceholder="Rechercher un type de ventilation..."
                      [formControl]="
                        combinedFilterForm.controls.ventilationType
                      "
                      [groups]="ventilationTypeGroups"
                      [showSearch]="true"
                    />
                  </mkp-filter-row>
                </section>
              </div>

              <!-- Category: Isolation -->
              <div class="flex flex-col gap-3">
                <h4 class="text-granite-500 font-semibold">Isolation</h4>
                <section class="flex flex-col gap-3 pl-2">
                  <!-- Type d’isolation mur -->
                  <mkp-filter-row
                    filterKey="exteriorWallInsulationType"
                    label="Type d’isolation mur"
                  >
                    <p-multiselect
                      class="w-full md:w-80"
                      appendTo="body"
                      formControlName="exteriorWallInsulationType"
                      placeholder="Choisissez une ou plusieurs options"
                      showClear
                      [options]="insulationTypeOptions"
                    />
                  </mkp-filter-row>

                  <!-- Type d’isolation plancher -->
                  <mkp-filter-row
                    filterKey="lowerFloorInsulationType"
                    label="Type d’isolation plancher"
                  >
                    <p-multiselect
                      class="w-full md:w-80"
                      appendTo="body"
                      formControlName="lowerFloorInsulationType"
                      placeholder="Choisissez une ou plusieurs options"
                      showClear
                      [options]="insulationTypeOptions"
                    />
                  </mkp-filter-row>

                  <!-- Type d’isolation toiture -->
                  <mkp-filter-row
                    filterKey="upperFloorInsulationType"
                    label="Type d’isolation toiture"
                  >
                    <p-multiselect
                      class="w-full md:w-80"
                      appendTo="body"
                      formControlName="upperFloorInsulationType"
                      placeholder="Choisissez une ou plusieurs options"
                      showClear
                      [options]="insulationTypeOptions"
                    />
                  </mkp-filter-row>

                  <!-- Surface vitrée -->
                  <mkp-filter-row
                    filterKey="glazingArea"
                    label="Surface vitrée"
                  >
                    <oui-slider
                      suffix="m²"
                      [control]="combinedFilterForm.controls.glazingArea"
                      [max]="locationRanges.GLAZING_AREA[1]"
                      [min]="locationRanges.GLAZING_AREA[0]"
                    />
                  </mkp-filter-row>
                  <!-- Type de vitrage -->
                  <mkp-filter-row
                    filterKey="glazingType"
                    label="Type de vitrage"
                  >
                    <p-multiselect
                      class="w-full md:w-80"
                      appendTo="body"
                      formControlName="glazingType"
                      placeholder="Choisissez une ou plusieurs options"
                      showClear
                      [options]="glazingTypeOptions"
                    />
                  </mkp-filter-row>
                </section>
              </div>

              <!-- Category: Autres -->
              <div class="flex flex-col gap-3">
                <h4 class="text-granite-500 font-semibold">Autres</h4>
                <section class="flex flex-col gap-3 pl-2">
                  <!-- Nombre de places de parking -->
                  <mkp-filter-row
                    filterKey="nbParkingSpots"
                    label="Nombre de places de parking"
                  >
                    <oui-slider
                      suffix="places"
                      [control]="combinedFilterForm.controls.nbParkingSpots"
                      [max]="locationRanges.PARKING_SPACES[1]"
                      [min]="locationRanges.PARKING_SPACES[0]"
                    />
                  </mkp-filter-row>

                  <!-- Accessibilité PMR -->
                  <mkp-filter-row
                    filterKey="pmrAccessible"
                    label="Accessibilité PMR"
                  >
                    <div class="flex items-center gap-2">
                      <p-checkbox
                        binary
                        indeterminate
                        [formControl]="
                          combinedFilterForm.controls.pmrAccessible
                        "
                      />
                      <label class="cursor-pointer text-sm">
                        {{
                          combinedFilterForm.controls.pmrAccessible.value ===
                          null
                            ? "Indifférent"
                            : combinedFilterForm.controls.pmrAccessible
                                  .value === true
                              ? "Accessible"
                              : "Non accessible"
                        }}
                      </label>
                    </div>
                  </mkp-filter-row>

                  <!-- Inertie du bâtiment -->
                  <mkp-filter-row
                    filterKey="inertiaClass"
                    label="Inertie du bâtiment"
                  >
                    <p-multiselect
                      class="w-80"
                      appendTo="body"
                      formControlName="inertiaClass"
                      placeholder="Indice d'isolation"
                      showClear
                      [options]="inertiaClassOptions"
                    />
                  </mkp-filter-row>
                </section>
              </div>
            </div>
          </div>
        </mkp-filters-group>

        <!-- Section 4: Énergie & Performance -->
        <mkp-filters-group dropDown>
          <h3 class="flex items-center gap-2" heading>
            <icon-building
              class="bg-granite-100 size-5 rounded-full p-1"
              slot="icon"
            />
            Énergie & Performance
            @if (
              filtersCountByCategory().energyPerformance;
              as energyPerformanceCount
            ) {
              <span
                class="bg-granite-100 text-granite-900 flex size-6 items-center justify-center rounded-full text-center font-medium"
              >
                {{ energyPerformanceCount }}
              </span>
            }
          </h3>
          <div class="flex flex-col gap-8">
            <section class="flex flex-col gap-3">
              <!-- Score IPE (normalisé) -->
              <mkp-filter-row filterKey="ipeNormalizedScore" label="Score IPE">
                <oui-slider
                  suffix="/10"
                  [control]="combinedFilterForm.controls.ipeNormalizedScore"
                  [max]="ipeNormalizedScoreRange[1]"
                  [min]="ipeNormalizedScoreRange[0]"
                />
              </mkp-filter-row>

              <!-- Chauffage -->
              <mkp-filter-row filterKey="heatingSystem" label="Chauffage">
                <p-selectButton
                  class="p-selectButton--transparent p-selectButton--pill"
                  [formControl]="combinedFilterForm.controls.heatingSystem"
                  [multiple]="true"
                  [options]="heatingSystemOptions"
                >
                  <ng-template let-option pTemplate="item">
                    <oui-pill-option
                      class="font-sans"
                      [control]="combinedFilterForm.controls.heatingSystem"
                      [value]="option"
                    >
                      {{ option | capitalize }}
                    </oui-pill-option>
                  </ng-template>
                </p-selectButton>
              </mkp-filter-row>
              <!-- Énergie -->
              <mkp-filter-row filterKey="energyType" label="Énergie">
                <p-selectButton
                  class="p-selectButton--transparent p-selectButton--pill"
                  [formControl]="combinedFilterForm.controls.energyType"
                  [multiple]="true"
                  [options]="energyTypeOptions"
                >
                  <ng-template let-option pTemplate="item">
                    <oui-pill-option
                      class="font-sans"
                      [control]="combinedFilterForm.controls.energyType"
                      [value]="option"
                    >
                      {{ option }}
                    </oui-pill-option>
                  </ng-template>
                </p-selectButton>
              </mkp-filter-row>

              <!-- Surface chauffée -->
              <mkp-filter-row
                filterKey="surfaceThatRequiresHeating"
                label="Surface chauffée"
              >
                <oui-slider
                  suffix="m²"
                  [control]="
                    combinedFilterForm.controls.surfaceThatRequiresHeating
                  "
                  [max]="locationRanges.SURFACE_HEATED[1]"
                  [min]="locationRanges.SURFACE_HEATED[0]"
                />
              </mkp-filter-row>

              <!-- Consommation énergétique -->
              <mkp-filter-row
                filterKey="electricityConsumptionPerSquareMeter"
                label="Consommation énergétique (kWh/m²)"
              >
                <oui-slider
                  suffix="kWh"
                  [control]="
                    combinedFilterForm.controls
                      .electricityConsumptionPerSquareMeter
                  "
                  [max]="locationRanges.ELECTRICITY_CONSUMPTION[1]"
                  [min]="locationRanges.ELECTRICITY_CONSUMPTION[0]"
                />
              </mkp-filter-row>

              <!-- Consommation annuelle bâtiment -->
              <mkp-filter-row
                filterKey="annualElectricityConsumption"
                label="Consommation annuelle bâtiment"
              >
                <oui-slider
                  suffix="MWh"
                  [control]="
                    combinedFilterForm.controls.annualElectricityConsumption
                  "
                  [max]="locationRanges.ANNUAL_ELEC_CONSUMPTION_2020[1]"
                  [min]="locationRanges.ANNUAL_ELEC_CONSUMPTION_2020[0]"
                  [ratio]="1000"
                />
              </mkp-filter-row>
              <!-- Émissions GES (kgCO₂/m²) -->
              <mkp-filter-row
                filterKey="greenhouseGasEmissionsPerSquareMeter"
                label="Émissions GES (kgCO₂/m²)"
              >
                <oui-slider
                  suffix="kg"
                  [control]="
                    combinedFilterForm.controls
                      .greenhouseGasEmissionsPerSquareMeter
                  "
                  [max]="locationRanges.GES_EMISSIONS[1]"
                  [min]="locationRanges.GES_EMISSIONS[0]"
                />
              </mkp-filter-row>
            </section>

            <!-- Category: Diagnostic -->
            <div class="flex flex-col gap-3">
              <h4 class="text-granite-500 font-semibold">Diagnostics</h4>
              <section class="flex flex-col gap-3 pl-2">
                <!-- Note énergétique-->
                <mkp-filter-row filterKey="dpe" label="Note énergétique">
                  <div class="flex flex-col gap-1">
                    @for (dpe of dpeLabelsOptions; track dpe; let i = $index) {
                      <div
                        class="hover:bg-granite-100 text-granite-900 flex items-center rounded-lg p-2 text-sm font-medium transition-all"
                      >
                        <p-checkbox
                          [formControl]="combinedFilterForm.controls.dpe"
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
                  </div>
                </mkp-filter-row>
                <!-- Classe GES -->
                <mkp-filter-row filterKey="mainGesClass" label="Classe GES">
                  <div class="flex flex-col gap-1">
                    @for (dpe of dpeLabelsOptions; track dpe; let i = $index) {
                      <div
                        class="hover:bg-granite-100 text-granite-900 flex items-center rounded-lg p-2 text-sm font-medium transition-all"
                      >
                        <p-checkbox
                          [formControl]="
                            combinedFilterForm.controls.mainGesClass
                          "
                          [inputId]="'dpe-ges' + i"
                          [value]="dpe.value"
                        />
                        <label
                          class="ml-2 cursor-pointer"
                          [for]="'dpe-ges' + i"
                        >
                          @if (dpe.value === "NC") {
                            <span class="leading-7">Non communiqué</span>
                          } @else {
                            <oui-ges-label size="sm" [letter]="dpe.label" />
                          }
                        </label>
                      </div>
                    }
                  </div>
                </mkp-filter-row>

                <!-- Date d'établissement du DPE -->
                <mkp-filter-row
                  filterKey="dpeEstablishedDate"
                  label="Date d'établissement du dernier DPE"
                >
                  <p-datepicker
                    class="w-full md:w-80"
                    appendTo="body"
                    dateFormat="yy"
                    placeholder="Choisissez une période"
                    readonlyInput
                    selectionMode="range"
                    showClear
                    size="small"
                    view="year"
                    [formControl]="
                      combinedFilterForm.controls.dpeEstablishedDate
                    "
                    [maxDate]="maxDate"
                    [minDate]="minDate"
                  />
                </mkp-filter-row>

                <!-- Présence d'un DPE fiabilisé -->
                <mkp-filter-row
                  filterKey="dpeCertified"
                  label="Présence d'un DPE fiabilisé"
                >
                  <p-selectButton
                    class="p-selectButton--transparent p-selectButton--pill"
                    [formControl]="combinedFilterForm.controls.dpeCertified"
                    [options]="dpeCertifiedOptions"
                  >
                    <ng-template let-option pTemplate="item">
                      <div
                        class="font-display truncate rounded-3xl border px-2 py-1 text-sm"
                        [class]="{
                          'bg-primary-200 text-primary-700 border-gray-700':
                            combinedFilterForm.controls.dpeCertified.value ===
                            option.value,
                          'border-gray-300':
                            combinedFilterForm.controls.dpeCertified.value !==
                            option.value,
                        }"
                      >
                        {{ option.label }}
                      </div>
                    </ng-template>
                  </p-selectButton>
                </mkp-filter-row>
              </section>
            </div>
          </div>
        </mkp-filters-group>
      </form>

      <footer class="flex justify-between gap-2">
        <p-button
          label="Tout effacer"
          severity="secondary"
          size="small"
          styleClass="underline"
          variant="text"
          (click)="reset()"
        />
        <p-button
          label="Appliquer"
          severity="success"
          size="small"
          (click)="onApplyFilters()"
        />
      </footer>
    </op-dialog-wrapper>
  `,
  imports: [
    ButtonModule,
    Checkbox,
    DialogWrapperComponent,
    FormsModule,
    IconBuildingComponent,
    PillOptionComponent,
    ReactiveFormsModule,
    SelectButtonModule,
    SliderModule,
    FiltersGroupComponent,
    SliderComponent,
    MultiSelectModule,
    GesLabelComponent,
    FilterRowComponent,
    DatePicker,
    DpeLabelComponent,
    // InputNumber,
    CapitalizePipe,
    OptionsGroupSelectorComponent,
    OptionsSelectorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersModalComponent extends StronglyTypedDialog<
  {
    filters: LocationBdnbLegalEntityFilterPro | null;
    filtersPageType: "places" | "legal-entities";
  },
  LocationBdnbLegalEntityFilterPro | null
> {
  protected readonly filterPermissions = inject(FilterPermissionsService);
  private readonly trackingService = inject(TrackingService);

  protected readonly locationRanges = LOCATION_FILTER_RANGES;
  protected readonly filtersPageType = this.data.filtersPageType;

  // We only want Individuel and collectif for heating systems here
  protected readonly heatingSystemOptions = [
    ...COLLECTIVE_AND_INDIVIDUAL_HEATING_SYSTEMS,
  ];

  protected readonly activitySectorGroups: OptionGroupSelectorGroup<NafCode>[] =
    buildActivitySectorGroups();

  protected readonly energyTypeOptions = FILTERED_ENERGY_TYPES;

  protected readonly gesClassOptions = [...DPE_LABELS, "NC"];

  protected readonly departmentOptions = FRENCH_REGION_DEPARTMENT_GROUPS;
  protected readonly locationBuildingTypeOptions = locationBuildingTypeOptions;

  protected readonly dpeCertifiedOptions = [
    { label: "Oui", value: true },
    { label: "Non", value: false },
  ];

  protected readonly climateZoneOptions = [...CLIMATE_ZONES];

  protected readonly buildingUsageOptions = BUILDING_USAGE.map((value) => ({
    label: BUILDING_USAGE_LABELS[value],
    value,
  }));

  protected readonly buildingOccupancyStatusOptions =
    BUILDING_OCCUPANCY_STATUS.map((value) => ({
      label: BUILDING_OCCUPANCY_STATUS_LABELS[value],
      value,
    }));

  protected readonly ipeNormalizedScoreRange = IPE_NORMALIZED_SCORE_RANGE;

  protected readonly getLegalEntityTypeLabel = getLegalEntityTypeLabel;

  protected readonly typesOptions = LEGAL_ENTITY_TYPES.map((type) => ({
    label: getLegalEntityTypeLabel(type),
    value: type,
  }));

  protected readonly maxConstructionPeriodOptions = MAX_CONSTRUCTION_PERIOD.map(
    (period) => ({
      label: period
        .replace(/_/g, " ")
        .replace(" A ", " à ")
        .replace("APRES", "après")
        .toLocaleLowerCase(),
      value: period,
    }),
  );

  protected readonly heatingTypeGroups = HEATING_TYPE_GROUPS.map((group) => ({
    ...group,
    options: [...group.options],
  }));

  protected readonly ecsGeneratorTypeGroups = ECS_GENERATOR_TYPE_GROUPS.map(
    (group) => ({
      ...group,
      options: [...group.options],
    }),
  );

  protected readonly ventilationTypeGroups = VENTILATION_TYPE_GROUPS.map(
    (group) => ({
      ...group,
      options: [...group.options],
    }),
  );

  protected readonly dpeLabelsOptions = [
    ...DPE_LABELS.map((dpe) => ({ label: dpe, value: dpe })),
    { value: "NC", label: "Non connu" },
  ] as const;

  protected readonly inertiaClassOptions = [...INERTIA_CLASS];

  protected readonly glazingTypeOptions = [...GLAZING_TYPES];
  protected readonly insulationTypeOptions = [...INSULATION_TYPES];
  protected readonly nbEmployeesRangeOptions = [...EMPLOYEE_RANGES];
  protected readonly legalFormOptions = [...LEGAL_FORM];

  protected readonly minDate = GLOBAL_DATE_RANGE[0];
  protected readonly maxDate = GLOBAL_DATE_RANGE[1];
  protected readonly legalEntityRanges = LEGAL_ENTITY_FILTER_RANGES;

  protected readonly locationBuildingTypeSelection = new FormControl<
    LocationTypeNafCategory[]
  >(
    getLocationBuildingTypeSelection(
      this.data.filters?.locationBuildingType ?? [],
    ),
  );

  protected readonly filtersCategories = {
    localisation: [
      "locationDepartment",
      // "legalEntityTypes",
      "maxConstructionPeriod",
      "creationDate",
      "buildingUsage",
      "buildingOccupancyStatus",
      "nbBuildings",
      "nbUnits",
      "habitableSurfaceArea",
      "isInQpv",
    ],
    entreprise: [
      "sector",
      "locationBuildingType",
      "mainBusinessActivity",
      "nbLegalEntitiesPerLocation",
      "legalEntityDepartment",
      "type",
    ],
    characteristics: [
      "heatingType",
      "ecsGeneratorType",
      "hasAirConditioning",
      "exteriorWallInsulationType",
      "lowerFloorInsulationType",
      "upperFloorInsulationType",
      "glazingType",
      "nbParkingSpots",
      "pmrAccessible",
      "ventilationType",
      "nbStoreys",
      "surfaceArea",
      "surfaceThatRequiresHeating",
      "glazingArea",
      "inertiaClass",
    ],
    energyPerformance: [
      "ipeNormalizedScore",
      "heatingSystem",
      "energyType",
      "electricityConsumptionPerSquareMeter",
      "dpe",
      "mainGesClass",
      "greenhouseGasEmissionsPerSquareMeter",
      "dpeEstablishedDate",
      "annualElectricityConsumption",
      "dpeCertified",
    ],
  } as const;

  protected readonly combinedFilterForm = new FormGroup({
    locationDepartment: new FormControl<Department[]>(
      this.data.filters?.locationDepartment ?? [],
    ),
    locationBuildingType: new FormControl<NafCode[]>(
      this.data.filters?.locationBuildingType ?? [],
    ),
    legalEntityDepartment: new FormControl<Department[]>(
      this.data.filters?.legalEntityDepartment ?? [],
    ),

    nbUnits: createNumberRangeControl(
      this.locationRanges.NB_UNITS,
      this.data.filters?.nbUnits,
    ),
    nbBuildings: createNumberRangeControl(
      this.locationRanges.NB_BUILDINGS,
      this.data.filters?.nbBuildings,
    ),
    energyType: new FormControl<EnergyType[]>(
      this.data.filters?.energyType ?? [],
    ),
    heatingSystem: new FormControl<HeatingSystem[]>(
      this.data.filters?.heatingSystem ?? [],
    ),
    //address: new FormControl<string>(this.data.filters?.address ?? ""),
    // gesClass: new FormControl<string[]>([]),
    pmrAccessible: new FormControl<boolean | null>(
      this.data.filters?.pmrAccessible ?? null,
    ),
    glazingType: new FormControl<GlazingType[]>(
      this.data.filters?.glazingType ?? [],
    ),
    sector: new FormControl<Sector[]>(this.data.filters?.sector ?? []),
    // legalEntityTypes: new FormControl<LegalEntityFilterType[]>(
    //   this.data.filters?.legalEntityTypes ?? [],
    // ),
    mainBusinessActivity: new FormControl<string[]>(
      this.data.filters?.mainBusinessActivity ?? [],
    ),
    nbLegalEntitiesPerLocation: createNumberRangeControl(
      this.locationRanges.RELATED_LEGAL_ENTITIES,
      this.data.filters?.nbLegalEntitiesPerLocation,
    ),
    isInQpv: new FormControl<boolean | null>(
      this.data.filters?.isInQpv ?? null,
    ),
    dpe: new FormControl<(DpeLabel | "NC")[]>(this.data.filters?.dpe ?? []),
    mainGesClass: new FormControl<(DpeLabel | "NC")[]>(
      this.data.filters?.mainGesClass ?? [],
    ),
    greenhouseGasEmissionsPerSquareMeter: createNumberRangeControl(
      this.locationRanges.GES_EMISSIONS,
      this.data.filters?.greenhouseGasEmissionsPerSquareMeter ?? null,
    ),
    maxConstructionPeriod: new FormControl<MaxConstructionPeriod[]>(
      this.data.filters?.maxConstructionPeriod ?? [],
    ),
    creationDate: new FormControl<Date[] | null>(
      this.data.filters?.creationDate
        ? this.data.filters.creationDate
            .map((d) => (d ? new Date(d) : null))
            .filter(isNotNullish)
        : null,
    ),
    nbParkingSpots: createNumberRangeControl(
      this.locationRanges.PARKING_SPACES,
      this.data.filters?.nbParkingSpots,
    ),
    habitableSurfaceArea: createNumberRangeControl(
      this.locationRanges.HABITABLE_SURFACE_AREA,
      this.data.filters?.habitableSurfaceArea ?? null,
    ),
    dpeEstablishedDate: new FormControl<Date[] | null>(
      this.data.filters?.dpeEstablishedDate ?? null,
    ),
    heatingType: new FormControl<HeatingTypeCode[]>(
      this.data.filters?.heatingType ?? [],
    ),
    ecsGeneratorType: new FormControl<ECSGeneratorTypeCode[]>(
      this.data.filters?.ecsGeneratorType ?? [],
    ),
    electricityConsumptionPerSquareMeter: createNumberRangeControl(
      this.locationRanges.ELECTRICITY_CONSUMPTION,
      this.data.filters?.electricityConsumptionPerSquareMeter ?? null,
    ),
    exteriorWallInsulationType: new FormControl<InsulationType[]>(
      this.data.filters?.exteriorWallInsulationType ?? [],
    ),
    lowerFloorInsulationType: new FormControl<InsulationType[]>(
      this.data.filters?.lowerFloorInsulationType ?? [],
    ),
    upperFloorInsulationType: new FormControl<InsulationType[]>(
      this.data.filters?.upperFloorInsulationType ?? [],
    ),
    hasAirConditioning: new FormControl<boolean | null>(
      this.data.filters?.hasAirConditioning ?? null,
    ),
    ventilationType: new FormControl<VentilationTypeCode[]>(
      this.data.filters?.ventilationType ?? [],
    ),

    annualElectricityConsumption: createNumberRangeControl(
      this.locationRanges.ANNUAL_ELEC_CONSUMPTION_2020,
      this.data.filters?.annualElectricityConsumption ?? null,
    ),

    nbStoreys: createNumberRangeControl(
      this.locationRanges.NB_STOREYS,
      this.data.filters?.nbStoreys,
    ),

    surfaceArea: createNumberRangeControl(
      this.locationRanges.SURFACE_AREA,
      this.data.filters?.surfaceArea,
    ),

    surfaceThatRequiresHeating: createNumberRangeControl(
      this.locationRanges.SURFACE_HEATED,
      this.data.filters?.surfaceThatRequiresHeating,
    ),

    glazingArea: createNumberRangeControl(
      this.locationRanges.GLAZING_AREA,
      this.data.filters?.glazingArea,
    ),

    dpeCertified: new FormControl<boolean | null>(
      this.data.filters?.dpeCertified ?? null,
    ),

    inertiaClass: new FormControl<InertiaClass[]>(
      this.data.filters?.inertiaClass ?? [],
    ),

    nbEmployeesRange: new FormControl<EmployeeRange[]>(
      this.data.filters?.nbEmployeesRange ?? [],
    ),
    nbPremises: createNumberRangeControl(
      this.legalEntityRanges.NB_PREMISES,
      this.data.filters?.nbPremises ?? null,
    ),
    buildingUsage: new FormControl<BuildingUsage[]>(
      this.data.filters?.buildingUsage ?? [],
    ),
    buildingOccupancyStatus: new FormControl<BuildingOccupancyStatus[]>(
      this.data.filters?.buildingOccupancyStatus ?? [],
    ),
    ipeNormalizedScore: createNumberRangeControl(
      this.ipeNormalizedScoreRange,
      this.data.filters?.ipeNormalizedScore ?? null,
    ),
    type: new FormControl<LegalEntityType[]>(this.data.filters?.type ?? []),
    legalForm: new FormControl<LegalForm[]>(this.data.filters?.legalForm ?? []),
    nbRelatedLocations: createNumberRangeControl(
      this.legalEntityRanges.NB_RELATED_LOCATIONS,
      this.data.filters?.nbRelatedLocations ?? null,
    ),
    climateZones: new FormControl<ClimateZone[]>([]),
  });

  private readonly syncLocationBuildingTypeSelection =
    this.locationBuildingTypeSelection.valueChanges
      .pipe(
        startWith(this.locationBuildingTypeSelection.value),
        takeUntilDestroyed(),
      )
      .subscribe((categories) => {
        const nextCodes = buildLocationBuildingTypeCodes(categories ?? []);
        const control = this.combinedFilterForm.controls.locationBuildingType;
        if (!areSameNafCodes(control.value ?? [], nextCodes)) {
          control.setValue(nextCodes, { emitEvent: false });
        }
      });

  private readonly syncClimateZoneWithDepartmentControl =
    this.combinedFilterForm.controls.climateZones.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((zones) => {
        const departmentControl =
          this.combinedFilterForm.controls.locationDepartment;

        if (!zones || zones.length === 0) {
          departmentControl.setValue([], { emitEvent: false });
          return;
        }

        departmentControl.setValue(
          zones.flatMap((zone) => getDepartments(zone)),
          { emitEvent: false },
        );
      });

  protected readonly filtersCountByCategory = toSignal(
    this.combinedFilterForm.valueChanges.pipe(
      startWith(this.combinedFilterForm.getRawValue()),
      map((value) => {
        const counts: Record<FilterCategory, number> = {
          localisation: 0,
          entreprise: 0,
          characteristics: 0,
          energyPerformance: 0,
        };

        //const filtersToIgnore = ["unlockedOnly", "sort"] as const;

        for (const category in this.filtersCategories) {
          const keys = this.filtersCategories[category as FilterCategory];
          for (const key of keys) {
            const filterValue = value[key];
            if (filterValue !== null && filterValue !== undefined) {
              if (Array.isArray(filterValue) && filterValue.length > 0) {
                counts[category as FilterCategory]++;
              } else if (
                typeof filterValue === "object" &&
                Object.keys(filterValue).length
              ) {
                counts[category as FilterCategory]++;
              } else if (
                typeof filterValue === "boolean" ||
                typeof filterValue === "string" ||
                typeof filterValue === "number"
              ) {
                counts[category as FilterCategory]++;
              }
            }
          }
        }
        return counts;
      }),
    ),
    {
      initialValue: {
        localisation: 0,
        entreprise: 0,
        characteristics: 0,
        energyPerformance: 0,
      },
    },
  );

  protected reset() {
    this.combinedFilterForm.reset();
    this.locationBuildingTypeSelection.setValue([]);
    this.dialogRef.close(this.combinedFilterForm.value);
  }

  protected onApplyFilters() {
    this.trackFiltersUsage();
    this.dialogRef.close(this.combinedFilterForm.value);
  }

  private trackFiltersUsage() {
    const rawFilters = this.combinedFilterForm.value;
    const cleanedFilters = this.cleanFiltersPayload(rawFilters);
    const filterKeys = Object.keys(cleanedFilters);
    this.trackingService.trackPro("pro_filters_used", {
      source_component: "filters_modal",
      filters_page_type: this.filtersPageType,
      filters_count: filterKeys.length,
      global_filters_keys: filterKeys.join(","),
      global_filters_values: JSON.stringify(cleanedFilters),
    });
  }

  private cleanFiltersPayload(
    filters: LocationBdnbLegalEntityFilterPro,
  ): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (key === "locationBuildingType") {
        const categories = this.locationBuildingTypeSelection.value;
        if (categories && categories.length > 0) {
          cleaned[key] = categories;
        }
        continue;
      }
      if (value === null || value === undefined) {
        continue;
      }
      if (Array.isArray(value)) {
        if (value.length === 0) {
          continue;
        }
        cleaned[key] = value;
        continue;
      }
      if (typeof value === "object") {
        const entries = Object.entries(value as Record<string, unknown>).filter(
          ([, v]) =>
            v !== null &&
            v !== undefined &&
            !(Array.isArray(v) && v.length === 0) &&
            !(typeof v === "string" && v.trim() === ""),
        );
        if (entries.length === 0) {
          continue;
        }
        cleaned[key] = Object.fromEntries(entries);
        continue;
      }
      if (typeof value === "string" && value.trim() === "") {
        continue;
      }
      cleaned[key] = value;
    }
    return cleaned;
  }
}
