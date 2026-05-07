import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { getOnboardingPath } from "@optee/constants";
import type { ButtonVariant } from "@optee/ui/components/atoms/button/button/button.component";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";

@Component({
  selector: "oui-onboarding-button",
  template: `
    <oui-button keepQueryParams [href]="onboardingUrl" [variant]="variant()">
      {{ label() ?? "M'inscrire gratuitement" }}
    </oui-button>
  `,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingButtonComponent {
  readonly variant = input<ButtonVariant>("accent");
  readonly label = input<string | undefined>();

  protected readonly onboardingUrl = getOnboardingPath({
    step: "contact",
    variant: "2025",
    useAbsoluteUrl: true,
  });
}
