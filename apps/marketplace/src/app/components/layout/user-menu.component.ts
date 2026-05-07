import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { Popover } from "primeng/popover";
import { AuthService } from "../../services/auth.service";
import { UserDropdownComponent } from "../user/user-dropdown/user-dropdown.component";

@Component({
  selector: "mkp-user-menu",
  template: `
    <oui-button-icon
      class="size-12 text-xl"
      (click)="userDropdown.toggle($event)"
    >
      {{ userInitial$ | async }}
    </oui-button-icon>

    <p-popover #userDropdown>
      <mkp-user-dropdown />
    </p-popover>
  `,
  imports: [
    AsyncPipe,
    RouterModule,
    Popover,
    UserDropdownComponent,
    ButtonIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  protected readonly authService = inject(AuthService);

  user$ = this.authService.contact$;
  userInitial$ = this.authService.userInitial$;
}
