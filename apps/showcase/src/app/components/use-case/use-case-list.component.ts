import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { useCaseSchema } from "@optee/blog";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { CtaBlockComponent } from "@optee/ui/components/molecules/cta-block/cta-block.component";
import { ProjectsComponent } from "@optee/ui/components/organisms/projects/projects.component";
import z from "zod";
import type { HeroSectionImage } from "../hero-section/hero-section.component";
import { HeroSectionComponent } from "../hero-section/hero-section.component";
import { StatsBannerComponent } from "../stats/stats-banner.component";
import { UseCaseCardComponent } from "./use-case-card.component";

export const useCasesRouteDataSchema = z.object({
  useCases: useCaseSchema.array(),
});

@Component({
  selector: "swc-use-cases-list",
  template: `
    <swc-hero-section [multiplesImg]="images">
      <span title>
        Des entreprises qui optimisent
        <br />
        leur efficacité énergétique
      </span>

      <p text>
        Avec Optee, plus de 100 clients économisent temps et argent grâce à une
        gestion simplifiée des projets énergétiques. Nos offres et opérations
        mieux structurées permettent des économies d'énergie significatives.
      </p>
    </swc-hero-section>

    <swc-stats-banner [stats]="stats" />

    <div
      class="relative flex flex-col gap-10 overflow-hidden bg-white px-6 py-4 !pb-60 xl:gap-20 xl:py-20"
    >
      <oui-circle
        class="-left-[629px] bottom-[100px] w-[945px]"
        theme="light"
      />
      <oui-circle class="-right-[248px] top-[158px] w-[600px]" theme="light" />

      <h3
        class="mx-auto text-pretty p-4 text-center text-2xl font-semibold !leading-relaxed xl:max-w-screen-lg xl:text-4xl"
      >
        Explorez nos études de cas mettant en avant les initiatives de nos
        partenaires
      </h3>

      <div
        class="mx-auto flex max-w-screen-xl flex-wrap justify-center gap-x-6 gap-y-10"
      >
        @for (useCase of useCases; track useCase.slug) {
          <swc-use-case-card [useCase]="useCase" />
        } @empty {
          <li>Aucun cas client trouvé</li>
        }
      </div>
    </div>

    <div class="relative">
      <oui-cta-block class="absolute -top-36 left-1/2 -translate-x-1/2" />
    </div>

    <div class="relative overflow-hidden">
      <oui-circle
        class="-bottom-[235px] -right-[400px] w-[749px]"
        theme="light"
      />

      <oui-projects class="mt-96 xl:mt-52" sectionTitle="Nos partenaires" />
    </div>
  `,
  imports: [
    RouterModule,
    StatsBannerComponent,
    HeroSectionComponent,
    CtaBlockComponent,
    UseCaseCardComponent,
    CircleComponent,
    ProjectsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UseCasesListComponent {
  private readonly route = inject(ActivatedRoute);

  // ✅ Données pré-chargées par le resolver (pas d'appel API au runtime !) - TYPE SAFE
  routeData = useCasesRouteDataSchema.parse(this.route.snapshot.data);

  useCases = this.routeData.useCases;

  readonly stats = [
    {
      prefix: "+",
      value: 150,
      description: "Clients engagés pour réduire leur empreinte carbone",
    },
    {
      prefix: "+",
      value: 1500,
      description: "Opérations d'efficacité énergétique réalisées",
    },
    {
      value: 1500,
      unit: "Gwh",
      description: "Économies d'énergie réalisées",
    },
  ];

  readonly images: HeroSectionImage[] = [
    {
      class: "bottom-8 left-6 w-[170px] w-[152px]",
      alt: "illustration travaux; ouvrier",
      publicAssetPath: "hero-section/travaux_1.png",
    },
    {
      class: "bottom-0 left-[15%] md:left-24 sm:left-[35%] w-[211px]",
      alt: "illustration travaux; bâtiment",
      publicAssetPath: "hero-section/travaux_2.png",
    },
    {
      class: "bottom-0 left-[50%] xl:left-[35%] w-[180px] hidden md:block",
      alt: "illustration travaux; dialogue",
      publicAssetPath: "hero-section/travaux_3.png",
    },
    {
      class: "bottom-0 right-24  w-[368px] hidden xl:block",
      alt: "illustration travaux; plan ",
      publicAssetPath: "hero-section/travaux_4.png",
    },
    {
      class: "bottom-6 right-12 w-[149px]",
      alt: "illustration travaux; coordination",
      publicAssetPath: "hero-section/travaux_5.png",
    },
  ];
}
