import { CdkConnectedOverlay, OverlayModule } from "@angular/cdk/overlay";
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
    signal,
    ViewChild,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import {
    buildAssetUrl,
    getOnboardingPath,
    MARKETPLACE_AUTH_URL,
} from "@optee/constants";
import { IconChevronRightComponent } from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { HeaderPopoverComponent } from "../header-popover/header-popover.component";
import { HeaderSubitemsComponent } from "../header-subitems/header-subitems.component";
import { NAV_ITEMS, NavAction, NavPage } from "../navigation-items";

@Component({
  selector: "swc-header-desktop",
  template: `
    <nav
      class="font-display flex w-screen select-none items-center justify-between px-16 py-10"
    >
      <div class="flex items-center gap-14">
        <a routerLink="/">
          <span class="sr-only">Optee</span>
          <img
            class="h-10 w-auto"
            alt="Logo de Optee"
            height="40"
            width="164"
            [src]="theme() === 'dark' ? logoDark : logoLight"
          />
        </a>
        @if (!skipNav()) {
          <div class="flex gap-4 xl:gap-8">
            @for (item of NAV_ITEMS; track item.slug) {
              @if (item.type === "page") {
                <a
                  class="select-none leading-6"
                  [class.text-primary-700]="currentPage().startsWith(item.slug)"
                  [class.text-white]="theme() === 'dark'"
                  [routerLink]="item.url"
                >
                  {{ item.label }}
                </a>
              }
              @if (item.type === "action") {
                @if (item.slug === NavAction.SERVICES) {
                  <span
                    class="flex cursor-pointer select-none items-center gap-2 leading-6"
                    #trigger="cdkOverlayOrigin"
                    cdkOverlayOrigin
                    (click)="isServicesMenuOpen.set(true)"
                    [class.text-white]="theme() === 'dark'"
                  >
                    {{ item.label }}

                    <icon-chevron-right
                      class="size-4 origin-center rotate-90 transition-transform duration-200"
                      [class.rotate-0]="isServicesMenuOpen()"
                      [class.text-primary-700]="theme() === 'light'"
                    />
                  </span>

                  <ng-template
                    cdkConnectedOverlay
                    cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
                    cdkConnectedOverlayTransformOriginOn="swc-services-menu"
                    (backdropClick)="headerPopoverComponent.close()"
                    (detach)="isServicesMenuOpen.set(false)"
                    [cdkConnectedOverlayHasBackdrop]="true"
                    [cdkConnectedOverlayOffsetY]="10"
                    [cdkConnectedOverlayOpen]="isServicesMenuOpen()"
                    [cdkConnectedOverlayOrigin]="trigger"
                  >
                    <swc-header-popover
                      (closed)="isServicesMenuOpen.set(false)"
                    >
                      <swc-header-subitems
                        colorMode="semi"
                        [routes]="item.routes ?? []"
                      />
                    </swc-header-popover>
                  </ng-template>
                }
                @if (item.slug === NavAction.SOLUTIONS) {
                  <span
                    class="flex cursor-pointer items-center gap-2 leading-6"
                    #trigger="cdkOverlayOrigin"
                    cdkOverlayOrigin
                    (click)="isYouAreMenuOpen.set(true)"
                    [class.text-white]="theme() === 'dark'"
                  >
                    {{ item.label }}

                    <icon-chevron-right
                      class="size-4 origin-center rotate-90 transition-transform duration-200"
                      [class.rotate-0]="isYouAreMenuOpen()"
                      [class.text-primary-700]="theme() === 'light'"
                    />
                  </span>

                  <ng-template
                    cdkConnectedOverlay
                    cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
                    cdkConnectedOverlayTransformOriginOn="swc-you-are-menu"
                    (backdropClick)="headerPopoverComponent.close()"
                    (detach)="isYouAreMenuOpen.set(false)"
                    [cdkConnectedOverlayHasBackdrop]="true"
                    [cdkConnectedOverlayOffsetY]="10"
                    [cdkConnectedOverlayOpen]="isYouAreMenuOpen()"
                    [cdkConnectedOverlayOrigin]="trigger"
                  >
                    <swc-header-popover (closed)="isYouAreMenuOpen.set(false)">
                      <swc-header-subitems
                        colorMode="semi"
                        [routes]="item.routes ?? []"
                      />
                    </swc-header-popover>
                  </ng-template>
                }
              }
            }
          </div>
        }
      </div>

      <div class="flex items-center gap-4 xl:gap-8">
        <a
          rel="noopener"
          target="_blank"
          [class.text-white]="theme() === 'dark'"
          [href]="MARKETPLACE_AUTH_URL"
        >
          Connexion
        </a>
        <oui-button keepQueryParams variant="standard" [href]="onboardingUrl">
          M'inscrire gratuitement
        </oui-button>
      </div>
    </nav>
  `,
  imports: [
    RouterModule,
    HeaderSubitemsComponent,
    ButtonComponent,
    IconChevronRightComponent,
    HeaderPopoverComponent,
    OverlayModule,
    CdkConnectedOverlay,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderDesktopComponent {
  currentPage = input.required<NavPage>();
  theme = input<"light" | "dark">("dark");
  skipNav = input(false, { transform: booleanAttribute });

  MARKETPLACE_AUTH_URL = MARKETPLACE_AUTH_URL;

  @ViewChild(HeaderPopoverComponent)
  headerPopoverComponent!: HeaderPopoverComponent;

  isServicesMenuOpen = signal(false);
  isYouAreMenuOpen = signal(false);

  logoLight = buildAssetUrl("logo-light-theme.svg");
  logoDark = buildAssetUrl("logo-dark-theme.svg");

  NAV_ITEMS = NAV_ITEMS;
  NavAction = NavAction;
  NavPage = NavPage;
  onboardingUrl = getOnboardingPath({
    step: "contact",
    variant: "2025",
    useAbsoluteUrl: true,
  });
}
