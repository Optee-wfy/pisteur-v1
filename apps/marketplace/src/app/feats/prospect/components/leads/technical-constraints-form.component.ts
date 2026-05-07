import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { FormField, type FieldTree } from "@angular/forms/signals";
import type { DpeLabel, LeadGeneratorForm } from "@optee/constants";
import {
  COLLECTIVE_AND_INDIVIDUAL_HEATING_SYSTEMS,
  DPE_LABELS,
  ENERGY_TYPES,
  getDpeLabelColor,
  LOCATION_FILTER_RANGES,
} from "@optee/constants";
import {
  IconBoltComponent,
  IconBuildingMaterialsComponent,
} from "@optee/icons";
import { SelectButtonsComponent } from "@optee/ui/components/atoms/fields/select-buttons.component";
import { SliderComponent } from "@optee/ui/components/atoms/fields/slider.component";
import { FiltersGroupComponent } from "../filters/filters-group/filters-group.component";

@Component({
  selector: "mkp-technical-constraints-form",
  host: {
    class:
      "flex flex-col gap-6 max-w-screen-lg mx-auto w-full bg-granite-50 p-4 rounded-xl shadow-inner",
  },
  template: `
    <h3 class="text-center text-2xl font-semibold">
      Affinez votre ciblage technique.
    </h3>

    <form class="flex flex-col gap-4">
      <mkp-filters-group dropDown [isOpen]="true">
        <h3 class="flex items-center gap-2" heading>
          <icon-bolt
            class="bg-granite-100 size-5 rounded-full p-1"
            slot="icon"
          />
          Énergie
        </h3>
        <oui-select-buttons
          buttonsVariant="wrap"
          label="Type d'énergie"
          multiple
          [formField]="form().energyType"
          [options]="energyTypeOptions"
        />

        <oui-select-buttons
          label="Système de chauffage"
          multiple
          [formField]="form().heatingSystem"
          [options]="heatingSystemOptions"
        />

        <oui-select-buttons
          label="Classe énergétique"
          multiple
          [formField]="form().dpe"
          [options]="dpeLabels"
        />
      </mkp-filters-group>

      <mkp-filters-group dropDown>
        <h3 class="flex items-center gap-2" heading>
          <icon-bolt
            class="bg-granite-100 size-5 rounded-full p-1"
            slot="icon"
          />
          Performance & consommation
        </h3>
        <oui-slider
          label="Consommation électrique annuelle"
          suffix="MWh"
          [formField]="form().annualElectricityConsumption"
          [maxValue]="locationRanges.ANNUAL_ELEC_CONSUMPTION_2020[1]"
          [minValue]="locationRanges.ANNUAL_ELEC_CONSUMPTION_2020[0]"
          [ratio]="1000"
        />

        <oui-slider
          label="Surface chauffée"
          suffix="m²"
          [formField]="form().surfaceThatRequiresHeating"
          [maxValue]="locationRanges.SURFACE_HEATED[1]"
          [minValue]="locationRanges.SURFACE_HEATED[0]"
        />
      </mkp-filters-group>

      <mkp-filters-group dropDown>
        <h3 class="flex items-center gap-2" heading>
          <icon-building-materials
            class="bg-granite-100 size-5 rounded-full p-1"
            slot="icon"
          />
          Structure du bâtiment (expert)
        </h3>
        <oui-slider
          label="Nombre de lots"
          [formField]="form().nbUnits"
          [maxValue]="locationRanges.NB_UNITS[1]"
          [minValue]="locationRanges.NB_UNITS[0]"
        />

        <oui-slider
          label="Nombre de places de parking"
          [formField]="form().nbParkingSpots"
          [maxValue]="locationRanges.PARKING_SPACES[1]"
          [minValue]="locationRanges.PARKING_SPACES[0]"
        />

        <oui-slider
          label="Nombre d'étages"
          [formField]="form().nbStoreys"
          [maxValue]="locationRanges.NB_STOREYS[1]"
          [minValue]="locationRanges.NB_STOREYS[0]"
        />
      </mkp-filters-group>
    </form>
  `,
  imports: [
    SelectButtonsComponent,
    FormField,
    SliderComponent,
    FiltersGroupComponent,
    IconBuildingMaterialsComponent,
    IconBoltComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnicalConstraintsFormComponent {
  readonly form =
    input.required<FieldTree<LeadGeneratorForm["technicalConstraintsForm"]>>();

  protected readonly energyTypeOptions = [...ENERGY_TYPES];
  protected readonly dpeLabels = [...DPE_LABELS, "NC"].map((dpe) => ({
    label: dpe,
    value: dpe,
    bgColor: getDpeLabelColor(dpe as DpeLabel),
    color: "#fff",
  }));

  protected readonly locationRanges = LOCATION_FILTER_RANGES;
  protected readonly heatingSystemOptions = [
    ...COLLECTIVE_AND_INDIVIDUAL_HEATING_SYSTEMS,
  ];
}
