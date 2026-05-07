import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { LayoutComponent } from "../../../components/layout/layout.component";
import { LocationPanelComponent } from "../../../components/location/location-panel/location-panel.component";
import { OperationPanelComponent } from "../../../components/operation/operation-panel/operation-panel.component";
import { NotificationService } from "../../../services/notification.service";

@Component({
  selector: "mkp-layout-client",
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LayoutClientComponent {
  protected readonly notificationService = inject(NotificationService);

  constructor() {
    this.notificationService.checkOperationNotification();
  }
}
