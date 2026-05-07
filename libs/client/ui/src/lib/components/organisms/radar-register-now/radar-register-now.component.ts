import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import {
  buildAssetUrl,
  getOnboardingPath,
  SHOWCASE_DEMO_URL,
} from "@optee/constants";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";

const bgRadar = buildAssetUrl("bg-radar.png");

@Component({
  selector: "oui-radar-register-now",
  host: {
    class: "block rounded-2xl bg-primary-900 bg-cover",
    "[style.background-image]": `'url(${bgRadar})'`,
  },
  template: `
    <div
      class="flex gap-4 rounded-2xl bg-gradient-to-l from-black/40 to-black/0 p-4 text-white lg:gap-8 lg:p-8"
    >
      <div class="ml-auto flex basis-[600px] flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="font-display text-xl font-semibold md:text-3xl">
            {{ heading() }}
          </div>

          <div class="font-display font-thin leading-tight">
            {{ description() }}
          </div>
        </div>

        @switch (ctaDestination()) {
          @case ("demo") {
            <oui-button full [href]="demoUrl">
              {{ ctaLabel() }}
            </oui-button>
          }
          @default {
            <oui-button full keepQueryParams [href]="onboardingUrl">
              {{ ctaLabel() }}
            </oui-button>
          }
        }
      </div>
    </div>
  `,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarRegisterNowComponent {
  readonly ctaLabel = input("M’inscrire gratuitement maintenant");
  readonly heading = input("Passez à l’action dès maintenant");
  readonly ctaDestination = input<"onboarding" | "demo">("onboarding");
  readonly description = input(
    "Accédez gratuitement à toutes les fonctionnalités d’Optee pour identifier vos travaux, simuler les aides et lancer vos projets en quelques clics",
  );

  protected readonly demoUrl = SHOWCASE_DEMO_URL;

  protected readonly onboardingUrl = getOnboardingPath({
    step: "contact",
    variant: "2025",
    useAbsoluteUrl: true,
  });
}
