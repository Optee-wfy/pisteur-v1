import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { ArcadeComponent } from "../arcade/arcade.component";

@Component({
  selector: "oui-arcade-wrapper",
  host: {
    class:
      "block border-1 relative rounded-2xl border-purple-200 bg-purple-100 pt-[calc(9/16*100%)]",
  },
  template: `
    <oui-arcade class="!absolute inset-4" [flowId]="flowId()" />
  `,
  imports: [ArcadeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArcadeWrapperComponent {
  flowId = input.required<string>();
}
