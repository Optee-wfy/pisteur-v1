import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { OnboardingClientFormComponent } from "../../components/onboarding-client/onboarding-client-form.component";
import { OnboardingNumberOneComponent } from "../../components/onboarding-client/onboarding-number-one.component";
import { OnboardingService } from "../../services/onboarding.service";

@Component({
  selector: "mkp-onboarding-client-2025-client-page",
  template: `
    <mkp-onboarding-number-one class="my-6" [target]="content().target" />

    <oui-message class="text-primary-700 font-display">
      Nous venons de vous envoyer un mail de vérification, complétez les
      dernières informations relatives à votre entreprise et renseignez le code
      reçu par mail
    </oui-message>

    <mkp-onboarding-client-form [locationLabel]="content().locationLabel" />
  `,
  imports: [
    OnboardingNumberOneComponent,
    MessageComponent,
    OnboardingClientFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OnboardingClient2025ClientPageComponent {
  protected readonly onboardingService = inject(OnboardingService);

  protected readonly content = computed(() => this.onboardingService.content());
}
