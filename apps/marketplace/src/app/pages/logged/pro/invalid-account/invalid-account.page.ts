import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { buildAssetUrl, ProSubscription } from "@optee/constants";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { ProSubscriptionPickerComponent } from "../../../../feats/prospect/components/pro-subscription-picker/pro-subscription-picker.component";
import { ProService } from "../../../../services/pro.service";

@Component({
  selector: "mkp-invalid-account-page",
  host: { class: "flex h-full items-center justify-center" },
  template: `
    <oui-eve
      class="mx-auto flex max-w-screen-lg flex-col items-center justify-center gap-8 p-10 text-center"
    >
      <img class="w-full max-w-36" alt="Pisteur Logo" [src]="pisterUrl" />

      <div class="flex flex-col gap-4">
        <h1 class="text-granite-900 text-2xl font-bold">Il y a un souci</h1>
        <p class="max-w-prose text-gray-600">{{ text() }}</p>
      </div>

      @if (canResumeSubscription()) {
        <div class="flex w-full max-w-xl flex-col items-center gap-3">
          @if (!showSubscriptionForm()) {
            <oui-button
              variant="accent"
              (click)="showSubscriptionForm.set(true)"
            >
              Reprendre mon abonnement
            </oui-button>
          } @else {
            <div class="w-full">
              <mkp-pro-subscription-picker />
            </div>
          }
        </div>
      }

      <oui-button
        class="mt-auto"
        href="mailto:support@optee.com"
        variant="outline"
      >
        Nous contacter
      </oui-button>
    </oui-eve>
  `,
  imports: [EveComponent, ButtonComponent, ProSubscriptionPickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvalidAccountPage {
  private readonly proService = inject(ProService);
  private readonly router = inject(Router);

  protected readonly pro = toSignal(this.proService.pro$, {
    initialValue: null,
  });

  private readonly redirectIfValidAccount = effect(() => {
    const pro = this.pro();
    const hasActiveSubscription =
      pro?.subscription &&
      pro.subscription !== ProSubscription.UNPAID &&
      pro.subscription !== ProSubscription.RESIGNED;

    if (
      pro?.status === "Actif" &&
      hasActiveSubscription &&
      this.router.url !== "/pro"
    ) {
      this.router.navigateByUrl("/pro", { replaceUrl: true });
    }
  });

  protected readonly showSubscriptionForm = signal(false);
  protected readonly pisterUrl = buildAssetUrl("pister.svg");

  protected readonly text = computed(() => {
    const pro = this.pro();

    if (!pro) {
      return "Aucun compte trouvé. Merci de contacter le support.";
    }

    if (pro.status !== "Actif") {
      return "Votre compte est actuellement inactif. Merci de contacter le support.";
    }

    switch (pro.subscription) {
      case null:
        return "Il semblerait que vous n’ayez pas d’abonnement actif.\nContactez nos équipes pour régulariser votre situation et accéder à la plateforme. ";
      default:
        return "Il semblerait qu’il y ait un problème avec vos données de facturation actuelles.\nContactez-nous pour régulariser la situation.";
    }
  });

  protected readonly canResumeSubscription = computed(() => {
    const pro = this.pro();
    if (!pro) {
      return false;
    }

    return (
      pro.subscription === null ||
      pro.subscription === ProSubscription.RESIGNED ||
      pro.subscription === ProSubscription.UNPAID ||
      ["canceled", "past_due", "unpaid"].includes(
        pro.stripeSubscriptionStatus ?? "",
      )
    );
  });
}
