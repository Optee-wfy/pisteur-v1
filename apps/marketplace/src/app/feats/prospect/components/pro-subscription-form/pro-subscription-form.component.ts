import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from "@angular/core";
import { PRO_PLANS } from "@optee/constants";
import { IconBoltComponent } from "@optee/icons";
import trpcClient from "../../../../../trpc-client";
import { ProService } from "../../../../services/pro.service";
import { ProSubscriptionCardComponent } from "../pro-subscription-card/pro-subscription-card.component";
import { ProSubscriptionPickerComponent } from "../pro-subscription-picker/pro-subscription-picker.component";

@Component({
  selector: "mkp-pro-subscription-form",
  host: { class: "flex flex-col gap-6" },
  template: `
    <header class="flex flex-col items-start justify-center gap-2">
      <h1 class="text-2xl font-semibold">Abonnement & crédits</h1>
      <p class="text-sm text-gray-600">
        Gérez votre abonnement et vos crédits.
      </p>
    </header>

    <section
      class="bg-primary-100 flex w-full items-center justify-between gap-4 rounded-lg p-4"
    >
      <div
        class="text-primary-500 bg-primary-100 flex items-center gap-2 rounded-lg p-2 text-sm font-medium transition-all"
      >
        <icon-bolt class="size-6" />
        <div class="text-sm">
          Il vous reste
          <strong>{{ proService.remainingCredits() }}</strong>
          crédits à utiliser ce mois-ci.
        </div>
      </div>

      <!-- <button class="text-primary-400 rounded-lg bg-white px-4 py-2">
        Recharger
      </button> -->
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-sm font-medium">Formule actuelle</h2>

      @if (currentSubscription(); as subscription) {
        <mkp-pro-subscription-card
          [renewalDate]="
            currentStripeSubscriptionResource.value()?.currentPeriodEnd ?? null
          "
          [subscription]="subscription"
        />
      } @else {
        <span
          class="text-granite-400 border-granite-200 flex items-start justify-between rounded-lg border p-4 italic"
        >
          Vous n'avez pas d'abonnement actif, merci d'en sélectionner un
        </span>
      }

      @if (showOtherPlans()) {
        <section class="flex flex-col gap-2">
          <h2 class="text-sm font-medium">Autres formules</h2>
          <!-- Change plan -->
          <mkp-pro-subscription-picker />
        </section>
      } @else if (editable()) {
        <button
          class="text-granite-400 hover:bg-granite-100 bg-granite-50 w-full rounded-lg px-4 py-2 text-sm font-medium transition-all"
          (click)="showOtherPlans.set(true)"
        >
          Voir les autres formules
        </button>
      } @else {
        <p
          class="text-granite-400 bg-granite-50 w-full rounded-lg px-4 py-2 text-center text-sm font-medium"
        >
          Contactez votre administrateur pour changer de formule.
        </p>
      }
    </section>
  `,
  imports: [
    IconBoltComponent,
    ProSubscriptionCardComponent,
    ProSubscriptionPickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProSubscriptionFormComponent {
  readonly editable = input<boolean>(false);
  protected readonly proService = inject(ProService);

  protected readonly showOtherPlans = signal(false);
  protected readonly currentStripeSubscriptionResource = resource({
    loader: async () => trpcClient.stripe.getCurrentSubscription.query(),
  });

  protected readonly currentSubscription = computed(() =>
    PRO_PLANS.find((s) => s.subscription === this.proService.subscription()),
  );
}
