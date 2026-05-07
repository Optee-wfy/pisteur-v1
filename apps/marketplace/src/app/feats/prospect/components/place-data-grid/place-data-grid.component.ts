import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { INDUSTRIAL_LOCATION_NAF_CODES, type Sector } from "@optee/constants";
import { IconChevronRightComponent, IconInfoComponent } from "@optee/icons";
import type { BaseLocation, ExternalLocation } from "@optee/models";

import { Tooltip } from "primeng/tooltip";
import { LocationBdnbCategoryIconComponent } from "../../../../components/location/location-bdnb/location-bdnb-category-icon/location-bdnb-category-icon.component";
import { DataSourceChipComponent } from "../data-source-chip/data-source-chip.component";
import { EnedisDataService } from "../enedis-data-grid/enedis-data.service";
import { EnergyConsumptionSummaryComponent } from "./energy-consumption-summary.component";
import { EstimatedEnergyProfileComponent } from "./estimated-energy-profile.component";
import type {
  PlacePropConfig,
  PlacePropertyCategory,
} from "./place-props.type";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "mkp-place-data-grid",
  host: { class: "flex min-w-0 flex-col gap-2" },
  template: `
    @let cat = category();
    <div [class]="containerClass(cat.isOpen || hideCategoryLabel())">
      @if (!hideCategoryLabel()) {
        <h2
          (click)="cat.isOpen = !cat.isOpen"
          [class.bg-granite-50]="!isColored() && cat.isOpen"
          [class]="headerClass()"
        >
          <div [class]="headerIconWrapperClass()">
            <mkp-location-bdnb-category-icon
              [category]="cat.key"
              [class]="headerIconClass()"
            />
          </div>
          <span [class]="headerLabelClass()">{{ cat.label }}</span>
          <icon-chevron-right
            [class.rotate-90]="cat.isOpen"
            [class]="chevronClass()"
          />
        </h2>
      }
      @if (cat.isOpen || hideCategoryLabel()) {
        @if (cat.dataSources.length > 0) {
          <div [class]="dataSourcesClass()">
            <span class="text-sm text-gray-600">Source</span>
            <div
              class="ml-auto flex min-w-0 max-w-full gap-2 overflow-x-auto overflow-y-hidden"
            >
              @for (data of cat.dataSources; track data.label) {
                <mkp-data-source-chip
                  [bgColor]="data.bgColor"
                  [label]="data.label"
                />
              }
            </div>
          </div>
        }

        <section [class]="contentSectionClass()">
          <div
            class="grid h-full min-w-0"
            style="grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);"
            [class.gap-2]="compact()"
            [class.gap-3]="!compact()"
          >
            @if (!cat.customRender) {
              @for (config of cat.properties; track config.key) {
                <p
                  class="text-granite-400 min-w-0 pr-2 font-medium"
                  [class.text-sm]="!compact()"
                  [class.text-xs]="compact()"
                >
                  {{ config.label }}:
                </p>
                <div class="flex min-w-0 items-start justify-between gap-1">
                  <div class="flex min-w-0 items-start gap-1">
                    @let comparison = getComparison(config);
                    @let confidenceScore =
                      getInitialSectorConfidenceScore(config);
                    @if (comparison === null) {
                      <p
                        class="text-granite-300 italic"
                        [class.text-sm]="!compact()"
                        [class.text-xs]="compact()"
                      >
                        Non connu
                      </p>
                    } @else if (comparison.changed) {
                      @if (comparison.after !== null) {
                        <div class="flex items-start gap-1">
                          <p
                            class="font-semibold"
                            [class.text-sm]="!compact()"
                            [class.text-xs]="compact()"
                          >
                            {{ comparison.after }}
                          </p>
                        </div>
                      } @else {
                        @if (comparison.before !== null) {
                          <p
                            class="font-semibold"
                            [class.text-sm]="!compact()"
                            [class.text-xs]="compact()"
                          >
                            {{ comparison.before }}
                          </p>
                        } @else {
                          <p
                            class="text-granite-300 italic"
                            [class.text-sm]="!compact()"
                            [class.text-xs]="compact()"
                          >
                            Non connu
                          </p>
                        }
                      }
                    } @else {
                      <p
                        class="font-semibold"
                        [class.text-sm]="!compact()"
                        [class.text-xs]="compact()"
                      >
                        {{ comparison.value }}
                      </p>
                    }
                    @if (
                      comparison &&
                      comparison.changed &&
                      comparison.after !== null
                    ) {
                      <icon-info
                        class="text-primary-500 shrink-0 cursor-pointer"
                        tooltipPosition="right"
                        [class.size-3]="compact()"
                        [class.size-4]="!compact()"
                        [pTooltip]="
                          combinedTooltip(comparison.before, confidenceScore)
                        "
                      />
                    } @else if (confidenceScore) {
                      <icon-info
                        class="text-primary-500 shrink-0 cursor-pointer"
                        tooltipPosition="right"
                        [class.size-3]="compact()"
                        [class.size-4]="!compact()"
                        [pTooltip]="confidenceTooltip(confidenceScore)"
                      />
                    }
                  </div>

                  @if (
                    comparison !== null &&
                    (config.estimated || this.configIsEstimated(config))
                  ) {
                    <span
                      class="ml-2 inline-block w-fit rounded-lg bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
                    >
                      Estimation
                    </span>
                  }
                </div>
              }
            }

            @if (cat.key === "estimatedConsumption") {
              <div class="col-span-2">
                <mkp-energy-consumption-summary
                  [compact]="compact()"
                  [compareLocation]="compareLocation()"
                  [consumptionEfM2]="consumptionEfM2()"
                  [consumptionEnterpriseResults]="
                    consumptionEnterpriseEnedis.value().results
                  "
                  [consumptionResidentialResults]="
                    consumptionResidentialEnedis.value().results
                  "
                  [location]="location()"
                />
              </div>
            }
            @if (cat.customRender && cat.key === "estimatedEnergyProfile") {
              <div class="col-span-2">
                <mkp-estimated-energy-profile
                  [compact]="compact()"
                  [consumptionEnterpriseResults]="
                    consumptionEnterpriseEnedis.value().results
                  "
                  [consumptionResidentialResults]="
                    consumptionResidentialEnedis.value().results
                  "
                  [location]="location()"
                  [rawScore]="ipeRawScore()"
                />
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
  imports: [
    DataSourceChipComponent,
    EnergyConsumptionSummaryComponent,
    EstimatedEnergyProfileComponent,
    IconInfoComponent,
    IconChevronRightComponent,
    LocationBdnbCategoryIconComponent,
    Tooltip,
  ],
  providers: [EnedisDataService],
})
export class PlaceDataGridComponent {
  readonly category = input.required<
    PlacePropertyCategory & { isOpen?: boolean }
  >();

  readonly location = input.required<ExternalLocation>();
  readonly compareLocation = input<ExternalLocation | null>(null);
  readonly consumptionEfM2 = input<number | null>(null);
  readonly hideCategoryLabel = input(false, { transform: booleanAttribute });
  readonly compact = input(false, { transform: booleanAttribute });
  readonly variant = input<"default" | "colored">("default");

  private readonly industrialNafCodes = new Set(INDUSTRIAL_LOCATION_NAF_CODES);
  private readonly enedisData = inject(EnedisDataService);

  protected readonly consumptionResidentialEnedis =
    this.enedisData.consumptionResidentialEnedis;

  protected readonly consumptionEnterpriseEnedis =
    this.enedisData.consumptionEnterpriseEnedis;

  protected readonly isColored = computed(() => this.variant() === "colored");

  protected containerClass(isOpen: boolean): string {
    if (!this.isColored()) {
      return "";
    }

    return "w-full rounded-[28px] border border-gray-300 bg-white p-4";
  }

  protected readonly headerClass = computed(() => {
    if (this.isColored()) {
      return "flex cursor-pointer items-center gap-4 text-black transition-all";
    }

    return "text-granite-900 hover:bg-granite-50 flex cursor-pointer items-center gap-2 rounded-lg text-sm font-medium transition-all";
  });

  protected readonly headerIconWrapperClass = computed(() => {
    if (this.isColored()) {
      return "flex items-center justify-center text-green-600";
    }

    return "bg-granite-100 flex items-center justify-center rounded-lg p-1.5";
  });

  protected readonly headerIconClass = computed(() => {
    if (this.isColored()) {
      return "!size-4 text-green-600";
    }

    return "text-granite-500 !size-5";
  });

  protected readonly headerLabelClass = computed(() => {
    if (this.isColored()) {
      return "text-md font-medium text-black md:text-xl";
    }

    return "";
  });

  protected readonly chevronClass = computed(() => {
    if (this.isColored()) {
      return "ml-auto size-4 text-black md:size-5";
    }

    return "ml-auto mr-2 size-4";
  });

  protected readonly dataSourcesClass = computed(() => {
    if (this.isColored()) {
      return "mb-4 flex items-center justify-between gap-4 px-2 pt-4";
    }

    return "mb-2 flex items-center justify-between gap-4 px-1";
  });

  protected readonly contentSectionClass = computed(() => {
    if (this.isColored()) {
      return "h-full min-w-0 px-2 pb-2";
    }

    return this.compact()
      ? "border-granite-100 h-full min-w-0 rounded-lg border bg-white p-2"
      : "border-granite-100 h-full min-w-0 rounded-lg border bg-white p-4";
  });

  protected ipeRawScore(): number | null {
    return (
      this.compareLocation()?.ipeRawScore ?? this.location().ipeRawScore ?? null
    );
  }

  protected tooltip(beforeValue: string | null) {
    return (
      "Cette valeur a été mise à jour via l'API BDNB. Ancienne valeur:\n" +
      (beforeValue ?? "Non connu")
    );
  }

  protected combinedTooltip(
    beforeValue: string | null,
    confidenceScore: "FORT" | "MOYEN" | "FAIBLE" | null,
  ) {
    if (!confidenceScore) {
      return this.tooltip(beforeValue);
    }
    return `${this.tooltip(beforeValue)}\nScore de confiance : ${confidenceScore}`;
  }

  protected confidenceTooltip(confidenceScore: "FORT" | "MOYEN" | "FAIBLE") {
    return `Score de confiance : ${confidenceScore}`;
  }

  protected configIsEstimated(config: PlacePropConfig): boolean {
    return this.location().uncertainData.includes(
      config.key as keyof BaseLocation,
    );
  }

  protected getInitialSectorConfidenceScore(
    config: PlacePropConfig,
  ): "FORT" | "MOYEN" | "FAIBLE" | null {
    if (config.key !== "initialSector") {
      return null;
    }

    const sector: Sector | null = this.location().initialSector;
    const hasIndustrialNaf = this.location().legalEntities.some((entity) =>
      this.isIndustrialNaf(entity.mainBusinessActivity),
    );

    if (
      sector === "resi" ||
      sector === "Résidentiel collectif" ||
      sector === "ter"
    ) {
      return "FORT";
    }

    if (sector === "Autre") {
      return hasIndustrialNaf ? "FORT" : "FAIBLE";
    }

    if (sector === null) {
      return hasIndustrialNaf ? "MOYEN" : "FAIBLE";
    }

    return "FAIBLE";
  }

  private isIndustrialNaf(code: string | null | undefined): boolean {
    if (!code) {
      return false;
    }
    const normalized = code.trim().toUpperCase();
    return this.industrialNafCodes.has(
      normalized as (typeof INDUSTRIAL_LOCATION_NAF_CODES)[number],
    );
  }

  formatRawValue(rawValue: unknown, config: PlacePropConfig): string | null {
    if (rawValue === null || rawValue === undefined) {
      return null;
    }

    const formattedValue = config.format
      ? config.format(rawValue)
      : String(rawValue);

    if (config.suffix) {
      return `${formattedValue} ${config.suffix}`;
    }

    return formattedValue;
  }

  // before = valeur actuelle Optee, after = valeur BDNB la plus récente
  // Affiche "after" si disponible avec indication visuelle, sinon "before", si "after" est null, on affiche "before"
  getComparison(
    config: PlacePropConfig,
  ):
    | { changed: false; value: string }
    | { changed: true; before: string | null; after: string | null }
    | null {
    const current = this.location();
    const latest = this.compareLocation();

    const currentValue = this.formatRawValue(current[config.key], config);
    const latestValue =
      latest && latest[config.key] !== undefined
        ? this.formatRawValue(latest[config.key], config)
        : null;

    if (currentValue === null && latestValue === null) {
      return null;
    }

    const changed = (currentValue ?? null) !== (latestValue ?? null);
    if (changed) {
      return { changed: true, before: currentValue, after: latestValue };
    }

    return { changed: false, value: currentValue ?? latestValue ?? "" };
  }
}
