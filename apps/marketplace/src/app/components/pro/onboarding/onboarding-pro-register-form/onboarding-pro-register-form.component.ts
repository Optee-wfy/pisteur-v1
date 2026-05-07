import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { IconEyeComponent, IconEyeSlashComponent } from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { Checkbox } from "primeng/checkbox";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { AppService } from "../../../../services/app.service";
import { checkPasswordComplexity } from "../../../validators/password-validity.validator";

const PASSWORD_ERROR_MESSAGE =
  "Le mot de passe doit contenir au moins 9 caractères et doit être composé d'au moins 1 lettre et 1 chiffre.";

@Component({
  selector: "mkp-onboarding-pro-register-form-component",
  host: { class: "flex flex-col gap-6 w-full" },
  template: `
    <form
      class="mx-auto flex w-full flex-col items-center gap-4 md:max-w-screen-sm"
    >
      <!-- FirstName & LastName fields  -->
      <div class="flex w-full gap-4">
        <oui-form-field
          class="flex-1"
          name="firstName"
          label="Prénom"
          [control]="signUpForm.controls.firstName"
        >
          <input
            id="firstName"
            name="firstName"
            autocomplete="given-name"
            fluid
            pInputText
            type="text"
            [formControl]="signUpForm.controls.firstName"
          />
        </oui-form-field>

        <oui-form-field
          class="flex-1"
          name="lastName"
          label="Nom"
          [control]="signUpForm.controls.lastName"
        >
          <input
            id="lastName"
            name="lastName"
            autocomplete="family-name"
            fluid
            pInputText
            type="text"
            [formControl]="signUpForm.controls.lastName"
          />
        </oui-form-field>
      </div>

      <!-- Phone field  -->
      <oui-form-field
        class="w-full"
        name="phone"
        label="Numéro de téléphone (facultatif)"
        [control]="signUpForm.controls.phone"
      >
        <input
          id="phone"
          name="phone"
          autocomplete="phone"
          fluid
          pInputText
          type="tel"
          [formControl]="signUpForm.controls.phone"
        />
      </oui-form-field>

      <!-- Email field  -->
      <oui-form-field
        class="w-full"
        name="email"
        label="Adresse e-mail"
        [control]="signUpForm.controls.email"
      >
        <input
          id="email"
          name="email"
          autocomplete="email"
          fluid
          pInputText
          type="email"
          [formControl]="signUpForm.controls.email"
        />
      </oui-form-field>

      <!-- Password field  -->
      <oui-form-field
        class="w-full"
        name="password"
        label="Créer un mot de passe"
        [control]="signUpForm.controls.password"
      >
        <p-iconfield class="flex-1">
          <input
            id="password"
            name="password"
            autocomplete="new-password"
            fluid
            pInputText
            [formControl]="signUpForm.controls.password"
            [type]="passwordVisible() ? 'text' : 'password'"
          />

          <p-inputicon class="size-5">
            <button
              type="button"
              aria-label="Toggle password visibility"
              (click)="passwordVisible.set(!passwordVisible())"
            >
              @if (passwordVisible()) {
                <icon-eye colorMode="colored" />
              } @else {
                <icon-eye-slash colorMode="colored" />
              }
            </button>
          </p-inputicon>
        </p-iconfield>
      </oui-form-field>

      <!-- Terms and conditions checkbox  -->
      <div class="flex items-center justify-start gap-4">
        <p-checkbox
          binary
          inputId="agreeConditionCheck"
          [formControl]="signUpForm.controls.agreeConditions"
        />
        <label
          class="max-w-prose text-pretty text-xs text-gray-600"
          for="agreeConditionCheck"
        >
          En cochant cette case, je reconnais avoir pris connaissance des
          <a
            class="link no-underline"
            rel="noopener noreferrer"
            routerLink="/cgu"
            target="_blank"
          >
            conditions générales d’utilisation
          </a>
          d’Optee et les accepte.
        </label>
      </div>
    </form>

    <oui-button
      class="w-full"
      full
      type="submit"
      variant="accent"
      (click)="submitted.emit(signUpForm.getRawValue())"
      [disabled]="signUpForm.invalid"
    >
      Créer mon compte
    </oui-button>
  `,
  imports: [
    ButtonComponent,
    ReactiveFormsModule,
    InputText,
    FormFieldComponent,
    IconEyeComponent,
    IconEyeSlashComponent,
    IconField,
    InputIcon,
    Checkbox,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OnboardingProRegisterFormComponent {
  readonly submitted = output<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    password: string;
  }>();

  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly toastService = inject(ToastService);
  protected readonly appService = inject(AppService);

  protected readonly signUpForm = new FormGroup({
    firstName: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phone: new FormControl("", {
      validators: [Validators.pattern(/^((\+)33|0|0033)[1-9](\d{2}){4}$/)],
    }),
    email: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl("", {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(9),
        (control) => checkPasswordComplexity(control, PASSWORD_ERROR_MESSAGE),
      ],
    }),

    agreeConditions: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });

  protected readonly passwordVisible = signal(false);
}
