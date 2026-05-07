import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from "@angular/core";
import { IconArrowLeftComponent } from "@optee/icons";

@Component({
  selector: "mkp-location-bdnb-row",
  host: {
    class: "flex flex-wrap items-center justify-between gap-2",
  },
  template: `
    <div
      class="flex flex-shrink-0 gap-1 truncate text-xs font-normal uppercase text-gray-300"
      [class.text-gray-300]="theme() === 'dark'"
      [class.text-primary-700]="theme() === 'light'"
    >
      @if (isHighlighted()) {
        <div
          class="rotate-180"
          [class.text-primary-700]="theme() === 'light'"
          [class.text-white]="theme() === 'dark'"
        >
          <icon-arrow-left class="animate-bounce-x size-4" />
        </div>
      }
      {{ label() }}
    </div>
    <ng-content />
  `,
  imports: [IconArrowLeftComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationBdnbRowComponent {
  readonly label = input<string>();
  readonly isHighlighted = input(false, { transform: booleanAttribute });
  readonly theme = input<"dark" | "light">("dark");
}
