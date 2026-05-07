import { DecimalPipe } from "@angular/common";
import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";

@Pipe({
  name: "roundedNumber",
  standalone: true,
})
export class RoundedNumberPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || isNaN(Number(value))) {
      return "N/C";
    }
    const decimalPipe = new DecimalPipe("fr-FR");
    return decimalPipe.transform(value, "1.0-0") ?? "";
  }
}
