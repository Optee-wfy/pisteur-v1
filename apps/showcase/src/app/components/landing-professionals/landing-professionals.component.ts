import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from "@angular/core";
import { buildAssetUrl, CTA } from "@optee/constants";
import { ArcadeWrapperComponent } from "@optee/ui/components/molecules/arcade/arcade-wrapper/arcade-wrapper.component";
import { DemoButtonComponent } from "@optee/ui/components/atoms/button/demo-button/demo-button.component";
import { EvaComponent } from "@optee/ui/components/organisms/eva/eva.component";
import { RadarRegisterNowComponent } from "@optee/ui/components/organisms/radar-register-now/radar-register-now.component";
import { TestimonialCarouselComponent } from "@optee/ui/components/organisms/testimonial-carousel/testimonial-carousel.component";
import { HeroSectionMainComponent } from "../hero-section-main/hero-section-main.component";
import { MeetFormComponent } from "../meet-form/meet-form.component";
import { RegisteringProcessProComponent } from "../registering-process-pro/registering-process-pro.component";
import { SelectProfessionalsComponent } from "../select-professionals/select-professionals.component";
import { StructureCallForTendersProComponent } from "../structure-call-for-tenders-pro/structure-call-for-tenders-pro.component";
import { SubscriptionBlockComponent } from "../subscription-block/subscription-block.component";

@Component({
  selector: "swc-landing-professionals",
  template: `
    <swc-hero-section-main
      class="relative block overflow-hidden"
      ctaDestination="demo"
      [ctaLabel]="'🚀 ' + CTA.accessToQualifiedProjects"
      [skipNav]="skipNav()"
    >
      <ng-container title>
        <span class="font-bold">{{ firstTitle() }}</span>
        {{ secondTitle() }}
      </ng-container>

      <ng-container text>
        Chaque mois, accédez à des projets qualifiés, des briefs prêts à
        chiffrer, et à notre réseau actif de donneurs d’ordre pour développer
        votre portefeuille sans prospection.
      </ng-container>

      <ng-container underButtonText>
        15 min pour découvrir comment Optee génère vos projets qualifiés.
      </ng-container>

      <ng-container partnerText>
        +450 professionnels déjà accompagnés, +30 000 bâtiments B2B et +200
        appels d'offres mensuels.
      </ng-container>
    </swc-hero-section-main>

    <div
      class="max-w-showcase m-auto flex flex-col gap-6 p-4 md:gap-10 md:p-8 md:pt-20"
    >
      <swc-subscription-block />

      <swc-structure-call-for-tenders-pro>
        <ng-container title>
          <span class="font-bold">
            Générez vos prochains chantiers qualifiés automatiquement.
          </span>
        </ng-container>

        <ng-container text>
          Recevez en quelques secondes un projet qualifié à partir de l’adresse
          du bâtiment. Optee récupère automatiquement les données techniques et
          génère un brief complet des travaux à réaliser.
        </ng-container>
      </swc-structure-call-for-tenders-pro>

      <swc-select-professionals [text]="selectProfessionalsText">
        <ng-container title>
          <p>
            Accédez chaque mois
            <span class="font-bold">
              à des projets qualifiés dans votre zone,
            </span>
            sans prospection.
          </p>
        </ng-container>
      </swc-select-professionals>

      <oui-eva btnVariant="demo" [ctaLabel]="CTA.accessToQualifiedProjects">
        <ng-container mainTitle>
          Qualification instantanée
          <br class="hidden lg:block" />
          grâce à notre moteur de données bâtiment
        </ng-container>

        <ng-container pinkTitle>
          Votre prochain chantier commence par une simple adresse
        </ng-container>

        Saisissez simplement l’adresse de votre client.
        <br />
        Optee analyse automatiquement +150 données bâtiment (surface, hauteur,
        consommations, systèmes en place...) et génère votre brief technique
        complet prêt à chiffrer.

        <div class="mt-4">
          ✓ Qualification immédiate de vos projets sans audit terrain
          <br />
          ✓ Brief technique complet généré automatiquement
          <br />
          ✓ Données exploitables pour deviser dès le premier RDV
          <br />
          ✓ Toutes les aides et subventions automatiquement calculées
        </div>

        <img
          class="absolute -bottom-2 -right-2 w-1/2 max-w-[480px] opacity-25 lg:opacity-100"
          img
          aria-hidden="true"
          [src]="analysezBatimentJpg"
        />
      </oui-eva>

      <oui-eva btnVariant="demo" [ctaLabel]="CTA.accessToQualifiedProjects">
        <ng-container mainTitle>
          Votre tableau de bord
          <br class="hidden lg:block" />
          commercial 100% BtoB
        </ng-container>

        <ng-container pinkTitle>
          Accédez en temps réel aux appels d’offres qualifiés dans votre zone
        </ng-container>

        Chaque mois, retrouvez directement sur votre interface des centaines
        d’appels d’offres ciblés selon vos expertises, votre zone géographique
        et vos capacités.
        <br />
        Chaque projet est qualifié avec : les lots concernés, les volumes à
        traiter, les aides mobilisables, et le potentiel de chiffre d’affaires.

        <div class="mt-4">
          ✓ Appels d’offres qualifiés générés automatiquement sur votre zone
          <br />
          ✓ Fiches projets complètes : lots, surfaces, aides, ROI prévisionnel
          <br />
          ✓ Simulation de marge et de faisabilité dès réception
          <br />
          ✓ Sourcing commercial centralisé sur une seule interface
        </div>

        <img
          class="absolute -bottom-2 -right-2 w-1/2 max-w-[480px] opacity-25 lg:opacity-100"
          img
          aria-hidden="true"
          [src]="explorezOperationsJpg"
        />
      </oui-eva>

      <oui-eva btnVariant="demo" [ctaLabel]="CTA.accessToQualifiedProjects">
        <ng-container mainTitle>
          Nous vous connectons chaque mois à de nouveaux donneurs d’ordre
          qualifiés
        </ng-container>

        <ng-container pinkTitle>
          Un réseau actif de projets et de clients B2B qui cherchent vos
          expertises
        </ng-container>

        Chaque mois, Optee vous propose des projets prêts à démarrer. Vous êtes
        référencés dans notre marketplace nationale. Notre équipe commerciale
        alimente votre portefeuille avec des mises en relation qualifiées et des
        leads vérifiés.

        <div class="mt-4">
          ✓ Mises en relation directes avec 1 à 3 décideurs par mois selon
          l’offre
          <br />
          ✓ +3 000 décideurs ciblés via newsletters et campagnes marketing
          <br />
          ✓ +30 000 bâtiments référencés avec leurs données techniques
          <br />
          ✓ Référencement prioritaire sur la marketplace Optee PRO
        </div>

        <img
          class="absolute -bottom-2 -right-2 w-1/2 max-w-[480px] opacity-25 lg:opacity-100"
          img
          aria-hidden="true"
          [src]="generezBriefJpg"
        />
      </oui-eva>

      <swc-registering-process-pro />

      <oui-radar-register-now
        ctaDestination="demo"
        ctaLabel="Accéder à des projets qualifiés"
        description="Accédez gratuitement à la plateforme Optee pour découvrir des projets adaptés à votre activité, répondre aux appels d’offres, et développer votre portefeuille client en toute simplicité"
        heading="Recevez vos premiers projets qualifiés dès aujourd’hui."
      />

      <oui-testimonial-carousel />

      <oui-demo-button class="flex justify-center" />

      <oui-arcade-wrapper flowId="CpkKWROlAFsWT1DOpZXU" />

      <swc-subscription-block />

      <swc-meet-form
        formType="demo"
        heading="Vous voulez en savoir plus ? Prenons rendez-vous !"
      />
    </div>
  `,
  imports: [
    HeroSectionMainComponent,
    RadarRegisterNowComponent,
    SelectProfessionalsComponent,
    RegisteringProcessProComponent,
    TestimonialCarouselComponent,
    StructureCallForTendersProComponent,
    EvaComponent,
    DemoButtonComponent,
    ArcadeWrapperComponent,
    MeetFormComponent,
    SubscriptionBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingProfessionalsComponent {
  readonly skipNav = input(false, { transform: booleanAttribute });
  readonly firstTitle = input.required<string>();
  readonly secondTitle = input.required<string>();

  protected readonly CTA = CTA;
  protected readonly selectProfessionalsText =
    "Optee récupère automatiquement les données des bâtiments (surface, systèmes, consommations, âge du bâti, etc.) pour qualifier les projets et calculer instantanément les volumes de travaux à chiffrer. Vous recevez des briefs techniques complets : lots identifiés, aides mobilisables (CEE, subventions), estimations financières et ROI. Vous concentrez vos efforts sur la vente et le pilotage des chantiers.";

  protected readonly analysezBatimentJpg = buildAssetUrl(
    "analysez-batiment.jpg",
  );

  protected readonly explorezOperationsJpg = buildAssetUrl(
    "explorez-operations.jpg",
  );

  protected readonly generezBriefJpg = buildAssetUrl("generez-brief.jpg");
}
