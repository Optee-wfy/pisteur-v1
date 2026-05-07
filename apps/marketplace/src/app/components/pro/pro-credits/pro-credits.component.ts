import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { IconSpinnerComponent } from "@optee/icons";
import { CreditsComponent } from "@optee/ui/components/atoms/credits/credits.component";
import { Tooltip } from "primeng/tooltip";
import { ProService } from "../../../services/pro.service";

@Component({
  selector: "mkp-pro-credits",

  template: `
    @let credits = proService.remainingCredits();
    @if (credits !== null && credits !== undefined) {
      <oui-credits
        reverse
        tooltipPosition="bottom"
        [credits]="credits"
        [pTooltip]="label()"
      />
    } @else {
      <icon-spinner class="animate-spin text-gray-300" />
    }
  `,
  imports: [CreditsComponent, Tooltip, IconSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProCreditsComponent {
  protected readonly proService = inject(ProService);
  protected readonly label = computed(() => {
    const credits = this.proService.remainingCredits();
    if (credits === null || credits === undefined) {
      return undefined;
    }
    if (credits <= 0) {
      return "Aucun crédit";
    }

    const unit = credits === 1 ? "crédit" : "crédits";
    return `Il vous reste ${credits} ${unit}.`;
  });
}
