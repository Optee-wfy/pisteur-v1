import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { getIpeNormalizedScore } from "@optee/constants";
import { environment } from "@optee/env";
import type { ExternalLocation } from "@optee/models";
import { Tooltip } from "primeng/tooltip";

@Component({
  selector: "mkp-ipe-score-gauge",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (normalizedScore() === null) {
      <p class="text-granite-300 text-sm italic">Non connu</p>
    } @else {
      <section
        class="flex w-full items-center gap-2 text-xs text-gray-600"
        tooltipPosition="right"
        [pTooltip]="debugTooltip()"
      >
        <span>1</span>
        <div class="relative h-4 w-40 flex-1">
          <div
            class="bg-granite-200 absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2"
          ></div>

          <div
            class="border-granite-500 text-granite-500 absolute top-1/2 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-xs font-semibold"
            [style.left.%]="markerPosition()"
          >
            {{ normalizedScore() }}
          </div>
        </div>
        <span>10</span>
      </section>
    }
  `,
  imports: [Tooltip],
})
export class IpeScoreGaugeComponent {
  readonly rawScore = input<number | null>(null);
  readonly location = input<ExternalLocation | null>(null);

  private readonly showDebugTooltips =
    environment.slug === "development" || environment.slug === "preview";

  protected readonly normalizedScore = computed(() => {
    const raw = this.rawScore();
    if (typeof raw !== "number") {
      return null;
    }
    return getIpeNormalizedScore(raw);
  });

  protected readonly markerPosition = computed(() => {
    const normalized = this.normalizedScore();
    if (normalized === null) {
      return 0;
    }
    return ((normalized - 1) / 9) * 100;
  });

  protected readonly debugTooltip = computed(() => {
    if (!this.showDebugTooltips) {
      return undefined;
    }

    const source = this.location();
    if (!source) {
      return undefined;
    }

    const rawScore = this.rawScore();
    const normalizedScore = this.normalizedScore();

    return [
      `IPE usage: ${source.ipeUsage ?? "NC"}`,
      `IPE reason: ${source.ipeUsageReason ?? "NC"}`,
      `Raw score: ${rawScore ?? "NC"}`,
      `Normalized: ${normalizedScore ?? "NC"}`,
      `Building usage: ${source.buildingUsage ?? "NC"}`,
      `Ref company: ${source.referenceCompanyUuid ?? "NC"}`,
      `Ref reason: ${source.referenceCompanySelectionReason ?? "NC"}`,
    ].join("\n");
  });
}
