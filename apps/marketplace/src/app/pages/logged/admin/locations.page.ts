import { ChangeDetectionStrategy, Component } from "@angular/core";
import { LocationsAdminComponent } from "../../../components/location/locations-admin/locations-admin.component";

@Component({
  selector: "mkp-admin-locations-page",
  template: `
    <mkp-locations-admin />
  `,
  imports: [LocationsAdminComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminLocationsPageComponent {}
