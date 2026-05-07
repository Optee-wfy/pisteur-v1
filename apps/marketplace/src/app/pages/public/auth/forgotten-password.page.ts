import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { startCooldown } from "@optee/ui/functions/cooldown-timer.fn";
import { ToastService } from "@optee/ui/services/toast.service";
import { InputText } from "primeng/inputtext";
import trpcClient from "../../../../trpc-client";
import { AppService } from "../../../services/app.service";

@Component({
  selector: "mkp-forgotten-password-page",
  host: {
    class: "flex flex-col items-center justify-center gap-6",
  },
  template: `
    <h2
      class="font-display text-center text-2xl font-medium leading-9 tracking-tight text-gray-900"
    >
      Mot de passe oublié ?
    </h2>

    <p class="text-center">
      Renseignez l'adresse email de votre compte
      <br />
      pour recevoir un lien de réinitialisation.
    </p>

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
          formControlName="email"
          pInputText
          placeholder="clement.dupont@optee.com"
          type="email"
        />
      </oui-form-field>

      <oui-button
        type="submit"
        variant="primary"
        [disabled]="forgottenPasswordForm.invalid || submitted()"
      >
        Réinitialiser mon mot de passe
      </oui-button>

      @if (timer() !== null) {
        <p class="text-center text-xs text-gray-600">
          Vous pourrez refaire une demande dans {{ timer() }} secondes.
        </p>
      }
    </form>

    <p class="text-center text-sm leading-6 text-gray-500">
      Pas encore de compte ?
      <a
        class="link"
        href="https://optee.io/demo"
        rel="noopener"
        target="_blank"
      >
        Demandez une démo
      </a>
    </p>
  `,
  imports: [
    ButtonComponent,
    FormFieldComponent,
    InputText,
    ReactiveFormsModule,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ForgottenPasswordPageComponent {
  protected readonly router = inject(Router);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly toastService = inject(ToastService);
  protected readonly appService = inject(AppService);

  submitted = signal(false);
  timer = signal<number | null>(null);

  forgottenPasswordForm = new FormGroup({
    email: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  async sendResetEmail() {
    this.submitted.set(true);

    this.appService.isLoading.set(true);

    const { email } = this.forgottenPasswordForm.getRawValue();

    await trpcClient.users.sendResetPasswordMail.mutate({
      email: email,
    });

    this.appService.isLoading.set(false);

    this.toastService.open(
      "success",
      "Succès",
      `Si l'adresse e-mail existe, un email de réinitialisation a été envoyé à ${email}.`,
    );

    startCooldown(this.timer, this.submitted, 60);
  }
}
