import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { Operation } from "@optee/models";
import { ProgressBar } from "primeng/progressbar";

@Component({
  selector: "mkp-operations-score-details",
  host: {
    class: "text-primary-900 flex flex-col gap-3",
  },
  template: `
    @if (displayedColumns().includes("roi")) {
      <div class="flex" [class]="sectionClass()">
        <div [class]="labelClass()">ROI</div>

        <div class="flex flex-col gap-1" [class]="progressClass()">
          <div class="flex justify-between text-xs text-gray-600">
            <div>> 10 ans</div>
            <div>Immédiat</div>
          </div>

          <p-progressbar
            class="w-full"
            styleClass="p-progressbar--light"
            [showValue]="false"
            [value]="operation().roiScore || 2"
          />
        </div>
      </div>
    }
    @if (displayedColumns().includes("funding")) {
      <div class="flex" [class]="sectionClass()">
        <div [class]="labelClass()">Financement</div>

        <div class="flex flex-col gap-1" [class]="progressClass()">
          <div class="flex justify-between text-xs text-gray-600">
            <div>0%</div>
            <div>100%</div>
          </div>

          <p-progressbar
            class="w-full"
            styleClass="p-progressbar--light"
            [showValue]="false"
            [value]="operation().fundingScore || 2"
          />
        </div>
      </div>
    }
    @if (displayedColumns().includes("complexity")) {
      <div class="flex" [class]="sectionClass()">
        <div [class]="labelClass()">Complexité</div>

        <div class="flex flex-col gap-1" [class]="progressClass()">
          <div class="flex justify-between text-xs text-gray-600">
            <div>Complexe</div>
            <div>Facile</div>
          </div>

          <p-progressbar
            class="w-full"
            styleClass="p-progressbar--light"
            [showValue]="false"
            [value]="operation().complexityScore || 2"
          />
        </div>
      </div>
    }
  `,
  imports: [ProgressBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationScoreDetailsComponent {
  readonly operation = input.required<Operation>();
  readonly mode = input<"vertical" | "horizontal">("vertical");
  readonly displayedColumns = input<Array<"roi" | "complexity" | "funding">>([
    "roi",
    "complexity",
    "funding",
  ]);

  protected readonly sectionClass = computed(() =>
    this.mode() === "vertical"
      ? "flex-col gap-1"
      : "flex-row-reverse justify-between items-center gap-4",
  );

  protected readonly progressClass = computed(() =>
    this.mode() === "vertical" ? "w-full" : "w-64",
  );

  protected readonly labelClass = computed(() =>
    this.mode() === "vertical" ? "font-semibold" : "text-sm",
  );
}
