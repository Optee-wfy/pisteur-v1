import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from "@angular/core";
import type { OperationTypology } from "@optee/constants";
import { TagComponent } from "@optee/ui/components/atoms/tag/tag.component";

@Component({
  selector: "mkp-operation-typology-tag",
  template: `
    <oui-tag variant="neutral" [isActive]="isActive()">
      <!-- <icon-light-operation
        class="size-4 shrink-0"
        [operationName]="operationType().icon"
      /> -->

      <div class="flex-auto truncate">
        {{ typology() }}
      </div>
    </oui-tag>
  `,
  imports: [TagComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationTypologyTagComponent {
  typology = input.required<OperationTypology>();
  isActive = input(false, { transform: booleanAttribute });
}
