import { CurrencyPipe, DecimalPipe, PercentPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  linkedSignal,
  signal,
} from "@angular/core";
import { CTA } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import {
  IconBoltComponent,
  IconEuroComponent,
  IconEuroLightComponent,
  IconEuroPurseComponent,
  IconLightOperationComponent,
  IconSuccessComponent,
} from "@optee/icons";
import type { OperationRow } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { CirclePercentComponent } from "@optee/ui/components/atoms/circle-percent/circle-percent/circle-percent.component";
import { TimmyComponent } from "@optee/ui/components/molecules/timmy/timmy.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { OperationService } from "../../../services/operation.service";
import { NewOperationByClientComponent } from "../new-operation-by-client/new-operation-by-client.component";

@Component({
  selector: "mkp-operation-card",
  host: {
    class: "rounded-lg bg-white p-2 border border-gray-100 flex flex-col",
  },
  template: `
    <div
      class="relative h-32 rounded-lg bg-cover"
      [style.backgroundImage]="'url(' + operation().image + ')'"
    >
      <div class="bg-gradient-card flex h-full flex-col rounded-lg p-4">
        <div
          class="font-display mt-auto flex items-center gap-4 text-base font-semibold text-white"
        >
          @if (operation().icon; as icon) {
            <icon-light-operation
              class="size-6 shrink-0"
              [operationName]="icon"
            />
          }
          {{ operation().label }}
        </div>
      </div>

      @if (operation().score; as score) {
        <oui-circle-percent
          class="shadow-o2 absolute -bottom-5 right-4 size-10 bg-white"
          [value]="score"
        />
      }
    </div>

    <div class="flex flex-auto flex-col gap-4 p-2">
      <div>
        <div class="font-display text-primary-900 text-sm font-semibold">
          {{ operation().location.shortAddress }}
        </div>
        <div class="text-xs text-gray-600">
          {{ operation().location.zipcode }}
          {{ operation().location.city }}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <oui-timmy class="shadow-o2" label="Coût">
          <icon-euro class="size-4" colorMode="colored" icon />

          @if (operation().cost.value) {
            {{ operation().cost.value | currency: "EUR" : "symbol" : "1.0-0" }}
          } @else {
            --
          }
        </oui-timmy>

        <oui-timmy class="shadow-o2" label="Économies">
          <icon-euro-light class="size-4" colorMode="colored" icon />

          @if (operation().estimatedAnnualSavings) {
            {{
              operation().estimatedAnnualSavings
                | currency: "EUR" : "symbol" : "1.0-0"
            }}/an
          } @else {
            --
          }
        </oui-timmy>

        <oui-timmy class="shadow-o2" label="Subventions">
          <icon-euro-purse class="size-4" colorMode="colored" icon />

          @if (operation().funding.value) {
            {{
              operation().funding.value | currency: "EUR" : "symbol" : "1.0-0"
            }}
          } @else {
            --
          }
        </oui-timmy>

        <oui-timmy class="shadow-o2" label="Impact/ROI">
          <icon-bolt class="size-4" colorMode="colored" icon />

          @if (operation().estimatedEnergyImpact) {
            {{ operation().estimatedEnergyImpact | percent: "1.0-0" }}
            /
            @if (operation().estimatedPaybackPeriod) {
              {{ operation().estimatedPaybackPeriod | number: "1.0-1" }} ans
            } @else {
              <icon-success class="size-4" colorMode="colored" />
            }
          } @else {
            --
          }
        </oui-timmy>
      </div>

      <oui-button
        class="mt-auto"
        full
        size="small"
        variant="outline"
        (click)="openIntegrationDialog()"
        [disabled]="isAlreadyOrdered()"
      >
        {{ isAlreadyOrdered() ? CTA.alreadyAdded : CTA.startThisProject }}
      </oui-button>
    </div>
  `,
  imports: [
    IconLightOperationComponent,
    ButtonComponent,
    CirclePercentComponent,
    TimmyComponent,
    IconBoltComponent,
    IconEuroComponent,
    IconSuccessComponent,
    IconEuroPurseComponent,
    IconEuroLightComponent,
    CurrencyPipe,
    PercentPipe,
    DecimalPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationCardComponent {
  operation = input.required<OperationRow>();

  protected readonly toastService = inject(ToastService);
  protected readonly dialogService = inject(DialogService);
  protected readonly operationService = inject(OperationService);

  isAlreadyOrderedManual = signal(false);

  isAlreadyOrdered = linkedSignal(
    () => this.operation().isAlreadyOrdered || this.isAlreadyOrderedManual(),
  );

  CTA = CTA;

  async openIntegrationDialog() {
    const { res: confirmed } = await this.dialogService.open(
      NewOperationByClientComponent,
      {
        data: {
          operation: this.operation(),
        },
      },
    );

    if (confirmed) {
      this.isAlreadyOrderedManual.set(true);
    }
  }
}
