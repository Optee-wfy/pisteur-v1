import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import type {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import type { ContactJobType } from "@optee/constants";
import {
  buildAssetUrl,
  CONTACT_ACTIVITY_SECTORS,
  CONTACT_JOB_TYPES,
  getOnboardingPath,
  ONBOARDING_PARTNER_QUERY_PARAM,
  ONBOARDING_UTM_CAMPAIGN_QUERY_PARAM,
  ONBOARDING_UTM_CONTENT_QUERY_PARAM,
  ONBOARDING_UTM_MEDIUM_QUERY_PARAM,
  ONBOARDING_UTM_SOURCE_QUERY_PARAM,
  ONBOARDING_UTM_TERM_QUERY_PARAM,
  PHONE_PATTERN,
} from "@optee/constants";
import { DialogService } from "@optee/dialog";
import {
  IconArrowLeftComponent,
  IconBoltComponent,
  IconEyeComponent,
  IconEyeSlashComponent,
} from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { refreshFormFieldValidity } from "@optee/ui/functions/refresh-form-field-validity.fn";
import { ToastService } from "@optee/ui/services/toast.service";
import { unreachable } from "@optee/utils";
import { FloatLabel } from "primeng/floatlabel";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { Select } from "primeng/select";
import trpcClient from "../../../trpc-client";
import { AppService } from "../../services/app.service";
import { TrackingService } from "../../services/tracking.service";
import { SupabaseService } from "../../supabase.service";
import { checkPasswordComplexity } from "../validators/password-validity.validator";

@Component({
  selector: "mkp-onboarding-contact-form",
  host: {
    class:
      "block bg-primary-700 relative mt-8 max-w-[600px] rounded-xl p-6 text-white",
  },
  template: `
    <form class="flex flex-col gap-4 lg:gap-6" [formGroup]="contactForm">
      <div class="flex flex-wrap gap-4 lg:gap-6">
        <oui-form-field
          class="flex-auto"
          name="firstName"
          darkMode
          [control]="contactForm.controls.firstName"
        >
          <p-floatlabel variant="in">
            <input
              id="firstName"
              fluid
              pInputText
              required
              type="text"
              [formControl]="contactForm.controls.firstName"
            />
            <label for="in_label">Prénom</label>
          </p-floatlabel>
        </oui-form-field>

        <oui-form-field
          class="flex-auto"
          name="lastName"
          darkMode
          [control]="contactForm.controls.lastName"
        >
          <p-floatlabel variant="in">
            <input
              id="lastName"
              fluid
              pInputText
              required
              type="text"
              [formControl]="contactForm.controls.lastName"
            />
            <label for="in_label">Nom</label>
          </p-floatlabel>
        </oui-form-field>
      </div>

      <div class="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <oui-form-field
          class="flex-1"
          name="email"
          darkMode
          [control]="contactForm.controls.email"
        >
          <p-floatlabel variant="in">
            <input
              id="email"
              fluid
              pInputText
              required
              type="email"
              [formControl]="contactForm.controls.email"
            />
            <label for="in_label">Adresse mail</label>
          </p-floatlabel>
        </oui-form-field>

        <oui-form-field
          class="flex-1"
          name="password"
          darkMode
          [control]="contactForm.controls.password"
        >
          <p-floatlabel variant="in">
            <p-iconfield>
              <input
                class="flex-1"
                id="password"
                fluid
                pInputText
                required
                [formControl]="contactForm.controls.password"
                [type]="passwordInputType()"
              />

              <p-inputicon class="size-5">
                <button
                  class="text-white"
                  type="button"
                  aria-label="Toggle password visibility"
                  (click)="passwordVisible.set(!this.passwordVisible())"
                >
                  @if (this.passwordVisible()) {
                    <icon-eye colorMode="colored" />
                  } @else {
                    <icon-eye-slash colorMode="colored" />
                  }
                </button>
              </p-inputicon>
            </p-iconfield>
            <label for="in_label">Mot de passe</label>
          </p-floatlabel>
        </oui-form-field>
      </div>

      <oui-form-field
        class="flex-1"
        name="phone"
        darkMode
        [control]="contactForm.controls.phone"
      >
        <p-floatlabel variant="in">
          <input
            id="phone"
            fluid
            pInputText
            required
            type="tel"
            [formControl]="contactForm.controls.phone"
          />
          <label for="in_label">Numéro de téléphone</label>
        </p-floatlabel>
      </oui-form-field>

      @if (session$ | async; as session) {
        <div
          class="flex items-center justify-center gap-1 text-center text-sm text-white sm:text-base"
        >
          <icon-arrow-left class="size-4 rotate-90" />

          <div class="cursor-pointer underline" (click)="signOut()">
            Ce n'est pas vous ? Cliquez ici pour vous déconnecter
          </div>

          <icon-arrow-left class="size-4 rotate-90" />
        </div>
      }

      <div class="flex flex-wrap gap-4 lg:gap-6">
        <oui-form-field
          class="min-w-64 flex-1"
          name="activitySector"
          darkMode
          [control]="contactForm.controls.activitySector"
        >
          <p-floatlabel variant="in">
            <p-select
              class="w-full"
              appendTo="body"
              placeholder="Sélectionnez un secteur"
              [formControl]="contactForm.controls.activitySector"
              [options]="activitySectors"
            />
            <label for="in_label">Secteur d'activité</label>
          </p-floatlabel>
        </oui-form-field>

        <oui-form-field
          class="min-w-64 flex-1"
          name="jobType"
          darkMode
          [control]="contactForm.controls.jobType"
        >
          <p-floatlabel variant="in">
            <p-select
              class="w-full"
              appendTo="body"
              placeholder="Sélectionnez un poste"
              [formControl]="contactForm.controls.jobType"
              [options]="jobTypes"
            />
            <label for="in_label">Poste</label>
          </p-floatlabel>
        </oui-form-field>
      </div>

      <oui-button full size="large" variant="accent" (click)="createUser()">
        <icon-bolt class="size-6" />
        <div>
          Accéder à la plateforme
          <span class="xs:inline hidden">gratuitement</span>
        </div>
      </oui-button>
    </form>

    <p
      class="text-semibold mt-3 text-center leading-7 tracking-wide text-white lg:mt-6"
    >
      En vous inscrivant, vous acceptez nos
      <a class="cursor-pointer font-bold" target="_blank" [href]="cguClients">
        conditions générales
      </a>
    </p>
  `,
  imports: [
    FormFieldComponent,
    AsyncPipe,
    ReactiveFormsModule,
    ButtonComponent,
    InputText,
    IconField,
    InputIcon,
    IconEyeComponent,
    IconEyeSlashComponent,
    IconArrowLeftComponent,
    FloatLabel,
    Select,
    IconBoltComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingContactFormComponent {
  protected readonly dialogService = inject(DialogService);
  protected readonly router = inject(Router);
  protected readonly toastService = inject(ToastService);
  protected readonly appService = inject(AppService);
  protected readonly trackingService = inject(TrackingService);
  protected readonly route = inject(ActivatedRoute);

  cguClients = buildAssetUrl("CGU_Clients.pdf");

  jobTypes = [...CONTACT_JOB_TYPES].sort((a, b) => {
    if (a.value === "Autre") {
      return 1;
    }
    if (b.value === "Autre") {
      return -1;
    }
    return a.label.localeCompare(b.label);
  });

  activitySectors = [...CONTACT_ACTIVITY_SECTORS];

  session$ = SupabaseService.getSession();

  checkPasswordComplexity: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    return checkPasswordComplexity(
      control,
      "Le mot de passe doit contenir au moins 9 caractères et doit être composé d'au moins 1 lettre et 1 chiffre.",
    );
  };

  readonly contactForm = new FormGroup({
    firstName: new FormControl("", {
      validators: [Validators.required],
      nonNullable: true,
    }),
    lastName: new FormControl("", {
      validators: [Validators.required],
      nonNullable: true,
    }),
    email: new FormControl("", {
      validators: [Validators.email, Validators.required],
      nonNullable: true,
    }),
    phone: new FormControl("", {
      validators: [Validators.pattern(PHONE_PATTERN), Validators.required],
      nonNullable: true,
    }),
    jobType: new FormControl<ContactJobType | "">("", {
      validators: [Validators.required],
      nonNullable: true,
    }),
    activitySector: new FormControl("", {
      validators: [Validators.required],
      nonNullable: true,
    }),
    password: new FormControl("", {
      validators: [
        Validators.required,
        Validators.minLength(9),
        this.checkPasswordComplexity,
      ],
      nonNullable: true,
    }),
  });

  passwordVisible = signal(false);

  passwordInputType = computed(() =>
    this.passwordVisible() ? "text" : "password",
  );

  async createUser() {
    const ctxMessage = "Accès plateforme";

    try {
      this.appService.isLoading.set(true);

      if (this.contactForm.invalid) {
        refreshFormFieldValidity(this.contactForm);
        this.toastService.open(
          "error",
          ctxMessage,
          "Veuillez remplir tous les champs obligatoires.",
        );
        return;
      }

      const rawContact = this.contactForm.getRawValue();
      if (rawContact.jobType === "") {
        this.toastService.open(
          "error",
          ctxMessage,
          "Veuillez sélectionner un poste.",
        );
        this.appService.isLoading.set(false);
        return;
      }
      const dto = {
        contact: {
          ...rawContact,
          jobType: rawContact.jobType,
        },
        partner:
          this.route.snapshot.queryParams[ONBOARDING_PARTNER_QUERY_PARAM],
        utmData: {
          utmTerm:
            this.route.snapshot.queryParams[ONBOARDING_UTM_TERM_QUERY_PARAM],
          utmMedium:
            this.route.snapshot.queryParams[ONBOARDING_UTM_MEDIUM_QUERY_PARAM],
          utmSource:
            this.route.snapshot.queryParams[ONBOARDING_UTM_SOURCE_QUERY_PARAM],
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
          try {
            await SupabaseService.signIn(
              dto.contact.email,
              dto.contact.password,
            );

            this.toastService.open(
              "success",
              ctxMessage,
              "Veuillez vérifier votre boîte mail pour valider votre compte.",
            );

            await this.router.navigate(
              [getOnboardingPath({ step: "client", variant: "2025" })],
              {
                queryParamsHandling: "preserve",
              },
            );
          } catch (e) {
            // Could happen if we try to signIn an already existing contact/user but with the wrong password
            // This means that theorically anyone can know if someone is already registered in Optee
            this.toastService.open(
              "error",
              ctxMessage,
              "Une erreur est survenue. Veuillez vérifier les informations saisies.",
            );
          }

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

  async signOut() {
    await SupabaseService.signOut();
    window.location.reload();
  }
}
