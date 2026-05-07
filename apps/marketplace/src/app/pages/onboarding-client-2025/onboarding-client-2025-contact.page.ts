import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { OnboardingBulletPointsComponent } from "../../components/onboarding-client/onboarding-bullet-points.component";
import { OnboardingContactFormComponent } from "../../components/onboarding-client/onboarding-contact-form.component";
import { OnboardingNumberOneComponent } from "../../components/onboarding-client/onboarding-number-one.component";
import { OnboardingService } from "../../services/onboarding.service";

@Component({
  selector: "mkp-onboarding-client-2025-contact-page",
  template: `
    <mkp-onboarding-number-one class="my-6" [target]="content().target" />
    <mkp-onboarding-bullet-points [sellingPoints]="content().sellingPoints" />
    <mkp-onboarding-contact-form />
  `,
  imports: [
    OnboardingContactFormComponent,
    OnboardingBulletPointsComponent,
    OnboardingNumberOneComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OnboardingClient2025ContactPageComponent {
  protected readonly onboardingService = inject(OnboardingService);

  protected readonly content = computed(() => this.onboardingService.content());
}
