import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  signal,
  untracked,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { type FormValueControl } from "@angular/forms/signals";
import { Checkbox } from "primeng/checkbox";
import { InputText } from "primeng/inputtext";
import { Tooltip } from "primeng/tooltip";
import { FieldLayoutComponent } from "./field-layout.component";
import { FieldSkeleton } from "./field-skeleton.directive";
import type { FieldOptions } from "./field.types";
import { formatOptions } from "./functions/format-options.fn";
import { formatSelectedValues } from "./functions/format-selected-values.fn";

type InputValue = string[] | string | null;
type SingleOptionValue = string;

@Component({
  selector: "oui-select-list",
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
      <div class="flex flex-col gap-2">
        @if (!hideSearch()) {
          <input
            class="w-full"
            pInputText
            type="search"
            [(ngModel)]="search"
            [disabled]="disabled()"
            [placeholder]="searchPlaceholder()"
          />
        }

        @if (hasSelectionLimit()) {
          <p class="text-xs text-gray-500">
            Vous pouvez sélectionner jusqu'à {{ maxSelectable() }} options.
          </p>
        }

        @if (!hideSelectAll() && multiple()) {
          <div class="flex items-center gap-2 text-xs">
            <p-checkbox
              (onChange)="toggleAll()"
              [binary]="true"
              [disabled]="
                disabled() ||
                filteredOptions().length === 0 ||
                (isIndeterminate() && !canSelectAll())
              "
              [indeterminate]="isIndeterminate()"
              [inputId]="'select-all'"
              [ngModel]="allSelected()"
            />
            <label class="cursor-pointer" [for]="'select-all'">
              Tout sélectionner
            </label>
          </div>
        }

        <div class="scrollable-shadow-zone !max-h-64 overflow-y-auto">
          @if (filteredOptions().length === 0) {
            <p class="px-4 py-2 text-xs text-gray-500">
              Aucun élément trouvé pour cette recherche.
            </p>
          } @else {
            @for (
              option of filteredOptions();
              track option.value;
              let i = $index
            ) {
              @let optionDisabled = isOptionDisabled(option.value);
              <div
                class="hover:bg-granite-100 text-granite-900 flex items-center rounded-lg p-2 font-medium transition-all"
              >
                <p-checkbox
                  (onChange)="toggleOption(option.value, $event.checked)"
                  [binary]="true"
                  [disabled]="optionDisabled"
                  [inputId]="'option-' + i"
                  [ngModel]="isOptionSelected(option.value)"
                />

                <label
                  class="ml-2 line-clamp-1 w-full"
                  [class.cursor-not-allowed]="optionDisabled"
                  [class.cursor-pointer]="!optionDisabled"
                  [for]="'option-' + i"
                  [pTooltip]="
                    option.label.length > 30 ? option.label : undefined
                  "
                >
                  {{ option.label }}
                </label>
              </div>
            }
          }
        </div>
      </div>
    </oui-field-layout>
  `,
  imports: [FormsModule, Checkbox, Tooltip, InputText, FieldLayoutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectListComponent
  extends FieldSkeleton
  implements FormValueControl<InputValue>
{
  readonly options = input.required<FieldOptions>();
  readonly value = model<InputValue>([]);

  readonly maxSelectable = input<number | undefined>(undefined);
  readonly inputClasses = input<string>("");
  readonly searchPlaceholder = input("Rechercher...");
  readonly hideSearch = input(false, { transform: booleanAttribute });

  readonly hideSelectAll = input(false, { transform: booleanAttribute });
  readonly multiple = input(true, { transform: booleanAttribute });

  protected readonly search = signal("");

  protected readonly formattedOptions = computed(() =>
    formatOptions(this.options()),
  );

  protected readonly filteredOptions = computed(() => {
    const term = this.search().trim().toLowerCase();

    if (!term) {
      return this.formattedOptions();
    }

    return this.formattedOptions().filter((option) => {
      return (
        option.label.toLowerCase().includes(term) ||
        option.value.toLowerCase().includes(term)
      );
    });
  });

  protected readonly hasSelectionLimit = computed(
    () => (this.maxSelectable() ?? 0) > 0,
  );

  protected readonly selectedValues = computed(() => {
    const current = this.value();
    if (Array.isArray(current)) {
      return current;
    }
    return current === null ? [] : [current];
  });

  protected readonly selectedValuesFormatted = computed(() =>
    formatSelectedValues(this.selectedValues(), this.formattedOptions()),
  );

  protected readonly selectedInViewCount = computed(() => {
    const selected = new Set(this.selectedValues());
    let count = 0;
    for (const option of this.filteredOptions()) {
      if (selected.has(option.value)) {
        count += 1;
      }
    }
    return count;
  });

  protected readonly allSelected = computed(() => {
    const total = this.filteredOptions().length;
    return total > 0 && this.selectedInViewCount() === total;
  });

  protected readonly isIndeterminate = computed(() => {
    const total = this.filteredOptions().length;
    const selected = this.selectedInViewCount();
    return selected > 0 && selected < total;
  });

  protected readonly canSelectAll = computed(() => {
    if (!this.multiple() || this.disabled()) {
      return false;
    }
    const options = this.filteredOptions();
    if (options.length === 0) {
      return false;
    }
    const selected = new Set(this.selectedValues());
    let additional = 0;
    for (const option of options) {
      if (!selected.has(option.value)) {
        additional += 1;
      }
    }
    if (additional === 0) {
      return false;
    }
    if (!this.hasSelectionLimit()) {
      return true;
    }
    const limit = this.maxSelectable() ?? 0;
    return selected.size + additional <= limit;
  });

  protected isOptionDisabled(value: SingleOptionValue): boolean {
    return (
      this.disabled() ||
      (this.hasSelectionLimit() &&
        !this.isOptionSelected(value) &&
        this.selectedValues().length >= (this.maxSelectable() ?? 0))
    );
  }

  protected isOptionSelected(value: SingleOptionValue): boolean {
    return this.selectedValues().includes(value);
  }

  protected toggleOption(value: SingleOptionValue, isSelected: boolean): void {
    if (this.disabled()) {
      return;
    }

    if (this.multiple()) {
      const next = new Set(this.selectedValues());
      if (isSelected) {
        next.add(value);
      } else {
        next.delete(value);
      }
      this.value.set(Array.from(next.values()));
      return;
    }

    this.value.set(isSelected ? value : null);
  }

  protected toggleAll(): void {
    if (!this.multiple() || this.disabled()) {
      return;
    }

    if (this.allSelected()) {
      this.clearVisibleSelections();
      return;
    }

    if (this.isIndeterminate() && !this.canSelectAll()) {
      return;
    }

    this.selectAllVisible();
  }

  protected selectAllVisible(): void {
    if (!this.canSelectAll()) {
      return;
    }

    const next = new Set(this.selectedValues());
    for (const option of this.filteredOptions()) {
      next.add(option.value);
    }
    this.value.set(Array.from(next.values()));
  }

  protected clearVisibleSelections(): void {
    if (this.disabled()) {
      return;
    }

    const toRemove = new Set(
      this.filteredOptions().map((option) => option.value),
    );
    const next = this.selectedValues().filter((value) => !toRemove.has(value));
    this.value.set(this.multiple() ? next : (next[0] ?? null));
  }

  private readonly syncValueTypeWithMultipleMode = effect(() => {
    const currentValue = untracked(this.value);
    const isMultiple = this.multiple();
    if (isMultiple && !Array.isArray(currentValue)) {
      this.value.set(currentValue === null ? [] : [currentValue]);
    } else if (!isMultiple && Array.isArray(currentValue)) {
      this.value.set(currentValue[0] ?? null);
    }
  });
}
