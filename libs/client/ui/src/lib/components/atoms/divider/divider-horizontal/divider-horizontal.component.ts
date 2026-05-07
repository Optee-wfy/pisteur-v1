import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "oui-divider-horizontal",
  host: {
    class: "block h-px",
    style:
      "background: radial-gradient(circle, rgba(181,179,179,1) 0%, rgba(181,179,179,0) 100%);",
  },
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerHorizontalComponent {}
