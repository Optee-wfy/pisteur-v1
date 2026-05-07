import { animate, style, transition, trigger } from "@angular/animations";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  input,
  output,
} from "@angular/core";
import { IconXmarkComponent } from "@optee/icons";
import { ButtonIconComponent } from "../../atoms/button/button-icon/button-icon.component";

@Component({
  selector: "oui-drawer",
  host: {
    class:
      "shadow-o fixed inset-0 left-auto z-50 flex w-full max-w-screen-sm flex-col gap-6 overflow-auto rounded-l-3xl bg-white p-6",
  },
  template: `
    <header class="flex items-start justify-between gap-4">
      <ng-content select="[heading]" />
      @if (!hideCloseIcon()) {
        <oui-button-icon class="size-8 text-gray-600" (click)="closed.emit()">
          <icon-xmark class="size-5" />
        </oui-button-icon>
      }
    </header>
    <ng-content />
  `,
  imports: [ButtonIconComponent, IconXmarkComponent],
  animations: [
    trigger("fadeTranslate", [
      transition(":enter", [
        style({ transform: "translateX(100%)", opacity: 0 }),
        animate("300ms", style({ transform: "translateX(0)", opacity: 1 })),
      ]),
      transition(":leave", [
        animate("150ms", style({ transform: "translateX(100%)", opacity: 0 })),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent {
  hideCloseIcon = input(false, { transform: booleanAttribute });
  closed = output<void>();

  @HostBinding("@fadeTranslate") animation = true;
}
