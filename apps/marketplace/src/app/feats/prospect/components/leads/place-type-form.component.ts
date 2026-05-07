import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { FormField, type FieldTree } from "@angular/forms/signals";
import type { LeadGeneratorForm } from "@optee/constants";
import { CheckboxComponent } from "@optee/ui/components/atoms/fields/checkbox.component";

import { IconPersonComponent, IconUsersComponent } from "@optee/icons";
import { BUILDING_USAGE_WITH_ICONS } from "../places/place.constant";

@Component({
  selector: "mkp-place-type-form",
  template: `
    <form class="flex flex-col gap-8">
      <oui-checkbox
        [formField]="form().buildingUsage"
        [options]="buildingUsageOptions"
      />
    </form>
  `,
  imports: [CheckboxComponent, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceTypeFormComponent {
  readonly form = input.required<FieldTree<LeadGeneratorForm["placeForm"]>>();

  protected readonly buildingUsageOptions = BUILDING_USAGE_WITH_ICONS;

  protected readonly buildingOwnershipOptions = [
    {
      label: "mono-occupant",
      value: "single",
      icon: IconPersonComponent,
    },
    {
      label: "multi-occupant",
      value: "multiple",
      icon: IconUsersComponent,
    },
  ];
}
