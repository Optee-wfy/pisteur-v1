import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { IconProjectComponent } from "@optee/icons";

@Component({
  selector: "mkp-icon-operation-generic",
  host: { class: "block" },
  template: `
    <icon-project class="h-full" [colorMode]="colorMode()" />
  `,
  imports: [IconProjectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconOperationGenericComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
