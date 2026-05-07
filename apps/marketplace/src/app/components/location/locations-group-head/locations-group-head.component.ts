import { animate, style, transition, trigger } from "@angular/animations";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { IconChevronRightComponent } from "@optee/icons";
import type { LocationListColumn } from "../locations-group-row-admin/locations-group-row-admin.component";

@Component({
  selector: "mkp-locations-group-head",
  host: {
    class:
      "py-2 px-4 hover:text-primary-700 relative box-content cursor-pointer select-none font-normal table-cell",
    "[class.text-primary-700]": "isActive()",
  },
  template: `
    <ng-content />

    @if (sortCriteriaDirection() && sortCriteria() === this.criteria()) {
      <icon-chevron-right
        class="top-O absolute right-0 size-5 transition-transform"
        [@fadeInOut]
        [class.-rotate-90]="sortCriteriaDirection() === 'asc'"
        [class.rotate-90]="sortCriteriaDirection() === 'desc'"
      />
    }
  `,
  imports: [IconChevronRightComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("fadeInOut", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("150ms", style({ opacity: 1 })),
      ]),
      transition(":leave", [animate("150ms", style({ opacity: 0 }))]),
    ]),
  ],
})
export class LocationsGroupHeadComponent {
  readonly criteria = input.required<LocationListColumn | null>();

  readonly sortCriteria = input<LocationListColumn | null>(null);
  readonly sortCriteriaDirection = input<"asc" | "desc" | null>(null);

  protected readonly isActive = computed(
    () => this.sortCriteria() === this.criteria(),
  );
}
