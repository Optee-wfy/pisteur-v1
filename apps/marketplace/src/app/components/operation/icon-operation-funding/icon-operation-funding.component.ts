import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { IconEuroComponent } from "@optee/icons";

@Component({
  selector: "mkp-icon-operation-funding",
  host: { class: "block" },
  template: `
    <icon-euro class="h-full" [colorMode]="colorMode()" />
  `,
  imports: [IconEuroComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconOperationFundingComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
