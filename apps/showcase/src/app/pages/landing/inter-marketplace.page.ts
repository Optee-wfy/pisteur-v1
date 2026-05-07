import { ChangeDetectionStrategy, Component } from "@angular/core";
import { CTA } from "@optee/constants";
import { OnboardingButtonComponent } from "@optee/ui/components/atoms/button/onboarding-button/onboarding-button.component";
import { ArcadeWrapperComponent } from "@optee/ui/components/molecules/arcade/arcade-wrapper/arcade-wrapper.component";
import { QuestionsComponent } from "@optee/ui/components/organisms/questions/questions.component";
import { RadarRegisterNowComponent } from "@optee/ui/components/organisms/radar-register-now/radar-register-now.component";
import { TestimonialCarouselComponent } from "@optee/ui/components/organisms/testimonial-carousel/testimonial-carousel.component";
import { HeroSectionMainComponent } from "../../components/hero-section-main/hero-section-main.component";
import { RegisteringProcessComponent } from "../../components/registering-process/registering-process.component";
import { SelectProfessionalsComponent } from "../../components/select-professionals/select-professionals.component";
import { StructureCallForTendersComponent } from "../../components/structure-call-for-tenders/structure-call-for-tenders.component";

@Component({
  selector: "swc-landing-inter-marketplace-page",
  template: `
    <swc-hero-section-main
      class="relative block overflow-hidden"
      skipNav
      [ctaLabel]="CTA.launchMyCallForTender"
    >
      <ng-container title>
        La plateforme de sourcing pensée pour les AMO & architectes.
        <br />
        <span class="font-bold">Structuré. Fiable. Gratuit.</span>
      </ng-container>

      <ng-container text>
        Optee vous permet de transformer vos études ou cahiers des charges en
        projets concrets, prêts à être exécutés : sélection de lots, estimation
        des aides, mise en relation directe avec les meilleures entreprises du
        marché.
      </ng-container>

      <ng-container partnerText>
        Déjà plus de 3500 projets réalisés aux côtés d’AMO, ingénieurs et
        architectes
      </ng-container>
    </swc-hero-section-main>

    <div
      class="max-w-showcase m-auto flex flex-col gap-6 p-4 md:gap-10 md:p-8 md:pt-20"
    >
      <swc-structure-call-for-tenders>
        <ng-container title>
          <span class="font-bold">Accélérez</span>
          la structuration de vos projets et appels d’offres,
          <span class="font-bold">en toute confiance</span>
          .
        </ng-container>

        <ng-container text>
          Générez des briefs techniques complets en quelques secondes à partir
          des données bâtiment, identifiez automatiquement les lots à consulter,
          estimez les aides financières disponibles et pilotez vos projets
          depuis une interface centralisée.
        </ng-container>
      </swc-structure-call-for-tenders>

      <swc-select-professionals>
        <ng-container title>
          <span class="font-bold">Sélectionnez</span>
          des professionnels parmi un réseau d’experts
          <span class="font-bold">triés sur le volet.</span>
        </ng-container>
      </swc-select-professionals>

      <oui-arcade-wrapper flowId="5xenDksZnZFmrqCKivxR" />

      <swc-registering-process />

      <oui-radar-register-now [ctaLabel]="CTA.launchMyCallForTender" />

      <oui-testimonial-carousel />

      <oui-questions theme="light" />

      <oui-onboarding-button
        class="flex justify-center p-4 lg:p-8"
        [label]="CTA.launchMyCallForTender"
      />
    </div>
  `,
  imports: [
    HeroSectionMainComponent,
    RadarRegisterNowComponent,
    ArcadeWrapperComponent,
    SelectProfessionalsComponent,
    QuestionsComponent,
    RegisteringProcessComponent,
    TestimonialCarouselComponent,
    StructureCallForTendersComponent,
    OnboardingButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingInterMarketplacePageComponent {
  CTA = CTA;
}
