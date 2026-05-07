import { CurrencyPipe, PercentPipe } from "@angular/common";
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
} from "@angular/core";

import { RouterModule } from "@angular/router";
import {
    IconChevronRightComponent,
    IconEyeComponent,
    IconEyeSlashComponent,
    IconTrendDownComponent,
} from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";

export interface WhyOperationReason {
  title: string;
  description: string;
}

interface Cost {
  withoutOptee: number;
  withOptee: number;
  ceeAmount: number;
  energySavings: number;
}

@Component({
  selector: "swc-why-operation",
  host: {
    class:
      "px-6 py-12 xl:px-12 xl:py-24 bg-primary-900 justify-center gap-10 xl:gap-20 items-center inline-flex flex-wrap w-full relative overflow-hidden text-primary-900 min-h-[700px]",
  },
  template: `
    <div class="relative z-10 flex flex-wrap justify-center gap-6">
      <!-- Cost comparison card -->
      <div
        class="shadow-o inline-flex w-full flex-col items-start justify-start gap-6 rounded-2xl bg-white px-7 py-5 md:w-auto"
      >
        <div>
          <div class="flex items-center gap-3 py-2">
            <icon-eye-slash class="text-primary-700 size-5" />
            <span class="text-sm font-medium text-gray-900">Sans Optee</span>
          </div>
          <div class="text-xs font-light italic text-gray-900">
            Coût du projet
          </div>
          <div class="py-4 text-3xl font-bold text-gray-900">
            {{ costs().withoutOptee | currency: "EUR" : "symbol" : "1.0-0" }}
          </div>
        </div>
        <hr class="w-full" />
        <div>
          <div class="flex items-center gap-3 py-2">
            <icon-eye class="text-primary-700 size-5" />
            <span class="text-sm font-medium text-gray-900">Avec Optee</span>
          </div>
          <div class="text-xs font-light italic text-gray-900">
            Coût du projet
          </div>
          <div class="py-4 text-3xl font-bold text-gray-900">
            {{ costs().withOptee | currency: "EUR" : "symbol" : "1.0-0" }}
          </div>
          <div
            class="inline-flex items-center justify-start gap-1 rounded-[56px] bg-green-50 px-4 py-1"
          >
            <icon-trend-down class="size-4 text-green-600" />
            <div
              class="font-display text-center text-[10px] font-normal text-green-600"
            >
              {{ costReduction() | percent }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="relative z-10 flex flex-col gap-6 text-white xl:gap-12">
      <h3 class="max-w-xl text-pretty text-xl font-semibold xl:text-3xl">
        {{ questionTitle() }}
      </h3>
      <div class="max-w-lg">
        @for (reason of reasons(); track reason.title; let i = $index) {
          <div
            class="flex w-full cursor-pointer flex-col gap-4 border-b border-white py-4"
            (click)="updateVisibleIndex(i)"
          >
            <div class="flex items-center justify-between">
              <h4 class="text-lg font-medium">
                {{ reason.title }}
              </h4>
              <icon-chevron-right
                class="inline-block size-6 origin-center rotate-90 transition-transform duration-200"
                [class.rotate-0]="i === visibleIndex"
              />
            </div>
            @if (i === visibleIndex) {
              <p class="text-sm">
                {{ reason.description }}
              </p>
            }
          </div>
        }
      </div>
      <oui-button href="/demo">Parler à un expert</oui-button>
    </div>

    <oui-circle
      class="-bottom-[530px] -right-[530px] w-[1130px]"
      theme="dark"
    />
  `,
  imports: [
    CurrencyPipe,
    PercentPipe,
    ButtonComponent,
    IconEyeComponent,
    IconEyeSlashComponent,
    CircleComponent,
    IconChevronRightComponent,
    RouterModule,
    IconTrendDownComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhyOperationComponent {
  questionTitle = input.required<string>();
  reasons = input.required<WhyOperationReason[]>();
  costs = input.required<Cost>();

  visibleIndex = 0;

  updateVisibleIndex(index: number): void {
    this.visibleIndex = this.visibleIndex === index ? -1 : index;
  }

  costReduction = computed(() => {
    return (
      (this.costs().withoutOptee - this.costs().withOptee) /
      this.costs().withoutOptee
    );
  });
}
