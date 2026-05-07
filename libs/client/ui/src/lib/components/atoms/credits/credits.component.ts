import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from "@angular/core";
import { IconCreditsComponent } from "@optee/icons";

@Component({
  selector: "oui-credits",
  host: {
    class:
      "flex items-center justify-start border border-primary-400 rounded-xl text-primary-400 bg-primary-100",
    "[class.flex-row-reverse]": "reverse()",
    "[class]": "compact() ? 'p-1 pl-2 gap-1 text-xs' : 'p-2 gap-2'",
  },
  template: `
    <icon-credits
      colorMode="current"
      [class.size-4]="compact()"
      [class.size-6]="!compact()"
    />
    @if (credits() >= 0) {
      {{ credits() }}
    } @else {
      <span class="pr-1">Aucun crédit</span>
    }
  `,
  imports: [IconCreditsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditsComponent {
  readonly credits = input.required<number>();
  readonly compact = input(false, { transform: booleanAttribute });
  readonly reverse = input(false, { transform: booleanAttribute });
}
