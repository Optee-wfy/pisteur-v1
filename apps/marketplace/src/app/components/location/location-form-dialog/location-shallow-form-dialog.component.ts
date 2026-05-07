import { ChangeDetectionStrategy, Component } from "@angular/core";
import type {
  LocationAddressDetails,
  LocationPlaceDetails,
} from "@optee/constants";
import { DialogWrapperComponent, StronglyTypedDialog } from "@optee/dialog";
import type { HubspotLocationBdnbData } from "@optee/models";
import type { LocationFormInput } from "../location-form/location-form.component";
import { LocationFormComponent } from "../location-form/location-form.component";

@Component({
  selector: "mkp-location-shallow-form-dialog",
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
        (submitted)="dialogRef.close($event)"
        [data]="data"
      />
    </op-dialog-wrapper>
  `,
})
export class LocationShallowFormDialogComponent extends StronglyTypedDialog<
  LocationFormInput & {
    mode: "shallow";
  },
  {
    addressData: LocationAddressDetails;
    placeData: LocationPlaceDetails;
    customBdnbData: HubspotLocationBdnbData;
  } | null
> {}
