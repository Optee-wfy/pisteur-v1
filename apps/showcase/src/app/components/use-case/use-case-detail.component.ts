import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  type OnInit,
} from "@angular/core";
import { DomSanitizer, Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { useCaseSchema, type UseCase } from "@optee/blog";
import { SHOWCASE_URL } from "@optee/constants";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { DividerHorizontalComponent } from "@optee/ui/components/atoms/divider/divider-horizontal/divider-horizontal.component";
import { CtaBlockComponent } from "@optee/ui/components/molecules/cta-block/cta-block.component";
import { ProjectsComponent } from "@optee/ui/components/organisms/projects/projects.component";
import z from "zod";
import { HeroSectionHorizontalComponent } from "../hero-section-horizontal/hero-section-horizontal.component";
import { UseCaseCardComponent } from "./use-case-card.component";

export const useCaseRouteDataSchema = z.object({
  useCase: z.object({
    detail: useCaseSchema,
    relatedUseCases: useCaseSchema.array().nullish(),
  }),
});

@Component({
  selector: "swc-use-case-detail",
  template: `
    <swc-hero-section-horizontal
      [breadcrumbCurrent]="useCase.title"
      [breadcrumbParent]="{ label: 'Cas client', uri: 'clients' }"
      [singleImgUrl]="useCase.image?.url"
    >
      <div title>
        {{ useCase.title }}
      </div>

      <p text>
        {{ useCase.description }}
      </p>
    </swc-hero-section-horizontal>

    <div class="relative bg-white px-12 py-12 !pb-60 text-gray-600 xl:px-24">
      <oui-circle
        class="-left-[629px] bottom-[100px] w-[945px]"
        theme="light"
      />
      <oui-circle class="-right-[248px] top-[158px] w-[600px]" theme="light" />
      <div
        class="mx-auto flex w-fit flex-col gap-8 md:flex-row lg:max-w-screen-xl xl:gap-16"
      >
        <div class="flex flex-col items-stretch gap-8">
          @if (useCase.logo) {
            <div class="bg-primary-200 flex justify-center rounded-3xl p-4">
              <img
                class="w-[200px] rounded-3xl"
                [alt]="useCase.logo.title"
                [src]="useCase.logo.url"
              />
            </div>
          }
          <div
            class="bg-primary-900 relative flex min-w-64 flex-col items-center gap-8 overflow-hidden rounded-3xl p-6 text-white xl:p-10"
          >
            <oui-circle
              class="-right-[280px] -top-[270px] w-[450px]"
              theme="light"
            />
            <h4 class="w-full text-xl font-semibold xl:text-2xl">
              Les résultats
            </h4>
            <div class="flex w-full flex-col gap-4">
              @for (field of statsFields(); track field.label) {
                <div
                  class="flex w-full flex-col items-start justify-start gap-2"
                >
                  <span class="font-medium">{{ field.label }}</span>
                  <span class="text-2xl font-bold tracking-wide">
                    @if (field.format) {
                      {{ field.value(useCase) | number: field.format }}
                      {{ field.suffix }}
                    } @else {
                      {{ field.value(useCase) }} {{ field.suffix }}
                    }
                  </span>
                </div>

                @if (!$last) {
                  <oui-divider-horizontal class="hidden shrink-0 md:block" />
                }
              }
            </div>
          </div>
        </div>

        <div class="contentfull-content" [innerHTML]="useCase.content"></div>
      </div>
    </div>

    <div class="relative">
      <oui-cta-block
        class="absolute -top-48 left-1/2 -translate-x-1/2 md:-top-36"
      />
    </div>

    <oui-projects class="mt-96 xl:mt-52" />

    <div class="content-centered">
      @if (relatedUseCases.length) {
        <h3
          class="mx-auto mb-14 text-pretty text-center text-3xl font-semibold xl:mb-20 xl:max-w-screen-lg xl:text-4xl"
        >
          Découvrez nos autres cas clients
        </h3>
        <div class="my-14 flex flex-wrap justify-center gap-16">
          @for (relatedUseCase of relatedUseCases; track relatedUseCase.slug) {
            <swc-use-case-card [useCase]="relatedUseCase" />
          } @empty {
            <li>Aucun autre cas client</li>
          }
        </div>
      }
    </div>
  `,
  imports: [
    CommonModule,
    RouterModule,
    HeroSectionHorizontalComponent,
    UseCaseCardComponent,
    CtaBlockComponent,
    ProjectsComponent,
    DividerHorizontalComponent,
    CircleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UseCaseDetailComponent implements OnInit {
  protected readonly route = inject(ActivatedRoute);
  protected readonly meta = inject(Meta);
  protected readonly title = inject(Title);
  protected readonly sanitizer = inject(DomSanitizer);

  statsFields = signal([
    {
      label: "Surface traitée",
      value: (useCase: UseCase) => useCase.surface ?? 0,
      suffix: "m²",
      format: "1.0",
    },
    {
      label: "Coût initial du projet",
      value: (useCase: UseCase) => useCase.initialCost ?? 0,
      suffix: "€",
      format: "1.0-0",
    },
    {
      label: "Coût final après optimisation",
      value: (useCase: UseCase) => useCase.finalCost ?? 0,
      suffix: "€",
      format: "1.0-0",
    },
    {
      label: "Impact énergétique estimé",
      value: (useCase: UseCase) => useCase.impact ?? 0,
      suffix: "%",
      format: null,
    },
    {
      label: "Impact financier",
      value: (useCase: UseCase) => useCase.funding ?? 0,
      suffix: "%",
      format: null,
    },
  ]);

  // ✅ Données pré-chargées par les resolvers (pas d'appel API au runtime !) - TYPE SAFE
  routeData = useCaseRouteDataSchema.parse(this.route.snapshot.data);

  useCase = {
    ...this.routeData.useCase.detail,
    content: this.routeData.useCase.detail.content
      .replace(/<p><\/p>/gi, "")
      .replace(/<p><\/div><\/p>/gi, ""),
  };

  relatedUseCases = this.routeData.useCase.relatedUseCases ?? [];

  stats = [
    this.useCase.surface
      ? {
          value: this.useCase.surface,
          unit: "m²",
          description: "Surface totale",
        }
      : null,
    this.useCase.impact
      ? {
          value: this.useCase.impact,
          unit: "°C",
          description: "Écart de température visé",
        }
      : null,
    this.useCase.funding
      ? {
          value: this.useCase.funding,
          unit: "%",
          description: "Financement par CEE",
        }
      : null,
  ];

  ngOnInit(): void {
    // ✅ Métadonnées définies de manière synchrone avec les données du resolver (optimal pour SSG)

    // Titre de la page
    this.title.setTitle(`${this.useCase.title} - Cas client Optee`);

    // Meta tags pour SEO
    this.meta.updateTag({
      name: "description",
      content: this.useCase.description,
    });

    // Open Graph tags pour les réseaux sociaux
    this.meta.updateTag({
      property: "og:title",
      content: `${this.useCase.title} - Cas client Optee`,
    });
    this.meta.updateTag({
      property: "og:description",
      content: this.useCase.description,
    });
    this.meta.updateTag({ property: "og:type", content: "article" });
    this.meta.updateTag({
      property: "og:url",
      content: `${SHOWCASE_URL}/cas-clients/${this.useCase.slug}`,
    });

    if (this.useCase.image?.url) {
      this.meta.updateTag({
        property: "og:image",
        content: this.useCase.image.url,
      });
    }

    // Twitter Card
    this.meta.updateTag({
      name: "twitter:card",
      content: "summary_large_image",
    });
    this.meta.updateTag({
      name: "twitter:title",
      content: `${this.useCase.title} - Cas client Optee`,
    });
    this.meta.updateTag({
      name: "twitter:description",
      content: this.useCase.description,
    });

    if (this.useCase.image?.url) {
      this.meta.updateTag({
        name: "twitter:image",
        content: this.useCase.image.url,
      });
    }
  }
}
