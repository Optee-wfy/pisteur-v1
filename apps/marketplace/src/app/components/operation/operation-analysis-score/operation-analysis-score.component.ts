import { CurrencyPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { getDpeLabel } from "@optee/constants";
import { IconArrowLeftComponent } from "@optee/icons";
import type { OperationRow } from "@optee/models";
import { CirclePercentComponent } from "@optee/ui/components/atoms/circle-percent/circle-percent/circle-percent.component";
import { HighlightComparisonCardComponent } from "@optee/ui/components/organisms/highlight/highlight-comparison-card/highlight-comparison-card.component";
import { HighlightValueRangeCardComponent } from "@optee/ui/components/organisms/highlight/highlight-value-range-card/highlight-value-range-card.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { OperationScoreDetailsComponent } from "../operation-score-details/operation-score-details.component";

@Component({
  selector: "mkp-operation-analysis-score",
  host: { class: "flex flex-col gap-4" },
  template: `
    <div class="flex flex-wrap gap-4 print:pt-16">
      <oui-bob class="flex-1">
        <div class="flex flex-col gap-6">
          <div class="flex items-center justify-between gap-4">
            <h2
              class="font-display text-base font-medium leading-normal tracking-tight"
            >
              Notation
              <br />
              Performance énergétique
            </h2>
            <oui-circle-percent
              class="ml-12 size-24 bg-white"
              color="primary"
              [value]="operation().score"
            />
          </div>

          <mkp-operations-score-details
            mode="horizontal"
            [operation]="operation()"
          />
        </div>
      </oui-bob>
      <div class="flex flex-1 shrink-0 flex-wrap justify-stretch gap-4">
        <oui-highlight-value-range-card
          cardTitle="Coût"
          theme="dark"
          [highlightValue]="
            operation().cost.value | currency: 'EUR' : 'symbol' : '1.0-0'
          "
          [range]="operation().cost.range"
        />

        <oui-highlight-value-range-card
          cardTitle="Subventions"
          [highlightValue]="
            operation().funding.value | currency: 'EUR' : 'symbol' : '1.0-0'
          "
          [range]="operation().funding.range"
        />
      </div>
    </div>
    <div class="flex flex-wrap justify-stretch gap-4">
      <oui-highlight-value-range-card
        class="flex-1"
        cardTitle="Reste à charge"
        theme="dark"
        [highlightValue]="
          operation().remainingAmount.value
            | currency: 'EUR' : 'symbol' : '1.0-0'
        "
        [range]="operation().remainingAmount.range"
        [showRange]="operation().remainingAmount.value !== 0"
      />
      <div class="mx-auto flex gap-4">
        <oui-highlight-value-range-card
          cardTitle="Impact €/an"
          [highlightValue]="
            operation().estimatedAnnualSavings
              | currency: 'EUR' : 'symbol' : '1.0-0'
          "
          [range]="operation().estimatedAnnualSavingsRange"
          [showRange]="operation().estimatedAnnualSavings !== 0"
        />
        <icon-arrow-left
          class="text-primary-700 size-8 shrink-0 rotate-180 self-center"
        />
        <oui-highlight-value-range-card
          cardTitle="ROI"
          [highlightValue]="operation().estimatedPaybackPeriodFormatted"
          [range]="operation().estimatedPaybackPeriodRange"
          [showRange]="
            operation().estimatedPaybackPeriodFormatted !== 'immédiat'
          "
        />
      </div>
    </div>

    @if (impactEnergyValues(); as impactEnergyValues) {
      <oui-highlight-comparison-card
        cardSubtitle="Kwh/ep/m2/an"
        cardTitle="Impact Énergie"
        [estimated]="!operation().location.dpeLabel"
        [percent]="(operation().estimatedEnergyImpact ?? 0) * 100"
        [values]="impactEnergyValues"
      />
    }
  `,
  imports: [
    BobComponent,
    CirclePercentComponent,
    HighlightValueRangeCardComponent,
    HighlightComparisonCardComponent,
    OperationScoreDetailsComponent,
    CurrencyPipe,
    IconArrowLeftComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationAnalysisScoreComponent {
  operation = input.required<OperationRow>();

  impactEnergyValues = computed(() => {
    const estimatedImpact = this.operation().estimatedEnergyImpact;
    const locationConsumption =
      this.operation().location.electricityConsumptionPerSquareMeter;

    if (!locationConsumption) {
      return null;
    }

    const beforeValue = locationConsumption.toFixed(0);
    const afterValue = estimatedImpact
      ? locationConsumption * (1 - estimatedImpact) || 1
      : null;

    return {
      before: {
        label: this.operation().location.dpeLabel ?? getDpeLabel(+beforeValue),
        value: beforeValue,
      },
      after: {
        label: getDpeLabel(afterValue),
        value: afterValue?.toFixed(0) ?? null,
      },
    };
  });
}
