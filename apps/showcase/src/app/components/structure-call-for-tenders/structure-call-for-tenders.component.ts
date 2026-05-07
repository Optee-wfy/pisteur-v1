import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from "@angular/core";
import { ArcadeWrapperComponent } from "@optee/ui/components/molecules/arcade/arcade-wrapper/arcade-wrapper.component";
import { TaggardComponent } from "@optee/ui/components/organisms/taggard/taggard.component";

@Component({
  selector: "swc-structure-call-for-tenders",
  host: {
    class: "flex flex-col gap-6 lg:gap-10 rounded-2xl bg-white px-6 py-10",
  },
  template: `
    <div
      class="font-display text-primary-900 m-auto text-center text-xl font-light leading-snug lg:max-w-[80%] lg:text-4xl"
    >
      <ng-content select="[title]" />
    </div>

    <div
      class="font-display text-primary-900 m-auto text-center text-sm font-light lg:max-w-[930px] lg:text-2xl"
    >
      <ng-content select="[text]" />
    </div>

    @if (showVideo()) {
      <oui-arcade-wrapper flowId="CpkKWROlAFsWT1DOpZXU" />
    }

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <oui-taggard
        description="Générez instantanément des briefs techniques et lancez vos projets en 30 secondes, grace à notre IA qui récupère vos données bâtiment."
        headingA="Lancez vos projets"
        headingB="5X plus vite"
        publicAssetPath="appel-offres-flow.png"
        tagText="Productivité"
      />

      <oui-taggard
        description="Optee facilite la mise en concurrence de professionnels certifiés. et intègre toutes les subventions mobilisables."
        headingA="Réduisez vos coûts"
        headingB="jusqu’à 35%"
        publicAssetPath="reduisez-vos-devis.png"
        tagText="Rentabilité"
      />

      <oui-taggard
        description="Suivez l’avancement de chaque opération, visualisez les gains, les subventions et les prochaines étapes, centralisées efficacement."
        headingA="Suivez vos opérations"
        headingB="en temps réel"
        publicAssetPath="suivi-operations.png"
        tagText="Contrôle"
      />
    </div>
  `,
  imports: [TaggardComponent, ArcadeWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructureCallForTendersComponent {
  showVideo = input(false, { transform: booleanAttribute });
}
