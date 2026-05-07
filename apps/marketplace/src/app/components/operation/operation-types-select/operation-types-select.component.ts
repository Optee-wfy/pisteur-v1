import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { OperationHubspotPrestationId } from "@optee/constants";
import type { Location } from "@optee/models";
import { Select } from "primeng/select";
import { OperationService } from "../../../services/operation.service";
import { OperationTagComponent } from "../../operation/operation-tag/operation-tag.component";

@Component({
  selector: "mkp-operation-types-select",
  template: `
    <p-select
      class="w-full"
      id="operation-select"
      appendTo="body"
      emptyFilterMessage="Aucune opération compatible"
      filter
      filterBy="label"
      group
      optionLabel="label"
      optionValue="hsPrestationId"
      panelStyleClass="max-w-lg"
      placeholder="Sélectionnez une opération"
      [(ngModel)]="activeOperation"
      [disabled]="disabled()"
      [filterFields]="['label']"
      [options]="operationsTypes()"
      [showClear]="!hideClearButton()"
    >
      <ng-template #selectedItem let-selectedOption>
        {{ selectedOption.label }}
      </ng-template>
      <ng-template #item let-operation>
        <ng-template #group let-group>
          <mkp-operation-tag [operationType]="group" />
        </ng-template>
        {{ operation.label }}
      </ng-template>
    </p-select>
  `,
  imports: [OperationTagComponent, FormsModule, Select],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationTypesSelectComponent {
  readonly activeOperation =
    model.required<OperationHubspotPrestationId | null>();

  readonly location = input.required<Location | null>();

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly hideClearButton = input(false, { transform: booleanAttribute });

  private readonly operationService = inject(OperationService);

  protected readonly operationsTypes = computed(() => {
    const location = this.location();
    return location
      ? this.operationService.getCompatibleOperationsByLocation(location)
      : [];
  });
}
