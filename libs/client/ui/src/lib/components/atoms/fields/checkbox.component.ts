import { NgComponentOutlet } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  type Signal,
  type Type,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { FormValueControl } from "@angular/forms/signals";
import { Checkbox } from "primeng/checkbox";
import type { FieldOptions } from "./field.types";
import { formatOptions } from "./functions/format-options.fn";

let nextOuiCheckboxId = 0;
type CheckboxValue = boolean | string[] | string | null;
type FormattedCheckboxOption = {
  label: string;
  value: string;
  icon?: Type<unknown>;
  description?: string;
  color?: string;
  bgColor?: string;
};

@Component({
  selector: "oui-checkbox",
  host: { class: "block w-full" },
  template: `
    @if (formattedOptions().length) {
      <div class="oui-checkbox-options-grid">
        @for (
          option of formattedOptions();
          track option.value;
          let i = $index
        ) {
          <label
            class="oui-checkbox-option relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border px-3 py-3 text-center transition-all duration-200"
            [class.cursor-not-allowed]="disabled()"
            [class.opacity-60]="disabled()"
            [class.oui-checkbox-option-selected]="
              isOptionSelected(option.value)
            "
            [for]="getOptionId(i)"
            [style.--oui-checkbox-option-bg]="option.bgColor || '#eff6ff'"
            [style.--oui-checkbox-option-color]="option.color || '#2563eb'"
          >
            <p-checkbox
              class="oui-checkbox-control oui-checkbox-control-hidden"
              (onChange)="toggleOption(option.value, !!$event.checked)"
              [binary]="true"
              [disabled]="disabled()"
              [inputId]="getOptionId(i)"
              [ngModel]="isOptionSelected(option.value)"
            />
            @if (option.icon) {
              <span
                class="oui-checkbox-option-icon flex items-center justify-center rounded-full"
              >
                <ng-container [ngComponentOutlet]="option.icon"></ng-container>
              </span>
            }
            <span class="flex flex-col gap-0.5">
              <span
                class="oui-checkbox-option-title text-lg font-semibold leading-none tracking-tight"
              >
                {{ option.label }}
              </span>
              @if (option.description) {
                <span
                  class="oui-checkbox-option-description text-sm font-medium"
                >
                  {{ option.description }}
                </span>
              }
            </span>
          </label>
        }
      </div>
    } @else {
      <label
        class="flex cursor-pointer items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-4 transition-colors"
        [class.cursor-not-allowed]="disabled()"
        [class.opacity-60]="disabled()"
        [for]="inputId"
      >
        <p-checkbox
          class="oui-checkbox-control"
          (ngModelChange)="value.set($event)"
          [binary]="true"
          [disabled]="disabled()"
          [inputId]="inputId"
          [ngModel]="singleBooleanValue()"
        />
        <span class="text-granite-900 text-sm font-medium">
          {{ label() }}
        </span>
      </label>
    }
  `,
  imports: [Checkbox, FormsModule, NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent implements FormValueControl<CheckboxValue> {
  readonly label = input<string>("");
  readonly value = model<CheckboxValue>(false);
  readonly options = input<FieldOptions>([]);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly multiple = input(true, { transform: booleanAttribute });

  protected readonly inputId = `oui-checkbox-${nextOuiCheckboxId++}`;
  protected readonly formattedOptions: Signal<FormattedCheckboxOption[]> =
    computed(() => formatOptions(this.options()) as FormattedCheckboxOption[]);

  protected readonly singleBooleanValue = computed(() => {
    const current = this.value();
    return typeof current === "boolean" ? current : false;
  });

  protected getOptionId(index: number): string {
    return `${this.inputId}-option-${index}`;
  }

  protected isOptionSelected(optionValue: string): boolean {
    const current = this.value();
    return Array.isArray(current)
      ? current.includes(optionValue)
      : current === optionValue;
  }

  protected toggleOption(optionValue: string, checked: boolean): void {
    if (this.disabled()) {
      return;
    }

    if (!this.multiple()) {
      this.value.set(checked ? optionValue : null);
      return;
    }

    const current = this.value();
    const next = new Set(Array.isArray(current) ? current : []);

    if (checked) {
      next.add(optionValue);
    } else {
      next.delete(optionValue);
    }

    this.value.set(Array.from(next));
  }

  private readonly syncValueShape = effect(() => {
    const hasOptions = this.formattedOptions().length > 0;
    const current = this.value();

    if (hasOptions) {
      if (this.multiple() && !Array.isArray(current)) {
        this.value.set([]);
      } else if (!this.multiple() && Array.isArray(current)) {
        this.value.set(null);
      }
    } else if (!hasOptions && Array.isArray(current)) {
      this.value.set(false);
    }
  });
}
