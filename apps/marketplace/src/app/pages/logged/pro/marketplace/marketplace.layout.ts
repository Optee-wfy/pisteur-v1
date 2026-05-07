import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { LayoutComponent } from "../../../../components/layout/layout.component";
import { LocationPanelComponent } from "../../../../components/location/location-panel/location-panel.component";
import { OperationPanelComponent } from "../../../../components/operation/operation-panel/operation-panel.component";
import { DashboardService } from "../../../../services/dashboard.service";

@Component({
  selector: "mkp-layout-pro-marketplace",
  host: { class: "block h-full" },
  template: `
    <mkp-layout>
      <router-outlet />
    </mkp-layout>

    <mkp-operation-panel />
    <mkp-location-panel />
  `,
  imports: [
    RouterOutlet,
    LayoutComponent,
    OperationPanelComponent,
    LocationPanelComponent,
  ],
  // Provide DashboardService at the layout level. CyclopeService is provided in root
  // to ensure a single shared instance across dialogs/routes.
  providers: [DashboardService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LayoutProMarketplaceComponent {}
