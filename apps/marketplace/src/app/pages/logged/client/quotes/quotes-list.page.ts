import { ChangeDetectionStrategy, Component } from "@angular/core";
import { QuotesListComponent } from "../../../../components/quote/quotes-list.component";

@Component({
  selector: "mkp-quotes-list-page",
  host: {
    class: "p-4 xl:p-10 w-full h-full flex flex-col gap-4",
  },
  template: `
    <mkp-quotes-list />
  `,
  imports: [QuotesListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QuotesListPageComponent {}
