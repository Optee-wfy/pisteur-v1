import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "oui-divider-vertical",
  host: {
    class: "block w-px",
    style:
      "background: radial-gradient(circle, rgba(181,179,179,1) 0%, rgba(255,255,255,1) 100%);",
  },
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerVerticalComponent {}
