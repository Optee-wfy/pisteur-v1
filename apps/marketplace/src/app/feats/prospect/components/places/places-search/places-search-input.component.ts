import { NgxGpAutocompleteModule } from "@angular-magic/ngx-gp-autocomplete";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  resource,
  signal,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { BDNB_API_RESPONSE_SCHEMA } from "@optee/constants";
import {
  IconErrorComponent,
  IconRefreshComponent,
  IconSearchComponent,
  IconSuccessComponent,
} from "@optee/icons";
import { ToastService } from "@optee/ui/services/toast.service";
import { InputText } from "primeng/inputtext";
import { Popover } from "primeng/popover";
import { Tooltip } from "primeng/tooltip";
import z from "zod";
import trpcClient from "../../../../../../trpc-client";

const geocodingResponseSchema = z.object({
  features: z.array(
    z.object({
      properties: z.object({
        id: z.string(),
      }),
    }),
  ),
});

export const extractGooglePlaceData = (
  place: google.maps.places.PlaceResult,
) => {
  return {
    formattedAddress: place.formatted_address,
    googlePlaceId: place.place_id,
    longitude: place.geometry?.location?.lng(),
    latitude: place.geometry?.location?.lat(),
    name: place.name,
  };
};

export const extractGooglePlaceAddressData = (
  place: google.maps.places.PlaceResult,
) => {
  const streetNumber = place.address_components?.find((c) =>
    c.types.includes("street_number"),
  )?.long_name;

  const streetName = place.address_components?.find((c) =>
    c.types.includes("route"),
  )?.long_name;

  const city = place.address_components?.find((c) =>
    c.types.includes("locality"),
  )?.long_name;

  const zipcode = place.address_components?.find((c) =>
    c.types.includes("postal_code"),
  )?.long_name;

  if (!zipcode) {
    throw new Error(
      "Impossible de récupérer le code postal à partir de l'adresse.",
    );
  }

  if (!city) {
    throw new Error("Impossible de récupérer la ville à partir de l'adresse.");
  }

  return {
    streetNumber,
    streetName,
    zipcode,
    city,
  };
};

@Component({
  selector: "mkp-places-search-input",
  host: { class: "relative" },
  template: `
    <button
      class="prospect-button flex h-7 items-center justify-center gap-1 rounded-lg border px-2 text-sm font-medium transition-all"
      (click)="popover?.toggle($event)"
    >
      <icon-search class="size-3" />
      <span class="whitespace-nowrap">Rechercher une adresse</span>
    </button>

    <p-popover #popover>
      <div class="relative -m-2 flex items-center gap-2 px-1">
        <input
          class="w-80"
          id="googlePlace-input"
          #placesRef="ngx-places"
          fluid
          ngx-gp-autocomplete
          pInputText
          placeholder="Saisissez une adresse..."
          size="small"
          (onAddressChange)="placeResult.set($event)"
          [(ngModel)]="addressField"
          [disabled]="disabled()"
          [options]="{ componentRestrictions: { country: 'fr' } }"
        />

        <div
          class="absolute right-3 top-1/2 w-fit -translate-y-1/2 rounded-full bg-white p-1"
        >
          @if (placeResult()) {
            @if (placeId.isLoading()) {
              <icon-refresh class="size-6 animate-spin text-gray-500" />
            } @else if (placeId.value()) {
              <icon-success class="size-6 text-green-500" />
            } @else {
              <icon-error
                class="size-6 text-red-500"
                pTooltip="Impossible de récupérer les données BDNB pour cette adresse."
                tooltipPosition="left"
              />
            }
          }
        </div>
      </div>
    </p-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgxGpAutocompleteModule,
    FormsModule,
    InputText,
    IconErrorComponent,
    IconSuccessComponent,
    IconRefreshComponent,
    IconSearchComponent,
    Tooltip,
    Popover,
  ],
})
export class PlacesSearchInputComponent {
  readonly addressField = model<string>("");
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  @ViewChild("popover") popover?: Popover;

  protected readonly placeResult =
    signal<google.maps.places.PlaceResult | null>(null);

  protected readonly placeId = resource({
    params: () => this.placeResult(),
    loader: async ({ params: placeResult, abortSignal }) => {
      if (!placeResult) {
        return null;
      }

      const {
        longitude: lng,
        latitude: lat,
        formattedAddress: address,
      } = extractGooglePlaceData(placeResult);

      if (!address) {
        return null;
      }

      try {
        const geocodingResponse = await fetch(
          `https://api.bdnb.io/v1/bdnb/geocodage?q=${address}&autocomplete=0${lat && lng ? `&lat=${lat}&lon=${lng}` : ""}`,
          { signal: abortSignal },
        );

        if (!geocodingResponse.ok) {
          throw new Error(
            `L'API BDNB n'a pas réussi à géocoder cette adresse. HTTP Status: ${geocodingResponse.status}`,
          );
        }

        const geocodingData = geocodingResponseSchema.parse(
          await geocodingResponse.json(),
        );

        const firstBuilding = geocodingData.features[0];
        if (!firstBuilding) {
          throw new Error(
            `L'API BDNB n'a trouvé aucun site à cette adresse : ${address}`,
          );
        }

        const cleInterop = firstBuilding.properties?.id;
        if (!cleInterop) {
          throw new Error(
            `L'API BDNB n'a trouvé aucun ID de site correspondant à cette adresse: ${address}`,
          );
        }

        const buildingData = await fetch(
          `https://api.bdnb.io/v1/bdnb/donnees/batiment_groupe_complet/adresse?cle_interop_adr=eq.${cleInterop}&limit=1`,
          { signal: abortSignal },
        );
        const buildingDataJson = await buildingData.json();

        if (!Array.isArray(buildingDataJson) || buildingDataJson.length === 0) {
          this.toastService.open(
            "warn",
            "Recherche d'adresse",
            "Aucune donnée trouvée pour cette adresse.",
          );
          return null;
        }

        const firstBuildingData = BDNB_API_RESPONSE_SCHEMA.parse(
          buildingDataJson[0],
        );

        const bdnbGroupId = firstBuildingData?.batiment_groupe_id ?? null;

        if (bdnbGroupId) {
          const knownPlace =
            await trpcClient.locationsBdnb.getByBdnbGroupId.query(bdnbGroupId);
          if (knownPlace?.uuid) {
            return { type: "known", id: knownPlace.uuid };
          }
        }

        const knownAddress =
          await trpcClient.locationsBdnb.getByAddress.query(address);
        if (knownAddress) {
          return { type: "known", id: knownAddress.uuid };
        }

        return { type: "new", id: bdnbGroupId };
      } catch (err) {
        throw new Error(
          `Impossible de récupérer les données BDNB pour cette adresse: ${err instanceof Error ? err.message : "Erreur inconnue"}`,
        );
      }
    },
  });

  private readonly redirectToSearchPage = effect(async () => {
    const place = this.placeId.value();
    if (!place) {
      return;
    }

    if (place.type === "new") {
      this.router.navigate(["/pro/pisteur/places/search", place.id]);
    } else {
      this.router.navigate(["/pro/pisteur/places/details", place.id]);
      return;
    }
  });
}
