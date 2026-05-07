import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import {
  IconBicolorConfianceComponent,
  IconBicolorExpertiseComponent,
  IconBicolorOptimiseComponent,
  IconBicolorReseauComponent,
} from "@optee/icons";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";

export interface Advantage {
  icon: "optimise" | "reseau" | "confiance" | "expertise";
  title: string;
  description: string;
}

@Component({
  selector: "swc-optee-advantages",
  host: {
    class: "p-6 xl:py-16 block relative overflow-hidden",
    "[class.bg-primary-900]": "theme() === 'dark'",
    "[class.bg-white]": "theme() !== 'dark'",
  },
  template: `
    <oui-circle class="-left-[147px] top-[130px] w-[349px]" [theme]="theme()" />

    <oui-circle
      class="-bottom-[288px] -right-[211px] w-[669px]"
      [theme]="theme()"
    />

    <h2
      class="mb-6 text-pretty text-center text-2xl font-semibold xl:mb-20 xl:text-4xl"
      [class]="theme() === 'dark' ? 'text-white' : 'text-primary-900'"
    >
      {{ title() }}
    </h2>

    <div
      class="content-centered relative flex flex-wrap items-center justify-center gap-8"
    >
      @for (advantage of advantages(); track advantage.title) {
        <oui-bob class="max-w-lg self-stretch">
          @switch (advantage.icon) {
            @case ("optimise") {
              <icon-bicolor-optimise
                class="text-primary-700 size-8 lg:size-12"
                colorMode="semi"
              />
            }
            @case ("reseau") {
              <icon-bicolor-reseau
                class="text-primary-700 size-8 lg:size-12"
                colorMode="semi"
              />
            }
            @case ("confiance") {
              <icon-bicolor-confiance
                class="text-primary-700 size-8 lg:size-12"
                colorMode="semi"
              />
            }
            @case ("expertise") {
              <icon-bicolor-expertise
                class="text-primary-700 size-8 lg:size-12"
                colorMode="semi"
              />
            }
          }

          <h4
            class="font-display mb-4 text-lg font-semibold leading-snug xl:text-2xl"
            [innerHTML]="advantage.title"
          ></h4>

          <p class="p-soft">{{ advantage.description }}</p>
        </oui-bob>
      }
    </div>
  `,
  imports: [
    CircleComponent,
    BobComponent,
    IconBicolorOptimiseComponent,
    IconBicolorReseauComponent,
    IconBicolorConfianceComponent,
    IconBicolorExpertiseComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpteeAdvantagesComponent {
  readonly theme = input<"light" | "dark">("dark");
  readonly title = input.required<string>();
  readonly advantages = input.required<Advantage[]>();
}
