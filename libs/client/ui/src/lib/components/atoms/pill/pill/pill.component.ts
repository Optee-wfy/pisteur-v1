import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

export type PillVariant =
  | "trans-white"
  | "grey-black"
  | "white-blue"
  | "red-white"
  | "blue-white";

@Component({
  selector: "oui-pill",
  host: {
    class: "block rounded-2xl py-1 px-2 text-sm",
    "[class]": "style()",
    "[class.truncate]": "!truncateDisabled()",
  },
  template: `
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PillComponent {
  readonly variant = input.required<PillVariant>();
  readonly truncateDisabled = input(false, { transform: booleanAttribute });

  protected readonly style = computed(() => {
    switch (this.variant()) {
      case "white-blue":
        return "bg-white text-primary-700 font-medium";
      case "red-white":
        return "bg-red-500 text-white font-medium";
      case "blue-white":
        return "bg-primary-700 text-white font-medium";
      case "grey-black":
        return "bg-gray-100 text-black";
      case "trans-white":
        return "bg-transparent text-white border border-primary-400";
    }
  });
}
