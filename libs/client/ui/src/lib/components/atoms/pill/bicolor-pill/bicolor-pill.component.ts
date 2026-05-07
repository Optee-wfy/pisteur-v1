import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { isNotNullish } from "@optee/utils";

@Component({
  selector: "oui-bicolor-pill",
  host: {
    class:
      "text-sm font-display text-green-700 flex items-center font-medium min-w-28 justify-stretch tracking-normal whitespace-nowrap",
  },
  template: `
    @for (value of valuesNotNull(); track $index; let idx = $index) {
      <div
        class="self-stretch border border-green-300 px-2 py-1"
        [class.bg-green-300]="idx % 2 === 1"
        [class.rounded-l-3xl]="idx === 0"
        [class.rounded-r-3xl]="idx === valuesNotNull().length - 1"
      >
        {{ value }}
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BicolorPillComponent {
  readonly values = input.required<Array<string | null>>();

  protected readonly valuesNotNull = computed(() =>
    this.values().filter(isNotNullish),
  );
}
