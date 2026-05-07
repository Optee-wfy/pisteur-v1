import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { IconGoogleLogoComponent } from "@optee/icons";
import { ToastService } from "@optee/ui/services/toast.service";
import { AuthError } from "@supabase/supabase-js";
import { SupabaseService } from "../../../supabase.service";

@Component({
  selector: "mkp-button-google",
  template: `
    <oui-button full (click)="signInGoogle()">
      Google
      <icon-google-logo class="size-5" ngProjectAs="[prefix]" />
    </oui-button>
  `,
  imports: [ButtonComponent, IconGoogleLogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleButtonComponent {
  protected readonly router = inject(Router);
  protected readonly toastService = inject(ToastService);

  async signInGoogle(): Promise<void> {
    try {
      const { error } = await SupabaseService.signInWithGoogle();
      if (error) {
        throw error;
      }
      this.router.navigate(["/"]);
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        this.toastService.open("error", "Erreur", error.message);
      }
    }
  }
}
