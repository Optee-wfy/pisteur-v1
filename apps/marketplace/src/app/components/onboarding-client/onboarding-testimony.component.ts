import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { buildAssetUrl } from "@optee/constants";

@Component({
  selector: "mkp-onboarding-testimony",
  host: {
    class:
      "text-primary-900 font-display flex flex-col items-center text-center",
  },
  template: `
    <img
      class="mx-auto mb-4 w-16"
      alt="Portrait de Julie M."
      height="154"
      width="154"
      [src]="julieM"
    />

    <div class="text-xl font-bold">Julie M.</div>
    <span class="font-semibold">
      {{ job() }}
    </span>

    <div class="mx-auto mt-4 flex max-w-[380px] flex-col gap-4 text-sm">
      <p>
        “Optee nous fait gagner un temps précieux et maximise la rentabilité de
        nos projets.”
      </p>

      <p>
        On monte en expertise, on prend de meilleures décisions, et on s’appuie
        sur un réseau de pros de confiance. C’est devenu notre outil central
        pour piloter la rénovation.
      </p>
    </div>
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingTestimonyComponent {
  job = input.required<string>();

  julieM = buildAssetUrl("images/julie-m.png");
}
