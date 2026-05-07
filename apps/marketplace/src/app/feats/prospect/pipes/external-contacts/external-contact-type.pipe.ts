import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import { ExternalContactType } from "@optee/constants";

@Pipe({
  name: "ExternalContactType",
})
export class ExternalContactTypePipe implements PipeTransform {
  private readonly TYPE_LABELS: Record<ExternalContactType, string> = {
    [ExternalContactType.PERSONAL]: "Personnel",
    [ExternalContactType.GENERIC]: "Générique",
  };

  transform(type: ExternalContactType) {
    if (!type) {
      return "Non connu";
    }
    return this.TYPE_LABELS[type] ?? "Non connu";
  }
}
