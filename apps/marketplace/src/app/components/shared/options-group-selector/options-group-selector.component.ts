import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  signal,
} from "@angular/core";
import type { ControlValueAccessor } from "@angular/forms";
import { FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconChevronRightComponent } from "@optee/icons";
import { CheckboxModule } from "primeng/checkbox";
import { InputTextModule } from "primeng/inputtext";
import { Tooltip } from "primeng/tooltip";

export type OptionGroupSelectorOption<TValue> = {
  label: string;
  value: TValue;
};

export type OptionGroupSelectorGroup<TValue, TGroupValue = string> = {
  label: string;
  value: TGroupValue;
  options: OptionGroupSelectorOption<TValue>[];
};

@Component({
  selector: "mkp-options-group-selector",
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

    <div
      class="scrollable-shadow-zone overflow-y-auto"
      [class.!max-h-64]="!fullHeight()"
    >
      @if (filteredGroups().length === 0) {
        <p class="px-2 py-1 text-xs text-gray-600">
          Aucun élément trouvé pour cette recherche.
        </p>
      } @else {
        @for (group of filteredGroups(); track group.value) {
          <div class="flex flex-col pb-3">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <p-checkbox
                  (onChange)="toggleGroup(group.value, $event.checked)"
                  [binary]="true"
                  [disabled]="disabled()"
                  [indeterminate]="isGroupIndeterminate(group.value)"
                  [inputId]="'group-' + group.value"
                  [ngModel]="isGroupSelected(group.value)"
                />
                <button
                  class="text-granite-900 flex cursor-pointer items-center gap-1 whitespace-nowrap font-medium"
                  type="button"
                  (click)="toggleGroupVisibility(group.value)"
                >
                  {{ group.label }}

                  <span class="text-granite-500 ml-1 text-xs font-normal">
                    ({{ getGroupSelectionCount(group.value) }}/
                    {{ getGroupOptions(group.value).length }})
                  </span>
                </button>
              </div>
              <div class="flex items-center gap-2">
                @if (groupHasSelection(group.value) && !disabled()) {
                  <button
                    class="text-primary-600 text-[11px] underline"
                    type="button"
                    (click)="clearGroup(group.value)"
                  >
                    Tout effacer
                  </button>
                }
                <button
                  class="text-granite-700 hover:text-granite-900 mr-2 flex h-6 w-6 items-center justify-center rounded transition-colors"
                  type="button"
                  (click)="toggleGroupVisibility(group.value)"
                  [attr.aria-controls]="'group-options-' + group.value"
                  [attr.aria-expanded]="isGroupExpanded(group.value)"
                >
                  <icon-chevron-right
                    class="size-4 transition-transform"
                    [class.-rotate-90]="!isGroupExpanded(group.value)"
                    [class.rotate-90]="isGroupExpanded(group.value)"
                  />
                </button>
              </div>
            </div>

            @if (isGroupExpanded(group.value)) {
              <div [attr.id]="'group-options-' + group.value">
                @for (option of group.options; track option.value) {
                  <div
                    class="hover:bg-granite-100 ml-5 flex items-center rounded-lg p-2 text-sm font-medium text-gray-600 transition-all"
                  >
                    <p-checkbox
                      (onChange)="
                        updateOptionSelection(option.value, $event.checked)
                      "
                      [binary]="true"
                      [disabled]="disabled()"
                      [inputId]="group.value + '-' + option.value"
                      [ngModel]="isOptionSelected(option.value)"
                    />
                    <label
                      class="ml-2 line-clamp-1 w-full cursor-pointer"
                      [for]="group.value + '-' + option.value"
                      [pTooltip]="
                        option.label.length > 30 ? option.label : undefined
                      "
                    >
                      {{ option.label }}
                    </label>
                  </div>
                }
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  imports: [
    CheckboxModule,
    FormsModule,
    InputTextModule,
    Tooltip,
    IconChevronRightComponent,
  ],
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OptionsGroupSelectorComponent),
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsGroupSelectorComponent<
  TValue extends string | number,
  TGroupValue extends string | number = string,
> implements ControlValueAccessor {
  readonly groups = input<OptionGroupSelectorGroup<TValue, TGroupValue>[]>([]);
  readonly showSearch = input(true);
  readonly searchPlaceholder = input("Rechercher...");
  readonly fullHeight = input(false, { transform: booleanAttribute });

  protected readonly search = signal("");
  protected readonly selectedValues = signal<TValue[]>([]);
  protected readonly disabled = signal(false);
  protected readonly collapsedGroups = signal<Set<TGroupValue>>(new Set());
  private readonly hasInitializedGroups = signal(false);

  protected readonly filteredGroups = computed(() => {
    const term = this.search().trim().toLowerCase();

    if (!term) {
      return this.groups();
    }

    return this.groups()
      .map((group) => ({
        ...group,
        options: group.options.filter((option) => {
          return (
            option.label.toLowerCase().includes(term) ||
            String(option.value).toLowerCase().includes(term) ||
            group.label.toLowerCase().includes(term)
          );
        }),
      }))
      .filter((group) => group.options.length > 0);
  });

  private readonly initCollapsedGroups = effect(() => {
    if (this.hasInitializedGroups()) {
      return;
    }
    const groups = this.groups();
    if (groups.length === 0) {
      return;
    }
    this.collapsedGroups.set(new Set(groups.map((group) => group.value)));
    this.hasInitializedGroups.set(true);
  });

  protected groupHasSelection(groupValue: TGroupValue): boolean {
    return this.groupHasSelectionInValues(
      this.getGroupOptions(groupValue),
      this.selectedValues(),
    );
  }

  protected getGroupSelectionCount(groupValue: TGroupValue): number {
    return this.getSelectionCountForGroup(groupValue);
  }

  writeValue(value: TValue[] | null): void {
    const next = value ?? [];
    this.selectedValues.set(next);
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

  protected isGroupSelected(groupValue: TGroupValue): boolean {
    const options = this.getGroupOptions(groupValue);
    return (
      options.length > 0 &&
      options.every((option) => this.selectedValues().includes(option.value))
    );
  }

  protected getGroupOptions(
    groupValue: TGroupValue,
  ): OptionGroupSelectorOption<TValue>[] {
    return (
      this.groups().find((group) => group.value === groupValue)?.options ?? []
    );
  }

  protected isOptionSelected(value: TValue): boolean {
    return this.selectedValues().includes(value);
  }

  protected isGroupExpanded(groupValue: TGroupValue): boolean {
    return !this.collapsedGroups().has(groupValue);
  }

  protected toggleGroupVisibility(groupValue: TGroupValue) {
    this.collapsedGroups.update((current) => {
      const next = new Set(current);
      if (next.has(groupValue)) {
        next.delete(groupValue);
      } else {
        next.add(groupValue);
      }
      return next;
    });
  }

  protected toggleGroup(groupValue: TGroupValue, checked: boolean) {
    if (this.disabled()) {
      return;
    }

    const groupOptions = this.getGroupOptions(groupValue);
    const groupValues = groupOptions.map((o) => o.value);

    let nextValues: TValue[];
    if (!checked) {
      // CLEAR ALL (even if partially selected)
      nextValues = this.selectedValues().filter(
        (value) => !groupValues.includes(value),
      );
    } else {
      // SELECT ALL
      nextValues = Array.from(
        new Set([...this.selectedValues(), ...groupValues]),
      );
    }

    this.selectedValues.set(nextValues);
    this.emitValue(nextValues);
  }

  protected updateOptionSelection(value: TValue, checked: boolean) {
    if (this.disabled()) {
      return;
    }

    const nextValues = checked
      ? Array.from(new Set([...this.selectedValues(), value]))
      : this.selectedValues().filter(
          (selectedValue) => selectedValue !== value,
        );

    this.selectedValues.set(nextValues);

    this.emitValue(nextValues);
  }

  protected clearGroup(groupValue: TGroupValue) {
    if (this.disabled()) {
      return;
    }

    const groupOptions = this.getGroupOptions(groupValue);
    const nextValues = this.selectedValues().filter(
      (value) => !groupOptions.some((option) => option.value === value),
    );

    this.selectedValues.set(nextValues);
    this.emitValue(nextValues);

    this.collapseGroup(groupValue);
  }

  protected isGroupIndeterminate(groupValue: TGroupValue): boolean {
    const options = this.getGroupOptions(groupValue);
    const selectionCount = this.getSelectionCountForGroup(groupValue);

    return selectionCount > 0 && selectionCount < options.length;
  }

  private getSelectionCountForGroup(groupValue: TGroupValue): number {
    const options = this.getGroupOptions(groupValue);
    return options.filter((option) =>
      this.selectedValues().includes(option.value),
    ).length;
  }

  private emitValue(nextValues: TValue[]) {
    this.onChange(nextValues);
    this.onTouched();
  }

  private collapseGroup(groupValue: TGroupValue) {
    this.collapsedGroups.update((current) => {
      if (current.has(groupValue)) {
        return current;
      }
      const next = new Set(current);
      next.add(groupValue);
      return next;
    });
  }

  // Here we want to know if at least one option in the group is selected
  private groupHasSelectionInValues(
    options: OptionGroupSelectorOption<TValue>[],
    values: TValue[],
  ): boolean {
    return options.some((option) => values.includes(option.value));
  }

  private onChange: (value: TValue[]) => void = () => {
    // Callback set by registerOnChange
  };

  private onTouched: () => void = () => {
    // Callback set by registerOnTouched
  };
}
