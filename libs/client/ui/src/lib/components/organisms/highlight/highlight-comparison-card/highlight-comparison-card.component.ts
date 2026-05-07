import { DecimalPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { DpeLabel } from "@optee/constants";
import { IconArrowLeftComponent } from "@optee/icons";
import { Skeleton } from "primeng/skeleton";
import { DpeLabelComponent } from "../../../atoms/dpe-label/dpe-label.component";
import { TooltipEstimationComponent } from "../../../atoms/tooltip-estimation/tooltip-estimation.component";
@Component({
  selector: "oui-highlight-comparison-card",
  host: {
    class:
      "shadow-o relative flex w-full items-center overflow-hidden rounded-xl bg-white print:shadow-none",
  },
  template: `
    <!-- Percentage Circle -->
    @if (percent()) {
      <div
        class="bg-primary-700 absolute -bottom-2 -left-2 flex size-16 items-center justify-center rounded-full text-lg font-bold text-white"
      >
        {{ percent() | number: "1.0-0" }}%
      </div>
    }

    <!-- Text Content -->
    <div class="flex-1 pl-20">
      <p class="text-primary-900 text-xl font-semibold">
        {{ cardTitle() }}
        @if (values() && estimated()) {
          <oui-tooltip-estimation class="-bottom-2 -right-4" />
        }
      </p>
      <p class="text-sm text-gray-600">{{ cardSubtitle() }}</p>
    </div>

    <div
      class="bg-primary-50 flex h-full flex-1 items-end justify-center gap-4 rounded-l-full p-2 py-6 pl-10 shadow-inner"
    >
      <!-- Before -->
      @if (!loading()) {
        @if (values()) {
          <div class="flex flex-col items-center gap-2">
            @if (values()?.before?.label; as beforeLabel) {
              <oui-dpe-label class="size-14 !text-2xl" [letter]="beforeLabel" />
            }
            <span
              class="mt-1 rounded-xl bg-white px-3 py-1 text-sm text-gray-600"
            >
              {{ values()?.before?.value }}
            </span>
          </div>

          <icon-arrow-left class="text-primary-700 size-6 rotate-180" />

          @if (values()?.after?.label; as afterLabel) {
            <!-- After -->
            <div class="flex flex-col items-center gap-2">
              <oui-dpe-label class="size-14" [letter]="afterLabel" />
              <span
                class="mt-1 rounded-xl bg-white px-3 py-1 text-sm text-gray-600"
              >
                {{ values()?.after?.value ?? "--" }}
              </span>
            </div>
          }
        }
      } @else {
        <p-skeleton height="4.5rem" width="10rem" />
      }
    </div>
  `,
  imports: [
    IconArrowLeftComponent,
    DpeLabelComponent,
    TooltipEstimationComponent,
    DecimalPipe,
    Skeleton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighlightComparisonCardComponent {
  cardTitle = input.required<string>();
  estimated = input.required<boolean>();
  values = input.required<{
    before: { value: string | null; label: DpeLabel | "NC" };
    after: { value: string | null; label: DpeLabel | "NC" };
  } | null>();

  cardSubtitle = input<string>();
  percent = input<number>();
  loading = input<boolean>();
}
