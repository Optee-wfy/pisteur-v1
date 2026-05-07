import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CTA } from "@optee/constants";
import { IconBicolorCvcComponent } from "@optee/icons";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { ProjectsComponent } from "@optee/ui/components/organisms/projects/projects.component";
import { QuestionsComponent } from "@optee/ui/components/organisms/questions/questions.component";
import type { ShowcaseCard } from "../components/cards/img-card/img-cards-list.component";
import { ImgCardsListComponent } from "../components/cards/img-card/img-cards-list.component";
import { HeroSectionHorizontalComponent } from "../components/hero-section-horizontal/hero-section-horizontal.component";
import { OtherOperationsComponent } from "../components/other-operations/other-operations.component";
import type { WhyOperationReason } from "../components/why-operation/why-operation.component";
import { WhyOperationComponent } from "../components/why-operation/why-operation.component";
import { WhyOpteeComponent } from "../components/why-optee/why-optee.component";

const CARDS: ShowcaseCard[] = [
  {
    description:
      "Notre IA vous accompagne pour déterminer les opérations de Chauffage Ventilation Climatisation adaptées à vos besoins et génère automatiquement le cahier des charges associé.",
    publicAssetPath: "cards-img/cvc_mise_en_concurrence.png",
    imgDescription: "Mise en concurrence",
    title: "Déterminez l'opération de CVC adaptée à vos besoins",
  },
  {
    description:
      "Sélectionnez les professionnels pour votre projet parmi notre réseau de partenaires certifiés. Réalisez vos demandes de devis et appels d'offre directement depuis notre plateforme.",
    publicAssetPath: "cards-img/cvc_reseau.png",
    imgDescription: "Réseau CVC",
    title: "Accédez à notre réseau d'experts en CVC",
  },
  {
    description:
      "Profitez de tarifs préférentiels négociés avec nos partenaires. Nous optimisons les subventions disponibles, avançons les frais et nous occupons pour vous des démarches administratives.",
    publicAssetPath: "cards-img/roi.png",
    imgDescription: "Graphique retour sur investissement",
    title: "Augmentez le ROI de votre opération",
  },
];

const REASONS: WhyOperationReason[] = [
  {
    title: "Moins d'énergie pour plus de confort",
    description:
      "Moderniser les systèmes de chauffage, ventilation et climatisation permet de réduire les pertes énergétiques en installant des équipements plus performants, mieux isolés et capables d'ajuster leur fonctionnement en temps réel selon les besoins.",
  },
  {
    title: "Une obligation légale à respecter",
    description:
      "Améliorer la performance énergétique de vos bâtiments devient obligatoire. Dans le tertiaire, les consommations d'énergie doivent diminuer de 40% d'ici 2030. Dans le secteur du logement, les 'passoires thermiques', classées F et G ne pourront plus être mises en location dès 2025.",
  },
  {
    title: "Réduction de vos dépenses énergétiques",
    description:
      "Optimiser les systèmes CVC vous permet d'éviter les surconsommations inutiles et garantit un meilleur contrôle du confort thermique. Vous diminuez votre consommation et votre facture énergétique.",
  },
];

@Component({
  selector: "swc-cvc-page",
  template: `
    <swc-hero-section-horizontal
      bigImgPath="hero-section/dashboard_cvc.png"
      littleImgPath="hero-section/quote_received.png"
      showCurrentPage
      twoImg
      [cta]="CTA.getQuotes"
    >
      <div title>Trouvez le professionnel pour votre projet de CVC</div>

      <div text>
        Accédez à notre plateforme et récupérez rapidement des devis compétitifs
        d'opérations de Chauffage Ventilation Climatisation.
      </div>

      <icon-bicolor-cvc
        class="text-primary-700 bg-primary-100 size-10 rounded-lg p-2"
        colorMode="semi"
        icon
      />
    </swc-hero-section-horizontal>

    <swc-img-cards-list
      title="Pourquoi effectuer une opération de Chauffage Ventilation Climatisation avec Optee ?"
      [cards]="CARDS"
    />

    <div class="relative block overflow-hidden py-8 xl:py-16">
      <oui-circle
        class="-bottom-[235px] left-[290px] w-[349px]"
        theme="light"
      />
      <oui-projects showButton />
    </div>
    <swc-why-operation
      questionTitle="Pourquoi réaliser des travaux de Chauffage Ventilation Climatisation ?"
      [costs]="{
        withoutOptee: 59_000,
        withOptee: 47_000,
        ceeAmount: 3700,
        energySavings: 42,
      }"
      [reasons]="REASONS"
    />

    <swc-why-optee />

    <!-- <swc-video-testimony /> -->

    <oui-questions />

    <swc-other-operations currentOperation="cvc" />
  `,
  imports: [
    ImgCardsListComponent,
    HeroSectionHorizontalComponent,
    WhyOperationComponent,
    QuestionsComponent,
    ProjectsComponent,
    IconBicolorCvcComponent,
    WhyOpteeComponent,
    OtherOperationsComponent,
    CircleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcPageComponent {
  readonly CTA = CTA;
  readonly CARDS = CARDS;
  readonly REASONS = REASONS;
}
