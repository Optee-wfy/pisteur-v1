import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import {
  explainElectricityConsumption,
  explainNonElectricConsumption,
  explainTotalConsumption,
  formatConsumptionExplanation,
  getIncompressibleShareFromNafCodes,
} from "@optee/constants";
import { environment } from "@optee/env";
import type { ExternalLocation } from "@optee/models";
import { Tooltip } from "primeng/tooltip";
import {
  EnedisDataService,
  type EnedisResultRow,
} from "../enedis-data-grid/enedis-data.service";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "mkp-energy-consumption-summary",
  host: { class: "flex flex-col gap-4" },
  template: `
    <div
      class="grid grid-cols-2"
      [class.gap-2]="compact()"
      [class.gap-3]="!compact()"
    >
      <p
        class="text-granite-400 whitespace-nowrap font-medium"
        [class.text-sm]="!compact()"
        [class.text-xs]="compact()"
      >
        Consommation totale (EF):
      </p>
      <div [class.text-sm]="!compact()" [class.text-xs]="compact()">
        @if (totalInfo().value === null) {
          <p
            class="text-granite-300 italic"
            tooltipPosition="right"
            [pTooltip]="totalInfo().tooltip"
          >
            Non connu
          </p>
        } @else {
          <p
            class="font-semibold"
            tooltipPosition="right"
            [pTooltip]="totalInfo().tooltip"
          >
            {{ formatMwh(totalInfo().value) }}
          </p>
        }
      </div>
    </div>

    <div
      class="grid grid-cols-2"
      [class.gap-2]="compact()"
      [class.gap-3]="!compact()"
      [class.text-sm]="!compact()"
      [class.text-xs]="compact()"
    >
      <p class="text-granite-400 whitespace-nowrap font-medium">
        Consommation élec:
      </p>

      <div class="flex items-center justify-between gap-1">
        @if (electricityInfo().value === null) {
          <p
            class="text-granite-300 italic"
            tooltipPosition="right"
            [pTooltip]="electricityInfo().tooltip"
          >
            Non connu
          </p>
        } @else {
          <p
            class="font-semibold"
            tooltipPosition="right"
            [class.text-sm]="!compact()"
            [class.text-xs]="compact()"
            [pTooltip]="electricityInfo().tooltip"
          >
            {{ formatMwh(electricityInfo().value) }}
            @if (electricitySharePercent() !== null) {
              <span class="text-primary-700 ml-1 text-xs font-medium">
                {{ formatPercent(electricitySharePercent()) }}
              </span>
            }
          </p>
        }
      </div>
    </div>

    @if (nonElectricInfo().label) {
      <div
        class="grid grid-cols-2"
        [class.gap-2]="compact()"
        [class.gap-3]="!compact()"
        [class.text-sm]="!compact()"
        [class.text-xs]="compact()"
      >
        <p class="text-granite-400 whitespace-nowrap font-medium">
          {{ nonElectricInfo().label }}:
        </p>

        @if (nonElectricInfo().value === null) {
          <p
            class="text-granite-300 italic"
            tooltipPosition="right"
            [pTooltip]="nonElectricInfo().tooltip"
          >
            Non connu
          </p>
        } @else {
          <p
            class="font-semibold"
            tooltipPosition="right"
            [pTooltip]="nonElectricInfo().tooltip"
          >
            {{ formatMwh(nonElectricInfo().value) }}
            @if (nonElectricSharePercent() !== null) {
              <span class="text-primary-700 ml-1 text-xs font-medium">
                {{ formatPercent(nonElectricSharePercent()) }}
              </span>
            }
          </p>
        }
      </div>
    }
  `,
  imports: [Tooltip],
})
export class EnergyConsumptionSummaryComponent {
  readonly location = input.required<ExternalLocation>();
  readonly compareLocation = input<ExternalLocation | null>(null);
  readonly consumptionEfM2 = input<number | null>(null);
  readonly consumptionResidentialResults = input<EnedisResultRow[]>([]);

  readonly compact = input(false, { transform: booleanAttribute });

  readonly consumptionEnterpriseResults = input<EnedisResultRow[]>([]);

  private readonly enedisData = inject(EnedisDataService);
  private readonly showDebugTooltips =
    environment.slug === "development" || environment.slug === "preview";

  private readonly energyType = computed(
    () => this.compareLocation()?.energyType ?? this.location().energyType,
  );

  private readonly surfaceThatRequiresHeating = computed(
    () =>
      this.compareLocation()?.surfaceThatRequiresHeating ??
      this.location().surfaceThatRequiresHeating ??
      null,
  );

  private readonly hasConsumptionEfM2 = computed(
    () => this.consumptionEfM2() !== null,
  );

  private readonly selectedEnedisResult = computed(() =>
    this.getSelectedEnedisResult(),
  );

  private readonly incompressibleShare = computed(() =>
    this.getIncompressibleShare(),
  );

  // Energy split rules:
  // - Total uses EF (required).
  // - Electricity uses Enedis when available; otherwise it uses the incompressible share.
  // - Non-electric consumption is the remainder of total minus electricity.
  protected readonly totalExplanation = computed(() =>
    explainTotalConsumption({
      surfaceThatRequiresHeating: this.surfaceThatRequiresHeating(),
      consumptionEfM2: this.consumptionEfM2(),
      energyType: this.energyType(),
      enedis: this.selectedEnedisResult(),
    }),
  );

  protected readonly electricityExplanation = computed(() =>
    explainElectricityConsumption({
      energyType: this.energyType(),
      totalConsumptionMwh: this.totalExplanation().value,
      enedis: this.selectedEnedisResult(),
      incompressibleShare: this.incompressibleShare(),
      hasConsumptionEfM2: this.hasConsumptionEfM2(),
    }),
  );

  protected readonly nonElectricExplanation = computed(() =>
    explainNonElectricConsumption({
      energyType: this.energyType(),
      totalConsumptionMwh: this.totalExplanation().value,
      electricityConsumptionMwh: this.electricityExplanation().value,
      hasConsumptionEfM2: this.hasConsumptionEfM2(),
    }),
  );

  protected readonly totalConsumptionMwh = computed(() => {
    return this.totalExplanation().value;
  });

  protected readonly electricityConsumptionMwh = computed(() => {
    return this.electricityExplanation().value;
  });

  protected readonly nonElectricConsumptionMwh = computed(() => {
    return this.nonElectricExplanation().value;
  });

  protected readonly nonElectricConsumptionLabel = computed(() => {
    const energyType = this.energyType();
    if (!energyType || energyType === "Electrique") {
      return null;
    }
    return `Consommation ${energyType.toLowerCase()}`;
  });

  protected readonly totalInfo = computed(() => {
    const explanation = this.totalExplanation();
    return {
      value: explanation.value,
      tooltip: this.tooltipFor(
        formatConsumptionExplanation({
          explanation: explanation.explanation,
          formatNumber: (value) => this.formatValue(value),
          formatMwh: (value) => this.formatMwh(value),
        }),
      ),
    };
  });

  protected readonly electricityInfo = computed(() => {
    const explanation = this.electricityExplanation();
    return {
      value: explanation.value,
      tooltip: this.tooltipFor(
        formatConsumptionExplanation({
          explanation: explanation.explanation,
          formatNumber: (value) => this.formatValue(value),
          formatMwh: (value) => this.formatMwh(value),
        }),
      ),
    };
  });

  protected readonly nonElectricInfo = computed(() => {
    const label = this.nonElectricConsumptionLabel();
    const explanation = this.nonElectricExplanation();
    return {
      value: explanation.value,
      label,
      tooltip: this.tooltipFor(
        formatConsumptionExplanation({
          explanation: explanation.explanation,
          formatNumber: (value) => this.formatValue(value),
          formatMwh: (value) => this.formatMwh(value),
        }),
      ),
    };
  });

  protected readonly electricitySharePercent = computed(() => {
    const total = this.totalConsumptionMwh();
    const electricity = this.electricityConsumptionMwh();
    if (total === null || total === 0 || electricity === null) {
      return null;
    }
    return (electricity / total) * 100;
  });

  protected readonly nonElectricSharePercent = computed(() => {
    const total = this.totalConsumptionMwh();
    const nonElectric = this.nonElectricConsumptionMwh();
    if (total === null || total === 0 || nonElectric === null) {
      return null;
    }
    return (nonElectric / total) * 100;
  });

  private formatValue(value: number): string {
    return new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
    })
      .format(value)
      .replace(/\u00A0/g, " ");
  }

  protected formatMwh(value: number | null): string {
    if (value === null) {
      return "";
    }
    return `${this.formatValue(value)} MWh`;
  }

  protected formatPercent(value: number | null): string {
    if (value === null) {
      return "";
    }
    return `${this.formatValue(value)} %`;
  }

  // Debug tooltips are only enabled in dev/preview; production hides them.
  private tooltipFor(message: string) {
    if (!message || !this.showDebugTooltips) {
      return undefined;
    }
    return `Tooltip présent uniquement en env de dev/preview:\n${message}`;
  }

  // Enedis usage rule:
  // - Sum residential + enterprise only when both values are from the same year.
  // - Otherwise, keep the most recent available value.
  private getSelectedEnedisResult(): {
    value: number;
    source: "residential" | "enterprise" | "combined";
    details: string;
  } | null {
    const residential = this.enedisData.getLatestEnedisRow(
      this.consumptionResidentialResults(),
    );
    const enterprise = this.enedisData.getLatestEnedisRow(
      this.consumptionEnterpriseResults(),
    );

    if (residential && enterprise && residential.year === enterprise.year) {
      return {
        value: residential.value + enterprise.value,
        source: "combined",
        details:
          "Residential + enterprise\n" +
          `Annee res.: ${residential.year} / Valeur: ${this.formatMwh(residential.value)} \n` +
          `Annee ent.: ${enterprise.year} / Valeur: ${this.formatMwh(enterprise.value)}`,
      };
    }

    if (residential && enterprise) {
      const latest =
        residential.year > enterprise.year ? residential : enterprise;
      return {
        value: latest.value,
        source:
          residential.year > enterprise.year ? "residential" : "enterprise",
        details:
          `Annee: ${latest.year}\n` + `Valeur: ${this.formatMwh(latest.value)}`,
      };
    }

    if (residential) {
      return {
        value: residential.value,
        source: "residential",
        details:
          `Annee: ${residential.year}\n` +
          `Valeur: ${this.formatMwh(residential.value)}`,
      };
    }

    if (enterprise) {
      return {
        value: enterprise.value,
        source: "enterprise",
        details:
          `Annee: ${enterprise.year}\n` +
          `Valeur: ${this.formatMwh(enterprise.value)}`,
      };
    }

    return null;
  }

  private getIncompressibleShare(): number | null {
    const legalEntities = this.location().legalEntities;
    const nafCodes = legalEntities
      .map((entity) => entity.mainBusinessActivity)
      .filter((code): code is string => Boolean(code));
    return getIncompressibleShareFromNafCodes(nafCodes);
  }
}
