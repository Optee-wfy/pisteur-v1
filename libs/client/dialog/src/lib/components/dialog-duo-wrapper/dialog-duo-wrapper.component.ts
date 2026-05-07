import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { IconXmarkComponent } from "@optee/icons";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";

@Component({
  selector: "op-dialog-duo-wrapper",
  host: {
    class: "flex relative max-h-[90vh] max-w-[90vw] animate-[modal_300ms]",
  },
  template: `
    <oui-button-icon
      class="text-primary-700 !absolute right-3 top-3 size-8"
      (click)="crossClick.emit()"
    >
      <icon-xmark class="size-5" />
    </oui-button-icon>

    <aside
      class="bg-primary-700 scrollbar-stable relative h-full overflow-y-auto overflow-x-hidden rounded-bl-3xl rounded-tl-3xl text-white"
      [style.scrollbar-color]="'#FFFFFF70 transparent'"
    >
      <oui-circle class="-top-[120px] right-0 w-[280px]" theme="light" />
      <ng-content select="[aside]" />
    </aside>

    <div
      class="h-full flex-auto overflow-auto rounded-br-3xl rounded-tr-3xl bg-white"
      [style.scrollbar-color]="'#001A99 transparent'"
    >
      <ng-content />
    </div>
  `,
  imports: [ButtonIconComponent, CircleComponent, IconXmarkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogDuoWrapperComponent {
  crossClick = output<void>();
}
