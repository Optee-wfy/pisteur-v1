import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";

@Pipe({
  name: "telephoneLink",
})
export class TelephoneLinkPipe implements PipeTransform {
  transform(value: string) {
    if (!value) {
      return value;
    }

    // Format the telephone number
    return "tel:" + value.replace(/[^\d+]/g, "");
  }
}
