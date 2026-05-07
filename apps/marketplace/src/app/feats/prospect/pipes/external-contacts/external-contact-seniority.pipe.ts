import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import { ExternalContactSeniority } from "@optee/constants";

const SENIORITY_LABELS: Record<ExternalContactSeniority, string> = {
  [ExternalContactSeniority.JUNIOR]: "Junior",
  [ExternalContactSeniority.SENIOR]: "Senior",
  [ExternalContactSeniority.EXECUTIVE]: "Cadre",
  [ExternalContactSeniority.MANDATAIRE]: "Mandataire",
  [ExternalContactSeniority.DIRIGEANT]: "Dirigeant",
  [ExternalContactSeniority.GERANT]: "Gérant",
  [ExternalContactSeniority.DIRECTEUR]: "Directeur",
  [ExternalContactSeniority.RESPONSABLE]: "Responsable",
  [ExternalContactSeniority.ASSIST]: "Assistant",
  [ExternalContactSeniority.COLLAB]: "Collaborateur",
  [ExternalContactSeniority.AUTRE]: "Autre",
};

@Pipe({
  name: "ExternalContactSeniority",
})
export class ExternalContactSeniorityPipe implements PipeTransform {
  transform(value: ExternalContactSeniority | null | undefined): string | null {
    if (!value) {
      return "Non connu";
    }
    return SENIORITY_LABELS[value] ?? value;
  }
}
