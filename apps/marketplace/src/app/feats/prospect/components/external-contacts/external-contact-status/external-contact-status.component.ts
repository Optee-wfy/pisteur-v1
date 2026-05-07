import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import {
  AssociationProExternalContactStatus,
  ExternalContactStatusLabels,
} from "@optee/constants";

@Component({
  selector: "mkp-external-contact-status",
  host: {
    class:
      "px-2.5 py-1 rounded-xl flex items-center gap-2 text-xs min-w-fit whitespace-nowrap",
    "[class]": "statusClass()",
  },
  template: `
    <span class="size-2 shrink-0 rounded-full bg-current"></span>
    <div class="flex gap-1">
      {{ label() }}
      @if (count() !== null) {
        ({{ count() }})
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalContactStatusComponent {
  readonly status = input.required<AssociationProExternalContactStatus>();
  readonly count = input<number | null>(null);

  protected readonly label = computed(
    () => ExternalContactStatusLabels[this.status()],
  );

  protected readonly statusClass = computed(() => {
    switch (this.status()) {
      case AssociationProExternalContactStatus.NEW:
        return "bg-blue-100 text-blue-800";
      case AssociationProExternalContactStatus.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800";
      case AssociationProExternalContactStatus.CLOSED_WON:
        return "bg-green-100 text-green-800";
      case AssociationProExternalContactStatus.CLOSED_LOST:
        return "bg-red-100 text-red-800";
      case AssociationProExternalContactStatus.ARCHIVED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-transparent text-granite-900";
    }
  });
}
