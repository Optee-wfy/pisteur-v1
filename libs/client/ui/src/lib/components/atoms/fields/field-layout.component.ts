import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { ButtonFilterPopoverComponent } from "../button/button-filter-popover/button-filter-popover.component";
import type { FieldMode } from "./field.types";

@Component({
  selector: "oui-field-layout",
  host: { class: "flex flex-col gap-1" },
  template: `
    @if (mode() === "field") {
      @if (label(); as fieldLabel) {
        <label class="text-granite-700 font-medium">{{ fieldLabel }}</label>
      }
      <ng-container *ngTemplateOutlet="fieldTemplate" />
    } @else {
      @let hasSelected = formattedValue().length > 0;
      <oui-button-filter-popover
        (clear)="clear.emit()"
        [disabled]="disabled()"
        [hasSelected]="!hideClearButton() && hasSelected"
        [isFilterAccessible]="isFilterAccessible()"
        [label]="label()"
        [selectedValue]="formattedValue()"
      >
        <ng-container *ngTemplateOutlet="fieldTemplate" />
      </oui-button-filter-popover>
    }

    <ng-template #fieldTemplate><ng-content /></ng-template>
  `,
  imports: [ButtonFilterPopoverComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldLayoutComponent {
  readonly label = input<string | undefined>(undefined);
  readonly mode = input<FieldMode>("field");

  readonly isFilterAccessible = input<boolean>(false);
  readonly formattedValue = input<string>("");
  readonly hideClearButton = input(false);
  readonly disabled = input(false);

  readonly clear = output<void>();
}
