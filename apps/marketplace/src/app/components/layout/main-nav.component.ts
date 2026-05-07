import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { UserType } from "@optee/constants";
import { isNotNullish } from "@optee/utils";
import { Tooltip } from "primeng/tooltip";
import { combineLatest, map, of, shareReplay, switchMap } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { LocationService } from "../../services/location.service";
import { PermissionService } from "../../services/permission.service";
import { ProService } from "../../services/pro.service";
import {
  MainNavIconComponent,
  type HeaderIcon,
} from "./main-nav-icon.component";

enum Page {
  HOME = "home",
  PILOTER = "piloter",
  EXPLORER = "explorer",
  MARKETPLACE = "marketplace",
  QUOTES = "quotes",
  SIMULATOR = "simulator",
  MY_ACCOUNT = "my_account",
  LOCATIONS = "locations",
  DASHBOARD = "dashboard",
  PROSPECTING = "prospecting",
  NONE = "none",
}

enum Action {
  CONTACT_OPTEE = "contact_optee",
  LOG_OUT = "log_out",
}

type ActionFunction = () => void | Promise<void>;

type PageItem = {
  type: "page";
  slug: Page;
  label: string;
  icon: HeaderIcon;
  url: string;
  showInHeader: boolean;
  isDisabled?: boolean;
  isDivider?: boolean;
};

type ActionItem = {
  type: "action";
  slug: Action;
  label: string;
  icon?: HeaderIcon;
  action: ActionFunction;
  showInHeader: boolean;
  isDivider?: boolean;
};

type Item = PageItem | ActionItem;

@Component({
  selector: "mkp-main-nav",
  host: {
    class: "text-granite-700 flex gap-2 lg:gap-0",
  },
  template: `
    @for (item of NAV_ITEMS$ | async; track item.slug) {
      @if (item.showInHeader && item.type === "page") {
        <a
          class="flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-base leading-6 lg:flex-row lg:gap-2 lg:px-5 lg:py-3"
          tooltipPosition="bottom"
          [class.cursor-not-allowed]="item.isDisabled"
          [pTooltip]="item.isDisabled ? disabledBtnTooltip() : undefined"
          [routerLink]="item.isDisabled ? undefined : item.url"
          [routerLinkActive]="'bg-primary-100 text-primary-700'"
          [routerLinkActiveOptions]="{ exact: item.slug === 'home' }"
        >
          <mkp-main-nav-icon
            class="w-5"
            [class.!text-gray-600]="item.isDisabled"
            [headerIcon]="item.icon"
          />

          <div
            class="text-xs lg:text-base"
            [class.text-gray-600]="item.isDisabled"
          >
            {{ item.label }}
          </div>
        </a>
      }
    }
  `,
  imports: [AsyncPipe, RouterModule, MainNavIconComponent, Tooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNavComponent {
  private readonly authService = inject(AuthService);
  private readonly permissionService = inject(PermissionService);
  private readonly locationService = inject(LocationService);
  private readonly proService = inject(ProService);

  private readonly proMarketplaceRoutes$ = this.proService.pro$.pipe(
    map((pro) => {
      if (!pro || pro?.status !== "Actif") {
        return [];
      }

      const pages: Array<Item | null> = [
        {
          type: "page",
          slug: Page.HOME,
          label: "Accueil",
          url: "/pro/marketplace",
          icon: "home",
          showInHeader: true,
          isDisabled: false,
        },
        {
          type: "page",
          slug: Page.DASHBOARD,
          label: "Mes projets",
          url: "/pro/marketplace/dashboard",
          icon: "dashboard",
          showInHeader: true,
          isDisabled: false,
        },
        {
          type: "page",
          slug: Page.MARKETPLACE,
          label: "Marketplace",
          url: "/pro/marketplace/explore",
          icon: "opportunities",
          showInHeader: true,
          isDisabled: false,
        },
      ];
      return pages.filter(isNotNullish);
    }),
    shareReplay(1),
  );

  private readonly clientPages$ = combineLatest([
    this.locationService.hasLocations$,
    this.permissionService.can$("QUOTE_READ_BY_CLIENT"),
    this.permissionService.can$("QUOTE_READ_BY_LOCATION"),
    this.permissionService.can$("DEAL_READ_BY_CLIENT"),
    this.permissionService.can$("DEAL_READ_BY_LOCATION"),
  ]).pipe(
    map(
      ([
        hasLocations,
        canReadQuotesByClient,
        canReadQuotesByLocation,
        canReadDealsByClient,
        canReadDealsByLocation,
      ]) => {
        const pages: Array<Item | null> = [
          {
            type: "page",
            slug: Page.HOME,
            label: "Accueil",
            url: "/client",
            icon: "home",
            showInHeader: true,
            isDisabled: !hasLocations,
          },
          {
            type: "page",
            slug: Page.EXPLORER,
            label: "Explorer",
            url: "/client/explorer",
            icon: "opportunities",
            showInHeader: true,
            isDisabled: !hasLocations,
          },
          canReadDealsByClient || canReadDealsByLocation
            ? {
                type: "page",
                slug: Page.PILOTER,
                label: "Piloter",
                url: "/client/piloter",
                icon: "dashboard",
                showInHeader: true,
                isDisabled: !hasLocations,
              }
            : null,
          {
            type: "page",
            slug: Page.LOCATIONS,
            label: "Sites",
            url: "/client/locations",
            icon: "sites",
            showInHeader: true,
            isDivider: true,
          },
          canReadQuotesByClient || canReadQuotesByLocation
            ? {
                type: "page",
                slug: Page.QUOTES,
                label: "Devis",
                url: "/client/quotes",
                icon: "consultations",
                showInHeader: true,
                isDivider: true,
                isDisabled: !hasLocations,
              }
            : null,
          {
            type: "page",
            slug: Page.MY_ACCOUNT,
            label: "Mon Compte",
            url: "/client/user",
            icon: "home",
            showInHeader: false,
            isDivider: true,
            isDisabled: !hasLocations,
          },
          {
            type: "action",
            slug: Action.LOG_OUT,
            label: "Se déconnecter",
            showInHeader: false,
            action: () => this.authService.logOut(),
          },
        ];

        return pages.filter(isNotNullish);
      },
    ),
  );

  protected readonly disabledBtnTooltip = computed(() =>
    this.authService.isLoggedAsPro()
      ? "Réservé aux abonnés Impact. Contactez votre agent Optee pour accéder dès maintenant à notre marketplace exclusive."
      : "Veuillez ajouter au moins un site pour accéder à cette fonctionnalité",
  );

  readonly NAV_ITEMS$ = this.authService.loggedAs$.pipe(
    switchMap((loggedAs) => {
      if (!loggedAs) {
        return of([]);
      }
      return loggedAs === UserType.CLIENT
        ? this.clientPages$
        : this.proMarketplaceRoutes$;
    }),
    shareReplay(1),
  );
}
