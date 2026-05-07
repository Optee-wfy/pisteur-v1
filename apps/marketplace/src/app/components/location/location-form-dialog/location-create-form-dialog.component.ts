import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import type {
  LocationAddressDetails,
  LocationPlaceDetails,
} from "@optee/constants";
import { DialogWrapperComponent, StronglyTypedDialog } from "@optee/dialog";
import type { HubspotLocationBdnbData, LocationUuid } from "@optee/models";
import { ToastService } from "@optee/ui/services/toast.service";
import trpcClient from "../../../../trpc-client";
import { AppService } from "../../../services/app.service";
import { LocationService } from "../../../services/location.service";
import type { LocationFormInput } from "../location-form/location-form.component";
import { LocationFormComponent } from "../location-form/location-form.component";

@Component({
  selector: "mkp-location-create-form-dialog",
  imports: [DialogWrapperComponent, LocationFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <op-dialog-wrapper
      class="overflow-hidden"
      (crossClick)="dialogRef.close(null)"
    >
      <mkp-location-form
        class="-m-6 h-full overflow-y-auto lg:-m-8 lg:-mt-12"
        canEditLocation
        canSetAddress
        (cancelled)="dialogRef.close(null)"
        (submitted)="submit($event)"
        [data]="data"
      />
    </op-dialog-wrapper>
  `,
})
export class LocationCreateFormDialogComponent extends StronglyTypedDialog<
  LocationFormInput & {
    mode: "create";
  },
  LocationUuid | null
> {
  protected readonly appService = inject(AppService);
  protected readonly toastService = inject(ToastService);
  protected readonly locationService = inject(LocationService);

  async submit({
    addressData,
    placeData,
    customBdnbData,
  }: {
    addressData: LocationAddressDetails;
    placeData: LocationPlaceDetails;
    customBdnbData: HubspotLocationBdnbData;
  }) {
    const action = "Création d'un site";

    try {
      this.appService.isLoading.set(true);

      const res = await trpcClient.locations.create.mutate({
        addressData,
        placeData,
        customBdnbData,
        source: this.data.source,
        sourceAddress: this.data.sourceAddress,
      });

      if (!res) {
        throw new Error("Une erreur est survenue");
      }

      if (res === "already_exists") {
        throw new Error("Le site existe déjà");
      }

      this.locationService.refresh();

      this.dialogRef.close(res.uuid);
    } catch (err) {
      this.toastService.openError(action, err);
    } finally {
      this.appService.isLoading.set(false);
    }
  }
}
