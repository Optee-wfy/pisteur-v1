import { ChangeDetectionStrategy, Component } from "@angular/core";
import { QuotesListAdminComponent } from "../../../components/quote/quotes-list-admin.component";

@Component({
  selector: "mkp-admin-quotes-page",
  template: `
    <mkp-quotes-list-admin />
  `,
  imports: [QuotesListAdminComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminQuotesPageComponent {}
