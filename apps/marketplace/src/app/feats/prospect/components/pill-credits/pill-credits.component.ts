import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { IconBoltComponent } from "@optee/icons";

type ColorVariant = "primary" | "green" | "purple" | "granite";
type IconSize = 2 | 3 | 4 | 5 | 6;

@Component({
  selector: "mkp-pill-credits",
  host: {
    class: "flex items-center gap-0.5 rounded-full px-1.5 text-xs font-medium",
    "[class]": "variantClass()",
  },
  template: `
    <icon-bolt
      [class.size-2]="iconSize() === 2"
      [class.size-3]="iconSize() === 3"
      [class.size-4]="iconSize() === 4"
      [class.size-5]="iconSize() === 5"
      [class.size-6]="iconSize() === 6"
    />
    {{ credits() }}
  `,
  imports: [IconBoltComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PillCreditsComponent {
  readonly credits = input.required<number>();
  readonly colorVariant = input<ColorVariant>("green");
  readonly iconSize = input<IconSize>(3);

  protected readonly variantClass = computed(() => {
    switch (this.colorVariant()) {
      case "primary":
        return "text-primary-500 bg-primary-100";
      case "green":
        return "text-green-600 bg-green-200";
      case "purple":
        return "text-purple-700 bg-purple-100";
      case "granite":
        return "text-granite-700 bg-granite-100";
      default:
        return "text-primary-500 bg-primary-100";
    }
  });
}
