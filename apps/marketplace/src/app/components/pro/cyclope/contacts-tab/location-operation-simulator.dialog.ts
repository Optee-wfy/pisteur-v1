import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  viewChild,
} from "@angular/core";
import type { OperationHubspotPrestationId } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { IconSuccessComponent } from "@optee/icons";
import type { LocationUuid } from "@optee/models";
import { Location } from "@optee/models";
import { ToastService } from "@optee/ui/services/toast.service";
import trpcClient from "../../../../../trpc-client";
import {
  CyclopeMode,
  CyclopeService,
} from "../../../../services/cyclope.service";
import {
  extractGooglePlaceAddressData,
  GooglePlaceInputComponent,
} from "../../../location/google-place-input/google-place-input.component";
import { OperationTypesSelectComponent } from "../../../operation/operation-types-select/operation-types-select.component";

@Component({
  selector: "mkp-location-operation-simulator-dialog",
  template: `
    <op-dialog-wrapper class="max-w-lg" (crossClick)="dialogRef.close()">
      <op-dialog-heading heading="Simulez votre opération">
        <p class="max-w-prose text-lg font-medium text-gray-600">
          Obtenez les informations techniques du bâtiment et simulez l'opération
          de votre choix.
        </p>
      </op-dialog-heading>
      <form
        class="mx-auto flex w-full max-w-md flex-col items-center justify-start gap-6"
      >
        <div class="flex w-full flex-col gap-4">
          <div class="relative">
            <mkp-google-place-input class="flex-1" />
            @if (validLocation()) {
              <icon-success
                class="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-green-500"
              />
            }
            @if (!validLocation() && toSimulate()?.addressData) {
              <span class="px-1 py-3 text-sm italic text-gray-600">
                Aucune donnée disponible, essayez sur une autre adresse !
              </span>
            }
          </div>
          <mkp-operation-types-select
            class="flex-1"
            [(activeOperation)]="activeOperation"
            [disabled]="!validLocation()"
            [location]="toSimulate()?.location ?? null"
          />
        </div>
        <oui-button
          type="button"
          variant="primary"
          (click)="simulate()"
          [disabled]="!validLocation() || !activeOperation()"
        >
          Valider
        </oui-button>
      </form>
    </op-dialog-wrapper>
  `,
  imports: [
    DialogWrapperComponent,
    DialogHeadingComponent,
    GooglePlaceInputComponent,
    OperationTypesSelectComponent,
    ButtonComponent,
    IconSuccessComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationOperationSimulatorDialogComponent extends StronglyTypedDialog<
  void,
  void
> {
  readonly googlePlaceInput = viewChild(GooglePlaceInputComponent);

  protected readonly activeOperation =
    model<OperationHubspotPrestationId | null>(null);

  private readonly cyclopeService = inject(CyclopeService);
  private readonly toastService = inject(ToastService);

  protected readonly toSimulate = computed(() => {
    const googlePlaceInput = this.googlePlaceInput();

    if (!googlePlaceInput) {
      return null;
    }

    const place = googlePlaceInput.place();

    if (!place) {
      return null;
    }

    const addressData = extractGooglePlaceAddressData(place);

    const bdnbRes = googlePlaceInput.bdnbResResource.value();

    const location = Location.init({
      uuid: "temp-uuid" as LocationUuid,
      name: "",
      ...(bdnbRes ? bdnbRes.formattedData : {}),
      ...addressData,
    });
    return {
      location,
      addressData,
      bdnbRes: bdnbRes?.formattedData ?? null,
    };
  });

  protected readonly validLocation = computed(
    () => Object.keys(this.toSimulate()?.bdnbRes ?? {}).length > 0,
  );

  async simulate() {
    const { addressData, bdnbRes } = this.toSimulate() ?? {};
    const operation = this.activeOperation();
    if (!addressData || !operation || !bdnbRes) {
      this.toastService.openError(
        "Simulation d'un bâtiment.",
        "Veuillez remplir tous les champs.",
      );
      return;
    }
    try {
      const [existingLocation] =
        await trpcClient.locations.getByAddressData.query(addressData);

      await this.cyclopeService.openCyclope(
        existingLocation
          ? {
              mode: CyclopeMode.PROSPECT,
              locationUuid: existingLocation.uuid,
            }
          : {
              mode: CyclopeMode.SIMULATE,
              addressData,
              bdnbRes,
              operation,
            },
      );
      this.dialogRef.close();
    } catch (error) {
      this.toastService.openError("Simulation d'un bâtiment.", error);
    }
  }
}
