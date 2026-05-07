import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import {
  BUILDING_OCCUPANCY_STATUS_LABELS,
  type BuildingOccupancyStatus,
} from "@optee/constants";

@Component({
  selector: "mkp-occupancy-status",
  host: { "[class]": "hostClasses()" },
  template: `
    {{ label() }}
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OccupancyStatusComponent {
  readonly status = input.required<BuildingOccupancyStatus | null>();

  protected readonly label = computed(() => {
    const status = this.status();
    return status ? BUILDING_OCCUPANCY_STATUS_LABELS[status] : "";
  });

  protected readonly color = computed(() => {
    switch (this.status()) {
      case "OWNER":
        return "green";
      case "MIXED":
        return "red";
      case "OWNER_OCCUPANT":
        return "yellow";
      case "SYNDIC":
        return "primary";
      default:
        return "gray";
    }
  });

  protected readonly hostClasses = computed(() => {
    if (!this.status()) {
      return "hidden";
    }

    const baseClasses = "w-fit rounded-lg p-1 text-xs border border-current";
    const colorClasses = {
      green: "bg-green-200 text-green-600",
      red: "bg-red-200 text-red-600",
      yellow: "bg-yellow-200 text-yellow-600",
      primary: "bg-primary-100 text-primary-700",
      gray: "bg-gray-200 text-gray-600",
    }[this.color()];

    return `${baseClasses} ${colorClasses}`;
  });
}
