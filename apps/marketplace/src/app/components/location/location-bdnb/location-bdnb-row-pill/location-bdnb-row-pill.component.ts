import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  CLIMATE_ZONES,
  ENERGY_TYPES,
  HEATING_SYSTEMS,
  LOCATION_SECTORS,
  MAIN_SECTORS,
} from "@optee/constants";
import type { Location } from "@optee/models";
import { PillValueComponent } from "@optee/ui/components/atoms/pill/pill-value/pill-value.component";
import type { PillVariant } from "@optee/ui/components/atoms/pill/pill/pill.component";
import { TooltipEstimationComponent } from "@optee/ui/components/atoms/tooltip-estimation/tooltip-estimation.component";
import { DatePickerModule } from "primeng/datepicker";
import { InputNumberModule } from "primeng/inputnumber";
import { SelectModule } from "primeng/select";
import type {
  LocationBdnbProperty,
  SupportedPipe,
} from "../location-bdnb.type";

@Component({
  selector: "mkp-location-bdnb-pill",
  host: {
    class: "relative",
  },
  template: `
    @let propertyName = key();
    @if (canUpdate()) {
      @switch (inputType()) {
        @case ("inputnumber") {
          @switch (pipe()) {
            @case ("roundedNumber") {
              <p-inputnumber
                class="p-input-pill p-input-pill-clear w-36 lg:w-48"
                fluid
                inputId="integeronly"
                locale="fr-FR"
                maxFractionDigits="0"
                minFractionDigits="0"
                mode="decimal"
                size="small"
                [(ngModel)]="location()[propertyName]"
                [min]="0"
                [suffix]="suffix()"
              />
            }
            @case ("roundedCurrency") {
              <p-inputnumber
                class="p-input-pill p-input-pill-clear w-36 lg:w-48"
                currency="EUR"
                fluid
                inputId="integeronly"
                locale="fr-FR"
                maxFractionDigits="0"
                minFractionDigits="0"
                mode="currency"
                size="small"
                [(ngModel)]="location()[propertyName]"
                [min]="0"
                [suffix]="suffix()"
              />
            }
            @default {
              <p-inputnumber
                class="p-input-pill p-input-pill-clear w-36 lg:w-48"
                fluid
                mode="decimal"
                size="small"
                [(ngModel)]="location()[propertyName]"
                [min]="0"
              />
            }
          }
        }
        @case ("dropdown") {
          <p-select
            class="p-input-pill p-input-pill-clear w-36 rounded-3xl border text-xs lg:w-48"
            appendTo="body"
            optionLabel="label"
            optionValue="value"
            size="small"
            [(ngModel)]="location()[propertyName]"
            [options]="getDropdownValue()"
          />
        }
        @default {
          <p-datepicker
            class="p-input-pill p-input-pill-clear block w-36 lg:w-48"
            appendTo="body"
            dateFormat="yy"
            fluid
            panelStyleClass="!w-80"
            size="small"
            view="year"
            [(ngModel)]="location()[propertyName]"
            [iconDisplay]="'input'"
            [maxDate]="maxYear"
            [showIcon]="true"
          />
        }
      }

      @if (isUncertain()) {
        <oui-tooltip-estimation
          class="absolute -right-2 -top-1"
          tooltipPosition="top"
        />
      }
    } @else {
      <oui-pill-value
        truncateDisabled
        [pipe]="pipe()"
        [suffix]="suffix()"
        [value]="value()"
        [variant]="pillVariant()"
      >
        @if (isUncertain() && value()) {
          <oui-tooltip-estimation
            class="absolute -right-2 -top-1"
            tooltipPosition="top"
          />
        }
      </oui-pill-value>
    }
  `,
  imports: [
    TooltipEstimationComponent,
    FormsModule,
    InputNumberModule,
    SelectModule,
    PillValueComponent,
    DatePickerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationBdnbPillComponent {
  readonly maxYear: Date = new Date();
  readonly location = input.required<Location>();
  readonly key = input.required<LocationBdnbProperty>();
  readonly suffix = input<string | undefined>("");
  readonly pipe = input<SupportedPipe>();
  readonly variant = input<PillVariant>("trans-white");
  readonly variantNC = input<PillVariant>("trans-white");
  readonly canUpdate = input(false, { transform: booleanAttribute });
  readonly inputType = input<"dropdown" | "inputnumber" | "datepicker">();

  protected readonly value = computed(() => {
    if (this.key() === "sector") {
      return this.location().sectorLabel;
    }

    return this.location()[this.key()];
  });

  protected readonly pillVariant = computed(() => {
    if (this.value() === null || this.value() === undefined) {
      return this.variantNC();
    }

    return this.variant();
  });

  protected readonly isUncertain = computed(() => {
    const key = this.key();

    return this.location().uncertainData.includes(key);
  });

  protected getDropdownValue(): { label: string; value: string }[] {
    switch (this.key()) {
      case "sector":
        return MAIN_SECTORS.map((s) => ({
          label: LOCATION_SECTORS[s],
          value: s,
        }));

      case "energyType":
        return ENERGY_TYPES.map((type) => ({
          label: type === "reseau de chaleur" ? "Réseau de chaleur" : type,
          value: type,
        }));

      case "heatingSystem":
        return HEATING_SYSTEMS.filter((system) => system !== "collectif").map(
          (system) => ({
            label: system,
            value: system,
          }),
        );

      case "climateZone":
        return CLIMATE_ZONES.map((zone) => ({
          label: zone,
          value: zone,
        }));

      default:
        return [];
    }
  }
}
