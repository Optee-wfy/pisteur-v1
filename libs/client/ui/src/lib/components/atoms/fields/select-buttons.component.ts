import { NgComponentOutlet } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  untracked,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { FormValueControl } from "@angular/forms/signals";
import { SelectButtonModule } from "primeng/selectbutton";
import { FieldLayoutComponent } from "./field-layout.component";
import { FieldSkeleton } from "./field-skeleton.directive";
import type { FieldOptions } from "./field.types";
import { formatOptions } from "./functions/format-options.fn";
import { formatSelectedValues } from "./functions/format-selected-values.fn";

type FieldValue = string[] | string | null;

@Component({
  selector: "oui-select-buttons",
  host: { class: "flex flex-col gap-1" },
  template: `
    <oui-field-layout
      (clear)="value.set(multiple() ? [] : null)"
      [disabled]="disabled()"
      [formattedValue]="selectedValuesFormatted()"
      [hideClearButton]="!showClearButton()"
      [isFilterAccessible]="!restrictedAccess()"
      [label]="label()"
      [mode]="mode()"
    >
      <p-selectButton
        class="pister-select-button"
        [(ngModel)]="value"
        [ariaLabel]="label()"
        [class]="buttonsVariant() === 'wrap' ? 'wrapped' : 'expanded'"
        [multiple]="multiple()"
        [options]="formattedOptions()"
        [size]="optionsSize()"
      >
        <ng-template #item let-item>
          <span
            class="flex h-full w-full flex-wrap items-center justify-center gap-2 rounded-lg p-2"
            [style.backgroundColor]="item.bgColor || 'inherit'"
            [style.color]="item.color || 'inherit'"
          >
            @if (item.icon) {
              <span [class]="'size-' + iconSize()">
                <ng-container [ngComponentOutlet]="item.icon"></ng-container>
              </span>
            }
            <span>{{ item.label }}</span>
          </span>
        </ng-template>
      </p-selectButton>
    </oui-field-layout>
  `,
  imports: [
    SelectButtonModule,
    FormsModule,
    FieldLayoutComponent,
    NgComponentOutlet,
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectButtonsComponent
  extends FieldSkeleton
  implements FormValueControl<FieldValue>
{
  readonly value = model<FieldValue>(null);
  readonly options = input.required<FieldOptions>();
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly buttonsVariant = input<"default" | "wrap">();
  readonly iconSize = input<number>(6);
  readonly optionsSize = input<"small" | "large" | undefined>(undefined);

  protected readonly formattedOptions = computed(() =>
    formatOptions(this.options()),
  );

  protected readonly selectedValuesFormatted = computed(() =>
    formatSelectedValues(this.value(), this.formattedOptions()),
  );

  private readonly syncValueTypeWithMultipleMode = effect(() => {
    const currentValue = untracked(this.value);
    const isMultiple = this.multiple();
    if (isMultiple && !Array.isArray(currentValue)) {
      this.value.set([]);
    } else if (!isMultiple && Array.isArray(currentValue)) {
      this.value.set(null);
    }
  });
}
