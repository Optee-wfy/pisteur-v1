import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { buildAssetUrl } from "@optee/constants";

@Component({
  selector: "mkp-onboarding-head",
  host: {
    class: "flex items-center justify-center gap-4 sm:gap-8",
  },
  template: `
    <img class="w-28 sm:w-44" alt="Logo de Optee" [src]="logoLight" />

    @if (partnerLogo(); as partnerLogo) {
      <div class="font-display text-primary-700 text-2xl italic sm:text-[45px]">
        x
      </div>

      <img class="w-28 sm:w-44" alt="Logo du partenaire" [src]="partnerLogo" />
    }
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingHeadComponent {
  readonly partnerLogo = input.required<string | null>();
  readonly logoLight = buildAssetUrl("logo-light-theme.svg");
}
