import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

export type ButtonVariant =
  | "primary"
  | "danger"
  | "standard"
  | "accent"
  | "outline"
  | "litePrimary"
  | "litePrimaryReverse"
  | "green";

@Component({
  selector: "oui-button",
  host: {
    class: "block min-w-fit",
    "[class.pointer-events-none]": "disabled()",
    "(click)": "click()",
  },
  template: `
    <button
      class="font-display inline-flex select-none items-center rounded-lg text-base shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 {{
        sizeClass()
      }} {{ fullClass() }} {{ variantCompleteClass() }}"
      [type]="type()"
    >
      <ng-content select="prefix" />
      <ng-content />
      <ng-content select="suffix" />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  type = input<"button" | "submit">("button");
  full = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  keepQueryParams = input(false, { transform: booleanAttribute });
  // @todo separate variant and color
  variant = input<ButtonVariant>("standard");

  size = input<"small" | "medium" | "large">("medium");
  href = input<string>();

  click() {
    const href = this.href();
    if (!href || this.disabled()) {
      return;
    }

    const url = new URL(href, window.location.origin);
    const currentParams = new URLSearchParams(window.location.search);
    if (this.keepQueryParams()) {
      currentParams.forEach((value, key) => {
        url.searchParams.append(key, value);
      });
    }
    window.open(url.toString(), "_blank");
  }

  sizeClass = computed(() => {
    switch (this.size()) {
      case "small":
        return "gap-2 px-3 py-1 text-xs";
      case "medium":
        return "gap-3 px-6 py-3";
      case "large":
        return "gap-3 px-8 py-5 text-xl";
    }
  });

  fullClass = computed(() => {
    return this.full() ? "w-full justify-center" : "";
  });

  variantClass = computed(() => {
    switch (this.variant()) {
      case "primary":
        return "text-white focus-visible:outline-primary-700 to-primary-700 bg-gradient-227  from-[#0022CC] hover:from-[#001A99] hover:to-[#001166]";
      case "danger":
        return "text-white bg-red-600 hover:bg-red-700 focus-visible:outline-red-600";
      case "standard":
        return "text-primary-900 hover:bg-primary-50 focus-visible:outline-primary-700 bg-white font-medium";
      case "accent":
        return "bg-green-500 text-granite-700 hover:bg-green-400 focus-visible:outline-green-600 font-semibold";
      case "outline":
        return "text-primary-700 outline outline-1 outline-current";
      case "litePrimary":
        return "focus-visible:outline-primary-700 bg-primary-200 text-primary-700 hover:text-primary-800 font-medium";
      case "litePrimaryReverse":
        return "text-white focus-visible:outline-primary-700 bg-primary-700 font-semibold";
      case "green":
        return "text-white focus-visible:outline-green-600 bg-green-600 font-semibold";
    }
  });

  variantCompleteClass = computed(() => {
    const disabledStyle = this.disabled()
      ? "pointer-events-none opacity-50"
      : "";
    return `${disabledStyle} ${this.variantClass()}`;
  });
}
