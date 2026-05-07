import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { IconPlusComponent } from "@optee/icons";

@Component({
  selector: "oui-button-icon",
  host: {
    "[class]":
      "'flex size-10 relative select-none items-center justify-center rounded-full p-2 transition text-sm border ' + variantCompleteClass()",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />

    @if (action() === "add") {
      <icon-plus class="absolute right-1 top-1 size-3" />
    }
  `,
  imports: [IconPlusComponent],
})
export class ButtonIconComponent {
  disabled = input(false, { transform: booleanAttribute });
  isActive = input(false, { transform: booleanAttribute });
  action = input<"add" | "edit" | "delete" | null>(null);
  variant = input<"primary" | "standard">("standard");

  variantClass = computed(() => {
    switch (this.variant()) {
      case "standard":
        if (this.isActive()) {
          return "bg-white border-primary-400 border";
        }
        return "bg-white border border-primary-200 border hover:border-primary-400";
      case "primary": {
        const base =
          "border-white text-white focus-visible:outline-primary-700 bg-gradient-227";

        if (this.isActive()) {
          return `${base} from-[#4C6BCD] to-[#1647CD]`;
        }

        return `${base} to-primary-700  from-[#0022CC] hover:from-[#001A99] hover:to-[#001166]`;
      }
    }
  });

  variantCompleteClass = computed(() => {
    const disabledStyle = this.disabled()
      ? "pointer-events-none opacity-50"
      : "cursor-pointer";
    return `${disabledStyle} ${this.variantClass()}`;
  });
}
