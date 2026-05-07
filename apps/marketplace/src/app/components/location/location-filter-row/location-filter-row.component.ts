import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from "@angular/core";
import { IconChevronRightComponent } from "@optee/icons";

@Component({
  selector: "mkp-locations-filter-row",
  template: `
    <div class="flex flex-col gap-4">
      <div
        class="font-display flex cursor-pointer select-none items-center"
        (click)="toggleAccordion()"
      >
        {{ heading() }}

        @if (dropDown()) {
          <icon-chevron-right
            class="text-primary-700 ml-auto size-4 transition-all"
            [class.-rotate-90]="!this.isOpen()"
            [class.rotate-90]="this.isOpen()"
          />
        }
      </div>
      <div
        [class.hidden]="dropDown() && !this.isOpen()"
        [class.print:block]="dropDown() && !this.isOpen()"
      >
        <ng-content />
      </div>
    </div>
    <div class="mt-6 border border-gray-300"></div>
  `,
  imports: [IconChevronRightComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationsFilterRowComponent {
  dropDown = input(false, { transform: booleanAttribute });
  heading = input("");

  isOpen = model(false);

  toggleAccordion() {
    if (this.dropDown()) {
      this.isOpen.set(!this.isOpen());
    }
  }
}
