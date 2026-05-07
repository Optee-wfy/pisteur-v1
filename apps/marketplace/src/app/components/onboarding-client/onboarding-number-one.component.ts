import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "mkp-onboarding-number-one",
  host: {
    class: "block",
  },
  template: `
    <h1
      class="text-primary-700 font-display mx-auto max-w-prose text-center text-2xl font-bold leading-tight sm:text-3xl"
    >
      La plateforme n°1
      <span class="font-medium">pour les</span>
      <br />

      {{ target() }}
    </h1>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingNumberOneComponent {
  target = input<string>("décideurs de la rénovation");
}
