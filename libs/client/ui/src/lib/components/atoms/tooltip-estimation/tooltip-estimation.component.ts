import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { Tooltip } from "primeng/tooltip";

@Component({
  selector: "oui-tooltip-estimation",
  host: { class: "cursor-help text-xs" },
  template: `
    <span
      tooltipStyleClass="p-tooltip--warning"
      [pTooltip]="textContent()"
      [tooltipPosition]="tooltipPosition()"
    >
      ⚠️
    </span>
  `,
  imports: [Tooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipEstimationComponent {
  readonly textContent = input("Valeur estimée");
  readonly tooltipPosition = input<"left" | "bottom" | "right" | "top">(
    "bottom",
  );
}
