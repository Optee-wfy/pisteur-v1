import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { IconSuccessComponent } from "./icon-success.component";
import { IconWarningComponent } from "./icon-warning.component";

@Component({
  selector: "icon-conditional-success",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    @if (isSuccessful()) {
      <icon-success [colorMode]="colorMode()" />
    } @else {
      <icon-warning [colorMode]="colorMode()" />
    }
  `,
  imports: [IconSuccessComponent, IconWarningComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconConditionalSuccessComponent {
  isSuccessful = input.required();

  colorMode = input<"current" | "colored">("current");
}
