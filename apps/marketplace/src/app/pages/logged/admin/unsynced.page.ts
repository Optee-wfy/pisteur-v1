import { ChangeDetectionStrategy, Component } from "@angular/core";
import { LocationsUnsyncedAdminComponent } from "../../../components/location/locations-unsynced-admin/locations-unsynced-admin.component";
import { OperationsUnsyncedAdminComponent } from "../../../components/operation/operations-unsynced-admin/operations-unsynced-admin.component";
import { QuotesUnsyncedAdminComponent } from "../../../components/quote/quotes-unsynced-admin/quotes-unsynced-admin.component";

@Component({
  selector: "mkp-admin-unsynced-page",
  host: {
    class: "flex flex-col gap-4",
  },
  template: `
    <mkp-operations-unsynced-admin />
    <mkp-locations-unsynced-admin />
    <mkp-quotes-unsynced-admin />
  `,
  imports: [
    OperationsUnsyncedAdminComponent,
    LocationsUnsyncedAdminComponent,
    QuotesUnsyncedAdminComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminUnsyncedPageComponent {}
