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
  selector: "swc-landing-inter-strategie-page",
  template: `
    <swc-hero-section-main
      class="relative block overflow-hidden"
      ctaLabel="Démarrer un projet d’étude gratuitement"
      skipNav
    >
      <ng-container title>
        La plateforme pour
        <span class="font-bold">
          structurer, estimer et activer vos projets de rénovation. Gratuitement
        </span>
      </ng-container>

      <ng-container text>
        Accélérez vos études et appels d’offres grâce à la donnée bâtiment et un
        moteur d’analyse intelligent. Générez vos plans d’action, identifiez les
        opérations pertinentes et connectez-vous à un réseau qualifié
        d’entreprises.
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
          <span class="font-bold">Votre plan d’action simplifié (APS),</span>
          généré automatiquement grâce à la donnée.
        </ng-container>

        <ng-container text>
          Analysez un bâtiment en quelques secondes à partir de son adresse.
          Optee récupère automatiquement toutes les données techniques
          publiques, identifie les travaux pertinents.
        </ng-container>
      </swc-renovation-plan>

      <oui-arcade-wrapper flowId="CpkKWROlAFsWT1DOpZXU" />

      <swc-select-professionals>
        <ng-container title>
          <span class="font-bold">Explorez</span>
          l'ensemble des
          <span class="font-bold">opérations de rénovation pertinentes</span>
          selon les caractéristiques réelles de votre bâtiment.
        </ng-container>
      </swc-select-professionals>

      <swc-registering-process altVersion />

      <oui-radar-register-now ctaLabel="Générer mon plan d’action" />

      <oui-testimonial-carousel />

      <oui-questions theme="light" />

      <oui-onboarding-button
        class="flex justify-center p-4 lg:p-8"
        label="Démarrer un projet d’étude gratuitement"
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
export class LandingInterStrategiePageComponent {}
