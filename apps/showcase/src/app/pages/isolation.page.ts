import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CTA } from "@optee/constants";
import { IconBicolorIsolationComponent } from "@optee/icons";
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

@Component({
  selector: "swc-isolation-page",
  template: `
    <swc-hero-section-horizontal
      bigImgPath="hero-section/dashboard_isolation.png"
      littleImgPath="hero-section/quote_received.png"
      showCurrentPage
      twoImg
      [cta]="CTA.getQuotes"
    >
      <div title>Trouvez le professionnel pour votre projet d'isolation</div>

      <div text>
        Accédez à notre plateforme et récupérez rapidement des devis compétitifs
        d'opérations d'isolation.
      </div>

      <icon-bicolor-isolation
        class="text-primary-700 bg-primary-100 size-10 rounded-lg p-2"
        colorMode="semi"
        icon
      />
    </swc-hero-section-horizontal>

    <swc-img-cards-list
      title="Pourquoi effectuer une opération d'isolation avec Optee ?"
      [cards]="cards"
    />

    <div class="relative block overflow-hidden py-8 xl:py-16">
      <oui-circle
        class="-bottom-[235px] left-[290px] w-[349px]"
        theme="light"
      />
      <oui-projects showButton />
    </div>
    <swc-why-operation
      questionTitle="Pourquoi réaliser des travaux d'isolation ?"
      [costs]="{
        withoutOptee: 18_000,
        withOptee: 14_000,
        ceeAmount: 10_000,
        energySavings: 23,
      }"
      [reasons]="reasons"
    />

    <swc-why-optee />

    <!-- <swc-video-testimony /> -->

    <oui-questions />

    <swc-other-operations currentOperation="isolation" />
  `,
  imports: [
    ImgCardsListComponent,
    HeroSectionHorizontalComponent,
    WhyOperationComponent,
    QuestionsComponent,
    ProjectsComponent,
    WhyOpteeComponent,
    IconBicolorIsolationComponent,
    OtherOperationsComponent,
    CircleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsolationPageComponent {
  CTA = CTA;

  cards: ShowcaseCard[] = [
    {
      description:
        "Notre IA vous accompagne pour déterminer les opérations d'isolation adaptées à vos besoins et génère automatiquement le cahier des charges associé.",
      publicAssetPath: "cards-img/isolation_mise_en_concurrence.png",
      imgDescription: "Mise en concurrence",
      title: "Déterminez l'opération d'isolation adaptée à vos besoins",
    },
    {
      description:
        "Sélectionnez les professionnels pour votre projet parmi notre réseau de partenaires certifiés. Réalisez vos demandes de devis et appels d'offre directement depuis notre plateforme.",
      publicAssetPath: "cards-img/isolation_reseau.png",
      imgDescription: "Réseau isolation",
      title: "Accédez à notre réseau d'experts de l'isolation",
    },
    {
      description:
        "Profitez de tarifs préférentiels négociés avec nos partenaires. Nous optimisons les subventions disponibles, avançons les frais et nous occupons pour vous des démarches administratives.",
      publicAssetPath: "cards-img/roi.png",
      imgDescription: "Graphique retour sur investissement",
      title: "Augmentez le ROI de votre opération",
    },
  ];

  reasons: WhyOperationReason[] = [
    {
      title: "Moins de déperdition d'énergie",
      description:
        "Une part importante de l'énergie utilisée pour chauffer et refroidir un bâtiment est perdue du fait d'une mauvaise isolation. Eviter les déperditions thermiques améliore significativement la performance énergétique de vos bâtiments.",
    },
    {
      title: "Une obligation légale à respecter",
      description:
        "Améliorer la performance énergétique de vos bâtiments devient obligatoire. Dans le tertiaire, les consommations d'énergie doivent diminuer de 40% d'ici 2030. Dans le secteur du logement, les 'passoires thermiques', classées F et G ne pourront plus être mises en location dès 2025.",
    },
    {
      title: "Réduction de vos dépenses énergétiques",
      description:
        "En améliorant l'isolation de votre bâtiment, vous évitez la déperdition thermique. A confort égal, votre consommation en chauffage et climatisation diminue, ainsi que vos factures énergétiques.",
    },
  ];
}
