import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { IconPaperPlaneComponent } from "@optee/icons";

@Component({
  selector: "mkp-icon-operation-launch",
  host: { class: "block" },
  template: `
    <icon-paper-plane class="h-full" [colorMode]="colorMode()" />
  `,
  imports: [IconPaperPlaneComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconOperationLaunchComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
