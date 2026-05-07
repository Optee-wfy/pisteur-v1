import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { Select } from "primeng/select";

export type AdminProStripePriceOption = {
  label: string;
  value: string;
};

@Component({
  selector: "mkp-admin-pro-stripe-customer-dialog",
  template: `
    <op-dialog-wrapper class="!w-[520px]" (crossClick)="dialogRef.close(null)">
      <op-dialog-heading heading="Renseigner les identifiants Stripe">
        <p class="text-sm text-gray-600">
          {{ data.proName ?? "Pro sans nom" }}
        </p>
      </op-dialog-heading>

      <div class="space-y-3">
        <label class="text-sm font-medium" for="stripeCustomerId">
          Customer ID Stripe
        </label>
        <input
          class="border-granite-100 hover:border-granite-400 w-full rounded-lg border px-3 py-2 text-sm transition-all"
          id="stripeCustomerId"
          placeholder="Ex: cus_123456789"
          type="text"
          [formControl]="stripeCustomerIdControl"
        />
        @if (
          stripeCustomerIdControl.invalid &&
          (stripeCustomerIdControl.dirty || stripeCustomerIdControl.touched)
        ) {
          <p class="text-sm text-red-600">
            Merci de renseigner un customer_id Stripe valide.
          </p>
        }

        <label class="text-sm font-medium" for="stripeSubscriptionId">
          Subscription ID Stripe
        </label>
        <input
          class="border-granite-100 hover:border-granite-400 w-full rounded-lg border px-3 py-2 text-sm transition-all"
          id="stripeSubscriptionId"
          placeholder="Ex: sub_123456789"
          type="text"
          [formControl]="stripeSubscriptionIdControl"
        />
        @if (
          stripeSubscriptionIdControl.invalid &&
          (stripeSubscriptionIdControl.dirty ||
            stripeSubscriptionIdControl.touched)
        ) {
          <p class="text-sm text-red-600">
            Merci de renseigner un subscription_id Stripe valide.
          </p>
        }

        <label class="text-sm font-medium" for="stripeCurrentPlanPriceId">
          Abonnement Stripe
        </label>
        <p-select
          class="w-full"
          appendTo="body"
          inputId="stripeCurrentPlanPriceId"
          optionLabel="label"
          optionValue="value"
          placeholder="Choisir un abonnement"
          [formControl]="stripeCurrentPlanPriceIdControl"
          [options]="priceOptions"
        />
        @if (
          stripeCurrentPlanPriceIdControl.invalid &&
          (stripeCurrentPlanPriceIdControl.dirty ||
            stripeCurrentPlanPriceIdControl.touched)
        ) {
          <p class="text-sm text-red-600">
            Merci de sélectionner un abonnement Stripe.
          </p>
        }
      </div>

      <footer class="mt-6 flex items-center justify-end gap-2">
        <button
          class="text-primary-700 inline-block text-center underline underline-offset-1"
          type="button"
          (click)="dialogRef.close(null)"
        >
          Annuler
        </button>
        <oui-button
          type="button"
          variant="primary"
          (click)="confirm()"
          [disabled]="
            stripeCustomerIdControl.invalid ||
            stripeSubscriptionIdControl.invalid ||
            stripeCurrentPlanPriceIdControl.invalid
          "
        >
          Enregistrer
        </oui-button>
      </footer>
    </op-dialog-wrapper>
  `,
  imports: [
    ButtonComponent,
    DialogHeadingComponent,
    DialogWrapperComponent,
    ReactiveFormsModule,
    Select,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProStripeCustomerDialogComponent extends StronglyTypedDialog<
  {
    proName: string | null;
    currentStripeCustomerId: string | null;
    currentStripeSubscriptionId: string | null;
    currentStripeCurrentPlanPriceId: string | null;
    stripePriceOptions: AdminProStripePriceOption[];
  },
  {
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripeCurrentPlanPriceId: string;
  } | null
> {
  protected readonly stripeCustomerIdControl = new FormControl<string>(
    this.data.currentStripeCustomerId ?? "",
    {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^cus_[\w]+$/)],
    },
  );

  protected readonly stripeSubscriptionIdControl = new FormControl<string>(
    this.data.currentStripeSubscriptionId ?? "",
    {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^sub_[\w]+$/)],
    },
  );

  protected readonly priceOptions: AdminProStripePriceOption[] = (() => {
    const options = [...this.data.stripePriceOptions];
    const currentPriceId = this.data.currentStripeCurrentPlanPriceId;
    if (
      !currentPriceId ||
      options.some((option) => option.value === currentPriceId)
    ) {
      return options;
    }

    return [
      { label: `Prix actuel (${currentPriceId})`, value: currentPriceId },
      ...options,
    ];
  })();

  protected readonly stripeCurrentPlanPriceIdControl = new FormControl<
    string | null
  >(this.data.currentStripeCurrentPlanPriceId ?? null, {
    validators: [Validators.required],
  });

  protected confirm() {
    const stripeCustomerId = this.stripeCustomerIdControl.value.trim();
    const stripeSubscriptionId = this.stripeSubscriptionIdControl.value.trim();
    const stripeCurrentPlanPriceId = this.stripeCurrentPlanPriceIdControl.value;

    if (
      !stripeCustomerId ||
      !stripeSubscriptionId ||
      !stripeCurrentPlanPriceId
    ) {
      return;
    }

    this.dialogRef.close({
      stripeCustomerId,
      stripeSubscriptionId,
      stripeCurrentPlanPriceId,
    });
  }
}
