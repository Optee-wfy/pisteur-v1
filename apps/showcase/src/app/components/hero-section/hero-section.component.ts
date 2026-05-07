import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import type { PublicAssetPath } from "@optee/constants";
import { buildAssetUrl } from "@optee/constants";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { HeaderComponent } from "../layout/navigation/header/header.component";

export interface HeroSectionImage {
  class: string;
  alt: string;
  publicAssetPath: PublicAssetPath;
}

@Component({
  selector: "swc-hero-section",
  template: `
    <div
      class="relative flex flex-col overflow-hidden lg:items-center lg:gap-8"
      [class.bg-primary-900]="theme() === 'dark'"
      [class.pb-36]="!singleImg()"
      [class.text-white]="theme() === 'dark'"
    >
      <oui-circle
        class="-left-[519px] -top-[64px] w-[1071px]"
        [theme]="theme()"
      />

      <oui-circle
        class="-right-[70px] top-[172px] w-[244px]"
        [theme]="theme()"
      />

      <swc-header [theme]="theme()" />

      <div class="z-10 flex w-full flex-col gap-14 p-6">
        <div
          class="flex w-full flex-col items-center gap-10 py-8 text-center lg:gap-12"
        >
          <div class="flex max-w-3xl flex-col items-center gap-6">
            <h1 class="px-6 text-4xl font-semibold !leading-tight md:text-5xl">
              <ng-content select="[title]" />
            </h1>

            <div
              class="px-12 font-medium leading-relaxed tracking-tight md:max-w-4xl"
            >
              <ng-content select="[text]" />
            </div>
          </div>

          @if (cta()) {
            <oui-button
              href="/demo"
              [variant]="theme() === 'dark' ? 'standard' : 'primary'"
            >
              {{ cta() }}
            </oui-button>
          }
        </div>
      </div>

      @if (singleImg()) {
        <div
          class="m-auto max-w-[60%] rounded-[32px] rounded-b-none p-2 pb-0 xl:p-4 xl:pb-0"
          [class.bg-primary-200]="theme() === 'light'"
          [class.bg-primary-400]="theme() === 'dark'"
        >
          <img
            class="rounded-3xl rounded-b-none"
            alt="Capture d'écran de la plateforme"
            [src]="appScreenshotPng"
          />
        </div>
      } @else {
        <div
          class="absolute bottom-0 left-1/2 isolate z-10 block w-full -translate-x-1/2"
        >
          @for (image of multiplesImg(); track image.publicAssetPath) {
            <img
              class="pointer-events-none absolute"
              [alt]="image.alt"
              [class]="image.class"
              [src]="buildAssetUrl(image.publicAssetPath)"
            />
          }
        </div>
      }
    </div>
  `,
  imports: [RouterModule, HeaderComponent, ButtonComponent, CircleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent {
  theme = input<"light" | "dark">("dark");
  cta = input<string>();
  singleImg = input(false, { transform: booleanAttribute });
  multiplesImg = input<HeroSectionImage[]>([
    {
      class:
        "bottom-16 left-6 z-0 flex w-[170px] lg:bottom-24 lg:left-16 lg:w-[318px]",
      alt: "illustration question chatbot",
      publicAssetPath: "hero-section/ai_chatbot.png",
    },
    {
      class:
        "-bottom-12 -left-20 -z-10 flex w-[328px] lg:-bottom-28 lg:-left-0.5 lg:w-[586px]",
      alt: "illustration chatbot",
      publicAssetPath: "hero-section/chatbot.png",
    },
    {
      class:
        "-bottom-5 right-24 z-0 flex w-[122px] lg:bottom-6 lg:right-80 lg:w-[217px]",
      alt: "illustration devis",
      publicAssetPath: "hero-section/devis.png",
    },
    {
      class: "-bottom-20 right-0 -z-10 flex w-[205px] lg:w-[370px]",
      alt: "illustration dashboard",
      publicAssetPath: "hero-section/dashboard.png",
    },
  ]);

  buildAssetUrl = buildAssetUrl;
  appScreenshotPng = buildAssetUrl("app-screenshot.png");
}
