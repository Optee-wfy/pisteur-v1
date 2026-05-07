import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { ExternalLocation } from "@optee/models";
import type { EnedisResultRow } from "../enedis-data-grid/enedis-data.service";

@Component({
  selector: "mkp-ipe-confidence-badge",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="rounded-full px-2 py-1 font-semibold"
      [class.text-sm]="!compact()"
      [class.text-xs]="compact()"
      [class]="badgeClass()"
    >
      {{ confidence() }}
    </span>
  `,
})
export class IpeConfidenceBadgeComponent {
  readonly location = input.required<ExternalLocation>();
  readonly consumptionResidentialResults = input<EnedisResultRow[]>([]);
  readonly consumptionEnterpriseResults = input<EnedisResultRow[]>([]);
  readonly compact = input(false, { transform: booleanAttribute });

  protected readonly confidence = computed<"A" | "B" | "C">(() => {
    const hasEnedis =
      (this.consumptionResidentialResults().length ?? 0) > 0 ||
      (this.consumptionEnterpriseResults().length ?? 0) > 0;
    if (hasEnedis) {
      return "A";
    }

    const hasDpe = Boolean(this.location().dpeLabel);
    return hasDpe ? "B" : "C";
  });

  protected readonly badgeClass = computed(() => {
    const confidence = this.confidence();
    if (confidence === "A") {
      return "bg-green-100 text-green-800";
    }
    if (confidence === "B") {
      return "rounded-full bg-yellow-100 text-yellow-800";
    }
    return "bg-red-100 text-red-800";
  });
}
