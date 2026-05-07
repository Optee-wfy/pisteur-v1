import { ChangeDetectionStrategy, Component } from "@angular/core";
import { OnboardingButtonComponent } from "@optee/ui/components/atoms/button/onboarding-button/onboarding-button.component";
import { ArcadeWrapperComponent } from "@optee/ui/components/molecules/arcade/arcade-wrapper/arcade-wrapper.component";
import { QuestionsComponent } from "@optee/ui/components/organisms/questions/questions.component";
import { RadarRegisterNowComponent } from "@optee/ui/components/organisms/radar-register-now/radar-register-now.component";
import { TestimonialCarouselComponent } from "@optee/ui/components/organisms/testimonial-carousel/testimonial-carousel.component";
import { HeroSectionMainComponent } from "../../components/hero-section-main/hero-section-main.component";
import { RegisteringProcessComponent } from "../../components/registering-process/registering-process.component";
import { RenovationPlanComponent } from "../../components/renovation-plan/renovation-plan.component";
import { SelectProfessionalsComponent } from "../../components/select-professionals/select-professionals.component";

@Component({
  selector: "swc-landing-copro-strategie-page",
  template: `
    <swc-hero-section-main
      class="relative block overflow-hidden"
      ctaLabel="Générez votre plan d’action copro"
      skipNav
    >
      <ng-container title>
        <span class="font-bold">En 30 secondes,</span>
        identifiez tous les travaux possibles en copropriété.
        <br />
        <span class="font-bold">Gratuitement.</span>
      </ng-container>

      <ng-container text>
        Optee transforme la donnée de vos copropriétés en projets concrets,
        prêts à être lancés : rénovation énergétique, mise aux normes,
        déploiement du plan pluriannuel de travaux.
      </ng-container>

      <ng-container partnerText>
        Plus de 3500 projets lancés par les plus grandes entreprises dont :
      </ng-container>
    </swc-hero-section-main>

    <div
      class="max-w-showcase m-auto flex flex-col gap-6 p-4 md:gap-10 md:p-8 md:pt-20"
    >
      <swc-renovation-plan>
        <ng-container title>
          <span class="font-bold">Votre plan de rénovation,</span>
          sans audit, sans frais, sans attente.
        </ng-container>

        <ng-container text>
          Analysez votre parc en quelques secondes, identifiez les travaux
          prioritaires et accédez à des estimations chiffrées, gratuitement.
        </ng-container>
      </swc-renovation-plan>

      <oui-arcade-wrapper flowId="CpkKWROlAFsWT1DOpZXU" />

      <swc-select-professionals>
        <ng-container title>
          <span class="font-bold">Explorez</span>
          l’ensemble des opérations de rénovation pertinentes, et donnez un
          accès à vos copropriétaires.
        </ng-container>
      </swc-select-professionals>

      <swc-registering-process altVersion />

      <oui-radar-register-now ctaLabel="Générer mon plan d’action copro" />

      <oui-testimonial-carousel />

      <oui-questions theme="light" />

      <oui-onboarding-button
        class="flex justify-center p-4 lg:p-8"
        label="Générez votre plan d’action copro"
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
    RenovationPlanComponent,
    OnboardingButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingCoproStrategiePageComponent {}
