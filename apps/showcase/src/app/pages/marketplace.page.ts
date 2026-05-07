import { ChangeDetectionStrategy, Component } from "@angular/core";
import { buildAssetUrl } from "@optee/constants";
import { OnboardingButtonComponent } from "@optee/ui/components/atoms/button/onboarding-button/onboarding-button.component";
import { ArcadesTutorialComponent } from "@optee/ui/components/molecules/arcade/arcades-tutorial/arcades-tutorial.component";
import { EvaComponent } from "@optee/ui/components/organisms/eva/eva.component";
import { QuestionsComponent } from "@optee/ui/components/organisms/questions/questions.component";
import { RadarRegisterNowComponent } from "@optee/ui/components/organisms/radar-register-now/radar-register-now.component";
import { TestimonialCarouselComponent } from "@optee/ui/components/organisms/testimonial-carousel/testimonial-carousel.component";
import { HeroSectionMainComponent } from "../components/hero-section-main/hero-section-main.component";
import { MeetFormComponent } from "../components/meet-form/meet-form.component";
import { RegisteringProcessComponent } from "../components/registering-process/registering-process.component";
import { SelectProfessionalsComponent } from "../components/select-professionals/select-professionals.component";
import { StructureCallForTendersComponent } from "../components/structure-call-for-tenders/structure-call-for-tenders.component";

@Component({
  selector: "swc-marketplace-page",
  template: `
    <swc-hero-section-main class="relative block overflow-hidden">
      <ng-container title>
        <span class="font-bold">La plateforme de référence</span>
        pour lancer vos appels d'offres,
        <span class="font-bold">facilement.</span>
      </ng-container>

      <ng-container text>
        Grâce à Optee, accédez immédiatement à toutes les données nécessaires
        pour structurer vos projets et activer les meilleures entreprises du
        marché.
      </ng-container>

      <ng-container partnerText>
        Plus de 3500 projets lancés par les plus grandes entreprises dont :
      </ng-container>
    </swc-hero-section-main>

    <div
      class="max-w-showcase m-auto flex flex-col gap-6 p-4 md:gap-10 md:p-8 md:pt-20"
    >
      <swc-structure-call-for-tenders>
        <ng-container title>
          <div class="font-bold">Structurez vos appels d’offres,</div>
          en quelques clics.
        </ng-container>

        <ng-container text>
          Générez instantanément des briefs techniques complets, intégrez
          automatiquement les aides et subventions disponibles, et suivez chaque
          étape de vos projets depuis un tableau de bord centralisé.
        </ng-container>
      </swc-structure-call-for-tenders>

      <swc-select-professionals>
        <ng-container title>
          <span class="font-bold">Explorez</span>
          l'ensemble des
          <span class="font-bold">opérations de rénovation pertinentes</span>
          selon les caractéristiques réelles de votre bâtiment.
        </ng-container>
      </swc-select-professionals>

      <oui-radar-register-now />

      <oui-eva>
        <ng-container mainTitle>
          Exploration intelligente des opérations
        </ng-container>

        <ng-container pinkTitle>
          Identifiez les meilleures opportunités de travaux dès l’analyse de
          votre bâtiment
        </ng-container>

        Explorez instantanément les opérations réalisables grâce à l’analyse
        automatique de plus de 150 données techniques récupérées depuis les
        sources de référence (ENEDIS, GRDF, BDNB, Ademe...).
        <div class="mt-4">
          <br />
          ✓ Recommandations d’opérations /caractéristiques bâtiment
          <br />
          ✓ Estimations précises : coût, aides, gains énergétiques, ROI
          <br />
          ✓ Montée en expertise avec descriptifs détaillés par opération
        </div>

        <img
          class="absolute -bottom-2 -right-2 w-1/2 max-w-[520px] opacity-25 lg:opacity-100"
          img
          [src]="explorezOperationsJpg"
        />
      </oui-eva>

      <oui-eva>
        <ng-container mainTitle>
          Appels d’offres rapides & sécurisés
        </ng-container>

        <ng-container pinkTitle>
          Lancez vos appels d’offres en un clic, recevez jusqu’à 3 devis en 72h
        </ng-container>

        Optez pour la performance avec notre réseau de professionnels qualifiés,
        certifiés et notés, déployés partout en France.

        <div class="mt-4">
          ✓ Mise en concurrence automatisée auprès d’entreprises vérifiées par
          nos équipes internes
          <br />
          ✓ Jusqu’à 3 devis en moins de 72h, partout en France
          <br />
          ✓ Signature des devis 100% en ligne via notre partenaire sécurisé
          Yousign
        </div>

        <img
          class="absolute bottom-4 right-0 w-1/2 max-w-[520px] opacity-25 lg:opacity-100"
          img
          [src]="lancezAppelOffresJpg"
        />
      </oui-eva>

      <oui-eva>
        <ng-container mainTitle>
          Paiements centralisés & gestion des aides
        </ng-container>

        <ng-container pinkTitle>
          Sécurisez chaque transaction et simplifiez la gestion des aides
        </ng-container>

        Optee garantit la bonne exécution financière de vos projets grâce à son
        partenariat avec Lemonway, établissement accrédité ACPR.

        <div class="mt-4">
          ✓ Paiement sécurisé via un tiers de confiance (Lemonway, agent Banque
          de France)
          <br />
          ✓ Avance et gestion des aides (CEE, subventions)
          <br />
          ✓ Gestion des litiges, retenues de garantie et preuve de bonne
          exécution
        </div>

        <img
          class="absolute bottom-8 right-4 w-1/2 max-w-[520px] opacity-25 lg:opacity-100"
          img
          [src]="securisezTransactionJpg"
        />
      </oui-eva>

      <oui-arcades-tutorial />

      <swc-registering-process />

      <swc-meet-form />

      <oui-testimonial-carousel />

      <oui-questions class="rounded-3xl bg-white p-4 lg:p-8" theme="light" />

      <oui-onboarding-button class="flex justify-center p-4 lg:p-8" />
    </div>
  `,
  imports: [
    HeroSectionMainComponent,
    EvaComponent,
    RadarRegisterNowComponent,
    ArcadesTutorialComponent,
    SelectProfessionalsComponent,
    QuestionsComponent,
    MeetFormComponent,
    RegisteringProcessComponent,
    TestimonialCarouselComponent,
    StructureCallForTendersComponent,
    OnboardingButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplacePageComponent {
  securisezTransactionJpg = buildAssetUrl("securisez-transaction.jpg");
  lancezAppelOffresJpg = buildAssetUrl("lancez-appel-offres.jpg");
  explorezOperationsJpg = buildAssetUrl("explorez-operations.jpg");
}
