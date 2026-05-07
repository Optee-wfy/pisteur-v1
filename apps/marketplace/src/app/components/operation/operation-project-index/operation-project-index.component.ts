import { CurrencyPipe, formatCurrency, formatNumber } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
} from "@angular/core";
import { getDpeLabel } from "@optee/constants";
import { IconInfoComponent } from "@optee/icons";
import type { OperationRow } from "@optee/models";
import { CirclePercentIdleComponent } from "@optee/ui/components/atoms/circle-percent/circle-percent-idle/circle-percent-idle.component";
import { CirclePercentComponent } from "@optee/ui/components/atoms/circle-percent/circle-percent/circle-percent.component";
import { HighlightComparisonCardComponent } from "@optee/ui/components/organisms/highlight/highlight-comparison-card/highlight-comparison-card.component";
import { HighlightValueRangeCardComponent } from "@optee/ui/components/organisms/highlight/highlight-value-range-card/highlight-value-range-card.component";
import { ProgressBar } from "primeng/progressbar";
import { Skeleton } from "primeng/skeleton";
import { Tooltip } from "primeng/tooltip";
import { OperationFeasibilityScoreComponent } from "../operation-feasibility-score/operation-feasibility-score.component";

@Component({
  selector: "mkp-operation-project-index",
  host: { class: "grid grid-cols-3 gap-6" },
  template: `
    @let ope = operation();

    <oui-highlight-comparison-card
      class="col-span-2"
      cardSubtitle="Kwh/ep/m2/an"
      cardTitle="Impact Énergie"
      [estimated]="!ope?.location?.dpeLabel"
      [loading]="loading()"
      [percent]="estimatedEnergyImpactPercent()"
      [values]="impactEnergyValues()"
    />

    <oui-highlight-value-range-card
      class="flex-1"
      cardTitle="Impact Énergétique"
      theme="light"
      [highlightValue]="
        estimatedEnergyImpactPercent()
          ? estimatedEnergyImpactPercent() + '%'
          : '--'
      "
      [loading]="loading()"
      [range]="estimatedImpactRange()"
      [showRange]="estimatedEnergyImpactPercent() !== 0"
    />

    <oui-highlight-value-range-card
      class="flex-1"
      theme="light"
      [cardTitle]="ope?.xFactorLabel ?? 'Volume'"
      [highlightValue]="xFactorCardValue()"
      [loading]="loading()"
    />

    <oui-highlight-value-range-card
      class="flex-1"
      cardTitle="Reste à charge"
      theme="light"
      [highlightValue]="
        ope
          ? (ope.remainingAmount.value | currency: 'EUR' : 'symbol' : '1.0-0')
          : '--'
      "
      [loading]="loading()"
      [range]="ope?.remainingAmount?.range ?? '--'"
      [showRange]="ope?.remainingAmount?.value !== 0"
    />

    <oui-highlight-value-range-card
      class="flex-1"
      cardTitle="CA potentiel"
      theme="light"
      [highlightValue]="costCardValue()"
      [loading]="loading()"
      [range]="ope?.cost?.range ?? '--'"
    />
    <div
      class="bg-primary-100 flex flex-1 flex-col items-center justify-around gap-2 rounded-2xl p-4"
    >
      <div class="flex select-none justify-between gap-4 font-semibold">
        <span>Note de faisabilité</span>
        @if (ope) {
          <icon-info
            class="text-primary-500 size-5"
            tooltipPosition="right"
            tooltipStyleClass="p-tooltip--reset"
            [pTooltip]="feasibilityScoreTooltip"
          />
        }
      </div>
      <!-- loc.isCompatibleWithOperation(st.hsPrestationId), -->
      @if (!loading()) {
        @if (ope) {
          <oui-circle-percent class="size-20" [value]="ope.feasibilityScore" />
        } @else {
          <oui-circle-percent-idle class="size-20 text-white" />
        }
      } @else {
        <p-skeleton height="6rem" shape="circle" width="6rem" />
      }
    </div>

    <ng-template #feasibilityScoreTooltip>
      @if (ope) {
        <mkp-operation-feasibility-score [operation]="ope" />
      }
    </ng-template>

    <div
      class="col-span-2 inline-flex min-w-fit flex-col items-center justify-center gap-4 rounded-2xl p-4 tracking-tight print:shadow-none"
    >
      <div class="flex w-full flex-col gap-2">
        <div class="font-semibold">Retour sur investissement</div>

        <div class="flex items-end gap-4">
          @if (!loading()) {
            <div class="flex w-full flex-col gap-1">
              <div class="flex justify-between text-xs text-gray-600">
                <div>> 10 ans</div>
                <div>Immédiat</div>
              </div>

              <p-progressbar
                class="w-full"
                styleClass="p-progressbar--light"
                [showValue]="false"
                [value]="ope?.roiScore ?? 0"
              />
            </div>
            <span class="w-36 text-end font-semibold">
              {{ ope?.estimatedPaybackPeriodFormatted ?? "--" }}
            </span>
          } @else {
            <p-skeleton class="w-full" />
          }
        </div>
      </div>

      <div class="flex w-full flex-col gap-1">
        <div class="font-semibold">Économies annuelles</div>

        <div class="flex items-end gap-4">
          @if (!loading()) {
            <div class="flex w-full flex-col gap-1">
              <div class="flex justify-between text-xs text-gray-600">
                <div>0 €</div>
                <div>
                  {{
                    ope?.location?.annualElectricityCost
                      ? (ope?.location?.annualElectricityCost
                        | currency: "EUR" : "symbol" : "1.0-0")
                      : "-- €"
                  }}
                </div>
              </div>

              <p-progressbar
                class="w-full"
                styleClass="p-progressbar--light"
                [showValue]="false"
                [value]="estimatedAnnualSavingsPercent()"
              />
            </div>

            <span class="w-36 text-end font-semibold">
              {{
                ope?.estimatedAnnualSavings
                  ? (ope?.estimatedAnnualSavings
                    | currency: "EUR" : "symbol" : "1.0-0")
                  : "-- €"
              }}
            </span>
          } @else {
            <p-skeleton class="w-full" />
          }
        </div>
      </div>
    </div>
  `,
  imports: [
    HighlightValueRangeCardComponent,
    OperationFeasibilityScoreComponent,
    CirclePercentComponent,
    CirclePercentIdleComponent,
    IconInfoComponent,
    HighlightComparisonCardComponent,
    Tooltip,
    CurrencyPipe,
    ProgressBar,
    Skeleton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationProjectIndexComponent {
  readonly operation = input<OperationRow | null>(null);
  readonly loading = input<boolean>(false);

  private readonly locale = inject(LOCALE_ID);

  protected readonly xFactorCardValue = computed(() => {
    const operation = this.operation();
    if (!operation) {
      return "--";
    }

    const value =
      typeof operation.xFactorValue === "number" ? operation.xFactorValue : 0;
    const formattedValue = formatNumber(value, this.locale, "1.0-0");
    return formattedValue + " " + operation.xFactorUnit;
  });

  protected readonly costCardValue = computed(() => {
    const operation = this.operation();
    if (!operation || operation.cost.value == null) {
      return "--";
    }

    return formatCurrency(
      operation.cost.value,
      this.locale,
      "EUR",
      "symbol",
      "1.0-0",
    );
  });

  protected readonly impactEnergyValues = computed(() => {
    const estimatedImpact = this.operation()?.estimatedEnergyImpact;
    const locationConsumption =
      this.operation()?.location.electricityConsumptionPerSquareMeter;

    if (!locationConsumption) {
      return null;
    }

    const beforeValue = locationConsumption.toFixed(0);
    const afterValue = estimatedImpact
      ? Math.max(0, locationConsumption * (1 - estimatedImpact))
      : null;

    return {
      before: {
        label: this.operation()?.location.dpeLabel ?? getDpeLabel(+beforeValue),
        value: beforeValue,
      },
      after: {
        label: getDpeLabel(afterValue),
        value: afterValue?.toFixed(0) ?? null,
      },
    };
  });

  protected readonly estimatedAnnualSavingsPercent = computed(() => {
    const ope = this.operation();

    return ope?.estimatedAnnualSavings && ope?.location?.annualElectricityCost
      ? (ope.estimatedAnnualSavings / ope.location.annualElectricityCost) * 100
      : 0;
  });

  protected readonly estimatedEnergyImpactPercent = computed(() => {
    return (this.operation()?.estimatedEnergyImpact ?? 0) * 100;
  });

  protected readonly estimatedImpactRange = computed(() => {
    const value = this.estimatedEnergyImpactPercent();
    const gap = 0.1; // to be defined by product

    const rawLower = value - value * gap;
    const rawUpper = value + gap * value;

    return `${rawLower.toFixed(0)}% < ${rawUpper.toFixed(0)}%`;
  });
}
