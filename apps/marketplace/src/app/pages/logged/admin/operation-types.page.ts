import { ChangeDetectionStrategy, Component } from "@angular/core";
import { OperationTypesAdminComponent } from "../../../components/operation/operation-types-admin/operation-types-admin.component";

@Component({
  selector: "mkp-admin-operation-types-page",
  template: `
    <mkp-operation-types-admin />
  `,
  imports: [OperationTypesAdminComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminOperationTypesPageComponent {}
