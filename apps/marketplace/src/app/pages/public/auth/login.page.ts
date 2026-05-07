import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { IconEyeComponent, IconEyeSlashComponent } from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import trpcClient from "../../../../trpc-client";
import { AppService } from "../../../services/app.service";
import { AuthService } from "../../../services/auth.service";
import { TrackingService } from "../../../services/tracking.service";
import { SupabaseService } from "../../../supabase.service";

@Component({
  selector: "mkp-signin-page",
  host: {
    class: "flex flex-col items-center justify-center gap-10",
  },
  template: `
    <h2
      class="font-display text-center text-2xl font-medium leading-9 tracking-tight text-gray-900"
    >
      Connectez-vous à votre compte
    </h2>

    <form
      class="flex w-full flex-col gap-6 sm:items-center"
      (ngSubmit)="onSubmit()"
      [formGroup]="signInForm"
    >
      <oui-form-field
        class="w-full sm:w-80"
        name="email"
        label="Adresse e-mail"
        [control]="signInForm.controls.email"
      >
        <input
          id="email"
          name="email"
          autocomplete="email"
          fluid
          pInputText
          type="email"
          [formControl]="signInForm.controls.email"
        />
      </oui-form-field>

      <oui-form-field
        class="w-full sm:w-80"
        name="password"
        label="Mot de passe"
        [control]="signInForm.controls.password"
      >
        <p-iconfield class="flex-1">
          <input
            id="password"
            name="password"
            autocomplete="current-password"
            fluid
            pInputText
            [formControl]="signInForm.controls.password"
            [type]="passwordInputType()"
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

      <p class="text-center text-sm leading-6 text-gray-500">
        Pas encore de compte ?
        <br />
        <a
          class="link"
          href="https://optee.io/demo"
          rel="noopener"
          target="_blank"
        >
          Demandez une démo
        </a>
      </p>

      <oui-button
        class="w-full sm:w-80"
        full
        type="submit"
        variant="primary"
        [disabled]="signInForm.invalid"
      >
        Me connecter
      </oui-button>
    </form>

    <p class="text-center text-sm">
      Mot de passe oublié ?
      <br />
      <a class="link" routerLink="/auth/forgotten-password">
        Réinitialiser le mot de passe
      </a>
    </p>
  `,
  imports: [
    RouterModule,
    ButtonComponent,
    IconField,
    InputIcon,
    ReactiveFormsModule,
    InputText,
    FormFieldComponent,
    IconEyeComponent,
    IconEyeSlashComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SigninPageComponent {
  protected readonly router = inject(Router);
  protected readonly toastService = inject(ToastService);
  protected readonly appService = inject(AppService);
  protected readonly trackingService = inject(TrackingService);
  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  redirect = input<string>();

  protected readonly redirectTarget = computed(() => {
    const inputRedirect = this.redirect();
    const queryRedirect = this.route.snapshot.queryParamMap.get("redirect");
    const target = inputRedirect ?? queryRedirect ?? "/";

    // Autoriser uniquement les chemins locaux commençant par '/'
    return target.startsWith("/") ? target : "/";
  });

  signInForm = new FormGroup({
    email: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  passwordVisible = signal(false);

  passwordInputType = computed(() =>
    this.passwordVisible() ? "text" : "password",
  );

  async onSubmit(): Promise<void> {
    try {
      if (this.signInForm.invalid) {
        throw new Error("Le formulaire semble invalide");
      }

      this.appService.loadingMessage.set({
        title: "Connexion en cours",
      });
      this.appService.isLoading.set(true);

      const { email, password } = this.signInForm.getRawValue();
      await SupabaseService.signIn(email, password);

      this.trackingService.trackClient("login");
      await trpcClient.contacts.updateLastSignInAt.mutate();

      const hasMultipleUserTypes =
        await this.authService.hasMultipleUserTypes();
      const target = this.redirectTarget();

      // Si une URL de redirection est fournie, on la priorise même en cas de multi-compte
      if (target !== "/") {
        await this.router.navigateByUrl(target);
        return;
      }

      if (hasMultipleUserTypes && !this.authService.loggedAs()) {
        await this.router.navigate(["/choose-account"]);
      } else {
        await this.router.navigate([target]);
      }
    } catch (error: unknown) {
      this.toastService.openError("Connexion", error);
    } finally {
      this.appService.isLoading.set(false);
      this.appService.resetMessage();
    }
  }
}
