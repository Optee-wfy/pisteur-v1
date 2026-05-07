import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "mkp-quotes-layout",
  host: {
    class: "flex h-full w-full",
  },
  template: `
    <router-outlet />
  `,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QuotesLayoutComponent {}
