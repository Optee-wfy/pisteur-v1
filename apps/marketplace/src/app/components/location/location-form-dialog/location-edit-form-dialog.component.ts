import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import type {
  LocationAddressDetails,
  LocationPlaceDetails,
} from "@optee/constants";
import { DialogWrapperComponent, StronglyTypedDialog } from "@optee/dialog";
import type { HubspotLocationBdnbData } from "@optee/models";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import trpcClient from "../../../../trpc-client";
import { AppService } from "../../../services/app.service";
import { LocationService } from "../../../services/location.service";
import { OperationService } from "../../../services/operation.service";
import type { LocationFormInput } from "../location-form/location-form.component";
import { LocationFormComponent } from "../location-form/location-form.component";

@Component({
  selector: "mkp-location-edit-form-dialog",
  imports: [DialogWrapperComponent, LocationFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <op-dialog-wrapper
      class="overflow-hidden"
      (crossClick)="dialogRef.close(false)"
    >
      <mkp-location-form
        class="-m-6 h-full overflow-y-auto lg:-m-8 lg:-mt-12"
        canEditLocation
        (cancelled)="dialogRef.close(false)"
        (submitted)="submit($event)"
        [data]="data"
      />
    </op-dialog-wrapper>
  `,
})
export class LocationEditFormDialogComponent extends StronglyTypedDialog<
  LocationFormInput & {
    mode: "edit";
  },
  boolean
> {
  protected readonly appService = inject(AppService);
  protected readonly toastService = inject(ToastService);
  protected readonly operationService = inject(OperationService);
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
    const action = "Édition d'un site";

    try {
      this.appService.isLoading.set(true);

      await trpcClient.locations.update.mutate({
        addressData,
        placeData,
        customBdnbData,
        locationUuid: this.data.location.uuid,
      });

      const opUuids =
        await trpcClient.operations.getAllUuidsByLocationUuid.query(
          this.data.location.uuid,
        );

      this.locationService.refresh();

      const opUuidsFiltered = opUuids.filter(isNotNullish);

      if (opUuidsFiltered.length) {
        await trpcClient.operations.updateCalculations.mutate({
          operationUuids: opUuidsFiltered,
        });

        this.operationService.refresh();
      }

      this.dialogRef.close(true);
    } catch (err) {
      this.toastService.openError(action, err);
    } finally {
      this.appService.isLoading.set(false);
    }
  }
}
