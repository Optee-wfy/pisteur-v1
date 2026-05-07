import { ChangeDetectionStrategy, Component } from "@angular/core";
import type { ProSubscription } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";

export type AdminProOnboardingPaymentLink = {
  subscription: ProSubscription;
  label: string;
  url: string;
};

@Component({
  selector: "mkp-admin-pro-payment-links-dialog",
  template: `
    <op-dialog-wrapper class="!w-[720px]" (crossClick)="dialogRef.close(null)">
      <op-dialog-heading heading="Liens de paiements onboarding">
        <p class="text-sm text-gray-600">
          Utilisez ces URLs pour préremplir l'abonnement à l'onboarding.
        </p>
      </op-dialog-heading>

      <div class="max-h-[60vh] space-y-3 overflow-y-auto">
        @for (link of data.links; track link.subscription) {
          <div
            class="border-granite-100 flex flex-col gap-1 rounded-lg border p-3"
          >
            <span class="text-sm font-medium">{{ link.label }}</span>
            <a
              class="text-primary-700 break-all text-sm underline"
              rel="noopener noreferrer"
              target="_blank"
              [href]="link.url"
            >
              {{ link.url }}
            </a>
          </div>
        }
      </div>

      <footer class="mt-6 flex items-center justify-end gap-2">
        <oui-button type="button" variant="primary" (click)="dialogRef.close(null)">
          Fermer
        </oui-button>
      </footer>
    </op-dialog-wrapper>
  `,
  imports: [ButtonComponent, DialogHeadingComponent, DialogWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProPaymentLinksDialogComponent extends StronglyTypedDialog<
  { links: AdminProOnboardingPaymentLink[] },
  null
> {}

