import { NgxGpAutocompleteModule } from "@angular-magic/ngx-gp-autocomplete";
import { AsyncPipe, NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  linkedSignal,
  output,
  viewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  type CLIENT_TRACKING_EVENTS,
  type LocationAddressDetails,
  type LocationPlaceDetails,
  type XFactorsKey,
} from "@optee/constants";
import { IconLocationComponent } from "@optee/icons";
import {
  type HubspotLocationBdnbData,
  Location,
  type LocationUuid,
} from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { AppService } from "../../../services/app.service";
import {
  extractGooglePlaceAddressData,
  extractGooglePlaceData,
  GooglePlaceInputComponent,
} from "../google-place-input/google-place-input.component";
import { LocationColumnComponent } from "../location-column/location-column.component";

export type LocationFormInput =
  | {
      mode: "edit";
      location: Location;
      highlightXFactors?: XFactorsKey[];
    }
  | {
      mode: "create";
      source: (typeof CLIENT_TRACKING_EVENTS)["location_add"]["properties"]["source"][number];
      sourceAddress?: string;
    }
  | {
      mode: "shallow";
      sourceAddress?: string;
    };

export type LocationFormSubmitDTO = {
  addressData: LocationAddressDetails;
  placeData: LocationPlaceDetails;
  customBdnbData: HubspotLocationBdnbData;
};

@Component({
  selector: "mkp-location-form",
  template: `
    @let dataV = data();

    <!-- Variante mobile / desktop selon appService.isMobile$ -->
    @if (appService.isMobile$ | async) {
      <div class="flex flex-col gap-6 overflow-auto p-6">
        <ng-container *ngTemplateOutlet="titleTpl" />
        <ng-container *ngTemplateOutlet="addressInputTpl" />
        <ng-container *ngTemplateOutlet="submitTpl" />
        <ng-container *ngTemplateOutlet="locationBdnbTpl" />
      </div>
    } @else {
      <!-- Desktop: panneau BDNB + panneau formulaire/visuel côte‑à‑côte -->
      <div class="flex h-full w-full">
        <div
          class="bg-primary-700 dialog-min-h-app w-full max-w-lg overflow-y-auto text-white"
        >
          <ng-container *ngTemplateOutlet="locationBdnbTpl" />
        </div>

        <div
          class="hMd:pt-12 dialog-min-h-app flex flex-1 flex-col justify-center gap-8 overflow-y-auto px-20 py-6"
        >
          <ng-container *ngTemplateOutlet="titleTpl" />
          <ng-container *ngTemplateOutlet="addressInputTpl" />
          <ng-container *ngTemplateOutlet="submitTpl" />
        </div>
      </div>
    }

    <ng-template #locationBdnbTpl>
      <mkp-location-column
        class="max-w-lg overflow-y-auto rounded-3xl lg:rounded-none"
        [(location)]="location"
        [canUpdate]="canEditLocation()"
        [highlightXFactors]="
          dataV.mode === 'edit' ? (dataV.highlightXFactors ?? []) : []
        "
        [previewSrc]="
          dataV.mode === 'edit' ? dataV.location.streetViewUrl : null
        "
      />
    </ng-template>

    <ng-template #submitTpl>
      <div class="flex flex-col items-center justify-center gap-6">
        @if (dataV.mode === "edit") {
          <oui-message>
            Vos modifications vont entraîner un recalcul des estimations
            d’impacts et de coûts des opérations.
          </oui-message>
        }
        <oui-button
          variant="primary"
          (click)="submit()"
          [disabled]="!location()"
        >
          @if (dataV.mode === "edit") {
            Enregistrer les modifications
          } @else if (dataV.mode === "shallow") {
            Sélectionner ce site
          } @else {
            Ajouter ce site
          }
        </oui-button>
      </div>
    </ng-template>

    <ng-template #titleTpl>
      <div class="flex flex-col gap-2">
        <div class="bg-primary-700 h-1 w-28"></div>
        <div
          class="font-display text-primary-900 flex items-baseline gap-2 text-3xl font-semibold"
        >
          <icon-location class="text-primary-700 size-8" colorMode="semi" />
          @if (dataV.mode === "edit") {
            Modification du site
          } @else {
            Nouveau site
          }
        </div>
      </div>

      <p class="max-w-prose text-sm text-gray-600 lg:text-base">
        @if (dataV.mode === "edit") {
          Modifiez manuellement les informations récupérées par notre système
          pour améliorer vos préconisations.
        } @else {
          Renseignez votre adresse pour récupérer les informations de votre
          site. Si besoin, modifiez manuellement les informations récupérées par
          notre système pour améliorer vos préconisations.
        }
      </p>
    </ng-template>

    <ng-template #addressInputTpl>
      <mkp-google-place-input
        [(addressField)]="addressField"
        [disabled]="!canSetAddress()"
      />
    </ng-template>
  `,
  imports: [
    ButtonComponent,
    MessageComponent,
    IconLocationComponent,
    LocationColumnComponent,
    FormsModule,
    AsyncPipe,
    NgTemplateOutlet,
    NgxGpAutocompleteModule,
    GooglePlaceInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationFormComponent {
  readonly data = input.required<LocationFormInput>();
  readonly canSetAddress = input(false, { transform: booleanAttribute });
  readonly canEditLocation = input(false, { transform: booleanAttribute });

  readonly submitted = output<LocationFormSubmitDTO>();

  readonly googlePlaceInput = viewChild(GooglePlaceInputComponent);

  protected readonly appService = inject(AppService);
  protected readonly toastService = inject(ToastService);

  protected readonly addressField = linkedSignal(() => {
    const data = this.data();
    return data.mode === "edit"
      ? data.location.address
      : (data.sourceAddress ?? "");
  });

  protected readonly location = linkedSignal<Location | null>(() => {
    const data = this.data();

    const uuid =
      data.mode === "edit" ? data.location.uuid : ("temp-uuid" as LocationUuid);

    const previousBdnbDataToKeep =
      data.mode === "edit" ? data.location.bdnbDataWithoutNullOrUndefined : {};

    const googlePlaceInput = this.googlePlaceInput();

    const place = googlePlaceInput?.place();
    const addressData = place ? extractGooglePlaceAddressData(place) : null;

    if (!addressData) {
      return data.mode === "edit" ? data.location : null;
    }

    const bdnbRes = googlePlaceInput?.bdnbResResource.value();

    return Location.init({
      uuid,
      name: "",
      ...(bdnbRes ? bdnbRes.formattedData : {}),
      ...previousBdnbDataToKeep,
      ...addressData,
    });
  });

  protected async submit() {
    const action = "Enregistrement du site";

    try {
      const location = this.location();
      if (!location) {
        throw new Error("Aucun bâtiment n'a été sélectionné.");
      }

      const googlePlaceInput = this.googlePlaceInput();
      if (!googlePlaceInput) {
        throw new Error("Aucune adresse n'a été renseignée.");
      }

      const place = googlePlaceInput.place();
      if (!place) {
        throw new Error("Aucune adresse n'a été trouvée");
      }

      const placeData = extractGooglePlaceData(place);
      const addressData = extractGooglePlaceAddressData(place);

      this.submitted.emit({
        addressData,
        placeData,
        customBdnbData: location.bdnbData,
      });
    } catch (error) {
      this.toastService.openError(action, error);
    }
  }
}
