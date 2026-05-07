import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import {
  type OperationHubspotCategory,
  OPERATION_OPTIONS,
} from "@optee/constants";
import { IconLightOperationComponent } from "@optee/icons";
import type { OperationRow } from "@optee/models";

@Component({
  selector: "oui-operations-filter",
  host: {
    class:
      "border-granite-100 flex justify-between gap-2 border-b border-solid overflow-auto",
    role: "tablist",
  },
  template: `
    @for (
      operationsOption of operationsOptions();
      track operationsOption.label
    ) {
      <div
        class="relative mt-3 flex w-[85px] shrink-0 cursor-pointer flex-col items-center justify-center gap-2 border-b-2 border-solid"
        role="tab"
        tabindex="0"
        (click)="selectOperationTypes(operationsOption.hsCategories)"
        (keydown.enter)="selectOperationTypes(operationsOption.hsCategories)"
        (keydown.space)="
          selectOperationTypes(operationsOption.hsCategories);
          $event.preventDefault()
        "
        [attr.aria-label]="operationsOption.label"
        [attr.aria-selected]="
          arraysEqual(operationsOption.hsCategories, activeOperationTypes())
        "
        [class.border-amber-600]="
          mode() === 'leads' && isSelected(operationsOption.hsCategories)
        "
        [class.border-current]="
          mode() === 'client' && isSelected(operationsOption.hsCategories)
        "
        [class.border-transparent]="
          mode() === 'client' && !isSelected(operationsOption.hsCategories)
        "
        [class.border-transparent]="
          mode() === 'leads' && !isSelected(operationsOption.hsCategories)
        "
        [class.text-amber-600]="
          mode() === 'leads' && isSelected(operationsOption.hsCategories)
        "
        [class.text-granite-500]="
          mode() === 'client' && !isSelected(operationsOption.hsCategories)
        "
        [class.text-granite-500]="
          mode() === 'leads' && !isSelected(operationsOption.hsCategories)
        "
        [class.text-primary-700]="
          mode() === 'client' && isSelected(operationsOption.hsCategories)
        "
      >
        <icon-light-operation
          class="block size-6 shrink-0"
          [class.text-amber-600]="
            mode() === 'leads' && isSelected(operationsOption.hsCategories)
          "
          [operationName]="operationsOption.icon"
        />
        @if (operationsOption.count !== undefined && !hideCount()) {
          <span
            class="absolute -top-3 right-1 mb-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[0.60rem] text-white"
          >
            {{ operationsOption.count }}
          </span>
        }
        <div
          class="font-display w-full select-none truncate text-center text-xs"
        >
          {{ operationsOption.label }}
        </div>
      </div>
    }
  `,
  imports: [ReactiveFormsModule, IconLightOperationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsFilterComponent {
  readonly activeOperationTypes = model<OperationHubspotCategory[] | null>(
    null,
  );

  readonly mode = input<"client" | "leads">("client");
  readonly hideAllOption = input(false, { transform: booleanAttribute });
  readonly hideCount = input(false, { transform: booleanAttribute });
  readonly operations = input<OperationRow[]>([]);

  protected readonly operationsOptions = computed(() => {
    const operations = this.operations() ?? [];

    const countFor = (categories: OperationHubspotCategory[] | null) => {
      if (!categories) {
        return operations.length;
      }

      return operations.filter(
        (op) => op.category !== null && categories.includes(op.category),
      ).length;
    };

    const baseOptions = OPERATION_OPTIONS.map((option) => ({
      ...option,
      count: countFor(option.hsCategories),
    }));

    if (this.hideAllOption()) {
      return baseOptions;
    }

    return [
      {
        label: "Toutes",
        hsCategories: null,
        icon: null,
        count: countFor(null),
      },
      ...baseOptions,
    ];
  });

  protected selectOperationTypes(
    operationHsCategories: OperationHubspotCategory[] | null,
  ) {
    const activeOperationTypes = this.activeOperationTypes();

    if (!operationHsCategories) {
      this.activeOperationTypes.set(null);
      return;
    }

    if (
      activeOperationTypes &&
      this.arraysEqual(activeOperationTypes, operationHsCategories)
    ) {
      this.activeOperationTypes.set(null);
      return;
    }

    this.activeOperationTypes.set(operationHsCategories);
  }

  protected isSelected(
    operationHsCategories: OperationHubspotCategory[] | null,
  ) {
    return this.arraysEqual(operationHsCategories, this.activeOperationTypes());
  }

  protected arraysEqual(a: unknown[] | null, b: unknown[] | null): boolean {
    if (a === null && b === null) {
      return true;
    }

    return !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]);
  }
}
