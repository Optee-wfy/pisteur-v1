import { NgTemplateOutlet } from "@angular/common";
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
import type { FormValueControl } from "@angular/forms/signals";
import { IconChevronRightComponent } from "@optee/icons";
import { CheckboxModule } from "primeng/checkbox";
import { InputTextModule } from "primeng/inputtext";
import { Tooltip } from "primeng/tooltip";
import { ButtonFilterPopoverComponent } from "../button/button-filter-popover/button-filter-popover.component";
import { FieldSkeleton } from "./field-skeleton.directive";

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
  selector: "oui-select-list-grouped",
  host: { class: "flex flex-col gap-3" },
  template: `
    @if (mode() === "field") {
      <label class="text-granite-700 font-medium">{{ label() }}</label>
      <ng-container *ngTemplateOutlet="fieldTemplate" />
    } @else {
      @let hasSelected = value().length > 0;

      <oui-button-filter-popover
        (clear)="value.set([])"
        [disabled]="groups().length === 0"
        [hasSelected]="showClearButton() && hasSelected"
        [isFilterAccessible]="!restrictedAccess()"
        [label]="label()"
        [selectedValue]="selectedValue()"
      >
        <ng-container *ngTemplateOutlet="fieldTemplate" />
      </oui-button-filter-popover>
    }

    <ng-template #fieldTemplate>
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
                      ({{ getSelectionCountForGroup(group.value) }}/
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

      <ng-content select="[footer]" />
    </ng-template>
  `,
  imports: [
    CheckboxModule,
    FormsModule,
    InputTextModule,
    Tooltip,
    IconChevronRightComponent,
    ButtonFilterPopoverComponent,
    NgTemplateOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectListGroupedComponent<
  TValue extends string | number,
  TGroupValue extends string | number = string,
>
  extends FieldSkeleton
  implements FormValueControl<TValue[]>
{
  readonly value = model<TValue[]>([]);
  readonly groups = input<OptionGroupSelectorGroup<TValue, TGroupValue>[]>([]);

  readonly showSearch = input(true);
  readonly searchPlaceholder = input("Rechercher...");
  readonly fullHeight = input(false, { transform: booleanAttribute });

  protected readonly search = signal("");
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
    const groups = this.groups();
    const isInitialRun = !this.hasInitializedGroups();
    const currentCollapsed = untracked(() => this.collapsedGroups());

    const reconciledCollapsed = new Set<TGroupValue>();
    for (const group of groups) {
      if (isInitialRun || currentCollapsed.has(group.value)) {
        reconciledCollapsed.add(group.value);
      }
    }

    this.collapsedGroups.set(reconciledCollapsed);

    if (isInitialRun) {
      this.hasInitializedGroups.set(true);
    }
  });

  protected readonly optionLabelMap = computed(() => {
    const map = new Map<TValue, string>();
    for (const group of this.groups()) {
      for (const option of group.options) {
        map.set(option.value, option.label);
      }
    }
    return map;
  });

  protected readonly selectedValue = computed(() => {
    const labelMap = this.optionLabelMap();
    return this.value()
      .map((value) => labelMap.get(value))
      .filter((label): label is string => label !== undefined)
      .join(", ");
  });

  protected groupHasSelection(groupValue: TGroupValue): boolean {
    return this.groupHasSelectionInValues(
      this.getGroupOptions(groupValue),
      this.value(),
    );
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected isGroupSelected(groupValue: TGroupValue): boolean {
    const options = this.getGroupOptions(groupValue);
    return (
      options.length > 0 &&
      options.every((option) => this.value().includes(option.value))
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
    return this.value().includes(value);
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
      nextValues = this.value().filter((value) => !groupValues.includes(value));
    } else {
      // SELECT ALL
      nextValues = Array.from(new Set([...this.value(), ...groupValues]));
    }

    this.value.set(nextValues);
  }

  protected updateOptionSelection(value: TValue, checked: boolean) {
    if (this.disabled()) {
      return;
    }

    const nextValues = checked
      ? Array.from(new Set([...this.value(), value]))
      : this.value().filter((selectedValue) => selectedValue !== value);

    this.value.set(nextValues);
  }

  protected clearGroup(groupValue: TGroupValue) {
    if (this.disabled()) {
      return;
    }

    const groupOptions = this.getGroupOptions(groupValue);
    const nextValues = this.value().filter(
      (value) => !groupOptions.some((option) => option.value === value),
    );

    this.value.set(nextValues);
    this.collapseGroup(groupValue);
  }

  protected isGroupIndeterminate(groupValue: TGroupValue): boolean {
    const options = this.getGroupOptions(groupValue);
    const selectionCount = this.getSelectionCountForGroup(groupValue);

    return selectionCount > 0 && selectionCount < options.length;
  }

  protected getSelectionCountForGroup(groupValue: TGroupValue): number {
    const options = this.getGroupOptions(groupValue);
    return options.filter((option) => this.value().includes(option.value))
      .length;
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
}
