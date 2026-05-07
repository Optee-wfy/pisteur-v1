import { animate, style, transition, trigger } from "@angular/animations";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { IconChevronRightComponent } from "@optee/icons";
import { hostBinding } from "ngxtension/host-binding";
import type { OperationListColumn } from "../operations-group-row/operations-group-row.component";

@Component({
  selector: "mkp-operations-group-head",
  host: {
    class:
      "py-2 px-4 relative box-content cursor-pointer select-none font-normal table-cell truncate",
  },
  template: `
    <ng-content />

    @if (sortCriteriaDirection() && sortCriteria() === this.criteria()) {
      <icon-chevron-right
        class="absolute right-1 top-2 size-4 transition-transform"
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
export class OperationsGroupHeadComponent {
  criteria = input<OperationListColumn | null>();
  displayMode = input<"leads" | "marketplace">("marketplace");

  sortCriteria = input<OperationListColumn | null>(null);
  sortCriteriaDirection = input<"asc" | "desc" | null>(null);

  isActive = computed(() => this.sortCriteria() === this.criteria());

  leadsHoverBinding = hostBinding(
    "class.hover:text-emerald-500",
    computed(() => this.displayMode() === "leads"),
  );

  marketplaceHoverBinding = hostBinding(
    "class.hover:text-primary-700",
    computed(() => this.displayMode() !== "leads"),
  );

  activeBinding = hostBinding("class.text-primary-700", this.isActive);
}
