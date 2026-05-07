import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from "@angular/core";
import { ArcadeWrapperComponent } from "@optee/ui/components/molecules/arcade/arcade-wrapper/arcade-wrapper.component";
import { TaggardComponent } from "@optee/ui/components/organisms/taggard/taggard.component";

@Component({
  selector: "swc-renovation-plan",
  host: {
    class: "flex flex-col gap-10 rounded-2xl bg-white px-6 py-10",
  },
  template: `
    <div
      class="font-display text-primary-900 m-auto max-w-[80%] text-center text-2xl font-light leading-snug lg:text-4xl"
    >
      <ng-content select="[title]" />
    </div>

    <div
      class="font-display text-primary-900 m-auto max-w-[930px] text-center text-xl font-light lg:text-2xl"
    >
      <ng-content select="[text]" />
    </div>

    @if (showVideo()) {
      <oui-arcade-wrapper flowId="CpkKWROlAFsWT1DOpZXU" />
    }

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <oui-taggard
        description="En un clic, Optee collecte plus de 150 données techniques liées à votre adresse via les bases BDNB, Enedis, GRDF, Fichier foncier et Ademe."
        headingA="150+ données"
        headingB="récupérées en 10 sec"
        publicAssetPath="recuperez-donnees-sites.png"
        tagText="Expertise"
      />

      <oui-taggard
        description="Notre technologie identifie l’ensemble des opérations de rénovation pertinentes, selon les caractéristiques réelles de votre bâtiment."
        headingA="120+ opérations"
        headingB="analysées en temps réel"
        publicAssetPath="suivi-operations.png"
        tagText="Productivité"
      />

      <oui-taggard
        description="Lancez vos appels d’offres en toute autonomie, auprès d’entreprises certifiées et qualifiées, directement sur la marketplace Optee."
        headingA="Briefs techniques"
        headingB="générés en 30 secondes"
        publicAssetPath="gantt-securiser-projets.png"
        tagText="Contrôle"
      />
    </div>
  `,
  imports: [TaggardComponent, ArcadeWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenovationPlanComponent {
  showVideo = input(false, { transform: booleanAttribute });
}
