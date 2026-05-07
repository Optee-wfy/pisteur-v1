import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

@Component({
  selector: "oui-tag",
  host: {
    class:
      "flex items-center gap-1 rounded-lg border px-2 py-1 text-sm font-medium select-none",
    "[class]": "computedClass()",
  },
  template: `
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagComponent {
  isActive = input(false, { transform: booleanAttribute });
  variant = input.required<
    | "neutral"
    | "purple"
    | "gray"
    | "green"
    | "light-green"
    | "amber-light"
    | "primary"
    | "primary-light"
    | "primary-reverse"
  >();

  computedClass = computed(() => {
    switch (this.variant()) {
      case "neutral": {
        const bg = this.isActive() ? "bg-primary-200" : "bg-white";
        return `border-granite-400 text-granite-500 ${bg}`;
      }
      case "purple": {
        return "bg-purple-100 border-purple-300 text-purple-500";
      }
      case "gray": {
        return "bg-gray-100 border-gray-300 text-gray-600";
      }
      case "light-green": {
        return "bg-green-100 border-green-200 text-green-700";
      }
      case "amber-light": {
        return "bg-amber-50 border-amber-200 text-amber-700";
      }
      case "green": {
        return "bg-green-300 border-green-700 text-green-700";
      }
      case "primary": {
        return "bg-primary-100 border-primary-400 text-primary-700";
      }
      case "primary-light": {
        return "bg-primary-50 border-primary-200 text-primary-700";
      }
      case "primary-reverse": {
        return `bg-primary-700 border-primary-800 text-white`;
      }
      default:
        throw new Error(`Unknown variant: ${this.variant()}`);
    }
  });
}
