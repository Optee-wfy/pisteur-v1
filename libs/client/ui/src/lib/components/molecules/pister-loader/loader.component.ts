import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from "@angular/core";
import { IconSpinnerComponent } from "@optee/icons";

@Component({
  selector: "oui-loader",
  host: {
    class: "flex h-full w-full flex-1 items-center justify-center gap-4",
    "[class.py-6]": "!compact()",
    "[class.px-4]": "!compact()",
    "[class.flex-col]": "!compact()",
  },
  template: `
    <icon-spinner
      class="animate-spin"
      [class.size-3]="compact()"
      [class.size-6]="!compact()"
    />
    <p class="font-display font-medium" [class.text-sm]="compact()">
      {{ label() }}
    </p>
  `,
  imports: [IconSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  readonly label = input("Chargement en cours...");
  readonly compact = input(false, { transform: booleanAttribute });
}
