import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";

@Pipe({
  name: "placeSector",
  standalone: true,
})
export class PlaceSectorPipe implements PipeTransform {
  transform(sector: string | null | undefined): string {
    if (!sector) {
      return "Non connu";
    }

    switch (sector) {
      case "resi":
        return "Résidentiel";
      case "ter":
        return "Tertiaire";
      default:
        return sector;
    }
  }
}
