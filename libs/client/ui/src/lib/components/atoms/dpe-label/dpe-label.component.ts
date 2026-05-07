import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { getDpeLabelColor, type DpeLabel } from "@optee/constants";

@Component({
  selector: "oui-dpe-label",
  host: {
    class: "flex items-center font-display select-none",
    "[class]": "variantStyle()",
    "[style.color]": "color()",
    "[style.backgroundColor]": "bgColor()",
  },
  template: `
    {{ letter() }}

    @if (variant() === "arrow") {
      <div
        class="absolute left-[100%] top-0 size-0 border-b-[16px] border-l-[10px] border-r-0 border-t-[16px] border-solid border-b-transparent border-r-transparent border-t-transparent"
        [style.border-left-color]="bgColor()"
      ></div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DpeLabelComponent {
  readonly letter = input.required<DpeLabel | "?" | "NC">();
  readonly variant = input<"round" | "rounded-square" | "arrow">("round");
  readonly size = input<"sm" | "md" | "lg">("md");

  protected readonly variantStyle = computed(() => {
    const sizeClasses = this.getSizeClasses();

    switch (this.variant()) {
      case "round":
        return `${sizeClasses.size} justify-center rounded-full ${sizeClasses.text}`;
      case "rounded-square":
        return `${sizeClasses.size} justify-center rounded ${sizeClasses.text}`;
      case "arrow":
        return `relative ${sizeClasses.height} rounded-l ${sizeClasses.padding}`;
      default:
        throw new Error(`Variante DPE invalide: "${this.variant()}"`);
    }
  });

  private getSizeClasses() {
    switch (this.size()) {
      case "sm":
        return {
          size: "size-6",
          height: "h-6",
          text: "text-xs",
          padding: "px-1 py-0.5",
        };
      case "md":
        return {
          size: "size-8",
          height: "h-8",
          text: "text-sm",
          padding: "px-2 py-1",
        };
      case "lg":
        return {
          size: "size-10",
          height: "h-10",
          text: "text-base",
          padding: "px-3 py-1.5",
        };
      default:
        return {
          size: "size-8",
          height: "h-8",
          text: "text-sm",
          padding: "px-2 py-1",
        };
    }
  }

  protected readonly bgColor = computed(() => getDpeLabelColor(this.letter()));

  protected readonly color = computed(() => {
    switch (this.letter()) {
      case "G":
      case "?":
      case "NC":
      case null:
        return "white";
      default:
        return "#031122";
    }
  });
}
