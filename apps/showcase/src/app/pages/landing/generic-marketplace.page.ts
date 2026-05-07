import { ChangeDetectionStrategy, Component } from "@angular/core";
import { OnboardingButtonComponent } from "@optee/ui/components/atoms/button/onboarding-button/onboarding-button.component";
import { ArcadeWrapperComponent } from "@optee/ui/components/molecules/arcade/arcade-wrapper/arcade-wrapper.component";
import { QuestionsComponent } from "@optee/ui/components/organisms/questions/questions.component";
import { RadarRegisterNowComponent } from "@optee/ui/components/organisms/radar-register-now/radar-register-now.component";
import { TestimonialCarouselComponent } from "@optee/ui/components/organisms/testimonial-carousel/testimonial-carousel.component";
import posthog from "posthog-js";
import { HeroSectionMainComponent } from "../../components/hero-section-main/hero-section-main.component";
import { RegisteringProcessComponent } from "../../components/registering-process/registering-process.component";
import { SelectProfessionalsComponent } from "../../components/select-professionals/select-professionals.component";
import { StructureCallForTendersComponent } from "../../components/structure-call-for-tenders/structure-call-for-tenders.component";

@Component({
  selector: "swc-landing-generic-marketplace-page",
  template: `
    <swc-hero-section-main class="relative block overflow-hidden" skipNav>
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
      <swc-structure-call-for-tenders [showVideo]="shouldShowUpperVideo">
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

      @if (!shouldShowUpperVideo) {
        <oui-arcade-wrapper flowId="5xenDksZnZFmrqCKivxR" />
      }

      <swc-select-professionals>
        <ng-container title>
          <span class="font-bold">Explorez</span>
          l'ensemble des
          <span class="font-bold">opérations de rénovation pertinentes</span>
          selon les caractéristiques réelles de votre bâtiment.
        </ng-container>
      </swc-select-professionals>

      <oui-radar-register-now />

      <swc-registering-process />

      <oui-testimonial-carousel />

      <oui-questions theme="light" />

      <oui-onboarding-button class="flex justify-center p-4 lg:p-8" />
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
export class LandingGenericMarketplacePageComponent {
  shouldShowUpperVideo =
    posthog.getFeatureFlag("landing-video-en-haut") === "video-haute";
}
