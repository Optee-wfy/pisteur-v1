import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import type { ProPlan, ProSubscription } from "@optee/constants";

@Component({
  selector: "mkp-pro-subscription-card",
  host: {
    class: "border-granite-200 flex flex-col gap-4 rounded-lg border p-4",
    "[class.border-green-600]": "highlighted()",
  },
  template: `
    @let sub = subscription();
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h3 class="whitespace-nowrap text-lg font-semibold">{{ sub.name }}</h3>
        <h4 class="text-granite-400 text-xs italic">
          <strong>{{ sub.credits }}</strong>
          crédits par mois
        </h4>
        @if (renewalDate(); as renewalDate) {
          <p class="text-granite-400 text-xs italic">
            Renouvellement le
            {{ renewalDate | date }}
          </p>
        }
      </div>
      <div class="flex flex-col gap-1 text-end">
        <h3 class="flex items-baseline justify-end gap-1">
          <span class="w-fit whitespace-nowrap font-semibold">
            {{ sub.price }} €
          </span>
          <span class="text-sm font-medium">HT</span>
        </h3>
        <h4 class="text-granite-400 text-xs italic">par mois</h4>
      </div>
    </div>
    @if (showChooseButton() && sub.buyable) {
      <button
        class="mt-auto w-full rounded-lg bg-green-600 px-4 py-1 text-white hover:bg-green-800"
        (click)="chose.emit(sub.subscription)"
        [class.opacity-50]="disabled()"
        [class.pointer-events-none]="disabled()"
        [disabled]="disabled()"
      >
        Choisir
      </button>
    }
  `,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProSubscriptionCardComponent {
  readonly subscription = input.required<ProPlan>();
  readonly renewalDate = input<string | null>(null);
  readonly highlighted = input(false, { transform: booleanAttribute });

  readonly disabled = input(false);
  readonly showChooseButton = input(false, { transform: booleanAttribute });
  readonly chose = output<ProSubscription>();
}
