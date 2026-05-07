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
import { RenovationPlanComponent } from "../components/renovation-plan/renovation-plan.component";
import { SelectProfessionalsComponent } from "../components/select-professionals/select-professionals.component";

@Component({
  selector: "swc-strategie-page",
  template: `
    <swc-hero-section-main class="relative block overflow-hidden">
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
          Analyse automatisée
          <br class="hidden lg:block" />
          par adresse
        </ng-container>

        <ng-container pinkTitle>
          Plus besoin d’audit pour obtenir une première analyse de votre
          bâtiment
        </ng-container>

        Saisissez une adresse, Optee fait le reste. Grâce à nos connexions aux
        bases officielles (BDNB, GRDF, ENEDIS, Fichier Foncier, Ademe…), nous
        reconstituons automatiquement le profil complet de votre bâtiment.

        <div class="mt-4">
          ✓ Plus de 120 données récupérées et croisées en temps réel
          <br />
          ✓ Création automatique de votre tableau de bord bâtiment
          <br />
          ✓ Aucun audit à prévoir, aucune donnée à centraliser manuellement
        </div>

        <img
          class="absolute -bottom-2 -right-2 w-1/2 max-w-[480px] opacity-25 lg:opacity-100"
          alt=""
          img
          aria-hidden="true"
          [src]="analysezBatimentJpg"
        />
      </oui-eva>

      <oui-eva>
        <ng-container mainTitle>
          Stratégie de rénovation intelligente
        </ng-container>

        <ng-container pinkTitle>
          Visualisez en un instant les projets
          <br class="hidden lg:block" />
          les plus rentables à lancer
        </ng-container>

        Optee vous propose une liste personnalisée des travaux pertinents à
        mener, basée sur le profil réel de votre bâtiment.

        <div class="mt-4">
          ✓ Estimations fiables : coût, subventions mobilisables, impact
          énergétique et carbone, retour sur investissement
          <br />
          ✓ Détails opération par opération : conditions de faisabilité,
          matériel requis, étapes clés
          <br />
          ✓ Données mises à jour automatiquement selon les caractéristiques du
          bâtiment
        </div>

        <img
          class="absolute -bottom-2 -right-2 w-1/2 max-w-[500px] opacity-25 lg:opacity-100"
          alt=""
          img
          aria-hidden="true"
          [src]="explorezOperationsJpg"
        />
      </oui-eva>

      <oui-eva>
        <ng-container mainTitle>
          Brief technique,
          <br class="hidden lg:block" />
          prêt à l’emploi
        </ng-container>

        <ng-container pinkTitle>
          Un brief technique complet
          <br class="hidden lg:block" />
          généré pour chaque opération
        </ng-container>

        Optee produit automatiquement un dossier technique précis, prêt à être
        transmis à des entreprises pour appel d’offres.

        <div class="mt-4">
          ✓ Conditions de réalisation, spécificités techniques, points de
          vigilance
          <br />
          ✓ Livrable structuré et conforme aux attentes des professionnels
          <br />
          ✓ Téléchargeable, partageable, personnalisable en quelques clics
        </div>

        <img
          class="absolute -bottom-2 -right-2 w-1/2 max-w-[450px] opacity-25 lg:opacity-100"
          alt=""
          img
          aria-hidden="true"
          [src]="generezBriefJpg"
        />
      </oui-eva>

      <oui-arcades-tutorial />

      <swc-registering-process altVersion />

      <swc-meet-form />

      <oui-testimonial-carousel />

      <oui-questions class="rounded-3xl bg-white p-4 lg:p-8" theme="light" />

      <oui-onboarding-button class="flex justify-center p-4 lg:p-8" />
    </div>
  `,
  imports: [
    HeroSectionMainComponent,
    RadarRegisterNowComponent,
    ArcadesTutorialComponent,
    EvaComponent,
    SelectProfessionalsComponent,
    QuestionsComponent,
    MeetFormComponent,
    RegisteringProcessComponent,
    TestimonialCarouselComponent,
    RenovationPlanComponent,
    OnboardingButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrategiePageComponent {
  readonly analysezBatimentJpg = buildAssetUrl("analysez-batiment.jpg");
  readonly explorezOperationsJpg = buildAssetUrl("explorez-operations.jpg");
  readonly generezBriefJpg = buildAssetUrl("generez-brief.jpg");
}
