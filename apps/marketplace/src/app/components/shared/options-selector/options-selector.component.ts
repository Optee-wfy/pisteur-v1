import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from "@angular/core";
import type { ControlValueAccessor } from "@angular/forms";
import { FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { CheckboxModule } from "primeng/checkbox";
import { InputTextModule } from "primeng/inputtext";
import { Tooltip } from "primeng/tooltip";

export type OptionSelectorOption<TValue> = {
  label: string;
  value: TValue;
};

@Component({
  selector: "mkp-options-selector",
  host: { class: "flex flex-col gap-3" },
  template: `
    @if (showSearch()) {
      <input
        class="w-full"
        pInputText
        type="search"
        [(ngModel)]="search"
        [placeholder]="searchPlaceholder()"
      />
    }

    @if (hasSelectionLimit()) {
      <p class="text-xs text-gray-500">
        Vous pouvez sélectionner jusqu'à {{ maxSelectable() }} options.
      </p>
    }

    <div class="scrollable-shadow-zone !max-h-64 overflow-y-auto">
      @if (filteredOptions().length === 0) {
        <p class="text-xs text-gray-500">
          Aucun élément trouvé pour cette recherche.
        </p>
      } @else {
        @for (option of filteredOptions(); track option.value; let i = $index) {
          <div
            class="hover:bg-granite-100 text-granite-900 flex items-center rounded-lg p-2 font-medium transition-all"
          >
            <p-checkbox
              (onChange)="toggleOption(option.value, $event.checked)"
              [binary]="true"
              [disabled]="isOptionDisabled(option.value)"
              [inputId]="'option-' + i"
              [ngModel]="isOptionSelected(option.value)"
            />
            <label
              class="ml-2 line-clamp-1 w-full"
              [class.cursor-not-allowed]="isOptionDisabled(option.value)"
              [class.cursor-pointer]="!isOptionDisabled(option.value)"
              [for]="'option-' + i"
              [pTooltip]="option.label.length > 30 ? option.label : undefined"
            >
              {{ option.label }}
            </label>
          </div>
        }
      }
    </div>
  `,
  imports: [CheckboxModule, FormsModule, InputTextModule, Tooltip],
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OptionsSelectorComponent),
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsSelectorComponent<
  TValue extends string | number,
> implements ControlValueAccessor {
  readonly options = input<OptionSelectorOption<TValue>[]>([]);
  readonly showSearch = input(true);
  readonly searchPlaceholder = input("Rechercher...");
  readonly maxSelectable = input(0);

  protected readonly search = signal("");
  protected readonly selectedValues = signal<TValue[]>([]);
  protected readonly disabled = signal(false);

  protected readonly filteredOptions = computed(() => {
    const term = this.search().trim().toLowerCase();

    if (!term) {
      return this.options();
    }

    return this.options().filter((option) => {
      return (
        option.label.toLowerCase().includes(term) ||
        String(option.value).toLowerCase().includes(term)
      );
    });
  });

  protected readonly hasSelectionLimit = computed(
    () => this.maxSelectable() > 0,
  );

  protected isOptionDisabled(value: TValue): boolean {
    return (
      this.disabled() ||
      (this.hasSelectionLimit() &&
        !this.isOptionSelected(value) &&
        this.selectedValues().length >= this.maxSelectable())
    );
  }

  writeValue(value: TValue[] | null): void {
    this.selectedValues.set(value ?? []);
  }

  registerOnChange(fn: (value: TValue[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected isOptionSelected(value: TValue): boolean {
    return this.selectedValues().includes(value);
  }

  protected toggleOption(value: TValue, isSelected: boolean): void {
    if (this.disabled()) {
      return;
    }

    const next = new Set(this.selectedValues());
    if (isSelected) {
      next.add(value);
    } else {
      next.delete(value);
    }
    const nextValues = Array.from(next.values());
    this.selectedValues.set(nextValues);
    this.onChange(nextValues);
    this.onTouched();
  }

  private onChange: (value: TValue[]) => void = () => {
    // Callback set by registerOnChange
  };

  private onTouched: () => void = () => {
    // Callback set by registerOnTouched
  };
}
