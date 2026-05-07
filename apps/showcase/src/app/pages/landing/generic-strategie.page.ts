import { ChangeDetectionStrategy, Component } from "@angular/core";
import { OnboardingButtonComponent } from "@optee/ui/components/atoms/button/onboarding-button/onboarding-button.component";
import { ArcadeWrapperComponent } from "@optee/ui/components/molecules/arcade/arcade-wrapper/arcade-wrapper.component";
import { QuestionsComponent } from "@optee/ui/components/organisms/questions/questions.component";
import { RadarRegisterNowComponent } from "@optee/ui/components/organisms/radar-register-now/radar-register-now.component";
import { TestimonialCarouselComponent } from "@optee/ui/components/organisms/testimonial-carousel/testimonial-carousel.component";
import posthog from "posthog-js";
import { HeroSectionMainComponent } from "../../components/hero-section-main/hero-section-main.component";
import { RegisteringProcessComponent } from "../../components/registering-process/registering-process.component";
import { RenovationPlanComponent } from "../../components/renovation-plan/renovation-plan.component";
import { SelectProfessionalsComponent } from "../../components/select-professionals/select-professionals.component";

@Component({
  selector: "swc-landing-generic-strategie-page",
  template: `
    <swc-hero-section-main class="relative block overflow-hidden" skipNav>
      <ng-container title>
        <span class="font-bold">En 30 secondes,</span>
        identifiez tous les travaux possibles.
        <span class="font-bold">Gratuitement.</span>
      </ng-container>

      <ng-container text>
        Optee transforme la donnée de vos bâtiments en projets concrets, prêts à
        être lancés. Analyse automatisée, estimation des gains, et briefs
        techniques générés instantanément.
      </ng-container>

      <ng-container partnerText>
        Plus de 3500 projets lancés par les plus grandes entreprises dont :
      </ng-container>
    </swc-hero-section-main>

    <div
      class="max-w-showcase m-auto flex flex-col gap-6 p-4 md:gap-10 md:p-8 md:pt-20"
    >
      <swc-renovation-plan [showVideo]="shouldShowUpperVideo">
        <ng-container title>
          <span class="font-bold">Votre plan de rénovation,</span>
          sans audit, sans frais, sans attente.
        </ng-container>

        <ng-container text>
          Analysez votre parc en quelques secondes, identifiez les travaux
          prioritaires et accédez à des estimations chiffrées, gratuitement.
        </ng-container>
      </swc-renovation-plan>

      @if (!shouldShowUpperVideo) {
        <oui-arcade-wrapper flowId="CpkKWROlAFsWT1DOpZXU" />
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

      <swc-registering-process altVersion />

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
    RenovationPlanComponent,
    OnboardingButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingGenericStrategiePageComponent {
  shouldShowUpperVideo =
    posthog.getFeatureFlag("landing-video-en-haut") === "video-haute";
}
