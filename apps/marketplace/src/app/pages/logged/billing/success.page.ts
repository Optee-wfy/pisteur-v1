import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  IconErrorComponent,
  IconRefreshComponent,
  IconSuccessComponent,
} from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isTRPCClientError, trpcClient } from "../../../../trpc-client";

import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { ProSubscriptionCardComponent } from "../../../feats/prospect/components/pro-subscription-card/pro-subscription-card.component";
import { StripeCheckoutService } from "../../../feats/prospect/services/stripe-checkout.service";

@Component({
  selector: "mkp-billing-success-page",
  host: {
    class: "flex  justify-center bg-gray-50 p-4 md:p-10",
  },
  template: `
    @let session = sessionResource.value();

    <oui-eve class="flex w-full max-w-4xl flex-col gap-6">
      @if (sessionResource.isLoading()) {
        <oui-loader
          label="Vérification de votre session de paiement... Merci de patienter."
        />
      } @else {
        <header class="flex items-center gap-3 border-b border-gray-100">
          @if (session?.status === "success") {
            <icon-success class="size-10" colorMode="colored" />
          } @else if (session?.status === "pending") {
            <icon-refresh class="size-10 animate-spin text-gray-600" />
          } @else {
            <icon-error class="size-10 text-red-400" />
          }

          <div class="flex flex-col gap-1">
            <h1 class="text-2xl font-semibold">
              {{ statusCopy()?.title ?? "Validation de votre paiement" }}
            </h1>
            <p class="text-sm text-gray-600">
              {{
                statusCopy()?.subtitle ??
                  "Une erreur est survenue lors de la validation de votre paiement."
              }}
            </p>
          </div>
        </header>

        @let errorMsg = sessionErrorMessage();

        @if (!sessionId() || errorMsg || !session) {
          <oui-message
            severity="error"
            summary="Validation du paiement impossible"
          >
            {{
              errorMsg ??
                "Session invalide. Merci de relancer votre paiement depuis l'espace abonnement."
            }}
          </oui-message>

          <oui-button
            class="mx-auto mt-auto !w-fit"
            variant="primary"
            (click)="navigateToDashboard()"
          >
            Retour à l'espace pro
          </oui-button>
        } @else {
          <section class="flex flex-col gap-4">
            @if (session.status === "success") {
              <oui-message severity="success">
                Votre paiement est validé et votre abonnement est activé.
              </oui-message>
            } @else if (session.status === "pending") {
              <oui-message severity="info">
                Le paiement est en cours de confirmation. Vous pouvez patienter
                ou relancer le paiement si la page ne se met pas à jour.
              </oui-message>
            } @else {
              <oui-message severity="error">
                Nous n'avons pas pu confirmer ce paiement. Relancez le paiement
                ou contactez le support si le problème persiste.
              </oui-message>
            }

            <div
              class="flex flex-col gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <div class="flex flex-col gap-2">
                <p class="text-sm font-medium">Formule sélectionnée</p>

                @if (session.plan) {
                  <mkp-pro-subscription-card [subscription]="session.plan" />
                } @else {
                  <p class="text-sm text-gray-600">
                    Impossible d'identifier la formule associée à cette session.
                  </p>
                }
              </div>

              <div class="flex flex-col gap-2">
                <p class="text-sm font-medium">Détails du paiement</p>
                <ul class="space-y-2 text-sm">
                  <li class="flex justify-between gap-3">
                    <span class="text-gray-500">Statut paiement</span>
                    <span class="font-medium capitalize">
                      {{ session.paymentStatus }}
                    </span>
                  </li>
                  <li class="flex justify-between gap-3">
                    <span class="text-gray-500">Statut abonnement</span>
                    <span class="font-medium capitalize">
                      {{ session.subscriptionStatus ?? "en attente" }}
                    </span>
                  </li>
                  @if (sessionId()) {
                    <li class="flex justify-between gap-3">
                      <span class="text-gray-500">Session</span>
                      <span class="font-mono text-xs text-gray-800">
                        {{ sessionId() }}
                      </span>
                    </li>
                  }
                  @if (amountText(); as amount) {
                    <li class="flex justify-between gap-3">
                      <span class="text-gray-500">Montant</span>
                      <span class="font-semibold text-gray-900">
                        {{ amount }}
                      </span>
                    </li>
                  }
                  @if (session.customerEmail) {
                    <li class="flex justify-between gap-3">
                      <span class="text-gray-500">Email client</span>
                      <span class="font-medium">
                        {{ session.customerEmail }}
                      </span>
                    </li>
                  }
                </ul>
              </div>
            </div>

            <div class="mx-auto mt-auto flex flex-wrap items-center gap-4">
              @let mustRetry =
                session.status !== "success" && session.plan?.subscription;
              <oui-button
                (click)="navigateToDashboard()"
                [variant]="mustRetry ? 'outline' : 'accent'"
              >
                Retourner à l'espace pro
              </oui-button>

              @if (mustRetry) {
                <oui-button
                  variant="accent"
                  (click)="retryCheckout()"
                  [disabled]="submitting()"
                >
                  Relancer le paiement
                </oui-button>
              }
            </div>
          </section>
        }
      }
    </oui-eve>
  `,
  imports: [
    EveComponent,
    MessageComponent,
    ButtonComponent,
    IconSuccessComponent,
    IconRefreshComponent,
    IconErrorComponent,
    ProSubscriptionCardComponent,
    LoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingSuccessPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly stripeCheckoutService = inject(StripeCheckoutService);

  protected readonly sessionId = signal<string | null>(
    this.route.snapshot.queryParamMap.get("session_id"),
  );

  protected readonly submitting = signal(false);

  protected readonly sessionResource = resource({
    params: () => this.sessionId(),
    loader: async ({ params: sessionId }) => {
      if (!sessionId) {
        throw new Error("missing_session_id");
      }

      return await trpcClient.stripe.getCheckoutSession.query({
        sessionId,
      });
    },
  });

  protected readonly sessionErrorMessage = computed(() => {
    const error = this.sessionResource.error();
    if (!error) {
      return null;
    }

    if (error instanceof Error && error.message === "missing_session_id") {
      return "La session de paiement est manquante dans l'URL.";
    }

    if (isTRPCClientError(error)) {
      return error.message;
    }

    return "Impossible de vérifier votre paiement. Merci de réessayer.";
  });

  protected readonly statusCopy = computed(() => {
    const session = this.sessionResource.value();
    if (!session) {
      return null;
    }

    switch (session.status) {
      case "success":
        return {
          title: "Paiement confirmé",
          subtitle: "Votre abonnement est désormais actif.",
        } as const;

      case "pending":
        return {
          title: "Paiement en attente",
          subtitle:
            "Stripe n'a pas encore confirmé le paiement. Vous pouvez patienter ou relancer le paiement.",
        } as const;

      default:
        return {
          title: "Paiement non validé",
          subtitle:
            "Nous n'avons pas pu valider ce paiement. Vous pouvez le relancer ou revenir à votre espace.",
        } as const;
    }
  });

  protected readonly amountText = computed(() => {
    const session = this.sessionResource.value();
    if (!session || session.amountTotal == null) {
      return null;
    }

    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: (session.currency ?? "eur").toUpperCase(),
    }).format(session.amountTotal / 100);
  });

  protected async retryCheckout(): Promise<void> {
    const planSubscription = this.sessionResource.value()?.plan?.subscription;
    if (!planSubscription) {
      this.toastService.open(
        "error",
        "Relancer le paiement",
        "Aucune formule n'est associée à cette session.",
      );
      return;
    }

    try {
      if (this.submitting()) {
        return;
      }
      this.submitting.set(true);
      await this.stripeCheckoutService.redirectToCheckout(planSubscription);
    } catch (err) {
      this.toastService.openError("Relancer le paiement", err);
    } finally {
      this.submitting.set(false);
    }
  }

  protected navigateToDashboard(): void {
    this.router.navigate(["/pro"]);
  }
}
