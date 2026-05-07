import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
  signal,
} from "@angular/core";
import type { FormValueControl } from "@angular/forms/signals";
import { form, FormField } from "@angular/forms/signals";
import type { ClimateZone } from "@optee/constants";
import {
  CLIMATE_ZONES,
  FRENCH_REGION_DEPARTMENT_GROUPS,
  getDepartments,
  type Department,
} from "@optee/constants";
import { FieldSkeleton } from "./field-skeleton.directive";
import { SelectButtonsComponent } from "./select-buttons.component";
import { SelectListGroupedComponent } from "./select-list-grouped.component";

@Component({
  selector: "oui-select-departments",
  host: { class: "flex flex-col gap-1" },
  template: `
    <oui-select-list-grouped
      searchPlaceholder="Rechercher un département..."
      [formField]="departmentForm"
      [groups]="departmentOptions"
      [label]="label()"
      [mode]="mode()"
      [showSearch]="true"
    >
      @if (!hideClimateZoneSelector()) {
        <oui-select-buttons
          footer
          [formField]="climateZoneForm"
          [multiple]="multiple()"
          [options]="climateZoneOptions"
        />
      }
    </oui-select-list-grouped>
  `,
  imports: [SelectListGroupedComponent, SelectButtonsComponent, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDepartmentsComponent
  extends FieldSkeleton
  implements FormValueControl<Department[]>
{
  readonly value = model.required<Department[]>();
  readonly multiple = input(true);

  readonly hideClimateZoneSelector = input(false, {
    transform: booleanAttribute,
  });

  protected readonly climateZones = signal<ClimateZone[]>([]);

  protected readonly departmentForm = form(this.value);
  protected readonly climateZoneForm = form(this.climateZones);

  protected readonly departmentOptions = FRENCH_REGION_DEPARTMENT_GROUPS;
  protected readonly climateZoneOptions = [...CLIMATE_ZONES];

  private readonly syncDepartmentsWithClimateZones = effect(() => {
    const zones = this.climateZones();
    if (zones.length === 0) {
      this.value.set([]);
      return;
    }

    this.value.set(zones.map((zone) => getDepartments(zone)).flat());
  });
}
