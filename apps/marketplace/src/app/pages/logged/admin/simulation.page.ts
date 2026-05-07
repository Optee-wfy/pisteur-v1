import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SimulatorAdminComponent } from "../../../components/simulated-location/simulator-admin.component";

@Component({
  selector: "mkp-admin-simulation-page",
  template: `
    <mkp-simulator-admin />
  `,
  imports: [SimulatorAdminComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminSimulationPageComponent {}
