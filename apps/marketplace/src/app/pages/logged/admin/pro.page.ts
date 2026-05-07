import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ProAdminComponent } from "../../../components/pro/pro-admin/pro-admin.component";

@Component({
  selector: "mkp-admin-pro-page",
  template: `
    <mkp-pro-admin />
  `,
  imports: [ProAdminComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminProPageComponent {}
