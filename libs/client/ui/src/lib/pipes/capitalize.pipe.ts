import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";

@Pipe({
  name: "capitalize",
})
export class CapitalizePipe implements PipeTransform {
  transform(str: string | null): string {
    if (str === null || str.length === 0) {
      return "";
    }

    return str.charAt(0).toLocaleUpperCase() + str.slice(1);
  }
}
