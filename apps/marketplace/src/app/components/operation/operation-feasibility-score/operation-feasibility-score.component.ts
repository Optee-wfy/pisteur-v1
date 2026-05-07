import { CurrencyPipe, DecimalPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { OperationRow } from "@optee/models";

@Component({
  selector: "mkp-operation-feasibility-score",
  host: {
    class: "block bg-primary-700 w-64 rounded-xl p-2 text-sm shadow-lg",
  },
  template: `
    @if (!operation().isFeasible) {
      <div class="font-semibold text-red-600">
        ❌ Cette opération ne peut pas être réalisée sur ce bâtiment
      </div>
      <div class="mt-1 text-sm text-gray-600">
        (incompatibilité technique détectée)
      </div>
    } @else {
      <div class="space-y-2 text-sm">
        <div
          class="bg-primary-700 flex items-center gap-2 rounded-lg p-2 font-medium"
        >
          <span>💶</span>
          CA estimé:
          {{
            operation().cost.value !== null
              ? (operation().cost.value | currency: "EUR" : "symbol" : "1.0-0")
              : "N/A"
          }}
          <br />
          {{ operation().costScore }}/30
        </div>

        <div
          class="bg-primary-700 flex items-center gap-2 rounded-lg p-2 font-medium"
        >
          <span>💡</span>
          Aides estimées:
          {{ operation().fundingRatio * 100 | number: "1.0-0" }} %
          <br />
          {{ operation().subventionScore }}/30
        </div>

        <div
          class="bg-primary-700 flex items-center gap-2 rounded-lg p-2 font-medium"
        >
          <span>🧾</span>
          Reste à charge:
          {{
            operation().remainingAmount.value !== null
              ? (operation().remainingAmount.value
                | currency: "EUR" : "symbol" : "1.0-0")
              : "N/A"
          }}
          <br />
          {{ operation().remainingAmountScore }}/30
        </div>

        <div
          class="bg-primary-700 flex items-center gap-2 rounded-lg p-2 font-medium"
        >
          <span>♻️</span>
          Note DPE: {{ operation().location.dpeLabel || "Inconnue" }}
          <br />
          {{ operation().dpeScore }}/10
        </div>
      </div>
    }
  `,
  imports: [CurrencyPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationFeasibilityScoreComponent {
  operation = input.required<OperationRow>();
}
