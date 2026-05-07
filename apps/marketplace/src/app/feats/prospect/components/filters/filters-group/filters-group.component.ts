import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from "@angular/core";
import { IconChevronRightComponent } from "@optee/icons";

@Component({
  selector: "mkp-filters-group",
  template: `
    <div
      class="bg-granite-50 flex flex-col gap-4 rounded-lg px-4 py-2 transition-colors"
      [class.bg-white]="!colored()"
      [class.border-slate-200]="!colored()"
      [class.border]="!colored()"
    >
      <div
        class="font-display text-granite-900 -mx-3 flex cursor-pointer select-none items-center rounded-lg p-2 text-sm font-medium transition-colors"
        (click)="toggleAccordion()"
      >
        <ng-content select="[heading]" />

        @if (dropDown()) {
          <icon-chevron-right
            class="text-granite-900 ml-auto size-4 transition-all"
            [class.-rotate-90]="!isOpen()"
            [class.rotate-90]="isOpen()"
          />
        }
      </div>
      <div
        class="flex flex-col gap-4 pb-2"
        [class.hidden]="dropDown() && !isOpen()"
      >
        <ng-content />
      </div>
    </div>
  `,
  imports: [IconChevronRightComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersGroupComponent {
  readonly dropDown = input(false, { transform: booleanAttribute });
  readonly isOpen = model(false);
  readonly colored = input(true, { transform: booleanAttribute });

  protected toggleAccordion() {
    if (this.dropDown()) {
      this.isOpen.set(!this.isOpen());
    }
  }
}
