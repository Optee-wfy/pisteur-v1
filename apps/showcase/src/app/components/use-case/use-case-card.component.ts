import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { IconChevronRightComponent } from "@optee/icons";

export interface UseCaseCardProps {
  slug: string;
  title: string;
  description: string;
  image?: { url: string } | null;
  categories?: { slug: string; title: string }[] | null;
}

@Component({
  selector: "swc-use-case-card",
  host: {
    class:
      "shadow-o flex bg-white flex-col items-start rounded-3xl overflow-hidden w-[350px] z-10",
  },
  template: `
    @if (useCase(); as useCase) {
      @if (useCase.image) {
        <img
          class="h-[180px] self-stretch object-cover"
          [src]="useCase.image.url"
        />
      }

      <div
        class="flex flex-1 flex-col items-start justify-between gap-6 self-stretch bg-white p-6"
      >
        <div class="flex gap-2 md:min-h-6">
          @for (
            category of useCase.categories;
            track category.slug;
            let i = $index
          ) {
            <span
              class="bg-primary-200 text-primary-700 rounded-3xl px-4 py-1 text-sm font-medium"
            >
              {{ category.title }}
            </span>
          }
        </div>
        <div class="flex flex-1 flex-col gap-2">
          <h4
            class="font-display line-clamp-2 min-h-12 max-w-prose font-semibold xl:text-lg"
          >
            {{ useCase.title }}
          </h4>

          <p class="line-clamp-3 min-h-16 text-justify text-gray-600">
            {{ useCase.description }}
          </p>
        </div>
        <a
          class="text-primary-700 flex items-center gap-1"
          [routerLink]="['/clients', useCase.slug]"
        >
          <span class="font-display text-sm underline">En savoir plus</span>

          <icon-chevron-right class="size-5" />
        </a>
      </div>
    }
  `,
  imports: [IconChevronRightComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UseCaseCardComponent {
  useCase = input.required<UseCaseCardProps>();
}
