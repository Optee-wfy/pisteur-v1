import { ChangeDetectionStrategy, Component } from "@angular/core";
import { TaggardComponent } from "@optee/ui/components/organisms/taggard/taggard.component";

@Component({
  selector: "swc-structure-call-for-tenders-pro",
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

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <oui-taggard
        description="Optee analyse +150 données bâtiment et vous livre instantanément les volumes de travaux à chiffrer, et un brief prêt à vendre. Vous gagnez du temps sur chaque projet."
        headingA="Des projets qualifiés sans"
        headingB="prospection"
        publicAssetPath="suivi-operations.png"
        tagText="Productivité"
      />

      <oui-taggard
        description="Grâce aux appels d’offres qualifiés, aux leads exclusifs et aux briefs techniques, vous signez plus de projets sans multiplier vos équipes commerciales."
        headingA="Générez +30% de chiffre"
        headingB="d'affaires"
        publicAssetPath="reduisez-vos-devis.png"
        tagText="Rentabilité"
      />

      <oui-taggard
        description="Visualisez en temps réel les volumes de travaux chiffrés, les aides activées, les projets en cours et les signatures à venir. Un CRM intégré 100% orienté projet."
        headingA="Pilotez votre portefeuille"
        headingB="de projets"
        publicAssetPath="appel-offres-flow.png"
        tagText="Contrôle"
      />
    </div>
  `,
  imports: [TaggardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructureCallForTendersProComponent {}
