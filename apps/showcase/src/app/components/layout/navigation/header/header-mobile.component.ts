import { CdkTree } from "@angular/cdk/tree";
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
    signal,
    viewChild,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { buildAssetUrl, getOnboardingPath } from "@optee/constants";
import { IconMenuComponent, IconXmarkComponent } from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { HeaderSubitemsComponent } from "../header-subitems/header-subitems.component";
import { NAV_ITEMS, NavAction, NavPage } from "../navigation-items";

@Component({
  selector: "swc-header-mobile",
  host: { class: "relative z-50" },
  template: `
    <header
      class="shadow-o flex h-20 items-center justify-between gap-4 bg-white px-4 sm:gap-x-6 sm:px-6 xl:hidden"
    >
      @if (!skipNav()) {
        <button
          class="text-gray-600"
          type="button"
          (click)="isSidebarOpen.set(true)"
        >
          <span class="sr-only">Ouvrir la barre latérale</span>
          <icon-menu class="size-5" aria-true="false" />
        </button>
      }

      <a routerLink="/">
        <span class="sr-only">Optee</span>
        <img class="h-8 w-auto" alt="Logo de Optee" [src]="logoLight" />
      </a>

      <oui-button
        class="ml-auto"
        keepQueryParams
        variant="accent"
        [href]="onboardingUrl"
      >
        Inscription
      </oui-button>
    </header>

    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-gray-600/80 transition-all"
      (click)="isSidebarOpen.set(false)"
      [class]="isSidebarOpen() ? '' : 'pointer-events-none opacity-0'"
    ></div>

    <div
      class="fixed left-0 top-0 flex h-full gap-5 transition-all"
      [class]="
        !isSidebarOpen() ? 'pointer-events-none -translate-x-10 opacity-0' : ''
      "
    >
      <div class="flex flex-1 flex-col overflow-auto bg-white p-6 pr-12">
        <a class="h-20" routerLink="/">
          <span class="sr-only">Optee</span>
          <img class="h-8 w-auto" alt="Logo de Optee" [src]="logoLight" />
        </a>

        <nav class="text-primary-900 flex h-full select-none flex-col gap-6">
          @for (item of NAV_ITEMS; track item.slug) {
            @if (item.type === "page") {
              <a
                class="font-display select-none text-xl font-semibold"
                [routerLink]="item.url"
              >
                {{ item.label }}
              </a>
            }
            @if (item.type === "action") {
              <div class="flex flex-col gap-2">
                <div class="font-display select-none text-xl font-semibold">
                  {{ item.label }}
                </div>
                <swc-header-subitems
                  colorMode="semi"
                  [routes]="item.routes ?? []"
                />
              </div>
            }
          }
        </nav>
      </div>

      <!-- Close button -->
      <button
        class="text-primary-900 mt-5 flex size-10 items-center justify-center rounded-lg bg-white"
        type="button"
        (click)="isSidebarOpen.set(false)"
      >
        <span class="sr-only">Fermer la barre latérale</span>
        <icon-xmark class="size-5" aria-hidden="true" />
      </button>
    </div>
  `,
  imports: [
    ButtonComponent,
    IconMenuComponent,
    HeaderSubitemsComponent,
    RouterModule,
    IconXmarkComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderMobileComponent {
  readonly tree = viewChild(CdkTree);
  readonly currentPage = input.required<string>();
  readonly skipNav = input(false, { transform: booleanAttribute });

  readonly isSidebarOpen = signal(false);

  NAV_ITEMS = NAV_ITEMS;
  NavAction = NavAction;
  NavPage = NavPage;
  onboardingUrl = getOnboardingPath({
    step: "contact",
    variant: "2025",
    useAbsoluteUrl: true,
  });

  logoLight = buildAssetUrl("logo-light-theme.svg");
}
