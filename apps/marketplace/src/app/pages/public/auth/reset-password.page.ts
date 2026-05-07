import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { IconEyeComponent, IconEyeSlashComponent } from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import trpcClient from "../../../../trpc-client";
import { checkPasswordComplexity } from "../../../components/validators/password-validity.validator";
import { AppService } from "../../../services/app.service";
import { SupabaseService } from "../../../supabase.service";

@Component({
  selector: "mkp-reset-password-page",
  host: {
    class: "flex flex-col items-center justify-center gap-6",
  },
  template: `
    <h2
      class="font-display text-center text-2xl font-medium leading-9 tracking-tight text-gray-900"
    >
      Réinitialisez votre mot de passe
    </h2>

    @if (isTokenValid() === true) {
      <div>
        <p>
          Choisissez votre nouveau mot de passe.
          <br />
          Il doit être composé de :
        </p>
        <ul class="mt-3 list-disc pl-4 text-sm">
          <li>9 caractères minimum</li>
          <li>D’un mélange de chiffres et de lettres</li>
        </ul>
      </div>

      <form
        class="flex flex-col items-center gap-6"
        (ngSubmit)="resetPassword()"
        [formGroup]="resetPasswordForm"
      >
        <oui-form-field
          class="w-80"
          name="password"
          label="Nouveau mot de passe"
          [control]="resetPasswordForm.controls.password"
        >
          <p-iconfield>
            <input
              id="password"
              name="password"
              fluid
              pInputText
              required
              [formControl]="resetPasswordForm.controls.password"
              [type]="inputType()"
            />

            <p-inputicon class="size-5">
              <button
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
        </oui-form-field>

        <oui-button
          type="submit"
          variant="primary"
          [disabled]="resetPasswordForm.invalid"
        >
          Valider
        </oui-button>
      </form>
    } @else {
      <oui-message
        severity="error"
        summary="Réinitialisation de votre mot de passe."
      >
        Une erreur est survenue. Le token de réinitialisation de mot de passe
        est invalide ou a expiré. Merci de réessayer.
      </oui-message>

      <form
        class="flex flex-col items-center gap-6"
        (ngSubmit)="sendResetEmail()"
        [formGroup]="forgottenPasswordForm"
      >
        <oui-form-field
          class="w-80"
          name="email"
          label="Adresse email"
          [control]="forgottenPasswordForm.controls.email"
        >
          <input
            id="email"
            name="email"
            fluid
            pInputText
            placeholder="clement.dupont@optee.com"
            type="email"
            [formControl]="forgottenPasswordForm.controls.email"
          />
        </oui-form-field>

        <oui-button
          type="submit"
          variant="primary"
          [disabled]="forgottenPasswordForm.invalid || submitted()"
        >
          Recevoir un nouveau lien
        </oui-button>
      </form>
    }
  `,
  imports: [
    ButtonComponent,
    FormFieldComponent,
    InputText,
    IconField,
    InputIcon,
    IconEyeComponent,
    IconEyeSlashComponent,
    ReactiveFormsModule,
    MessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResetPasswordPageComponent {
  protected readonly router = inject(Router);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly toastService = inject(ToastService);
  protected readonly appService = inject(AppService);

  readonly token = input.required<string>();

  protected readonly passwordVisible = signal(false);

  protected readonly inputType = computed(() =>
    this.passwordVisible() ? "text" : "password",
  );

  protected readonly isTokenValid = signal<boolean>(false);
  protected readonly submitted = signal(false);

  resetPasswordForm = new FormGroup({
    password: new FormControl("", {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(9),
        checkPasswordComplexity,
      ],
    }),
  });

  forgottenPasswordForm = new FormGroup({
    email: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  readonly userResource = resource({
    params: () => this.token(),
    loader: async ({ params: token }) => {
      try {
        if (!token) {
          return null;
        }

        this.appService.isLoading.set(true);

        const tokenVerified = (await this.verifyToken(token))?.session
          ?.access_token;
        if (!tokenVerified) {
          return null;
        }

        const { data: userData } =
          await SupabaseService.getUserByToken(tokenVerified);

        if (!userData || !userData?.user?.email) {
          this.toastService.open(
            "error",
            "Récupération des données utilisateur",
            `Une erreur est survenue. Merci de contacter le support.`,
          );
          return null;
        }

        return userData.user;
      } catch (err) {
        console.error("Error loading user:", err);
        return null;
      } finally {
        this.appService.isLoading.set(false);
      }
    },
  });

  async resetPassword(): Promise<void> {
    this.submitted.set(true);
    const { password } = this.resetPasswordForm.getRawValue();

    const email = this.userResource.value()?.email;

    if (!email) {
      this.toastService.open(
        "error",
        "Réinitialisation du mot de passe",
        `Une erreur est survenue: l'email est manquant. Merci de contacter le support.`,
      );
      this.submitted.set(false);
      return;
    }

    const success = await this.updatePassword(email, password);
    if (!success) {
      console.error("Password update failed");
      this.submitted.set(false);
      return;
    }
    this.toastService.open(
      "success",
      "Succès",
      `Votre mot de passe a été mis à jour.`,
    );
    await SupabaseService.signIn(email, password);
    this.router.navigate(["/"]);
  }

  private async verifyToken(token: string) {
    const { data: sessionData, error } =
      await SupabaseService.verifyResetPasswordToken(token);

    if (error || !sessionData.session?.access_token) {
      this.toastService.open(
        "error",
        "Erreur",
        `Une erreur est survenue lors de la réinitialisation de votre mot de passe.`,
      );
      this.isTokenValid.set(false);
      return null;
    }

    this.isTokenValid.set(true);
    return sessionData;
  }

  private async updatePassword(
    email: string,
    password: string,
  ): Promise<boolean> {
    const { error: updateError } = await SupabaseService.updateUserPassword(
      email,
      password,
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      this.toastService.open(
        "error",
        "Erreur",
        `Une erreur est survenue lors de la mise à jour du mot de passe.`,
      );
      return false;
    }
    return true;
  }

  async sendResetEmail() {
    try {
      this.submitted.set(true);

      this.appService.isLoading.set(true);

      const { email } = this.forgottenPasswordForm.getRawValue();

      await trpcClient.users.sendResetPasswordMail.mutate({
        email: email,
      });

      this.toastService.open(
        "success",
        "Succès",
        `Si l'adresse e-mail existe, un email de réinitialisation a été envoyé à ${email}.`,
      );
    } catch (err) {
      this.toastService.openError(
        "Envoi d'un email de réinitialisation de mot de passe.",
        err,
      );
      this.submitted.set(false);
    } finally {
      this.appService.isLoading.set(false);
    }
  }
}
