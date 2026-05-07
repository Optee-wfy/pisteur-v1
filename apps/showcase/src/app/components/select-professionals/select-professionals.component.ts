import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { OperationsInfoComponent } from "../operations-info/operations-info.component";

@Component({
  selector: "swc-select-professionals",
  host: {
    class: "flex flex-col gap-10 rounded-2xl bg-white px-6 py-10",
  },
  template: `
    <div class="flex flex-col gap-4">
      <div
        class="font-display text-primary-900 text-xl font-light leading-snug lg:text-2xl"
      >
        <ng-content select="[title]" />
      </div>

      <p class="text-sm text-gray-600 md:text-base">{{ text() }}</p>
    </div>

    <swc-operations-info [activeOperationTypes]="['Rénovation globale']" />
  `,
  imports: [OperationsInfoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectProfessionalsComponent {
  readonly text = input<string>(
    "Nos équipes partenariats appliquent un processus de qualification strict pour chaque entreprise. Les partenaires doivent être labellisés, fournir des documents vérifiés (assurances, certifications, références), et passer un audit de conformité. Optee garantit un réseau fiable, réactif et conforme à nos standards de qualité.",
  );
}
