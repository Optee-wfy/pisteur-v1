import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from "@angular/core";

@Component({
  selector: "oui-title-tight",
  host: {
    class: "block font-display text-2xl",
    "[class.lg:text-3xl]": "!fixedFontSize()",
  },
  template: `
    <span class="font-semibold">
      <ng-content />
    </span>

    @if (value()) {
      <div class="ml-1 inline-block text-gray-300">
        {{ value() }}
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleTightComponent {
  readonly value = input<string | number | undefined>("");
  readonly fixedFontSize = input(false, { transform: booleanAttribute });
}
