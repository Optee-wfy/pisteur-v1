import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { IconBoltComponent } from "@optee/icons";

@Component({
  selector: "mkp-icon-operation-contract",
  host: { class: "block" },
  template: `
    <icon-bolt class="h-full" [colorMode]="colorMode()" />
  `,
  imports: [IconBoltComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconOperationContractComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
