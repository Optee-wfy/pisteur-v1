import { AsyncPipe, NgClass } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { buildAssetUrl, ProSubscription } from "@optee/constants";
import { DialogConfirmationComponent, DialogService } from "@optee/dialog";
import {
  IconBoltComponent,
  IconBuildingComponent,
  IconChevronRightComponent,
  IconCompanyComponent,
  IconCrosshairComponent,
  IconGearComponent,
  IconMagicWandComponent,
  IconPeopleDuoComponent,
  IconPowerComponent,
  IconRocketComponent,
} from "@optee/icons";
import { formatFullName } from "@optee/utils";
import { Tooltip } from "primeng/tooltip";
import { map } from "rxjs";
import { AuthService } from "../../../../services/auth.service";
import { ProService } from "../../../../services/pro.service";
import { NavItemComponent } from "../nav-item/nav-item.component";
import { UserModalComponent } from "../user-modal/user-modal.component";

@Component({
  selector: "mkp-sidebar",
  host: { class: "border-r border-granite-100" },
  template: `
    <aside
      class="flex h-full flex-col justify-between bg-white px-3 pb-3 pt-5"
      role="navigation"
      style="width: var(--prospect-sidebar-width);"
      aria-label="Navigation principale"
    >
      <div class="flex flex-col gap-2">
        <!-- HEADER -->
        <header class="mb-3 flex w-fit items-center gap-2.5">
          <img class="w-24" alt="Logo de Optee" [src]="pisterUrl" />
          <span
            class="bg-primary-500 flex cursor-help items-center rounded-lg px-1.5 py-0.5 text-xs text-white"
            tooltipPosition="bottom"
            tooltipStyleClass="!w-80"
            aria-label="Version bêta en cours de finalisation"
            [pTooltip]="betaTooltip"
          >
            Bêta
          </span>
        </header>

        <hr class="border-granite-200 my-2" />

        <!-- MOTEUR DE RECHERCHE (accordion) -->
        <div class="mb-1">
          <button
            class="text-granite-500 flex w-full items-center gap-1.5 px-3 py-2 text-xs font-medium uppercase tracking-wide xl:text-sm"
            (click)="toggleMoteurRecherche()"
            [attr.aria-expanded]="moteurRechercheOpen()"
          >
            <icon-chevron-right
              class="size-3 transition-transform"
              [class.rotate-90]="moteurRechercheOpen()"
            />
            <span class="whitespace-nowrap">Moteur de recherche</span>
          </button>

          @if (moteurRechercheOpen()) {
            <div class="mt-1 flex flex-col gap-4 pl-2">
              <!-- PROSPECTION AVANCÉE -->
              <div>
                <p
                  class="text-granite-400 mb-2 px-3 text-xs font-medium uppercase tracking-wide"
                >
                  Prospection avancée
                </p>
                <menu class="flex flex-col gap-y-1">
                  <li>
                    <mkp-nav-item routerLink="/pro/pisteur/places">
                      <icon-building
                        class="text-granite-900 size-4"
                        slot="icon"
                      />
                      Bâtiments
                    </mkp-nav-item>
                  </li>
                  <li>
                    <mkp-nav-item routerLink="/pro/pisteur/legal-entities">
                      <icon-company
                        class="text-granite-900 size-4"
                        slot="icon"
                      />
                      Entreprises
                    </mkp-nav-item>
                  </li>
                </menu>
              </div>

              <!-- CARNET D'ADRESSE -->
              <div>
                <p
                  class="text-granite-400 mb-2 px-3 text-xs font-medium uppercase tracking-wide"
                >
                  Carnet d'adresse
                </p>
                <menu class="flex flex-col gap-y-1">
                  <li>
                    <mkp-nav-item routerLink="/pro/pisteur/address-book/places">
                      <icon-building
                        class="text-granite-900 size-4"
                        slot="icon"
                      />
                      Bâtiments
                    </mkp-nav-item>
                  </li>
                  <li>
                    <mkp-nav-item
                      routerLink="/pro/pisteur/address-book/legal-entities"
                    >
                      <icon-company
                        class="text-granite-900 size-4"
                        slot="icon"
                      />
                      Entreprises
                    </mkp-nav-item>
                  </li>
                </menu>
              </div>
            </div>
          }
        </div>

        <!-- MES LEADS -->
        <mkp-nav-item routerLink="/pro/pisteur/address-book/leads">
          <icon-rocket class="size-4 text-blue-500" slot="icon" />
          Mes Leads
        </mkp-nav-item>

        <!-- MES CONTACTS -->
        <mkp-nav-item routerLink="/pro/pisteur/address-book/contacts">
          <icon-people-duo class="size-4 text-purple-500" slot="icon" />
          Mes Contacts
        </mkp-nav-item>

        <!-- SEPARATOR -->
        <hr class="border-granite-200 my-2" />

        <!-- ASSISTANT IA (hidden, coming soon) -->
        <div
          class="cursor-default"
          pTooltip="Bientôt disponible"
          tooltipPosition="right"
        >
          <button
            class="bg-granite-100 text-granite-800 flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium opacity-70"
            disabled
          >
            <icon-magic-wand class="size-4 shrink-0" />
            <span>Ouvrir l'Assistant IA</span>
          </button>
        </div>
      </div>

      <!-- FOOTER -->
      <footer class="flex flex-col gap-1">
        <div class="border-granite-200 border-y py-1">
          <a
            class="flex min-h-11 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
            #parametrage="routerLinkActive"
            routerLink="/pro/pisteur/leads/generate"
            routerLinkActive
            [ngClass]="
              parametrage.isActive
                ? 'bg-green-600 text-white'
                : 'hover:bg-granite-100 text-granite-900'
            "
          >
            <icon-crosshair class="size-4" />
            Paramétrage
          </a>
        </div>

        @if (authService.isAdminOptee()) {
          <mkp-nav-item routerLink="/admin">Administration</mkp-nav-item>
        }

        @if (hasImpactSubscription()) {
          <mkp-nav-item routerLink="/pro/marketplace">Marketplace</mkp-nav-item>
        }

        <!-- CREDITS CARD -->
        <div
          class="mt-1.5 flex flex-col gap-1 rounded-xl border border-blue-100 bg-blue-50 p-2.5"
        >
          <div
            class="flex items-center gap-1.5 text-xs font-medium text-blue-500"
          >
            <icon-bolt class="size-3.5" />
            <span>Crédits</span>
          </div>
          <span class="text-2xl font-bold leading-none text-blue-700">
            {{ proService.remainingCredits() }}
          </span>
          <span class="text-granite-400 text-xs">
            1 liste de leads = 10 crédits
          </span>
        </div>

        <!-- USER ROW -->
        <div class="mt-0.5 flex w-full items-center gap-1">
          <mkp-nav-item
            class="flex-1 shrink-0 cursor-pointer"
            (click)="openUserSettings()"
          >
            <span
              class="flex size-5 items-center justify-center rounded-full bg-black text-[8px] text-white"
              slot="icon"
            >
              {{ authService.userInitial$ | async }}
            </span>
            <span class="line-clamp-1 max-w-full">{{ userName$ | async }}</span>
          </mkp-nav-item>
          <button
            class="hover:bg-granite-100 hover:text-granite-700 text-granite-400 size-9 cursor-pointer rounded-lg p-2 transition-colors"
            aria-label="Paramètres utilisateur"
            (click)="openUserSettings()"
          >
            <icon-gear class="size-5" />
          </button>
          <button
            class="text-granite-400 size-9 cursor-pointer rounded-lg p-2 transition-colors hover:bg-red-100 hover:text-red-400"
            aria-label="Se déconnecter"
            (click)="logout()"
          >
            <icon-power class="size-5" />
          </button>
        </div>
      </footer>
    </aside>
  `,
  imports: [
    AsyncPipe,
    NgClass,
    IconBoltComponent,
    IconBuildingComponent,
    IconChevronRightComponent,
    IconCompanyComponent,
    IconCrosshairComponent,
    IconGearComponent,
    IconMagicWandComponent,
    IconPeopleDuoComponent,
    IconPowerComponent,
    IconRocketComponent,
    NavItemComponent,
    RouterLink,
    RouterLinkActive,
    Tooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  protected readonly proService = inject(ProService);
  protected readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);

  protected readonly betaTooltip = `Cette application est en cours de finalisation. Certaines fonctionnalités peuvent encore évoluer ! \nN'hésitez pas à nous contacter pour nous faire part de vos retours.`;

  protected readonly pisterUrl = buildAssetUrl("pister.svg");

  protected readonly moteurRechercheOpen = signal(false);

  protected readonly userName$ = this.authService.contact$.pipe(
    map((user) => {
      return (
        formatFullName({
          firstName: user?.firstName || null,
          lastName: user?.lastName || null,
        }) || "Utilisateur inconnu"
      );
    }),
  );

  protected readonly hasImpactSubscription = computed(
    () => this.proService.subscription() === ProSubscription.IMPACT,
  );

  protected toggleMoteurRecherche() {
    this.moteurRechercheOpen.update((v) => !v);
  }

  protected openUserSettings() {
    this.dialogService.open(UserModalComponent, {});
  }

  protected async logout() {
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
