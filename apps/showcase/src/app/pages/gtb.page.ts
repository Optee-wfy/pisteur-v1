import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CTA } from "@optee/constants";
import { IconBicolorGtbComponent } from "@optee/icons";
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
      "Notre IA vous accompagne pour déterminer la GTB adaptée à vos besoins et génère automatiquement le cahier des charges associé.",
    publicAssetPath: "cards-img/gtb_mise_en_concurrence.png",
    imgDescription: "Mise en concurrence",
    title: "Déterminez la classe de GTB adaptée à vos besoins",
  },
  {
    description:
      "Sélectionnez les professionnels pour votre projet parmi notre réseau de partenaires certifiés. Réalisez vos demandes de devis et appels d'offre directement depuis notre plateforme.",
    publicAssetPath: "cards-img/gtb_reseau.png",
    imgDescription: "Réseau GTB",
    title: "Accédez à notre réseau d'experts en GTB",
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
      "La GTB assure l'optimisation en temps réel du chauffage et de la climatisation de vos bâtiments. Ce système de pilotage permet d'optimiser votre consommation énergétique au plus proche de vos besoins réels, sans affecter le confort de vos occupants.",
  },
  {
    title: "Une obligation légale à respecter",
    description:
      "Dès 2024, les bâtiments tertiaires de plus de 1000m2 auront l'obligation de mettre en place une GTB : le décret BACS impose l’installation d’un système de contrôle et d’automatisation des équipements techniques.",
  },
  {
    title: "Réduction de vos dépenses énergétiques",
    description:
      "Installer un sytème de GTB vous permet d'identifier et corriger les consommations d'énergies superflues. Grâce à ce pilotage automatique, vous diminuez le montant  de votre facture énergétique.",
  },
];

@Component({
  selector: "swc-gtb-page",
  template: `
    <swc-hero-section-horizontal
      bigImgPath="hero-section/dashboard_gtb.png"
      littleImgPath="hero-section/quote_received.png"
      showCurrentPage
      twoImg
      [cta]="CTA.getQuotes"
    >
      <div title>Trouvez le professionnel pour votre projet de GTB</div>

      <div text>
        Accédez à notre plateforme et récupérez rapidement des devis compétitifs
        de systèmes de gestion technique du bâtiment.
      </div>

      <icon-bicolor-gtb
        class="text-primary-700 bg-primary-100 size-10 rounded-lg p-2"
        colorMode="semi"
        icon
      />
    </swc-hero-section-horizontal>

    <swc-img-cards-list
      title="Pourquoi installer une GTB avec Optee ?"
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
      questionTitle="Pourquoi installer un système de GTB ?"
      [costs]="{
        withoutOptee: 95_000,
        withOptee: 67_000,
        ceeAmount: 45_000,
        energySavings: 15,
      }"
      [reasons]="REASONS"
    />

    <swc-why-optee />

    <!-- <swc-video-testimony /> -->

    <oui-questions />

    <swc-other-operations currentOperation="gtb" />
  `,
  imports: [
    ImgCardsListComponent,
    HeroSectionHorizontalComponent,
    WhyOperationComponent,
    QuestionsComponent,
    ProjectsComponent,
    IconBicolorGtbComponent,
    WhyOpteeComponent,
    OtherOperationsComponent,
    CircleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GtbPageComponent {
  readonly CTA = CTA;
  readonly CARDS = CARDS;
  readonly REASONS = REASONS;
}
