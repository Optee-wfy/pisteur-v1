import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
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
  ContactLevel,
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
  WorkDomain,
} from "@optee/constants";
import {
  areSameNafCodes,
  buildActivitySectorGroups,
  BUILDING_OCCUPANCY_STATUS,
  BUILDING_OCCUPANCY_STATUS_LABELS,
  buildLocationBuildingTypeCodes,
  CLIMATE_ZONES,
  COLLECTIVE_AND_INDIVIDUAL_HEATING_SYSTEMS,
  CONTACT_LEVEL_LABELS,
  DPE_LABELS,
  ECS_GENERATOR_TYPE_GROUPS,
  EMPLOYEE_RANGES,
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
  LEGAL_FORM,
  LOCATION_FILTER_RANGES,
  locationBuildingTypeOptions,
  MAX_CONSTRUCTION_PERIOD,
  VENTILATION_TYPE_GROUPS,
  WORK_DOMAIN_LABELS,
} from "@optee/constants";
import {
  IconBoltComponent,
  IconBuildingComponent,
  IconCompanyComponent,
  IconGearComponent,
  IconPeopleComponent,
} from "@optee/icons";
import { DpeLabelComponent } from "@optee/ui/components/atoms/dpe-label/dpe-label.component";
import { SelectCardButtonsComponent } from "@optee/ui/components/atoms/fields/select-card-buttons.component";
import { GesLabelComponent } from "@optee/ui/components/atoms/ges-label/ges-label.component";
import { SliderComponent } from "@optee/ui/components/molecules/form/slider/slider.component";
import { createNumberRangeControl } from "@optee/ui/functions/create-number-range-control.fn";
import { isNotNullish } from "@optee/utils";
import { ButtonModule } from "primeng/button";
import { Checkbox } from "primeng/checkbox";
import { DatePicker } from "primeng/datepicker";
import { MultiSelectModule } from "primeng/multiselect";
import { SelectButtonModule } from "primeng/selectbutton";
import { SliderModule } from "primeng/slider";
import { debounceTime, merge, startWith } from "rxjs";
import {
  OptionsGroupSelectorComponent,
  type OptionGroupSelectorGroup,
} from "../../../../components/shared/options-group-selector/options-group-selector.component";
import { OptionsSelectorComponent } from "../../../../components/shared/options-selector/options-selector.component";
import { FilterPermissionsService } from "../../../../services/filter-permissions.service";
import { FilterRowComponent } from "../filters/filter-row/filter-row.component";
import { FiltersGroupComponent } from "../filters/filters-group/filters-group.component";
import { BUILDING_USAGE_WITH_ICONS } from "../places/place.constant";

type FilterCategory =
  | "localisation"
  | "entreprise"
  | "externalContact"
  | "characteristics"
  | "energyPerformance";

const EMPTY_FILTER_COUNTS: Record<FilterCategory, number> = {
  localisation: 0,
  entreprise: 0,
  externalContact: 0,
  characteristics: 0,
  energyPerformance: 0,
};

@Component({
  selector: "mkp-advanced-filters-form",
  template: `
    <form
      class="flex max-w-full flex-col gap-4 py-2"
      [formGroup]="combinedFilterForm"
    >
      <!-- Section 1: Bâtiment -->
      @if (shouldShowCategory("localisation")) {
        <mkp-filters-group colored="false" dropDown>
          <h3 class="flex items-center gap-2" heading>
            <icon-building
              class="size-5 rounded-full bg-blue-100 p-1 text-blue-600"
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
            <!-- Usage Bâtiment
          <mkp-filter-row filterKey="buildingUsage" label="Usage Bâtiment">
            <oui-select-card-buttons
              ariaLabel="Usage bâtiment"
              [formControl]="combinedFilterForm.controls.buildingUsage"
              [multiple]="true"
              [options]="buildingUsageOptions"
            />
          </mkp-filter-row> -->

            <!-- Acteur bâtiment -->
            <mkp-filter-row
              filterKey="buildingOccupancyStatus"
              label="Acteur bâtiment"
            >
              <oui-select-card-buttons
                ariaLabel="Acteur bâtiment"
                [formControl]="
                  combinedFilterForm.controls.buildingOccupancyStatus
                "
                [multiple]="true"
                [options]="buildingOccupancyStatusOptions"
              />
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
                class="w-full"
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
                class="w-full"
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

            <!--  Département  -->
            <mkp-filter-row filterKey="locationDepartment" label="Département">
              <mkp-options-group-selector
                searchPlaceholder="Rechercher un département..."
                [formControl]="combinedFilterForm.controls.locationDepartment"
                [groups]="departmentOptions"
                [showSearch]="true"
              />
              <oui-select-card-buttons
                ariaLabel="Zone climatique"
                [formControl]="climateZones"
                [multiple]="true"
                [options]="climateZoneOptions"
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
      }

      <!-- Section 2: Entreprise -->
      @if (shouldShowCategory("entreprise")) {
        <mkp-filters-group colored="false" dropDown>
          <h3 class="flex items-center gap-2" heading>
            <icon-company
              class="size-5 rounded-full bg-cyan-100 p-1 text-cyan-600"
              slot="icon"
            />
            Filtres complémentaires entreprise
            @if (filtersCountByCategory().entreprise; as entrepriseCount) {
              <span
                class="bg-granite-100 text-granite-900 flex size-6 items-center justify-center rounded-full text-center font-medium"
              >
                {{ entrepriseCount }}
              </span>
            }
          </h3>

          <section class="flex flex-col gap-3">
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
                class="w-full"
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
                class="w-full"
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
          </section>
        </mkp-filters-group>
      }

      <!-- Section 2 bis: Personnes -->
      @if (shouldShowCategory("externalContact")) {
        <mkp-filters-group colored="false" dropDown>
          <h3 class="flex items-center gap-2" heading>
            <icon-people
              class="size-5 rounded-full bg-green-100 p-1 text-green-700"
              slot="icon"
            />
            Personnes
            @if (
              filtersCountByCategory().externalContact;
              as externalContactCount
            ) {
              <span
                class="bg-granite-100 text-granite-900 flex size-6 items-center justify-center rounded-full text-center font-medium"
              >
                {{ externalContactCount }}
              </span>
            }
          </h3>

          <section class="flex flex-col gap-3">
            <mkp-filter-row filterKey="domains" label="Domaine d'activité">
              <p-multiselect
                class="w-full"
                appendTo="body"
                formControlName="domains"
                placeholder="Choisissez un ou plusieurs domaines"
                showClear
                [options]="domainsOptions"
              />
            </mkp-filter-row>

            <mkp-filter-row filterKey="levels" label="Niveau hiérarchique">
              <p-multiselect
                class="w-full"
                appendTo="body"
                formControlName="levels"
                placeholder="Choisissez un ou plusieurs niveaux"
                showClear
                [options]="levelsOptions"
              />
            </mkp-filter-row>
          </section>
        </mkp-filters-group>
      }

      <!-- Section 3: Caractéristiques -->
      @if (shouldShowCategory("characteristics")) {
        <mkp-filters-group colored="false" dropDown>
          <h3 class="flex items-center gap-2" heading>
            <icon-gear
              class="size-5 rounded-full bg-amber-100 p-1 text-amber-500"
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
                      class="w-full"
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
                      class="w-full"
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
                      class="w-full"
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
                      class="w-full"
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
      }

      <!-- Section 4: Énergie & Performance -->
      @if (shouldShowCategory("energyPerformance")) {
        <mkp-filters-group colored="false" dropDown>
          <h3 class="flex items-center gap-2" heading>
            <icon-bolt
              class="size-5 rounded-full bg-purple-100 p-1 text-purple-600"
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
                <oui-select-card-buttons
                  ariaLabel="Chauffage"
                  [formControl]="combinedFilterForm.controls.heatingSystem"
                  [multiple]="true"
                  [options]="heatingSystemOptions"
                />
              </mkp-filter-row>
              <!-- Énergie -->
              <mkp-filter-row filterKey="energyType" label="Énergie">
                <oui-select-card-buttons
                  ariaLabel="Énergie"
                  [formControl]="combinedFilterForm.controls.energyType"
                  [multiple]="true"
                  [options]="energyTypeOptions"
                />
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
                  <div class="flex gap-1">
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
                  <div class="flex gap-1">
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
                    class="w-full"
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
                  <oui-select-card-buttons
                    ariaLabel="Présence d'un DPE fiabilisé"
                    [formControl]="combinedFilterForm.controls.dpeCertified"
                    [options]="dpeCertifiedOptions"
                  />
                </mkp-filter-row>
              </section>
            </div>
          </div>
        </mkp-filters-group>
      }
    </form>

    <div class="flex w-full justify-end">
      <p-button
        label="Tout effacer"
        severity="secondary"
        size="small"
        styleClass="underline"
        variant="text"
        (click)="reset()"
      />
    </div>
  `,
  imports: [
    ButtonModule,
    Checkbox,
    FormsModule,
    IconBoltComponent,
    IconBuildingComponent,
    IconCompanyComponent,
    IconGearComponent,
    ReactiveFormsModule,
    SelectCardButtonsComponent,
    SelectButtonModule,
    SliderModule,
    IconPeopleComponent,
    FiltersGroupComponent,
    SliderComponent,
    MultiSelectModule,
    GesLabelComponent,
    FilterRowComponent,
    DatePicker,
    DpeLabelComponent,
    // InputNumber,
    OptionsGroupSelectorComponent,
    OptionsSelectorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedFiltersFormComponent {
  readonly filters = input<LocationBdnbLegalEntityFilterPro | null>(null);
  readonly visibleCategories = input<readonly FilterCategory[]>([
    "localisation",
    "entreprise",
    "externalContact",
    "characteristics",
    "energyPerformance",
  ]);

  readonly applyFilters = output<LocationBdnbLegalEntityFilterPro | null>();
  readonly resetFilters = output<LocationBdnbLegalEntityFilterPro | null>();

  protected readonly filterPermissions = inject(FilterPermissionsService);
  private isResetting = false;

  protected readonly locationRanges = LOCATION_FILTER_RANGES;
  private readonly normalizeOptionLabel = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);

  // We only want Individuel and collectif for heating systems here
  protected readonly heatingSystemOptions =
    COLLECTIVE_AND_INDIVIDUAL_HEATING_SYSTEMS.map((value) => ({
      label: this.normalizeOptionLabel(value),
      value,
    }));

  protected readonly activitySectorGroups: OptionGroupSelectorGroup<NafCode>[] =
    buildActivitySectorGroups();

  protected readonly energyTypeOptions = FILTERED_ENERGY_TYPES.map((value) => ({
    label: value,
    value,
  }));

  protected readonly gesClassOptions = [...DPE_LABELS, "NC"];

  protected readonly departmentOptions = FRENCH_REGION_DEPARTMENT_GROUPS;
  protected readonly locationBuildingTypeOptions = locationBuildingTypeOptions;
  protected readonly domainsOptions = Object.entries(WORK_DOMAIN_LABELS).map(
    ([value, label]) => ({
      value,
      label,
    }),
  );

  protected readonly levelsOptions = Object.entries(CONTACT_LEVEL_LABELS).map(
    ([value, label]) => ({
      value,
      label,
    }),
  );

  protected readonly dpeCertifiedOptions = [
    { label: "Oui", value: true },
    { label: "Non", value: false },
  ];

  protected readonly climateZoneOptions = CLIMATE_ZONES.map((zone) => ({
    label: zone,
    value: zone,
  }));

  protected readonly climateZones = new FormControl<ClimateZone[]>([], {
    nonNullable: true,
  });

  protected readonly buildingUsageOptions = BUILDING_USAGE_WITH_ICONS;

  protected readonly buildingOccupancyStatusOptions =
    BUILDING_OCCUPANCY_STATUS.map((value) => ({
      label: BUILDING_OCCUPANCY_STATUS_LABELS[value],
      value,
    }));

  protected readonly ipeNormalizedScoreRange = IPE_NORMALIZED_SCORE_RANGE;

  protected readonly getLegalEntityTypeLabel = getLegalEntityTypeLabel;

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
      this.filters()?.locationBuildingType ?? [],
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
      "mainBusinessActivity",
      "legalEntityDepartment",
      "nbEmployeesRange",
      "legalForm",
      "nbPremises",
      "nbLegalEntitiesPerLocation",
    ],
    externalContact: ["domains", "levels"],
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
      this.filters()?.locationDepartment ?? [],
    ),
    locationBuildingType: new FormControl<NafCode[]>(
      this.filters()?.locationBuildingType ?? [],
    ),
    domains: new FormControl<WorkDomain[]>(this.filters()?.domains ?? []),
    levels: new FormControl<ContactLevel[]>(this.filters()?.levels ?? []),
    legalEntityDepartment: new FormControl<Department[]>(
      this.filters()?.legalEntityDepartment ?? [],
    ),

    nbUnits: createNumberRangeControl(
      this.locationRanges.NB_UNITS,
      this.filters()?.nbUnits,
    ),
    nbBuildings: createNumberRangeControl(
      this.locationRanges.NB_BUILDINGS,
      this.filters()?.nbBuildings,
    ),
    energyType: new FormControl<EnergyType[]>(this.filters()?.energyType ?? []),
    heatingSystem: new FormControl<HeatingSystem[]>(
      this.filters()?.heatingSystem ?? [],
    ),
    //address: new FormControl<string>(this.filters()?.address ?? ""),
    // gesClass: new FormControl<string[]>([]),
    pmrAccessible: new FormControl<boolean | null>(
      this.filters()?.pmrAccessible ?? null,
    ),
    glazingType: new FormControl<GlazingType[]>(
      this.filters()?.glazingType ?? [],
    ),
    sector: new FormControl<Sector[]>(this.filters()?.sector ?? []),
    // legalEntityTypes: new FormControl<LegalEntityFilterType[]>(
    //   this.filters()?.legalEntityTypes ?? [],
    // ),
    mainBusinessActivity: new FormControl<string[]>(
      this.filters()?.mainBusinessActivity ?? [],
    ),
    nbLegalEntitiesPerLocation: createNumberRangeControl(
      this.locationRanges.RELATED_LEGAL_ENTITIES,
      this.filters()?.nbLegalEntitiesPerLocation,
    ),
    isInQpv: new FormControl<boolean | null>(this.filters()?.isInQpv ?? null),
    dpe: new FormControl<(DpeLabel | "NC")[]>(this.filters()?.dpe ?? []),
    mainGesClass: new FormControl<(DpeLabel | "NC")[]>(
      this.filters()?.mainGesClass ?? [],
    ),
    greenhouseGasEmissionsPerSquareMeter: createNumberRangeControl(
      this.locationRanges.GES_EMISSIONS,
      this.filters()?.greenhouseGasEmissionsPerSquareMeter ?? null,
    ),
    maxConstructionPeriod: new FormControl<MaxConstructionPeriod[]>(
      this.filters()?.maxConstructionPeriod ?? [],
    ),
    creationDate: new FormControl<Date[] | null>(
      (() => {
        const creationDate = this.filters()?.creationDate;
        return creationDate
          ? creationDate
              .map((d) => (d ? new Date(d) : null))
              .filter(isNotNullish)
          : null;
      })(),
    ),
    nbParkingSpots: createNumberRangeControl(
      this.locationRanges.PARKING_SPACES,
      this.filters()?.nbParkingSpots,
    ),
    habitableSurfaceArea: createNumberRangeControl(
      this.locationRanges.HABITABLE_SURFACE_AREA,
      this.filters()?.habitableSurfaceArea ?? null,
    ),
    dpeEstablishedDate: new FormControl<Date[] | null>(
      this.filters()?.dpeEstablishedDate ?? null,
    ),
    heatingType: new FormControl<HeatingTypeCode[]>(
      this.filters()?.heatingType ?? [],
    ),
    ecsGeneratorType: new FormControl<ECSGeneratorTypeCode[]>(
      this.filters()?.ecsGeneratorType ?? [],
    ),
    electricityConsumptionPerSquareMeter: createNumberRangeControl(
      this.locationRanges.ELECTRICITY_CONSUMPTION,
      this.filters()?.electricityConsumptionPerSquareMeter ?? null,
    ),
    exteriorWallInsulationType: new FormControl<InsulationType[]>(
      this.filters()?.exteriorWallInsulationType ?? [],
    ),
    lowerFloorInsulationType: new FormControl<InsulationType[]>(
      this.filters()?.lowerFloorInsulationType ?? [],
    ),
    upperFloorInsulationType: new FormControl<InsulationType[]>(
      this.filters()?.upperFloorInsulationType ?? [],
    ),
    hasAirConditioning: new FormControl<boolean | null>(
      this.filters()?.hasAirConditioning ?? null,
    ),
    ventilationType: new FormControl<VentilationTypeCode[]>(
      this.filters()?.ventilationType ?? [],
    ),

    annualElectricityConsumption: createNumberRangeControl(
      this.locationRanges.ANNUAL_ELEC_CONSUMPTION_2020,
      this.filters()?.annualElectricityConsumption ?? null,
    ),

    nbStoreys: createNumberRangeControl(
      this.locationRanges.NB_STOREYS,
      this.filters()?.nbStoreys,
    ),

    surfaceArea: createNumberRangeControl(
      this.locationRanges.SURFACE_AREA,
      this.filters()?.surfaceArea,
    ),

    surfaceThatRequiresHeating: createNumberRangeControl(
      this.locationRanges.SURFACE_HEATED,
      this.filters()?.surfaceThatRequiresHeating,
    ),

    glazingArea: createNumberRangeControl(
      this.locationRanges.GLAZING_AREA,
      this.filters()?.glazingArea,
    ),

    dpeCertified: new FormControl<boolean | null>(
      this.filters()?.dpeCertified ?? null,
    ),

    inertiaClass: new FormControl<InertiaClass[]>(
      this.filters()?.inertiaClass ?? [],
    ),

    nbEmployeesRange: new FormControl<EmployeeRange[]>(
      this.filters()?.nbEmployeesRange ?? [],
    ),
    nbPremises: createNumberRangeControl(
      this.legalEntityRanges.NB_PREMISES,
      this.filters()?.nbPremises ?? null,
    ),
    buildingUsage: new FormControl<BuildingUsage[]>(
      this.filters()?.buildingUsage ?? [],
    ),
    buildingOccupancyStatus: new FormControl<BuildingOccupancyStatus[]>(
      this.filters()?.buildingOccupancyStatus ?? [],
    ),
    ipeNormalizedScore: createNumberRangeControl(
      this.ipeNormalizedScoreRange,
      this.filters()?.ipeNormalizedScore ?? null,
    ),
    type: new FormControl<LegalEntityType[]>(this.filters()?.type ?? []),
    legalForm: new FormControl<LegalForm[]>(this.filters()?.legalForm ?? []),
    nbRelatedLocations: createNumberRangeControl(
      this.legalEntityRanges.NB_RELATED_LOCATIONS,
      this.filters()?.nbRelatedLocations ?? null,
    ),
  });

  private readonly syncFormWithFilters = effect(() => {
    const filters = this.filters();

    this.isResetting = true;
    this.locationBuildingTypeSelection.setValue(
      getLocationBuildingTypeSelection(filters?.locationBuildingType ?? []),
      { emitEvent: false },
    );
    this.combinedFilterForm.reset(this.buildFormValue(filters), {
      emitEvent: false,
    });
    this.climateZones.setValue(
      this.getClimateZonesFromDepartments(filters?.locationDepartment ?? []),
      { emitEvent: false },
    );
    this.isResetting = false;
    this.updateFiltersCountByCategory();
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
        this.updateFiltersCountByCategory();
      });

  private readonly syncClimateZoneWithDepartmentControl =
    this.climateZones.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((zones) => {
        const departmentControl =
          this.combinedFilterForm.controls.locationDepartment;

        if (!zones || zones.length === 0) {
          departmentControl.setValue([], { emitEvent: false });
          this.updateFiltersCountByCategory();
          return;
        }

        departmentControl.setValue(
          zones.flatMap((zone) => getDepartments(zone)),
          { emitEvent: false },
        );
        this.updateFiltersCountByCategory();
      });

  private readonly autoApplyFilters = merge(
    this.combinedFilterForm.valueChanges,
    this.climateZones.valueChanges,
    this.locationBuildingTypeSelection.valueChanges,
  )
    .pipe(debounceTime(250), takeUntilDestroyed())
    .subscribe(() => {
      if (this.isResetting) {
        return;
      }
      this.emitFilters();
    });

  private readonly syncFiltersCountByCategory =
    this.combinedFilterForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.updateFiltersCountByCategory();
      });

  protected readonly filtersCountByCategory = signal(EMPTY_FILTER_COUNTS);

  protected reset() {
    this.isResetting = true;
    this.combinedFilterForm.reset(this.buildResetFormValue(), {
      emitEvent: false,
    });
    this.climateZones.setValue([], { emitEvent: false });
    this.locationBuildingTypeSelection.setValue(
      getLocationBuildingTypeSelection(
        this.combinedFilterForm.controls.locationBuildingType.value,
      ),
      { emitEvent: false },
    );
    this.isResetting = false;
    this.updateFiltersCountByCategory();
    this.resetFilters.emit(this.getCurrentFiltersPayload());
  }

  private emitFilters() {
    const cleaned = this.cleanFiltersPayload(
      this.combinedFilterForm.getRawValue() as LocationBdnbLegalEntityFilterPro,
    );
    this.applyFilters.emit(cleaned as LocationBdnbLegalEntityFilterPro);
  }

  private buildFormValue(filters: LocationBdnbLegalEntityFilterPro | null) {
    return {
      locationDepartment: filters?.locationDepartment ?? [],
      locationBuildingType: filters?.locationBuildingType ?? [],
      domains: filters?.domains ?? [],
      levels: filters?.levels ?? [],
      legalEntityDepartment: filters?.legalEntityDepartment ?? [],
      nbUnits: filters?.nbUnits ?? null,
      nbBuildings: filters?.nbBuildings ?? null,
      energyType: filters?.energyType ?? [],
      heatingSystem: filters?.heatingSystem ?? [],
      pmrAccessible: filters?.pmrAccessible ?? null,
      glazingType: filters?.glazingType ?? [],
      sector: filters?.sector ?? [],
      mainBusinessActivity: filters?.mainBusinessActivity ?? [],
      nbLegalEntitiesPerLocation: filters?.nbLegalEntitiesPerLocation ?? null,
      isInQpv: filters?.isInQpv ?? null,
      dpe: filters?.dpe ?? [],
      mainGesClass: filters?.mainGesClass ?? [],
      greenhouseGasEmissionsPerSquareMeter:
        filters?.greenhouseGasEmissionsPerSquareMeter ?? null,
      maxConstructionPeriod: filters?.maxConstructionPeriod ?? [],
      creationDate: this.toDateArray(filters?.creationDate),
      nbParkingSpots: filters?.nbParkingSpots ?? null,
      habitableSurfaceArea: filters?.habitableSurfaceArea ?? null,
      dpeEstablishedDate: this.toDateArray(filters?.dpeEstablishedDate),
      heatingType: filters?.heatingType ?? [],
      ecsGeneratorType: filters?.ecsGeneratorType ?? [],
      electricityConsumptionPerSquareMeter:
        filters?.electricityConsumptionPerSquareMeter ?? null,
      exteriorWallInsulationType: filters?.exteriorWallInsulationType ?? [],
      lowerFloorInsulationType: filters?.lowerFloorInsulationType ?? [],
      upperFloorInsulationType: filters?.upperFloorInsulationType ?? [],
      hasAirConditioning: filters?.hasAirConditioning ?? null,
      ventilationType: filters?.ventilationType ?? [],
      annualElectricityConsumption:
        filters?.annualElectricityConsumption ?? null,
      nbStoreys: filters?.nbStoreys ?? null,
      surfaceArea: filters?.surfaceArea ?? null,
      surfaceThatRequiresHeating: filters?.surfaceThatRequiresHeating ?? null,
      glazingArea: filters?.glazingArea ?? null,
      dpeCertified: filters?.dpeCertified ?? null,
      inertiaClass: filters?.inertiaClass ?? [],
      nbEmployeesRange: filters?.nbEmployeesRange ?? [],
      nbPremises: filters?.nbPremises ?? null,
      buildingUsage: filters?.buildingUsage ?? [],
      buildingOccupancyStatus: filters?.buildingOccupancyStatus ?? [],
      ipeNormalizedScore: filters?.ipeNormalizedScore ?? null,
      type: filters?.type ?? [],
      legalForm: filters?.legalForm ?? [],
      nbRelatedLocations: filters?.nbRelatedLocations ?? null,
    };
  }

  protected shouldShowCategory(category: FilterCategory): boolean {
    return this.visibleCategories().includes(category);
  }

  private buildResetFormValue() {
    const currentValue = this.buildFormValue(this.filters()) as Record<
      string,
      unknown
    >;
    const emptyValue = this.buildFormValue(null) as Record<string, unknown>;

    for (const category of this.visibleCategories()) {
      for (const key of this.filtersCategories[category]) {
        currentValue[key] = emptyValue[key];
      }
    }

    return currentValue;
  }

  private getCurrentFiltersPayload(): LocationBdnbLegalEntityFilterPro | null {
    const cleaned = this.cleanFiltersPayload(
      this.combinedFilterForm.getRawValue() as LocationBdnbLegalEntityFilterPro,
    );

    return Object.keys(cleaned).length > 0
      ? (cleaned as LocationBdnbLegalEntityFilterPro)
      : null;
  }

  private updateFiltersCountByCategory() {
    const value = this.combinedFilterForm.getRawValue();
    const counts = { ...EMPTY_FILTER_COUNTS };

    for (const category of Object.keys(
      this.filtersCategories,
    ) as FilterCategory[]) {
      for (const key of this.filtersCategories[category]) {
        if (this.isFilterValueActive(value[key])) {
          counts[category]++;
        }
      }
    }

    this.filtersCountByCategory.set(counts);
  }

  private isFilterValueActive(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === "object") {
      return Object.values(value as Record<string, unknown>).some((entry) =>
        this.isFilterValueActive(entry),
      );
    }

    if (typeof value === "string") {
      return value.trim() !== "";
    }

    return true;
  }

  private toDateArray(
    value: Array<Date | string | null> | null | undefined,
  ): Date[] | null {
    if (!value) {
      return null;
    }

    const dates = value
      .map((date) => (date ? new Date(date) : null))
      .filter(isNotNullish);

    return dates.length > 0 ? dates : null;
  }

  private getClimateZonesFromDepartments(
    departments: Department[],
  ): ClimateZone[] {
    return CLIMATE_ZONES.filter((zone) => {
      const zoneDepartments = getDepartments(zone);
      return (
        zoneDepartments.length > 0 &&
        zoneDepartments.every((department) => departments.includes(department))
      );
    });
  }

  private cleanFiltersPayload(
    filters: LocationBdnbLegalEntityFilterPro,
  ): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (key === "locationBuildingType") {
        if (Array.isArray(value) && value.length > 0) {
          cleaned[key] = value;
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
