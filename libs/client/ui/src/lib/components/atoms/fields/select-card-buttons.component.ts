import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from "@angular/forms";

type SelectCardButtonsOptionValue = boolean | number | string;

export type SelectCardButtonsOption = {
  label: string;
  value: SelectCardButtonsOptionValue;
  color?: string;
  bgColor?: string;
};

type SelectCardButtonsValue =
  | SelectCardButtonsOptionValue[]
  | SelectCardButtonsOptionValue
  | null;
const NOOP = () => undefined;

@Component({
  selector: "oui-select-card-buttons",
  host: { class: "block w-full" },
  template: `
    <div class="flex gap-3">
      @for (option of options(); track option.value) {
        <button
          class="group flex w-full items-center gap-3 rounded-[1.5rem] border bg-white px-2 py-2 text-center transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          (click)="toggleOption(option.value)"
          [attr.aria-label]="ariaLabel() + ' ' + option.label"
          [attr.aria-pressed]="isSelected(option.value)"
          [class.bg-granite-50]="isSelected(option.value)"
          [class.border-black]="isSelected(option.value)"
          [class.border-granite-200]="!isSelected(option.value)"
          [class.shadow-sm]="isSelected(option.value)"
          [disabled]="disabled()"
        >
          <span class="min-w-0 flex-1">
            <span
              class="text-granite-900 block truncate text-base font-semibold transition-colors"
              [class.text-black]="isSelected(option.value)"
            >
              {{ option.label }}
            </span>
          </span>
        </button>
      }
    </div>
  `,
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectCardButtonsComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectCardButtonsComponent implements ControlValueAccessor {
  readonly options = input.required<readonly SelectCardButtonsOption[]>();
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input("Sélectionner");

  protected readonly disabled = signal(false);

  private readonly value = signal<SelectCardButtonsValue>(null);

  private onChange: (value: SelectCardButtonsValue) => void = NOOP;
  private onTouched: () => void = NOOP;

  writeValue(value: SelectCardButtonsValue): void {
    this.value.set(this.normalizeValue(value));
  }

  registerOnChange(fn: (value: SelectCardButtonsValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected isSelected(optionValue: SelectCardButtonsOptionValue): boolean {
    const currentValue = this.value();

    if (Array.isArray(currentValue)) {
      return currentValue.includes(optionValue);
    }

    return currentValue === optionValue;
  }

  protected toggleOption(optionValue: SelectCardButtonsOptionValue): void {
    this.onTouched();

    const nextValue = this.multiple()
      ? this.toggleArrayValue(optionValue)
      : this.value() === optionValue
        ? null
        : optionValue;

    this.value.set(nextValue);
    this.onChange(nextValue);
  }

  private toggleArrayValue(
    optionValue: SelectCardButtonsOptionValue,
  ): SelectCardButtonsOptionValue[] {
    const currentValue = this.value();
    const values = Array.isArray(currentValue)
      ? currentValue
      : currentValue
        ? [currentValue]
        : [];

    return values.includes(optionValue)
      ? values.filter((value) => value !== optionValue)
      : [...values, optionValue];
  }

  private normalizeValue(
    value: SelectCardButtonsValue,
  ): SelectCardButtonsValue {
    if (this.multiple()) {
      if (Array.isArray(value)) {
        return value;
      }

      return value ? [value] : [];
    }

    return Array.isArray(value) ? (value[0] ?? null) : value;
  }
}
