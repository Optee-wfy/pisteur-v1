import { ChangeDetectionStrategy, Component } from "@angular/core";
import { OperationsNoPrestationAdminComponent } from "../../../../components/operation/operations-no-prestation-admin/operations-no-prestation-admin.component";

@Component({
  selector: "mkp-admin-operations-no-prestation-page",
  template: `
    <mkp-operations-no-prestation-admin />
  `,
  imports: [OperationsNoPrestationAdminComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminOperationsNoPrestationPageComponent {}
