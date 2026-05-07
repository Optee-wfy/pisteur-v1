import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ContactFormComponent } from "../../../components/contact/contact-form.component";

@Component({
  selector: "mkp-client-account-page",
  host: {
    class: "p-4 xl:p-10",
  },
  template: `
    <mkp-contact-form />
  `,
  imports: [ContactFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClientAccountPageComponent {}
