import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import {
  buildAssetUrl,
  ONBOARDING_UTM_CAMPAIGN_QUERY_PARAM,
  ONBOARDING_UTM_CONTENT_QUERY_PARAM,
  ONBOARDING_UTM_MEDIUM_QUERY_PARAM,
  ONBOARDING_UTM_SOURCE_QUERY_PARAM,
  ONBOARDING_UTM_TERM_QUERY_PARAM,
  PUBLIC_ASSETS,
} from "@optee/constants";
import { IconSuccessComponent } from "@optee/icons";
import { ToastService } from "@optee/ui/services/toast.service";
import { unreachable } from "@optee/utils";
import trpcClient from "../../../trpc-client";
import { OnboardingProConfirmAccountFormComponent } from "../../components/pro/onboarding/onboarding-pro-confirm-account-form/onboarding-pro-confirm-account-form.component";
import OnboardingProRegisterFormComponent from "../../components/pro/onboarding/onboarding-pro-register-form/onboarding-pro-register-form.component";
import { AppService } from "../../services/app.service";

@Component({
  selector: "mkp-onboarding-pro-register-page",
  template: `
    <div class="flex w-full flex-col items-center justify-center gap-10">
      @let credentialsValue = credentials();
      @if (onboardingStep() === "register") {
        @if (variant() === "drapo") {
          <img class="w-48" alt="drapo's icon" [src]="drapoUrl" />
        }

        <div class="flex flex-wrap gap-4 lg:gap-10">
          <div class="font-display mx-auto flex w-fit flex-col gap-4">
            <p class="text-granite-700 text-lg font-medium">
              Créez votre compte et obtenez immédiatement :
            </p>

            <ul class="flex flex-col gap-3 pl-4 text-gray-600">
              <li class="flex items-center justify-start gap-3">
                <icon-success class="size-4" colorMode="colored" />
                Les bâtiments filtrables autour de vos zones
              </li>
              <li class="flex items-center justify-start gap-3">
                <icon-success class="size-4" colorMode="colored" />
                Les contacts décisionnaires associés
              </li>
              <li class="flex items-center justify-start gap-3">
                <icon-success class="size-4" colorMode="colored" />
                Les opportunités qualifiées en un clic
              </li>
            </ul>
          </div>

          <div class="flex flex-col gap-4">
            <mkp-onboarding-pro-register-form-component
              (submitted)="onRegister($event)"
            />

            <!-- <p class="font-display text-center text-sm text-gray-600 lg:text-base">
          🎯 Déjà plus de 200 professionnels utilisent Optee. Pourquoi pas vous
          ?
          <a
            class="link"
            rel="noopener noreferrer"
            target="_blank"
            [href]="SHOWCASE_URL"
          >
            En savoir plus sur Optee
          </a>
        </p> -->

            <p class="text-center text-sm">
              Déjà un compte ?
              <br />
              <a class="link" routerLink="/auth">Se connecter</a>
            </p>
          </div>
        </div>
      } @else if (credentialsValue !== null) {
        <!-- <h3 class="font-display text-center text-sm text-gray-600 lg:text-base">
          Plus qu'à confirmer votre adresse e-mail et vous pourrez commencer à
          utiliser Optee !
        </h3> -->

        <mkp-onboarding-pro-confirm-account-form
          [credentials]="credentialsValue"
          [subscriptionId]="subscriptionId()"
        />
      }
    </div>
  `,
  imports: [
    ReactiveFormsModule,
    OnboardingProRegisterFormComponent,
    RouterLink,
    OnboardingProConfirmAccountFormComponent,
    IconSuccessComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OnboardingProRegisterComponent {
  readonly variant = input<"default" | "drapo">("default");
  private readonly route = inject(ActivatedRoute);
  private readonly appService = inject(AppService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly credentials = signal<{
    email: string;
    password: string;
  } | null>(null);

  protected readonly subscriptionId = signal<string | null>(
    this.route.snapshot.queryParamMap.get("subscription"),
  );

  protected readonly drapoUrl = buildAssetUrl(PUBLIC_ASSETS.PARTNERS_DRAPO);
  protected readonly SHOWCASE_URL =
    "https://info.pisteur.io/batiscope-demo?hs_preview=eWNfefqO-292458909911On";

  protected readonly onboardingStep = signal<"register" | "confirmation">(
    "register",
  );

  async onRegister(form: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    password: string;
  }) {
    const ctxMessage = "Accès plateforme";

    try {
      this.appService.isLoading.set(true);

      const dto = {
        contact: form,
        utmData: {
          utmTerm:
            this.route.snapshot.queryParams[ONBOARDING_UTM_TERM_QUERY_PARAM],
          utmMedium:
            this.route.snapshot.queryParams[ONBOARDING_UTM_MEDIUM_QUERY_PARAM],
          utmSource:
            this.variant() !== "drapo"
              ? this.route.snapshot.queryParams[
                  ONBOARDING_UTM_SOURCE_QUERY_PARAM
                ]
              : "drapo_partner",
          utmContent:
            this.route.snapshot.queryParams[ONBOARDING_UTM_CONTENT_QUERY_PARAM],
          utmCampaign:
            this.route.snapshot.queryParams[
              ONBOARDING_UTM_CAMPAIGN_QUERY_PARAM
            ],
        },
      };

      const onboardRes = await trpcClient.contacts.onboard.mutate(dto);

      switch (onboardRes) {
        case "email_sent": {
          this.toastService.open(
            "success",
            ctxMessage,
            "Veuillez vérifier votre boîte mail pour valider votre compte.",
          );

          this.credentials.set({
            email: dto.contact.email,
            password: dto.contact.password,
          });
          this.onboardingStep.set("confirmation");

          break;
        }
        case "already_logged_in": {
          this.toastService.open(
            "info",
            ctxMessage,
            "Vous êtes déjà connecté. Déconnectez-vous pour créer un autre compte.",
          );

          await this.router.navigate(["/"]);

          break;
        }
        default: {
          unreachable(onboardRes);
        }
      }
    } catch (e) {
      this.toastService.openError(ctxMessage, e);
    } finally {
      this.appService.isLoading.set(false);
    }
  }
}
