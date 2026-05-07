import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ClientAdminComponent } from "../../../components/client/client-admin/client-admin.component";

@Component({
  selector: "mkp-admin-client-page",
  template: `
    <mkp-client-admin />
  `,
  imports: [ClientAdminComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminClientPageComponent {}
