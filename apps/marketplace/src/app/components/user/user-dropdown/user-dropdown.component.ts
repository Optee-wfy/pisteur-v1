import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { UserType } from "@optee/constants";
import { DialogConfirmationComponent, DialogService } from "@optee/dialog";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "mkp-user-dropdown",
  template: `
    <a
      class="menu-item text-primary-900"
      [routerLink]="accountSettingsUrl()"
      [routerLinkActive]="'!text-primary-700'"
    >
      Mon compte
    </a>

    @if (authService.isAdminOptee()) {
      <a
        class="menu-item text-primary-900"
        routerLink="/admin"
        [routerLinkActive]="'!text-primary-700'"
      >
        Admin
      </a>
    }

    @if (hasMultipleUserTypes()) {
      <a class="menu-item text-primary-900" routerLink="/choose-account">
        Changer d'espace
      </a>
    }

    <div class="menu-item text-red-500" (click)="confirmLogout()">
      Se déconnecter
    </div>
  `,
  styles: `
    .menu-item {
      @apply block cursor-pointer border-gray-100 p-4 font-medium leading-6 hover:bg-gray-100 focus:outline-none;
    }

    .menu-item:not(:last-child) {
      @apply border-b;
    }
  `,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDropdownComponent {
  protected readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);

  protected readonly accountSettingsUrl = computed(
    () => (this.authService.isLoggedAsClient() ? "/client" : "/pro") + "/user",
  );

  protected readonly hasMultipleUserTypes = computed(() => {
    const userTypes = this.authService
      .userTypes()
      .filter((a) => a !== UserType.ADMIN);
    return userTypes.length > 1;
  });

  protected async confirmLogout() {
    const { res: confirmed } = await this.dialogService.open(
      DialogConfirmationComponent,
      {
        data: {
          title: "Confirmation de déconnexion",
          description:
            "Voulez-vous vraiment vous déconnecter ? Toutes vos sessions en cours seront fermées.",
          action: "Se déconnecter",
          actionColor: "danger",
        },
        disableClose: true,
      },
    );

    if (confirmed) {
      this.authService.logOut();
    }
  }
}
