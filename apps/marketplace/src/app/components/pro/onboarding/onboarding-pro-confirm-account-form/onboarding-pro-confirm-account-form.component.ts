import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import {
  getProPlan,
  missingInformation,
  ProSubscription,
} from "@optee/constants";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { unreachable } from "@optee/utils";
import { InputOtpModule } from "primeng/inputotp";
import z from "zod";
import trpcClient from "../../../../../trpc-client";
import type { BillingInfoFormGroup } from "../../../../feats/prospect/components/billing-info-form/billing-info-form.component";
import {
  BillingInfoFormComponent,
  createBillingInfoForm,
} from "../../../../feats/prospect/components/billing-info-form/billing-info-form.component";
import { ProSubscriptionCardComponent } from "../../../../feats/prospect/components/pro-subscription-card/pro-subscription-card.component";
import { ProSubscriptionPickerComponent } from "../../../../feats/prospect/components/pro-subscription-picker/pro-subscription-picker.component";
import { StripeCheckoutService } from "../../../../feats/prospect/services/stripe-checkout.service";
import { AppService } from "../../../../services/app.service";
import { TrackingService } from "../../../../services/tracking.service";
import { SupabaseService } from "../../../../supabase.service";

@Component({
  selector: "mkp-onboarding-pro-confirm-account-form",
  template: `
    <form
      class="flex w-full flex-col gap-6"
      (ngSubmit)="onSubmit()"
      [formGroup]="proForm"
    >
      <!-- Abonnement -->
      <div class="flex flex-col gap-2">
        <h2
          class="text-granite-500 flex items-center gap-2 text-sm font-medium leading-5 tracking-[0.28px]"
        >
          Choix de l'abonnement
        </h2>
        @if (showOtherPlans()) {
          <mkp-pro-subscription-picker
            mode="form"
            showFreePlan
            (selectedSubscription)="subscriptionId.set($event)"
            [highlightedSubscription]="highlightedSubscription()"
          />
        } @else {
          @if (highlightedPlan(); as plan) {
            <mkp-pro-subscription-card [subscription]="plan" />
          }
          <button
            class="text-granite-400 hover:bg-granite-100 bg-granite-50 w-full rounded-lg px-4 py-2 text-sm font-medium transition-all"
            type="button"
            (click)="showOtherPlans.set(true)"
          >
            Voir les autres formules
          </button>
        }
      </div>

      <!-- Infos de facturation -->
      @if (requiresBillingInfo()) {
        <div class="flex flex-col gap-2">
          <h3 class="text-granite-600 text-sm font-medium">
            Informations de facturation
          </h3>

          <mkp-billing-info-form [form]="billingForm" />
        </div>
      }

      <oui-form-field
        class="flex-1"
        name="otp"
        [control]="proForm.controls.otp"
      >
        <div class="flex flex-col gap-2">
          <h2
            class="text-granite-500 flex items-center gap-2 text-sm font-medium leading-5 tracking-[0.28px]"
          >
            Confirmation de votre email
          </h2>
          <p-inputotp
            class="mx-auto my-0.5 w-fit"
            [formControl]="proForm.controls.otp"
            [integerOnly]="true"
            [length]="6"
          />
          <p class="text-center text-xs text-gray-600">
            Merci de confirmer le code envoyé à votre email.
          </p>
        </div>
      </oui-form-field>

      <oui-button
        class="w-full"
        full
        type="submit"
        variant="accent"
        [disabled]="proForm.invalid"
      >
        Continuer
      </oui-button>
    </form>
  `,
  imports: [
    FormFieldComponent,
    ReactiveFormsModule,
    InputOtpModule,
    ProSubscriptionPickerComponent,
    ProSubscriptionCardComponent,
    ButtonComponent,
    BillingInfoFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingProConfirmAccountFormComponent {
  readonly credentials = input.required<{ email: string; password: string }>();
  readonly subscriptionId = model.required<string | null>();

  private readonly router = inject(Router);
  private readonly appService = inject(AppService);
  private readonly toastService = inject(ToastService);
  private readonly trackingService = inject(TrackingService);
  private readonly stripeCheckoutService = inject(StripeCheckoutService);

  protected readonly billingForm: BillingInfoFormGroup =
    createBillingInfoForm();

  protected readonly highlightedSubscription = computed<ProSubscription | null>(
    () => {
      const subId = this.subscriptionId();
      if (!subId) {
        return null;
      }
      const capitalizedId = subId.charAt(0).toUpperCase() + subId.slice(1);
      return (
        z.nativeEnum(ProSubscription).safeParse(capitalizedId)?.data ?? null
      );
    },
  );

  protected readonly highlightedPlan = computed(() => {
    const sub = this.highlightedSubscription();
    if (!sub) {
      return null;
    }
    return getProPlan(sub) ?? null;
  });

  protected readonly requiresBillingInfo = computed(
    () =>
      this.highlightedSubscription() !== null &&
      this.highlightedSubscription() !== ProSubscription.FREE,
  );

  protected readonly showOtherPlans = linkedSignal(
    () => this.highlightedSubscription() === null,
  );

  readonly proForm = new FormGroup({
    otp: new FormControl("", {
      validators: [
        Validators.required,
        Validators.pattern(/^\d{6}$/), // Validates that OTP is exactly 6 digits
      ],
      nonNullable: true,
    }),
    billing: this.billingForm,
  });

  protected async onSubmit(): Promise<void> {
    if (this.proForm.invalid) {
      this.proForm.markAllAsTouched();
      this.billingForm.markAllAsTouched();
      return;
    }

    const ctxMessage = "Accès plateforme";
    this.appService.loadingMessage.set({
      title: ctxMessage,
      text: "Création de votre compte…",
    });
    this.appService.isLoading.set(true);

    const { email, password } = this.credentials();
    const billingInfo = this.billingForm.getRawValue();

    try {
      await SupabaseService.signIn(email, password);

      const pro = this.proForm.getRawValue();

      const onboardRes = await trpcClient.pros.onboard.mutate({
        pro: {
          email,
          ...billingInfo,
        },
        OTP: pro.otp,
      });

      switch (onboardRes) {
        case "success": {
          this.trackingService.trackConversionSignup();
          const sub = this.highlightedSubscription();
          if (sub && sub !== ProSubscription.FREE) {
            await this.stripeCheckoutService.redirectToCheckout(sub);
            return;
          }

          this.router.navigate(["/pro"]);

          this.toastService.open(
            "success",
            ctxMessage,
            "Vous pouvez désormais accéder à l'interface 🎉.",
          );

          break;
        }
        case "missing_contact": {
          this.toastService.open(
            "error",
            ctxMessage,
            "Merci de créer votre compte.",
          );

          await this.router.navigate(["/onboarding-pro"]);

          break;
        }
        case "missing_email": {
          this.toastService.open("error", ctxMessage, missingInformation);

          await this.router.navigate(["/onboarding-pro"]);

          break;
        }
        case "invalid_otp": {
          this.toastService.open(
            "error",
            ctxMessage,
            "Le code reçu par mail est invalide. Nous vous en avons envoyé un nouveau. Veuillez vérifier votre boîte de réception.",
          );

          // On remet le champ OTP à zéro sans ré‑émettre, pour permettre une nouvelle saisie
          const otpControl = this.proForm.controls.otp;
          otpControl.setValue("", { emitEvent: false });
          otpControl.markAsDirty();
          otpControl.markAsTouched();

          break;
        }
        case "already_onboarded": {
          // If the user is already onboarded, we redirect them
          await this.router.navigate(["/"]);

          break;
        }
        default: {
          unreachable(onboardRes);
        }
      }
    } catch (error) {
      this.toastService.openError(ctxMessage, error);
    } finally {
      this.appService.isLoading.set(false);
      this.appService.resetMessage();
    }
  }
}
