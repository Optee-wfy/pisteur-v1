import { CommonModule, CurrencyPipe, PercentPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import type { OperationRow } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { CirclePercentComponent } from "@optee/ui/components/atoms/circle-percent/circle-percent/circle-percent.component";
import { BicolorPillComponent } from "@optee/ui/components/atoms/pill/bicolor-pill/bicolor-pill.component";
import { PermissionService } from "../../../services/permission.service";
import { OperationTagComponent } from "../operation-tag/operation-tag.component";

@Component({
  selector: "mkp-operation-row",
  host: {
    class: "table-row align-middle p-2",
  },
  template: `
    <td class="rounded-l-lg border-l !pr-6">
      <div
        class="relative flex h-20 max-w-xs items-center rounded-lg bg-cover bg-center p-2"
        [style.backgroundImage]="background()"
      >
        <mkp-operation-tag
          class="max-w-[90%]"
          [operationGroup]="operation().phase.category"
          [operationSubType]="operation().typeInfo"
          [operationType]="operation().parentTypeInfo"
        />

        @if (operation().score; as score) {
          <oui-circle-percent
            class="shadow-o2 absolute -right-5 top-2/4 size-10 -translate-y-2/4 bg-white"
            [value]="score"
          />
        }
      </div>
    </td>

    <!-- Cost -->
    <td>
      <div class="flex flex-col">
        @if (operation().cost.value !== null) {
          <span class="text-primary-900 whitespace-nowrap text-sm">
            {{ operation().cost.value | currency: "EUR" : "symbol" : "1.0-0" }}
          </span>
          @if (operation().cost.isEstimated) {
            <div class="subtext">Estimation</div>
          }
        } @else {
          <span class="unavailable">Non disponible</span>
        }
      </div>
    </td>

    <!-- Funding -->
    <td>
      <div class="flex flex-col">
        @if (operation().funding.value !== null) {
          <span class="whitespace-nowrap text-sm text-green-700">
            {{
              operation().funding.value | currency: "EUR" : "symbol" : "1.0-0"
            }}
          </span>
          @if (operation().funding.isEstimated) {
            <div class="subtext">Estimation</div>
          }
        } @else {
          <span class="unavailable">
            @if (operation().funding.isEstimated) {
              Non disponible
            } @else {
              N/A
            }
          </span>
        }
      </div>
    </td>

    <!-- Remaining amount -->
    <td>
      <div class="flex flex-col">
        @if (operation().remainingAmount.value !== null) {
          <span class="text-primary-900 whitespace-nowrap text-sm">
            {{
              operation().remainingAmount.value
                | currency: "EUR" : "symbol" : "1.0-0"
            }}
          </span>
          @if (operation().remainingAmount.isEstimated) {
            <div class="subtext">Estimation</div>
          }
        } @else {
          <span class="unavailable">Non disponible</span>
        }
      </div>
    </td>

    <!-- ROI -->
    <td>
      @if (operation().estimatedEnergyImpact === null) {
        <span class="unavailable">Non disponible</span>
      } @else if (operation().estimatedEnergyImpact === 0) {
        <span class="unavailable">N/A</span>
      } @else {
        <oui-bicolor-pill
          [values]="[
            operation().estimatedEnergyImpact | percent: '1.0-0',
            ((operation().estimatedAnnualSavings
              | currency: 'EUR' : 'symbol' : '1.0-0') ?? 'N/A') + '/an',
            operation().estimatedPaybackPeriodFormatted,
          ]"
        />
      }
    </td>

    <!-- Client -->
    <td>
      @if (operation().client; as client) {
        <span class="text-primary-900 whitespace-nowrap text-sm">
          {{ client.name }}
        </span>
      } @else {
        <span class="unavailable">N/A</span>
      }
    </td>

    <!-- Actions -->
    @if (permissionService.can("DEAL_LAUNCH")) {
      <td class="rounded-r-lg border-r text-right">
        <oui-button size="small" variant="outline">Intégrer</oui-button>
      </td>
    }
  `,
  styles: `
    .unavailable {
      @apply text-sm text-gray-300;
    }

    .subtext {
      @apply text-xs font-normal leading-none tracking-tight text-gray-600;
    }

    td {
      @apply border-b border-t border-gray-100 p-2;
    }
  `,
  imports: [
    CirclePercentComponent,
    BicolorPillComponent,
    CurrencyPipe,
    ButtonComponent,
    PercentPipe,
    CommonModule,
    OperationTagComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationRowComponent {
  operation = input.required<OperationRow>();

  protected readonly permissionService = inject(PermissionService);

  background = computed(() => {
    return `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${this.operation().image})`;
  });
}
