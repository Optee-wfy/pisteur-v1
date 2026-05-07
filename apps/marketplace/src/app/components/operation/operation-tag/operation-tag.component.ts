import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type {
  OperationGroupKey,
  OperationSubTypeInfo,
  OperationTypeInfo,
} from "@optee/constants";
import { OperationType } from "@optee/constants";
import { IconLightOperationComponent } from "@optee/icons";
import { TagComponent } from "@optee/ui/components/atoms/tag/tag.component";
import { IconOperationFundingComponent } from "../icon-operation-funding/icon-operation-funding.component";

@Component({
  selector: "mkp-operation-tag",
  template: `
    <oui-tag [isActive]="isActive()" [variant]="variant()">
      @if (operationTypeCategory() === OperationType.FUNDING) {
        <mkp-icon-operation-funding class="size-4 shrink-0" />
      } @else {
        <icon-light-operation
          class="size-4 shrink-0"
          [operationName]="operationType().icon"
        />
      }

      <div class="flex-auto truncate">
        @if (operationTypeCategory() === OperationType.FUNDING) {
          Financement -
        }
        {{ label() }}
      </div>
    </oui-tag>
  `,
  imports: [
    TagComponent,
    IconLightOperationComponent,
    IconOperationFundingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationTagComponent {
  operationType = input.required<OperationTypeInfo>();
  operationSubType = input<OperationSubTypeInfo>();
  operationGroup = input<OperationGroupKey | null>();
  isActive = input(false, { transform: booleanAttribute });
  operationTypeCategory = input<OperationType>();
  styleMode = input<"default" | "leads">("default");

  OperationType = OperationType;

  label = computed(() => {
    return this.operationSubType()?.label ?? this.operationType().label;
  });

  variant = computed(() => {
    if (this.styleMode() === "leads") {
      return "amber-light";
    }

    if (
      this.operationTypeCategory() === OperationType.FUNDING ||
      this.operationTypeCategory() === OperationType.CONTRACT
    ) {
      return "neutral";
    }
    return "primary";
  });
}
