import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { BUILDING_USAGE_LABELS, getIpeNormalizedScore } from "@optee/constants";
import type { ExternalLocation } from "@optee/models";
import { Tooltip } from "primeng/tooltip";
import type { EnedisResultRow } from "../enedis-data-grid/enedis-data.service";
import { IpeConfidenceBadgeComponent } from "./ipe-confidence-badge.component";
import { IpeScoreGaugeComponent } from "./ipe-score-gauge.component";

@Component({
  selector: "mkp-estimated-energy-profile",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IpeScoreGaugeComponent, IpeConfidenceBadgeComponent, Tooltip],
  template: `
    <div class="grid grid-cols-2 gap-2.5">
      <p
        class="text-granite-400 font-medium"
        [class.text-sm]="!compact()"
        [class.text-xs]="compact()"
      >
        Indice:
      </p>
      <div class="flex items-center justify-between gap-1">
        <mkp-ipe-score-gauge [location]="location()" [rawScore]="rawScore()" />
      </div>

      <p
        class="text-granite-400 font-medium"
        [class.text-sm]="!compact()"
        [class.text-xs]="compact()"
      >
        Fiabilité:
      </p>
      <div class="flex items-center justify-between gap-1">
        <mkp-ipe-confidence-badge
          [compact]="compact()"
          [consumptionEnterpriseResults]="consumptionEnterpriseResults()"
          [consumptionResidentialResults]="consumptionResidentialResults()"
          [location]="location()"
        />
      </div>

      <div class="col-span-2">
        <p
          class="text-granite-700 rounded-lg border border-current px-2 py-1 text-center font-medium"
          tooltipPosition="right"
          [class.text-sm]="!compact()"
          [class.text-xs]="compact()"
          [pTooltip]="ipeTooltip()"
        >
          {{ potentialLabel() }}
        </p>
      </div>
    </div>
  `,
})
export class EstimatedEnergyProfileComponent {
  readonly rawScore = input<number | null>(null);
  readonly location = input.required<ExternalLocation>();
  readonly consumptionResidentialResults = input<EnedisResultRow[]>([]);
  readonly consumptionEnterpriseResults = input<EnedisResultRow[]>([]);
  readonly compact = input(false, { transform: booleanAttribute });

  private readonly normalizedScore = computed(() => {
    const score = this.rawScore();
    if (typeof score !== "number") {
      return null;
    }
    return getIpeNormalizedScore(score);
  });

  protected readonly potentialLabel = computed(() => {
    const score = this.normalizedScore();
    if (typeof score !== "number") {
      return "Potentiel énergétique non connu";
    }

    const usage = this.location().buildingUsage;
    const usageLabel = usage
      ? (BUILDING_USAGE_LABELS[usage] ?? "Usage inconnu")
      : "Usage inconnu";
    const level = score < 5 ? "faible" : score <= 7 ? "fort" : "très fort";
    return `Site ${usageLabel} à ${level} potentiel énergétique`;
  });

  protected readonly ipeTooltip = computed(() => {
    return (
      "Indice estimatif basé sur des profils statistiques sectoriels.\n\n" +
      "Utilisé uniquement à des fins de qualification et de priorisation."
    );
  });
}
