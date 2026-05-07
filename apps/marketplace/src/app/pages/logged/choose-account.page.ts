import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CTA, tryAgainOrContactUs, UserType } from "@optee/constants";
import { DialogHeadingComponent, DialogWrapperComponent } from "@optee/dialog";
import {
  IconClickComponent,
  IconClientComponent,
  IconProComponent,
} from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { OptionCardComponent } from "@optee/ui/components/organisms/option-card/option-card.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { AppService } from "../../services/app.service";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "mkp-choose-account-page",
  host: { class: "flex h-full flex-col" },
  template: `
    <main class="bg-primary-100 relative flex-auto overflow-hidden">
      <oui-circle class="-left-[629px] -top-[328px] w-[945px]" theme="light" />

      <oui-circle
        class="-bottom-[258px] -right-[248px] w-[580px]"
        theme="light"
      />

      <div
        class="scrollbar-stable relative isolate h-full overflow-auto"
        [style.scrollbar-color]="'#A3C0FF transparent'"
      >
        <op-dialog-wrapper
          class="mx-auto mt-6 !w-[920px] bg-white lg:mt-12"
          closeIconHidden
          variant="primary-100"
        >
          <op-dialog-heading heading="Sélection de votre espace">
            <icon-click class="text-primary-700 size-10" iconSlot />

            Choisissez l’espace sur lequel vous souhaite vous rendre.
          </op-dialog-heading>

          <div class="flex flex-wrap gap-4">
            <oui-option-card
              class="flex-1"
              buttonVariant="primary"
              heading="Espace Pro"
              highlight
              subtitle="Consultez les projets sur lesquels vous êtes positionné et suivez l’avancement de vos interventions."
              (click)="goTo(UserType.PRO)"
            >
              <icon-pro class="text-primary-700 size-12" />
            </oui-option-card>

            <oui-option-card
              class="flex-1"
              buttonVariant="primary"
              heading="Espace Client"
              subtitle="Analyser, lancez et suivez les opérations sur les bâtiments de votre parc immobilier."
              (click)="goTo(UserType.CLIENT)"
            >
              <icon-client class="text-primary-700 size-14" />
            </oui-option-card>
          </div>

          @if (authService.isAdminOptee()) {
            <div class="mt-4 flex justify-center">
              <oui-button routerLink="/admin" variant="accent">
                Accéder à l’espace Admin
              </oui-button>
            </div>
          }
        </op-dialog-wrapper>
      </div>
    </main>
  `,
  imports: [
    CircleComponent,
    DialogWrapperComponent,
    DialogHeadingComponent,
    IconClientComponent,
    IconProComponent,
    IconClickComponent,
    OptionCardComponent,
    RouterLink,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChooseAccountComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly appService = inject(AppService);
  private readonly toastService = inject(ToastService);

  readonly UserType = UserType;
  readonly CTA = CTA;

  constructor() {
    this.appService.isLoading.set(false);
  }

  async goTo(userType: UserType) {
    try {
      this.appService.isLoading.set(true);
      this.authService.changeUserType(userType);
      const route = userType === UserType.PRO ? "pro/pisteur" : "client";
      await this.router.navigate(["/" + route]);
    } catch (error) {
      this.toastService.open(
        "error",
        "changement d'espace",
        "Une erreur est survenue lors du changement d'espace." +
          tryAgainOrContactUs,
      );
      console.error("Failed to change user type:", error);
    } finally {
      this.appService.isLoading.set(false);
    }
  }
}
