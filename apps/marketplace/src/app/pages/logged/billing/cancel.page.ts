import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { getProPlan, ProSubscription } from "@optee/constants";
import { IconRefreshComponent, IconWarningComponent } from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { ToastService } from "@optee/ui/services/toast.service";

import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { StripeCheckoutService } from "../../../feats/prospect/services/stripe-checkout.service";

@Component({
  selector: "mkp-billing-cancel-page",
  host: {
    class: "flex justify-center bg-gray-50 p-4 md:p-10",
  },
  template: `
    @let selectedPlan = referencedPlan();

    <oui-eve class="flex w-full max-w-4xl flex-col gap-8">
      <header class="flex items-start gap-3 border-b border-gray-100 pb-4">
        <icon-warning class="size-8 text-amber-600" colorMode="colored" />

        <div>
          <h1 class="text-2xl font-semibold leading-tight text-gray-900">
            Paiement annulé
          </h1>
          <p class="text-sm text-gray-600">{{ pageSubtitle() }}</p>
        </div>
      </header>

      <oui-message severity="note">
        Aucun prélèvement n'a été effectué. Vous pouvez retourner sur votre
        espace ou relancer le paiement pour finaliser votre abonnement.
      </oui-message>

      <div class="mt-auto flex flex-wrap items-center justify-center gap-4">
        @if (selectedPlan) {
          <oui-button
            variant="accent"
            (click)="retryCheckout()"
            [disabled]="isSubmitting()"
          >
            Relancer le paiement
          </oui-button>
        }
        <oui-button
          class="!w-fit"
          (click)="router.navigate(['/pro'])"
          [variant]="selectedPlan ? 'outline' : 'accent'"
        >
          Retour à l'espace pro
        </oui-button>

        @if (isSubmitting()) {
          <icon-refresh class="text-primary-600 size-5 animate-spin" />
        }
      </div>
    </oui-eve>
  `,
  imports: [
    EveComponent,
    MessageComponent,
    ButtonComponent,
    IconWarningComponent,
    IconRefreshComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingCancelPage {
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly stripeCheckoutService = inject(StripeCheckoutService);

  protected readonly isSubmitting = signal(false);

  protected readonly subscriptionFromUrl = signal<ProSubscription | null>(
    this.parseSubscription(
      this.route.snapshot.queryParamMap.get("subscription"),
    ),
  );

  protected readonly referencedPlan = computed(() => {
    const subscription = this.subscriptionFromUrl();
    if (!subscription) {
      return null;
    }

    return getProPlan(subscription) ?? null;
  });

  protected readonly pageSubtitle = computed(() => {
    const plan = this.referencedPlan();
    if (plan) {
      return `Vous avez interrompu le paiement pour l'offre ${plan.name}.`;
    }

    return "Vous avez interrompu le processus de paiement avant validation.";
  });

  protected async retryCheckout(
    subscription: ProSubscription | null = this.subscriptionFromUrl(),
  ): Promise<void> {
    if (!subscription) {
      this.toastService.open(
        "info",
        "Relancer le paiement",
        "Sélectionnez une formule ci-dessous pour relancer votre paiement Stripe.",
      );
      return;
    }

    try {
      this.isSubmitting.set(true);

      await this.stripeCheckoutService.redirectToCheckout(subscription);
    } catch (err) {
      this.toastService.openError("Relancer le paiement", err);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private parseSubscription(value: string | null): ProSubscription | null {
    if (!value) {
      return null;
    }

    const normalized = value.toLowerCase();
    const match = (Object.values(ProSubscription) as ProSubscription[]).find(
      (candidate) => candidate.toLowerCase() === normalized,
    );

    return match ?? null;
  }
}
