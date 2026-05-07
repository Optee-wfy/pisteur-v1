import { httpResource } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from "@angular/core";
import type { BdnbApiResponse } from "@optee/constants";
import { apiBdnbUrl, normalizeBdnbApiResponse } from "@optee/constants";
import {
  IconBuildingComponent,
  IconChevronRightComponent,
  IconLocationPinComponent,
} from "@optee/icons";

import { ExternalLocation } from "@optee/models";
import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { ToastService } from "@optee/ui/services/toast.service";
import trpcClient from "../../../../../../trpc-client";
import { PlaceDataGridComponent } from "../../../../../feats/prospect/components/place-data-grid/place-data-grid.component";
import { EXTERNAL_BDNB_PROP_CONFIG } from "../../../../../feats/prospect/components/place-data-grid/place-props.constant";

@Component({
  selector: "mkp-place-search-page",
  host: { class: "w-full bg-white h-screen flex flex-col" },
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
      @if (bdnbResponse.isLoading()) {
        <oui-loader label="Chargement des détails du bâtiment..." />
      } @else if (bdnbResponse.error()) {
        <div class="flex h-full flex-col items-center justify-center px-4">
          <h3 class="text-granite-900 mb-2 text-base font-semibold">
            Erreur de chargement
          </h3>
          <p class="text-granite-600 text-sm">
            Impossible de charger les données du site
          </p>
        </div>
      } @else {
        @if (place(); as place) {
          <!-- Title bar -->
          <header
            class="border-granite-200 flex w-full items-center gap-2 border-b bg-white px-4 py-3 shadow-sm"
          >
            <div
              class="bg-granite-100 flex size-8 items-center justify-center rounded-lg"
            >
              <icon-building class="text-granite-700 size-4" />
            </div>
            <h1 class="text-granite-900 text-sm font-semibold">
              {{ place.address }}
            </h1>
          </header>

          <section
            class="flex max-h-full max-w-screen-xl flex-col items-center gap-6 overflow-y-auto lg:flex-row lg:flex-wrap lg:items-start"
          >
            <!-- Data columns -->
            <div
              class="order-2 flex min-w-80 flex-col gap-8 p-4 lg:order-1 lg:mr-auto lg:flex-1"
            >
              @for (category of BDNB_PROP_CONFIG; track category.key) {
                <mkp-place-data-grid
                  class="w-full lg:max-w-xl"
                  [category]="category"
                  [compareLocation]="place.details"
                  [location]="place.details"
                />
              }
            </div>

            <!-- Street View -->
            <div class="order-1 max-w-lg flex-1 p-4 lg:order-2">
              @if (streetView.value(); as streetViewUrl) {
                <article [style.width.px]="streetViewWidth">
                  <h2 class="mb-4 flex items-center gap-2">
                    <div
                      class="bg-granite-100 flex size-5 items-center justify-center rounded-lg"
                    >
                      <icon-location-pin
                        class="text-granite-700 size-2 text-sm font-medium"
                      />
                    </div>
                    <span class="text-granite-900 text-sm font-medium">
                      {{ place.address }}
                    </span>
                  </h2>
                  <img
                    class="w-full rounded-lg object-cover"
                    [alt]="'Vue de ' + place.address"
                    [src]="streetViewUrl"
                    [style.height.px]="streetViewHeight"
                    [style.width.px]="streetViewWidth"
                  />
                </article>
              }
            </div>
          </section>
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
    IconChevronRightComponent,
    IconBuildingComponent,
    IconLocationPinComponent,
    PlaceDataGridComponent,
    LoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceSearchPage {
  readonly id = input.required<string>();

  private readonly toastService = inject(ToastService);

  protected readonly BDNB_PROP_CONFIG = EXTERNAL_BDNB_PROP_CONFIG;
  protected readonly streetViewHeight = 266;
  protected readonly streetViewWidth = 472;

  protected readonly bdnbResponse = httpResource<BdnbApiResponse[]>(() =>
    this.id() ? apiBdnbUrl + this.id() + "&limit=1" : undefined,
  );

  protected readonly place = computed(() => {
    if (this.bdnbResponse.error()) {
      console.error(
        "Erreur lors de la récupération des dernières données BDNB sur le bâtiment ",
        this.id(),
        this.bdnbResponse.error(),
      );
      return null;
    }

    const latestData = this.bdnbResponse.value();
    // Do not log while the resource is still loading; wait until it has settled.
    if (!this.bdnbResponse.hasValue()) {
      return null;
    }

    const data = latestData?.at(0);
    if (!data) {
      console.error(
        "Erreur lors de la récupération des dernières données BDNB sur le bâtiment ",
        this.id(),
      );
      return null;
    }

    const details = ExternalLocation.init(normalizeBdnbApiResponse(data));
    if (!details) {
      this.toastService.openError(
        "Récupération des détails BDNB",
        "Impossible de normaliser les données BDNB reçues.",
      );
      return null;
    }
    return {
      details,
      address: data.libelle_adr_principale_ban || "",
    };
  });

  protected readonly streetView = resource({
    params: () => this.place()?.address ?? undefined,
    loader: async ({ params: address }) => {
      if (!address) {
        return null;
      }

      return trpcClient.locations.getStreetViewUrl.query({
        address,
        width: this.streetViewWidth,
        height: this.streetViewHeight,
      });
    },
  });

  goBack() {
    history.back();
  }
}
