import {
  ChangeDetectionStrategy,
  Component,
  computed,
  model,
} from "@angular/core";
import type { OperationHubspotCategory } from "@optee/constants";
import { buildAssetUrl, OPERATION_OPTIONS } from "@optee/constants";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { OperationsFilterComponent } from "@optee/ui/components/organisms/operations-filter/operations-filter.component";

@Component({
  selector: "swc-operations-info",
  host: {
    class: "flex flex-col gap-4 lg:gap-6",
  },
  template: `
    <oui-operations-filter
      hideAllOption
      hideCount
      [(activeOperationTypes)]="activeOperationTypes"
    />

    @if (activeOperation(); as activeOperation) {
      <oui-eve>
        <img
          class="float-end hidden md:block lg:w-[200px]"
          alt=""
          [src]="buildAssetUrl(activeOperation.publicAssetPath)"
        />

        <div class="mb-4 text-2xl font-semibold">
          {{ activeOperation.labelLong }}
        </div>
        <div class="max-w-[700px] text-sm text-gray-600">
          <p>
            {{ activeOperation.description }}
          </p>

          <div class="mt-2">Opérations disponibles :</div>
          <ul class="list-disc pl-6">
            @for (operation of activeOperation.operations; track $index) {
              <li>{{ operation }}</li>
            }
          </ul>
        </div>
      </oui-eve>
    }
  `,
  imports: [EveComponent, OperationsFilterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsInfoComponent {
  activeOperationTypes = model<OperationHubspotCategory[]>([
    "Rénovation globale",
  ]);

  buildAssetUrl = buildAssetUrl;

  activeOperation = computed(() => {
    const activeOperationTypes = this.activeOperationTypes();

    if (!activeOperationTypes) {
      return null;
    }

    const activeOperation = OPERATION_OPTIONS.find((operation) =>
      activeOperationTypes.some((type) =>
        operation.hsCategories.includes(type),
      ),
    );

    if (!activeOperation) {
      console.warn(
        `No operation found for activeOperationTypes: ${activeOperationTypes.join(
          ", ",
        )}`,
      );
      return OPERATION_OPTIONS[0]; // Default to the first operation as fallback
    }

    return activeOperation;
  });
}
