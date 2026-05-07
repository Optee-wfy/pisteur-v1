import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import type {
  ClimateZone,
  Department,
  EnergyType,
  HeatingSystem,
  LegalEntityType,
  LocationFilterPro,
  MainSector,
  ProLocationAssociationLabel,
} from "@optee/constants";
import {
  CLIMATE_ZONES,
  DPE_LABELS,
  ENERGY_TYPES,
  FRENCH_DEPARTMENTS,
  getDepartments,
  GLOBAL_DATE_RANGE,
  HEATING_SYSTEMS,
  LOCATION_FILTER_RANGES,
  LOCATION_SECTORS,
  PRO_LOCATION_ASSOCIATIONS,
} from "@optee/constants";
import { ButtonComponent } from "@optee/ui/components/atoms//button/button/button.component";
import { DpeLabelComponent } from "@optee/ui/components/atoms/dpe-label/dpe-label.component";
import { PillOptionComponent } from "@optee/ui/components/atoms/pill/pill-option/pill-option.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { SliderComponent } from "@optee/ui/components/molecules/form/slider/slider.component";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";
import { createNumberRangeControl } from "@optee/ui/functions/create-number-range-control.fn";
import { refreshFormFieldValidity } from "@optee/ui/functions/refresh-form-field-validity.fn";
import { Checkbox } from "primeng/checkbox";
import { DatePicker } from "primeng/datepicker";
import { MultiSelect } from "primeng/multiselect";
import { SelectButtonModule } from "primeng/selectbutton";
import { debounceTime, map, startWith } from "rxjs";
import { LocationsFilterRowComponent } from "../location-filter-row/location-filter-row.component";

@Component({
  selector: "mkp-locations-filter-pro",
  host: { class: "flex flex-col gap-2 pr-4" },
  template: `
    <oui-title-tight preTitle>Filtrer par</oui-title-tight>

    <form
      class="scrollable-shadow-zone flex flex-1 flex-col gap-6 px-4 py-2"
      [formGroup]="locationFilterForm"
    >
      <mkp-locations-filter-row dropDown heading="Localisation" [isOpen]="true">
        @let departmentCount =
          locationFilterForm.controls.department.value?.length ?? 0;
        <div class="flex flex-col gap-4">
          <oui-form-field
            name="department"
            label="Département"
            [control]="locationFilterForm.controls.department"
          >
            <p-multiselect
              class="w-full"
              appendTo="body"
              formControlName="department"
              placeholder="Sélectionnez un département"
              selectedItemsLabel="{{
                departmentCount
              }} départements sélectionnés"
              showClear
              [options]="departmentOptions"
            />
          </oui-form-field>

          <oui-form-field
            class="flex-1"
            name="climateZone"
            label="Zone climatique"
            [control]="climateZones"
          >
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
          </oui-form-field>
        </div>
      </mkp-locations-filter-row>

      <mkp-locations-filter-row dropDown heading="Caractéristiques du site">
        <div class="flex flex-col gap-4">
          <oui-form-field
            name="locationSector"
            label="Type de bâtiment"
            [control]="locationFilterForm.controls.sector"
          >
            <p-selectButton
              class="p-selectButton--transparent p-selectButton--pill"
              multiple
              optionLabel="name"
              optionValue="value"
              [formControl]="locationFilterForm.controls.sector"
              [options]="sectorOptions"
            >
              <ng-template let-option pTemplate="item">
                <oui-pill-option
                  [control]="locationFilterForm.controls.sector"
                  [value]="option.value"
                >
                  {{ option.name }}
                </oui-pill-option>
              </ng-template>
            </p-selectButton>
          </oui-form-field>

          <oui-form-field
            name="surfaceThatRequiresHeating"
            label="Surface chauffée"
            [control]="locationFilterForm.controls.surfaceThatRequiresHeating"
          >
            <oui-slider
              suffix="m²"
              [control]="locationFilterForm.controls.surfaceThatRequiresHeating"
              [max]="locationRanges.SURFACE_HEATED[1]"
              [min]="locationRanges.SURFACE_HEATED[0]"
            />
          </oui-form-field>

          <oui-form-field
            name="constructionDate"
            label="Année de construction"
            [control]="locationFilterForm.controls.creationDate"
          >
            <p-datepicker
              dateFormat="yy"
              placeholder="Sélectionnez une période"
              readonlyInput
              selectionMode="range"
              showClear
              view="year"
              [formControl]="locationFilterForm.controls.creationDate"
              [maxDate]="maxDate"
              [minDate]="minDate"
            />
          </oui-form-field>

          <oui-form-field
            name="heatingType"
            label="Type de chauffage"
            [control]="locationFilterForm.controls.heatingSystem"
          >
            <p-selectButton
              class="p-selectButton--transparent p-selectButton--pill"
              formControlName="heatingSystem"
              [multiple]="true"
              [options]="heatingSystemOptions"
            >
              <ng-template let-option pTemplate="item">
                <oui-pill-option
                  [control]="locationFilterForm.controls.heatingSystem"
                  [value]="option"
                >
                  {{ option }}
                </oui-pill-option>
              </ng-template>
            </p-selectButton>
          </oui-form-field>

          <oui-form-field
            class="flex-1"
            name="surfaceArea"
            label="Emprise au sol"
            [control]="locationFilterForm.controls.surfaceArea"
          >
            <oui-slider
              suffix="m²"
              [control]="locationFilterForm.controls.surfaceArea"
              [max]="locationRanges.SURFACE_AREA[1]"
              [min]="locationRanges.SURFACE_AREA[0]"
            />
          </oui-form-field>

          <oui-form-field
            class="flex-1"
            name="glazingArea"
            label="Surface vitrée"
            [control]="locationFilterForm.controls.glazingArea"
          >
            <oui-slider
              suffix="m²"
              [control]="locationFilterForm.controls.glazingArea"
              [max]="locationRanges.GLAZING_AREA[1]"
              [min]="locationRanges.GLAZING_AREA[0]"
            />
          </oui-form-field>

          <oui-form-field
            class="flex-1"
            name="height"
            label="Hauteur"
            [control]="locationFilterForm.controls.height"
          >
            <oui-slider
              suffix="m"
              [control]="locationFilterForm.controls.height"
              [max]="locationRanges.HEIGHT[1]"
              [min]="locationRanges.HEIGHT[0]"
            />
          </oui-form-field>

          <oui-form-field
            class="flex-1"
            name="nbStoreys"
            label="Nombre d'étages"
            [control]="locationFilterForm.controls.nbStoreys"
          >
            <oui-slider
              suffix="étage(s)"
              [control]="locationFilterForm.controls.nbStoreys"
              [max]="locationRanges.NB_STOREYS[1]"
              [min]="locationRanges.NB_STOREYS[0]"
            />
          </oui-form-field>

          <oui-form-field
            class="flex-1"
            name="nbUnits"
            label="Nombre de lots"
            [control]="locationFilterForm.controls.nbUnits"
          >
            <oui-slider
              suffix="lot(s)"
              [control]="locationFilterForm.controls.nbUnits"
              [max]="locationRanges.NB_UNITS[1]"
              [min]="locationRanges.NB_UNITS[0]"
            />
          </oui-form-field>

          <oui-form-field
            class="flex-1"
            name="nbBuildings"
            label="Nombre de bâtiments"
            [control]="locationFilterForm.controls.nbBuildings"
          >
            <oui-slider
              suffix="bâtiment(s)"
              [control]="locationFilterForm.controls.nbBuildings"
              [max]="locationRanges.NB_BUILDINGS[1]"
              [min]="locationRanges.NB_BUILDINGS[0]"
            />
          </oui-form-field>
        </div>
      </mkp-locations-filter-row>

      <mkp-locations-filter-row
        dropDown
        heading="Performance énergétique"
        [isOpen]="true"
      >
        <div class="flex flex-col gap-4">
          <oui-form-field
            name="dpeLabels"
            label="Score DPE"
            [control]="locationFilterForm.controls.dpe"
          >
            <div class="flex flex-col gap-1">
              @for (letter of dpeLabels; track letter; let i = $index) {
                <div class="flex gap-2">
                  <p-checkbox
                    [formControl]="locationFilterForm.controls.dpe"
                    [inputId]="'dpe-letter-' + letter.value"
                    [value]="letter.value"
                  />
                  <label
                    class="cursor-pointer"
                    [for]="'dpe-letter-' + letter.value"
                  >
                    @if (letter.value === "NC") {
                      <span class="leading-7">Non communiqué</span>
                    } @else {
                      <oui-dpe-label
                        variant="arrow"
                        [letter]="letter.label"
                        [style.width.px]="30 + i * 10"
                      />
                    }
                  </label>
                </div>
              }
            </div>
          </oui-form-field>

          <oui-form-field
            class="flex-1"
            name="energyType"
            label="Type d'énergie"
            [control]="locationFilterForm.controls.energyType"
          >
            <p-selectButton
              class="p-selectButton--transparent p-selectButton--pill"
              [formControl]="locationFilterForm.controls.energyType"
              [multiple]="true"
              [options]="energyTypeOptions"
            >
              <ng-template let-option pTemplate="item">
                <oui-pill-option
                  [control]="locationFilterForm.controls.energyType"
                  [value]="option"
                >
                  {{ option }}
                </oui-pill-option>
              </ng-template>
            </p-selectButton>
          </oui-form-field>
        </div>
      </mkp-locations-filter-row>
    </form>

    <oui-button
      class="border-primary-500 mt-6 rounded-lg border"
      full
      size="small"
      variant="standard"
      (click)="reset()"
    >
      Réinitialiser
    </oui-button>
  `,
  imports: [
    TitleTightComponent,
    DpeLabelComponent,
    PillOptionComponent,
    SliderComponent,
    LocationsFilterRowComponent,
    FormFieldComponent,
    FormsModule,
    ReactiveFormsModule,
    MultiSelect,
    Checkbox,
    SelectButtonModule,
    DatePicker,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationsFilterProComponent {
  readonly filtersChanged = output<LocationFilterPro>();

  protected readonly locationRanges = LOCATION_FILTER_RANGES;

  protected readonly minDate = GLOBAL_DATE_RANGE[0];
  protected readonly maxDate = GLOBAL_DATE_RANGE[1];

  protected readonly locationFilterForm = new FormGroup({
    associationType: new FormControl<ProLocationAssociationLabel | null>(null),
    department: new FormControl<Department[]>([]),
    sector: new FormControl<MainSector[]>([]),
    dpe: new FormControl<string[]>([]),
    heatingSystem: new FormControl<HeatingSystem[]>([]),
    creationDate: new FormControl<[Date | null, Date | null] | null>(null, {
      nonNullable: true,
    }),
    surfaceThatRequiresHeating: createNumberRangeControl([
      ...this.locationRanges.SURFACE_HEATED,
    ]),
    surfaceArea: createNumberRangeControl([
      ...this.locationRanges.SURFACE_AREA,
    ]),
    glazingArea: createNumberRangeControl([
      ...this.locationRanges.GLAZING_AREA,
    ]),
    height: createNumberRangeControl([...this.locationRanges.HEIGHT]),
    nbStoreys: createNumberRangeControl([...this.locationRanges.NB_STOREYS]),
    nbUnits: createNumberRangeControl([...this.locationRanges.NB_UNITS]),
    nbBuildings: createNumberRangeControl([
      ...this.locationRanges.NB_BUILDINGS,
    ]),
    energyType: new FormControl<EnergyType[]>([], { nonNullable: true }),
    legalEntityType: new FormControl<LegalEntityType[]>([], {
      nonNullable: true,
    }),
  });

  protected readonly climateZones = new FormControl<ClimateZone[]>([]);

  private readonly syncClimateZoneWithDepartmentControl =
    this.climateZones.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((zones) => {
        if (!zones || zones.length === 0) {
          this.locationFilterForm.controls.department.setValue([]);
          return;
        }

        this.locationFilterForm.controls.department.setValue(
          zones.map((zone) => getDepartments(zone)).flat(),
        );
      });

  protected readonly PRO_LOCATION_ASSOCIATIONS = PRO_LOCATION_ASSOCIATIONS;

  protected readonly energyTypeOptions = [...ENERGY_TYPES];
  protected readonly climateZoneOptions = [...CLIMATE_ZONES];
  protected readonly heatingSystemOptions = [...HEATING_SYSTEMS];
  protected readonly departmentOptions = [...FRENCH_DEPARTMENTS];
  protected readonly dpeLabels = [
    ...DPE_LABELS.map((dpe) => ({ label: dpe, value: dpe })),
    { value: "NC", label: "Non communiqué" },
  ] as const;

  protected readonly sectorOptions = Object.entries(LOCATION_SECTORS)
    .map(([key, value]) => ({
      name: value,
      value: key,
    }))
    .filter(
      (l) =>
        [
          LOCATION_SECTORS["Résidentiel collectif"],
          LOCATION_SECTORS["indu"],
          LOCATION_SECTORS["Autre"],
        ].findIndex((str) => str === l.name) === -1,
    );

  /**
   * Emits the current filter values whenever they change (600ms delay).
   * This is used to update the parent component with the latest filter values.
   */
  private readonly subActiveFilter = this.locationFilterForm.valueChanges
    .pipe(
      startWith(this.locationFilterForm.value),
      debounceTime(600),
      takeUntilDestroyed(),
      map((filters) => ({
        ...filters,
      })),
    )
    .subscribe((filters) => this.filtersChanged.emit(filters));

  protected reset() {
    this.locationFilterForm.reset();
    this.climateZones.reset();
    refreshFormFieldValidity(this.locationFilterForm);
  }
}
