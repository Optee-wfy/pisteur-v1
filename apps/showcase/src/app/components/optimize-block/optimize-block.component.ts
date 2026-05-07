import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { OptimizeBlockContent } from "../optimize-block-desktop/optimize-block-desktop.component";
import { OptimizeBlockDesktopComponent } from "../optimize-block-desktop/optimize-block-desktop.component";
import { OptimizeBlockMobileComponent } from "../optimize-block-mobile/optimize-block-mobile.component";

@Component({
  selector: "swc-optimize-block",
  template: `
    <swc-optimize-block-desktop
      class="hidden lg:flex"
      [contents]="contents()"
      [title]="title()"
    />
    <swc-optimize-block-mobile
      class="lg:hidden"
      [contents]="contents()"
      [title]="title()"
    />
  `,
  imports: [OptimizeBlockMobileComponent, OptimizeBlockDesktopComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptimizeBlockComponent {
  title = input.required<string>();
  contents = input.required<OptimizeBlockContent[]>();
}
