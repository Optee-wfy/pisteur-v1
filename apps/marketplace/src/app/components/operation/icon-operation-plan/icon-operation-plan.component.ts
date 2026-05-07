import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { IconCalendarComponent } from "@optee/icons";

@Component({
  selector: "mkp-icon-operation-plan",
  host: { class: "block" },
  template: `
    <icon-calendar class="h-full" [colorMode]="colorMode()" />
  `,
  imports: [IconCalendarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconOperationPlanComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
