import { CurrencyPipe, DecimalPipe } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { CapitalizePipe } from "@optee/ui/pipes/capitalize.pipe";

import type { PillVariant } from "../pill/pill.component";
import { PillComponent } from "../pill/pill.component";
type SupportedPipe =
  | "roundedNumber"
  | "roundedCurrency"
  | "toBoolean"
  | "placeSector"
  | "heatingType"
  | "ventilationType"
  | "shutterType";

@Component({
  selector: "oui-pill-value",
  template: `
    <oui-pill [truncateDisabled]="truncateDisabled()" [variant]="variant()">
      {{ formattedValue() | capitalize }}
      <ng-content />
    </oui-pill>
  `,
  imports: [PillComponent, CapitalizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PillValueComponent {
  readonly variant = input.required<PillVariant>();
  readonly value = input.required<unknown>();
  readonly pipe = input<SupportedPipe>();
  readonly suffix = input<string | undefined>("");
  readonly truncateDisabled = input(false, { transform: booleanAttribute });

  protected readonly formattedValue = computed(() => {
    const value = this.value();

    if (typeof value === "string") {
      if (this.pipe() === "toBoolean") {
        return value ? "Oui" : "Non";
      }
      return value;
    }

    const suffix = this.suffix() ?? "";

    if (typeof value === "number") {
      if (this.pipe() === "roundedNumber") {
        const decimalPipe = new DecimalPipe("fr-FR");
        return decimalPipe.transform(value, "1.0-0") + suffix;
      }

      if (this.pipe() === "roundedCurrency") {
        const currencyPipe = new CurrencyPipe("fr-FR");
        return currencyPipe.transform(value, "EUR", "symbol", "1.0-0") + suffix;
      }

      return value + suffix;
    }

    if (value instanceof Date) {
      return value.getFullYear().toString();
    }

    if (typeof value === "boolean") {
      return value ? "Oui" : "Non";
    }

    return "N/C";
  });
}
