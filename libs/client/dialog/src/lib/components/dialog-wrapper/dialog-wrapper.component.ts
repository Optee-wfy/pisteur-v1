import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  ViewEncapsulation,
} from "@angular/core";
import { IconXmarkComponent } from "@optee/icons";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";

@Component({
  selector: "op-dialog-wrapper",
  host: {
    class:
      "relative w-fit max-w-[95vw] rounded-3xl animate-[modal_300ms] transition-all flex flex-col gap-6 dialog-min-h-app",
    "[class]": "fadeClass() + ' ' + variantClass() + ' ' + paddingClass()",
  },
  template: `
    @if (!closeIconHidden()) {
      <oui-button-icon
        class="text-primary-700 !absolute right-4 top-4 size-8"
        (click)="crossClick.emit()"
      >
        <icon-xmark class="size-5" />
      </oui-button-icon>
    }

    @if (showCircle()) {
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <oui-circle
          class="-left-[120px] -top-[120px] w-[320px]"
          theme="light"
        />
      </div>
    }

    <ng-content />
  `,
  styles: `
    .dialog-min-h-app {
      max-height: min(768px, 90dvh);
    }
  `,
  imports: [ButtonIconComponent, CircleComponent, IconXmarkComponent],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogWrapperComponent {
  readonly crossClick = output<void>();

  readonly fadedOut = input(false, { transform: booleanAttribute });
  readonly closeIconHidden = input(false, { transform: booleanAttribute });
  readonly showCircle = input(false, { transform: booleanAttribute });
  readonly spaceless = input(false, { transform: booleanAttribute });
  readonly variant = input<"white" | "primary-100">("white");

  protected readonly variantClass = computed(() => {
    switch (this.variant()) {
      case "white":
        return "bg-white";
      case "primary-100":
        return "bg-primary-50";
    }
  });

  protected readonly paddingClass = computed(() => {
    return this.spaceless() ? "overflow-hidden" : "p-6 lg:p-8 lg:pt-12";
  });

  protected readonly fadeClass = computed(() => {
    return this.fadedOut() ? "opacity-0 scale-90" : "opacity-100 scale-100";
  });
}
