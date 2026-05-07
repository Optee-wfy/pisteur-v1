import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { Skeleton } from "primeng/skeleton";

@Component({
  selector: "oui-highlight-value-range-card",
  host: {
    class:
      "inline-flex flex-col items-center justify-center gap-4 rounded-2xl p-4 tracking-tight flex-1 min-w-fit print:shadow-none ",
    "[class]": "hostClass()",
  },
  template: `
    <div class="min-wfit flex flex-col items-center justify-evenly gap-2">
      <p class="select-none text-center text-base font-semibold">
        {{ cardTitle() }}
      </p>
      @if (!loading()) {
        <p
          class="font-display text-pretty text-center text-lg font-semibold leading-normal"
        >
          {{ highlightValue() ?? "--" }}
        </p>
      } @else {
        <p-skeleton class="h-6 w-24" />
      }
    </div>
    @if (range() && showRange()) {
      @if (!loading()) {
        <p
          class="min-w-fit rounded-2xl px-2 py-1 text-xs leading-none"
          [class]="rangeClass()"
        >
          {{ range() }}
        </p>
      } @else {
        <p-skeleton class="h-6 w-24" />
      }
    }
  `,
  imports: [Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighlightValueRangeCardComponent {
  cardTitle = input.required<string>();
  highlightValue = input<string | null>();
  range = input<string | null>();
  showRange = input<boolean>(true);
  loading = input<boolean>();
  theme = input<"light" | "dark" | "soft">("light");

  protected readonly hostClass = computed(() => {
    if (this.theme() === "light") {
      return "bg-white text-primary-900 shadow-o";
    }
    if (this.theme() === "dark") {
      return "bg-primary-700 text-white shadow-inner";
    }

    return "bg-primary-400 text-white";
  });

  protected readonly rangeClass = computed(() => {
    if (this.theme() === "soft") {
      return "bg-primary-200 text-primary-400";
    }

    return "bg-primary-200 text-primary-700";
  });
}
