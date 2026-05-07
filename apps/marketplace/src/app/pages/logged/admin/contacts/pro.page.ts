import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ContactsListAdminComponent } from "../../../../components/contact/contact-list-admin.component";

@Component({
  selector: "mkp-admin-contacts-pro-page",
  template: `
    <mkp-contacts-list-admin target="pros" />
  `,
  imports: [ContactsListAdminComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminContactsProPageComponent {}
