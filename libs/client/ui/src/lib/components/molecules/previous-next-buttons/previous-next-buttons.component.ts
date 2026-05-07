import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { IconChevronRightComponent } from "@optee/icons";

@Component({
  selector: "oui-previous-next-buttons",
  host: { class: "flex items-center gap-2" },
  template: `
    <button
      class="pister-link inverted"
      type="button"
      (click)="previous.emit()"
      [disabled]="disabledPrevious()"
    >
      <icon-chevron-right class="size-3 rotate-180" />
      <span>Précédent</span>
    </button>
    <button
      class="pister-link inverted"
      type="button"
      (click)="next.emit()"
      [disabled]="disabledNext()"
    >
      <span>Suivant</span>
      <icon-chevron-right class="size-3" />
    </button>
  `,
  imports: [IconChevronRightComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviousNextButtonsComponent {
  readonly disabledPrevious = input(false);
  readonly disabledNext = input(false);

  readonly previous = output<void>();
  readonly next = output<void>();
}
