import { ChangeDetectionStrategy, Component } from "@angular/core";
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
  selector: "swc-landing-hotel-marketplace-page",
  template: `
    <swc-hero-section-main
      class="relative block overflow-hidden"
      ctaLabel="Lancer mes appels d’offres"
      skipNav
    >
      <ng-container title>
        <span class="font-bold">La plateforme de référence</span>
        pour lancer vos appels d'offres hôteliers,
        <span class="font-bold">gratuitement, facilement.</span>
      </ng-container>

      <ng-container text>
        Grâce à Optee, accédez immédiatement à toutes les données techniques et
        financières pour structurer vos projets de rénovation, d’équipement ou
        d’optimisation énergétique dans vos établissements.
      </ng-container>

      <ng-container partnerText>
        Plus de 3500 projets lancés par les plus grands groupes, dont de
        nombreux acteurs du secteur hôtelier.
      </ng-container>
    </swc-hero-section-main>

    <div
      class="max-w-showcase m-auto flex flex-col gap-6 p-4 md:gap-10 md:p-8 md:pt-20"
    >
      <swc-structure-call-for-tenders>
        <ng-container title>
          <div class="font-bold">Structurez vos appels d’offres</div>
          hôteliers, en quelques clics.
        </ng-container>

        <ng-container text>
          Générez instantanément des briefs techniques complets, intégrez
          automatiquement les aides et subventions disponibles, et suivez chaque
          étape de vos projets depuis un tableau de bord centralisé.
        </ng-container>
      </swc-structure-call-for-tenders>

      <swc-select-professionals>
        <ng-container title>
          <span class="font-bold">Sélectionnez</span>
          des professionnels parmi un réseau d’experts
          <span class="font-bold">
            triés sur le volet pour le secteur de l’hôtellerie.
          </span>
        </ng-container>
      </swc-select-professionals>

      <oui-arcade-wrapper flowId="5xenDksZnZFmrqCKivxR" />

      <swc-registering-process />

      <oui-radar-register-now
        ctaLabel="Lancer mon appel d’offres gratuitement"
      />

      <oui-testimonial-carousel />

      <oui-questions theme="light" />

      <oui-onboarding-button
        class="flex justify-center p-4 lg:p-8"
        label="Lancer mes appels d’offres"
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
export class LandingHotelMarketplacePageComponent {}
