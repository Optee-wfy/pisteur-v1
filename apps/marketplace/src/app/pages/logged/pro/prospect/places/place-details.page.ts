import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import type {
  LocationBdnbLegalEntityFilterPro,
  LocationBdnbLegalEntityFilterProSort,
} from "@optee/constants";
import {
  IconBuildingComponent,
  IconChevronRightComponent,
  IconCompanyComponent,
} from "@optee/icons";
import {
  ExternalLocation,
  type LegalEntityUuid,
  type LocationBdnbUuid,
} from "@optee/models";
import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { PreviousNextButtonsComponent } from "@optee/ui/components/molecules/previous-next-buttons/previous-next-buttons.component";
import { FormatAddressPipe } from "@optee/ui/pipes/format-address.pipe";
import { ToastService } from "@optee/ui/services/toast.service";
import { ButtonModule } from "primeng/button";
import { TabsModule } from "primeng/tabs";
import { trpcClient } from "../../../../../../trpc-client";
import { LegalEntitiesTabComponent } from "../../../../../feats/prospect/components/legal-entities-tab/legal-entities-tab.component";
import { PlaceInformationsTabComponent } from "../../../../../feats/prospect/components/places/place-informations-tab/place-informations-tab.component";
import { PlacesNavigationService } from "../../../../../feats/prospect/services/places-navigation.service";

@Component({
  selector: "mkp-place-details-page",
  host: { class: "w-full bg-white h-screen flex flex-col" },
  // providers: [EnedisDataService],
  template: `
    <header
      class="border-granite-200 flex w-full items-center border-b bg-white px-4 py-1 shadow-sm"
    >
      <button class="pister-link" (click)="goBack()">
        <icon-chevron-right
          class="size-3 rotate-180 transition-transform group-hover:translate-x-[-2px]"
        />
        <span class="font-medium">Retour</span>
      </button>
    </header>

    <section class="flex h-full flex-1 flex-col">
      @if (place.isLoading()) {
        <oui-loader label="Chargement des détails du bâtiment..." />
      } @else if (place.error()) {
        <!-- Error state, quelque chose de déjà dispo ? icon-error ...-->
        <div class="flex h-full items-center justify-center px-4">
          <div class="text-center">
            <div
              class="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-red-50"
            ></div>
            <h3 class="text-granite-900 mb-2 text-base font-semibold">
              Erreur de chargement
            </h3>
            <p class="text-granite-600 text-sm">
              Impossible de charger les données du site
            </p>
          </div>
        </div>
      } @else {
        <!-- Title bar -->
        <header
          class="border-granite-200 flex w-full items-center gap-2 border-b bg-white px-4 py-3 shadow-sm"
        >
          <div
            class="bg-granite-100 flex size-8 items-center justify-center rounded-lg"
          >
            <icon-building class="text-granite-700 size-4" />
          </div>
          @if (place.value(); as place) {
            <h1 class="text-granite-900 text-sm font-semibold">
              {{ place | formatAddress }}
            </h1>
          } @else {
            <h1 class="text-granite-900 text-sm font-semibold">
              Bâtiment indisponible
            </h1>
          }

          @if (previousLocationUuid() || nextLocationUuid()) {
            <oui-previous-next-buttons
              class="ml-auto"
              (next)="goTo('next')"
              (previous)="goTo('previous')"
              [disabledNext]="!nextLocationUuid()"
              [disabledPrevious]="!previousLocationUuid()"
            />
          }
        </header>

        @if (place.value(); as place) {
          <p-tabs class="h-full" scrollable [(value)]="activeTab">
            <p-tablist
              class="p-tablist--small border-granite-200 w-full border-b p-2"
            >
              <p-tab value="informations">
                <button
                  class="pister-link"
                  [class.bg-granite-100]="activeTab() === 'informations'"
                >
                  <icon-building class="size-3" slot="icon" />
                  <span>Informations</span>
                </button>
              </p-tab>
              <p-tab value="legalEntities">
                <button
                  class="pister-link"
                  [class.bg-granite-100]="activeTab() === 'legalEntities'"
                >
                  <icon-company class="size-3" slot="icon" />
                  <span>Entreprises</span>
                </button>
              </p-tab>
            </p-tablist>

            <div class="relative block h-full overflow-y-auto">
              <p-tabpanels class="absolute inset-0 !p-0">
                <p-tabpanel
                  value="informations"
                  [class.h-full]="activeTab() === 'informations'"
                >
                  <mkp-place-informations-tab
                    (goToLegalEntities)="activeTab.set('legalEntities')"
                    [legalEntitiesCount]="legalEntitiesCount.value() ?? 0"
                    [place]="place"
                    [solicitationCount]="solicitationCount()"
                  />
                </p-tabpanel>

                <p-tabpanel value="legalEntities">
                  <mkp-legal-entities-tab
                    (unlocked)="onSolicitationUnlocked()"
                    [address]="place | formatAddress"
                    [legalEntitiesCount]="legalEntitiesCount.value() ?? 0"
                    [locationBdnbUuid]="uuid()"
                    [solicitationCount]="solicitationCount()"
                  />
                </p-tabpanel>
              </p-tabpanels>
            </div>
          </p-tabs>
        } @else {
          <!-- No data state -->
          <div
            class="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4"
          >
            <div class="text-center">
              <h3 class="text-granite-900 mb-2 text-base font-semibold">
                Aucune donnée disponible
              </h3>
              <p class="text-granite-600 text-sm">
                Les informations de ce site ne sont pas disponibles
              </p>
            </div>
          </div>
        }
      }
    </section>
  `,
  imports: [
    IconBuildingComponent,
    IconCompanyComponent,
    IconChevronRightComponent,
    PlaceInformationsTabComponent,
    ButtonModule,
    TabsModule,
    LegalEntitiesTabComponent,
    FormatAddressPipe,
    LoaderComponent,
    PreviousNextButtonsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceDetailsPage {
  readonly uuid = input.required<LocationBdnbUuid>();

  private readonly toastService = inject(ToastService);

  private readonly router = inject(Router);
  protected readonly navigationService = inject(PlacesNavigationService);

  private readonly isSyncInProgress = signal(false);
  private readonly syncedPages = signal<Set<number>>(new Set());
  private readonly lastContextKey = signal<string | null>(null);
  protected readonly solicitationCount = signal<number | null>(null);

  protected readonly activeTab = signal("informations");

  protected readonly place = resource({
    params: () => this.uuid(),
    loader: async ({ params: uuid }) => {
      try {
        this.solicitationCount.set(null);
        const res = await trpcClient.locationsBdnb.get.query(uuid);
        const location = res?.batiments_bdnb;
        if (!location) {
          throw new Error(
            "Ce bâtiment n'a pas été trouvé. Si le problème persiste, contactez le support.",
          );
        }
        this.solicitationCount.set(Number(res?.nbRelatedPros ?? 0));
        //this.locationGroupId.set(location?.locationGroupId ?? null);
        return ExternalLocation.init(location, res?.personnes_morales);
      } catch (error) {
        this.solicitationCount.set(null);
        this.toastService.openError("Chargement du bâtiment.", error);
        return null;
      }
    },
  });

  protected readonly syncLocationList = effect(async () => {
    const uuid = this.uuid();
    if (this.isSyncInProgress()) {
      return;
    }

    const isLast = this.navigationService.isLastLocation(uuid);
    const isFirst = this.navigationService.isFirstLocation(uuid);
    if (!isLast && !isFirst) {
      return;
    }

    const context = this.navigationService.queryContext();
    if (!context) {
      return;
    }

    const { page, pageSize, sort, show, legalEntityUuid, filters } = context;

    const contextKey = JSON.stringify({
      pageSize,
      sort,
      show,
      legalEntityUuid,
      filters,
    });
    if (this.lastContextKey() !== contextKey) {
      this.syncedPages.set(new Set());
      this.lastContextKey.set(contextKey);
    }

    const targetPage = isLast
      ? page + 1
      : isFirst && page > 0
        ? page - 1
        : null;
    if (targetPage === null) {
      return;
    }

    if (this.syncedPages().has(targetPage)) {
      return;
    }

    this.isSyncInProgress.set(true);
    try {
      const newLocations = await this.fetchLocationPage(
        filters,
        targetPage,
        pageSize,
        sort,
        show,
        legalEntityUuid,
      );

      if (!newLocations) {
        return;
      }

      this.syncedPages.update((pages) => {
        const next = new Set(pages);
        next.add(targetPage);
        return next;
      });

      if (newLocations.length === 0) {
        return;
      }

      this.navigationService.locationsList.update((list) =>
        isFirst ? [...newLocations, ...list] : [...list, ...newLocations],
      );
    } finally {
      this.isSyncInProgress.set(false);
    }
  });

  protected readonly legalEntitiesCount = resource({
    params: () => this.uuid(),
    loader: async ({ params: locationBdnbUuid }) => {
      try {
        if (!locationBdnbUuid) {
          return 0;
        }
        const count =
          await trpcClient.legalEntities.getAssociationsWithLocationBdnbCount.query(
            locationBdnbUuid,
          );
        return count;
      } catch (error) {
        this.toastService.openError(
          "Chargement du nombre d'entreprises.",
          error,
        );
        return 0;
      }
    },
  });

  readonly nextLocationUuid = computed(() =>
    this.navigationService.nextLocation(this.uuid()),
  );

  readonly previousLocationUuid = computed(() =>
    this.navigationService.previousLocation(this.uuid()),
  );

  goTo(direction: "next" | "previous") {
    const targetUuid =
      direction === "next"
        ? this.nextLocationUuid()
        : this.previousLocationUuid();
    if (targetUuid) {
      this.router.navigate(["/pro/pisteur/places/details", targetUuid]);
    }
  }

  private async fetchLocationPage(
    filters: LocationBdnbLegalEntityFilterPro | null,
    page: number,
    pageSize: number,
    sort: LocationBdnbLegalEntityFilterProSort | null,
    show: "new" | "unlocked" | "all" | null,
    legalEntityUuid: LegalEntityUuid | null,
  ) {
    try {
      const response =
        await trpcClient.locationsBdnb.getAllPaginatedForPro.mutate({
          ...(filters ?? {}),
          page,
          pageSize,
          sort: sort ?? undefined,
          show: show ?? undefined,
          legalEntityUuid: legalEntityUuid ?? undefined,
        });

      return response.items.map((loc) => loc.location.uuid);
    } catch (error) {
      this.toastService.openError("Chargement des bâtiments.", error);
      return null;
    }
  }

  protected readonly onSolicitationUnlocked = () => {
    this.solicitationCount.update((count) => (count ?? 0) + 1);
  };

  goBack() {
    history.back();
  }
}
