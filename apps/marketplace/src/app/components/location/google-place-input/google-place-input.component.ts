import { NgxGpAutocompleteModule } from "@angular-magic/ngx-gp-autocomplete";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  resource,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import { InputText } from "primeng/inputtext";
import { concatMap, filter } from "rxjs";
import trpcClient from "../../../../trpc-client";

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
  selector: "mkp-google-place-input",
  template: `
    <input
      class="w-full"
      id="googlePlace-input"
      #placesRef="ngx-places"
      fluid
      ngx-gp-autocomplete
      pInputText
      placeholder="Saisissez une adresse..."
      (onAddressChange)="place.set($event)"
      [(ngModel)]="addressField"
      [disabled]="disabled()"
      [options]="{ componentRestrictions: { country: 'fr' } }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxGpAutocompleteModule, FormsModule, InputText],
})
export class GooglePlaceInputComponent {
  readonly addressField = model<string>("");
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly toastService = inject(ToastService);

  readonly place = signal<google.maps.places.PlaceResult | null>(null);

  readonly subSimulatePlaceWhenNotFound = toObservable(this.place)
    .pipe(
      concatMap(async (place) => {
        if (place) {
          return;
        }

        const address = this.addressField();

        if (!address) {
          return;
        }

        const simulated =
          await trpcClient.locations.convertAddressToPlaceResult.query({
            address,
          });

        if (simulated) {
          this.place.set(simulated);
        } else {
          this.toastService.openError(
            "Analyse de l'adresse saisie",
            "L'adresse n'est pas reconnue par Google place",
          );
        }
      }),
      takeUntilDestroyed(),
    )
    .subscribe();

  readonly subToast = toObservable(this.place)
    .pipe(filter(isNotNullish), takeUntilDestroyed())
    .subscribe((place) => {
      try {
        extractGooglePlaceAddressData(place);
        extractGooglePlaceData(place);
      } catch (err) {
        // @todo For some reason those errors don't show up
        this.toastService.openError("Analyse de l'adresse saisie", err);
      }
    });

  // Can be used from the outside to get the address data
  readonly bdnbResResource = resource({
    params: () => ({
      place: this.place(),
    }),
    loader: async ({ params }) => {
      if (!params.place?.formatted_address) {
        return null;
      }

      return trpcClient.locations.getBdnbData.query({
        address: params.place.formatted_address,
        lat: params.place.geometry?.location?.lat(),
        lng: params.place.geometry?.location?.lng(),
      });
    },
  });
}
