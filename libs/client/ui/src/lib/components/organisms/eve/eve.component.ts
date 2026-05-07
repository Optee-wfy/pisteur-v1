import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

@Component({
  selector: "oui-eve",
  host: {
    "[class]":
      "'block shadow-o rounded-3xl print:shadow-none ' + variantClass()",
    "[class.p-3]": "!spaceless()",
    "[class.md:p-6]": "!spaceless()",
  },
  template: `
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EveComponent {
  variant = input<"primary" | "standard" | "slate">("standard");
  spaceless = input(false, { transform: booleanAttribute });

  variantClass = computed(() => {
    switch (this.variant()) {
      case "primary":
        return "bg-primary-700 text-white";
      case "standard":
        return "bg-white text-primary-900";
      case "slate":
        return "border-slate-200 bg-slate-50 text-slate-900";
    }
  });
}
