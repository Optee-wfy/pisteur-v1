import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from "@angular/core";
import { IconChevronRightComponent } from "@optee/icons";

@Component({
  selector: "oui-stock",
  host: {
    class: "select-none group cursor-pointer",
  },
  template: `
    <div
      class="text-primary-700 flex max-w-[150px] items-center gap-1 font-semibold lg:max-w-fit"
    >
      {{ labelA() }}
      @if (forceNewLine()) {
        <br />
      }
      {{ labelB() }}
      <icon-chevron-right
        class="text-granite-400 size-3 transition-transform group-hover:translate-x-1"
      />
    </div>

    <div
      class="text-granite-700 text-[48px] font-bold leading-tight empty:hidden"
    >
      {{ value() }}
    </div>
  `,
  imports: [IconChevronRightComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockComponent {
  forceNewLine = input(false, { transform: booleanAttribute });
  labelA = input.required<string>();
  labelB = input.required<string>();
  value = input.required<number | string | null>();
}
