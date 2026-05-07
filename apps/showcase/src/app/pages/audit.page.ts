import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CTA } from "@optee/constants";
import { IconBicolorAuditComponent } from "@optee/icons";
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
      "Notre IA vous accompagne pour déterminer le type d'audit adapté à vos besoins et génère automatiquement le cahier des charges associé.",
    publicAssetPath: "cards-img/audit_mise_en_concurrence.png",
    imgDescription: "Mise en concurrence",
    title: "Sélectionnez le type d'audit adapté à votre besoin",
  },
  {
    description:
      "Sélectionnez les professionnels pour votre projet parmi notre réseau de partenaires certifiés. Réalisez vos demandes de devis et appels d'offre directement depuis notre plateforme.",
    publicAssetPath: "cards-img/audit_reseau.png",
    imgDescription: "Réseau audit",
    title: "Accédez à notre réseau d'auditeurs certifiés",
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
    title: "Connaître votre bâtiment",
    description:
      "L'audit énergétique permet de faire un diagnostic précis des déperditions d’énergie dans un bâtiment. Il repose sur l'analyse des systèmes de chauffage, de ventilation, d’isolation, et de consommations d’électricité et vous permet d'adapter votre stratégie de rénovation.",
  },
  {
    title: "Une obligation légale à respecter",
    description:
      "L'audit énergétique est obligatoire pour évaluer la performance des bâtiments, identifier les actions de réduction de consommation, et garantir la conformité avec les objectifs de transition énergétique imposés par des textes comme le décret tertiaire.",
  },
  {
    title: "Réduction de vos dépenses énergétiques",
    description:
      "En identifiant les zones où les pertes sont les plus importantes, l’audit aide à cibler les interventions prioritaires pour maximiser l'efficacité d'un bâtiment.",
  },
];

@Component({
  selector: "swc-audit-page",
  template: `
    <swc-hero-section-horizontal
      bigImgPath="hero-section/dashboard_audit.png"
      littleImgPath="hero-section/quote_received.png"
      showCurrentPage
      twoImg
      [cta]="CTA.getQuotes"
    >
      <div title>Trouvez le professionnel pour votre audit énergétique</div>

      <div text>
        Accédez à notre plateforme et récupérez rapidement des devis compétitifs
        d'audit énergétique.
      </div>

      <icon-bicolor-audit
        class="text-primary-700 bg-primary-100 size-10 rounded-lg p-2"
        colorMode="semi"
        icon
      />
    </swc-hero-section-horizontal>

    <swc-img-cards-list
      title="Pourquoi effectuer un Audit énergétique avec Optee ?"
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
      questionTitle="Pourquoi réaliser un audit énergétique ?"
      [costs]="{
        withoutOptee: 6500,
        withOptee: 5100,
        ceeAmount: 0,
        energySavings: 0,
      }"
      [reasons]="REASONS"
    />

    <swc-why-optee />

    <!-- <swc-video-testimony /> -->

    <oui-questions />

    <swc-other-operations currentOperation="audit" />
  `,
  imports: [
    ImgCardsListComponent,
    HeroSectionHorizontalComponent,
    WhyOperationComponent,
    QuestionsComponent,
    ProjectsComponent,
    WhyOpteeComponent,
    IconBicolorAuditComponent,
    OtherOperationsComponent,
    CircleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditPageComponent {
  readonly CTA = CTA;
  readonly CARDS = CARDS;
  readonly REASONS = REASONS;
}
