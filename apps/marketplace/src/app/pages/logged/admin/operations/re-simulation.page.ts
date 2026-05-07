import { ChangeDetectionStrategy, Component } from "@angular/core";
import { OperationsReSimulationAdminComponent } from "../../../../components/operation/operations-re-simulation-admin/operations-re-simulation-admin.component";

@Component({
  selector: "mkp-admin-operations-re-simulation-page",
  template: `
    <mkp-operations-re-simulation-admin />
  `,
  imports: [OperationsReSimulationAdminComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminOperationsReSimulationPageComponent {}
