import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { IconMicrosoftLogoComponent } from "@optee/icons";
import { ToastService } from "@optee/ui/services/toast.service";
import { AuthError } from "@supabase/supabase-js";
import { SupabaseService } from "../../../supabase.service";

@Component({
  selector: "mkp-button-microsoft",
  template: `
    <oui-button full (click)="signInMicrosoft()">
      Microsoft
      <icon-microsoft-logo class="size-5" ngProjectAs="[prefix]" />
    </oui-button>
  `,
  imports: [ButtonComponent, IconMicrosoftLogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MicrosoftButtonComponent {
  protected readonly router = inject(Router);
  protected readonly toastService = inject(ToastService);

  async signInMicrosoft(): Promise<void> {
    try {
      const { error } = await SupabaseService.signInWithAzure();
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
