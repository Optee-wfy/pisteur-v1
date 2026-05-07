import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { PRO_PLANS, ProSubscription } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import { environment } from "@optee/env";
import { IconRefreshComponent } from "@optee/icons";
import { ToastService } from "@optee/ui/services/toast.service";
import { ProService } from "../../../../services/pro.service";
import { StripeCheckoutService } from "../../services/stripe-checkout.service";
import { BillingInfoDialogComponent } from "../billing-info-dialog/billing-info-dialog.component";
import { ProSubscriptionCardComponent } from "../pro-subscription-card/pro-subscription-card.component";

@Component({
  selector: "mkp-pro-subscription-picker",
  host: { class: "flex flex-col gap-2" },
  template: `
    <div [class]="gridClasses()">
      @for (plan of buyablePlans(); track plan.subscription) {
        <mkp-pro-subscription-card
          showChooseButton
          (chose)="choosePlan($event)"
          [disabled]="loading()"
          [highlighted]="highlightedSubscription() === plan.subscription"
          [subscription]="plan"
        />
      }
    </div>

    @if (showFreePlan()) {
      <p
        class="hover:bg-granite-100 bg-granite-50 border-granite-100 text-granite-400 cursor-pointer rounded-lg border p-2 text-center text-sm"
        (click)="choosePlan(freeSub)"
      >
        Continuer avec la version d'essai (25 crédits/mois).
      </p>
    }

    @if (loading()) {
      <div
        class="text-granite-400 flex w-full items-center justify-center gap-2 px-3 py-1"
      >
        <icon-refresh class="text-granite-400 size-5 animate-spin" />
        <span>Chargement du paiement Stripe...</span>
      </div>
    }

    @if (!isProductionMode) {
      <p class="text-center text-sm italic text-gray-600">
        Pour tester en
        <strong>mode preview</strong>
        , choisissez l'une des
        <a
          class="text-blue-600 underline"
          rel="noopener noreferrer"
          target="_blank"
          [href]="testingCardsUrl"
        >
          cartes fournies par Stripe
        </a>
      </p>
    }
  `,
  imports: [ProSubscriptionCardComponent, IconRefreshComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProSubscriptionPickerComponent {
  readonly mode = input<"form" | "stripe">("stripe");
  readonly highlightedSubscription = model<ProSubscription | null>(null);
  readonly showFreePlan = input(false, { transform: booleanAttribute });

  readonly selectedSubscription = output<ProSubscription | null>();
  protected readonly freeSub = ProSubscription.FREE;

  private readonly proService = inject(ProService);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);
  private readonly stripeCheckoutService = inject(StripeCheckoutService);

  protected readonly isProductionMode = environment.slug === "production";
  protected readonly testingCardsUrl =
    "https://docs.stripe.com/testing?locale=fr-FR#cards";

  protected readonly loading = signal(false);
  private readonly pro = toSignal(this.proService.pro$, { initialValue: null });

  protected readonly hasMissingBillingInfo = computed(() => {
    const pro = this.pro();
    if (!pro) {
      return true;
    }

    return !pro.name || !pro.siret || !pro.street || !pro.zipcode || !pro.city;
  });

  protected readonly buyablePlans = computed(() => [
    ...PRO_PLANS.filter((s) => s.buyable).filter(
      (s) => s.subscription !== this.proService.subscription(),
    ),
  ]);

  protected readonly gridClasses = computed(() => {
    const count = this.buyablePlans().length;
    const xlCols = count <= 2 ? "xl:grid-cols-2" : "xl:grid-cols-3";
    return `grid grid-cols-1 gap-4 md:grid-cols-2 ${xlCols}`;
  });

  async choosePlan(subscription: ProSubscription) {
    if (this.mode() === "form") {
      this.selectedSubscription.emit(subscription);
      this.highlightedSubscription.set(subscription);
      return;
    }
    try {
      this.loading.set(true);
      if (this.hasMissingBillingInfo()) {
        await this.dialogService.open(BillingInfoDialogComponent);
      }
      await this.stripeCheckoutService.redirectToCheckout(subscription);
    } catch (error) {
      this.toastService.openError("Changement de formule", error);
    } finally {
      this.loading.set(false);
    }
  }
}
