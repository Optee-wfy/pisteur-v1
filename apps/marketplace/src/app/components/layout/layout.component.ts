import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { buildAssetUrl, CTA } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import { IconPlusComponent } from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";

import { Router, RouterLink } from "@angular/router";
import { SelectButtonModule } from "primeng/selectbutton";
import { Tooltip } from "primeng/tooltip";
import { AppService } from "../../services/app.service";
import { AuthService } from "../../services/auth.service";
import { LocationService } from "../../services/location.service";
import { PermissionService } from "../../services/permission.service";
import { ProService } from "../../services/pro.service";
import { NewOperationByProComponent } from "../operation/new-operation-by-pro/new-operation-by-pro.component";
import { NewProjectComponent } from "../operation/new-project/new-project.component";
import { MainNavComponent } from "./main-nav.component";
import { UserMenuComponent } from "./user-menu.component";

@Component({
  selector: "mkp-layout",
  host: { class: "flex h-full flex-col" },
  template: `
    @let isMobile = appService.isMobile$ | async;

    <div class="shadow-o relative z-10 bg-white">
      <nav class="max-w-app m-auto flex items-center p-4 print:hidden">
        <a class="mr-6 block h-8 w-auto" routerLink="/">
          <span class="sr-only">Optee</span>
          <img class="block h-8 w-auto" alt="Logo de Optee" [src]="logoLight" />
        </a>

        @if (!isMobile) {
          <mkp-main-nav />
        }

        <div class="ml-auto flex items-center gap-2 lg:gap-4">
          @if (canCreateDeal()) {
            @if (isMobile) {
              <oui-button routerLink="/pro/pisteur" variant="primary">
                Pisteur
              </oui-button>
            } @else if (authService.isLoggedAsClient()) {
              <span
                [class.cursor-pointer]="
                  isClientAllowedToCreateProject() ||
                  isProAllowedToCreateProject()
                "
                [pTooltip]="tooltipText()"
              >
                <oui-button
                  variant="primary"
                  (click)="newProject()"
                  [disabled]="isNewProjectDisabled()"
                >
                  <icon-plus class="size-5" />
                  {{ ctaLabel() }}
                </oui-button>
              </span>
            } @else if (authService.isLoggedAsPro()) {
              <oui-button routerLink="/pro/pisteur" variant="primary">
                Pisteur
              </oui-button>
            }
          }
          <div class="flex items-center justify-end gap-2">
            <mkp-user-menu />
          </div>
        </div>
      </nav>
    </div>

    <main class="bg-primary-50 relative flex-auto overflow-hidden">
      <oui-circle class="-left-[629px] -top-[328px] w-[945px]" theme="light" />

      <oui-circle
        class="-bottom-[258px] -right-[248px] w-[580px]"
        theme="light"
      />

      <div
        class="scrollbar-stable relative isolate h-full overflow-auto"
        [style.scrollbar-color]="'#A3C0FF transparent'"
      >
        <ng-content />
      </div>
    </main>

    @if (isMobile) {
      <mkp-main-nav
        class="shadow-o2-reverse relative z-10 flex justify-center bg-white p-4"
      />
    }
  `,
  imports: [
    AsyncPipe,
    MainNavComponent,
    ButtonComponent,
    IconPlusComponent,
    CircleComponent,
    UserMenuComponent,
    SelectButtonModule,
    FormsModule,
    Tooltip,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  protected readonly authService = inject(AuthService);
  protected readonly appService = inject(AppService);
  protected readonly proService = inject(ProService);
  private readonly permissionService = inject(PermissionService);
  private readonly locationService = inject(LocationService);
  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);

  protected readonly CTA = CTA;
  protected readonly logoLight = buildAssetUrl("logo-light-theme.svg");

  protected readonly noClientsTooltip =
    "Vous n’avez pas encore été mis en relation avec des clients. Contactez notre équipe pour en savoir plus.";

  protected readonly canCreateDeal = computed(
    () =>
      (this.authService.isLoggedAsClient() &&
        this.permissionService.can("DEAL_CREATE")) ||
      this.authService.isLoggedAsPro(),
  );

  protected readonly isClientAllowedToCreateProject = computed(
    () =>
      this.authService.isLoggedAsClient() &&
      this.locationService.hasLocations(),
  );

  protected readonly isProAllowedToCreateProject = computed(
    () => this.authService.isLoggedAsPro() && this.proService.proHasClients(),
  );

  protected readonly isNewProjectDisabled = computed(() =>
    this.authService.isLoggedAsClient()
      ? !this.locationService.hasLocations()
      : this.authService.isLoggedAsPro() && !this.proService.proHasClients(),
  );

  protected readonly tooltipText = computed(() =>
    this.authService.isLoggedAsPro() && !this.proService.proHasClients()
      ? this.noClientsTooltip
      : "",
  );

  protected readonly ctaLabel = computed(() =>
    this.authService.isLoggedAsClient()
      ? this.CTA.newProject
      : this.CTA.createClientProject,
  );

  protected newProject() {
    if (this.authService.isLoggedAsClient()) {
      this.dialogService.open(NewProjectComponent);
    } else {
      this.dialogService.open(NewOperationByProComponent, {
        data: {
          redirectToDashboard: true,
        },
      });
    }
  }
}
