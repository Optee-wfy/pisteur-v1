import { ChangeDetectionStrategy, Component } from "@angular/core";
import { OperationsNoSimulationAdminComponent } from "../../../../components/operation/operations-no-simulation-admin/operations-no-simulation-admin.component";

@Component({
  selector: "mkp-admin-operations-no-simulation-page",
  template: `
    <mkp-operations-no-simulation-admin />
  `,
  imports: [OperationsNoSimulationAdminComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminOperationsNoSimulationPageComponent {}
