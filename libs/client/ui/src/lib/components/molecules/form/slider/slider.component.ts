import type { OnDestroy } from "@angular/core";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  linkedSignal,
  model,
} from "@angular/core";
import type { FormControl } from "@angular/forms";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SliderModule } from "primeng/slider";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { distinctUntilChanged, Subject, takeUntil } from "rxjs";

type SliderValue = number | [number, number] | null | undefined;

@Component({
  selector: "oui-slider",
  host: {
    class: "flex gap-2",
    "[class.items-center]": "!active()",
  },
  template: `
    @if (!alwaysActiveMode()) {
      <p-toggleswitch [(ngModel)]="active" />
    }

    @if (active()) {
      <div class="flex flex-1 flex-col gap-2">
        <p-slider
          class="mx-3 mt-3 h-3"
          [formControl]="control()"
          [max]="max()"
          [min]="min()"
          [range]="sliderMode() === 'range'"
          [step]="step()"
        />

        @if (showValueLabel()) {
          @if (isRangeMode(control().value)) {
            <div
              class="text-granite-400 flex items-center justify-between gap-2 text-sm"
            >
              <span class="rounded-lg">
                {{ formatValue(getRangeStart(control().value)) }}
                {{ suffix() }}
              </span>
              <span class="rounded-lg">
                {{ formatValue(getRangeEnd(control().value)) }}
                {{ suffix() }}
              </span>
            </div>
          } @else {
            <span class="text-granite-400 text-sm">
              {{ formatValue(asNumber(control().value) ?? min()) }}
              {{ suffix() }}
            </span>
          }
        }
      </div>
    } @else {
      <span
        class="text-granite-400 cursor-pointer pb-2 text-sm italic hover:text-black"
        (click)="active.set(true)"
      >
        Spécifier un intervalle
      </span>
    }
  `,
  imports: [SliderModule, ToggleSwitchModule, ReactiveFormsModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent implements OnDestroy {
  readonly control = model.required<FormControl<SliderValue>>();

  readonly min = input.required<number>();
  readonly max = input.required<number>();
  readonly step = input<number>(1);
  readonly suffix = input<string>();
  readonly ratio = input<number>(1);
  readonly sliderMode = input<"single" | "range">("range");
  readonly alwaysActiveMode = input(false, { transform: booleanAttribute });
  readonly showValueLabel = input(true, { transform: booleanAttribute });

  protected readonly active = linkedSignal(() => {
    if (this.alwaysActiveMode()) {
      return true;
    }

    const value = this.control().value;
    if (this.sliderMode() === "single") {
      return typeof value === "number";
    }

    return value !== null && value !== undefined && Array.isArray(value);
  });

  private readonly syncControlActiveness = effect(() => {
    const currentValue = this.control().value;

    if (!this.active()) {
      this.control().setValue(null);
      this.control().updateValueAndValidity();
      return;
    }

    if (this.sliderMode() === "range") {
      const [min, max] = Array.isArray(currentValue)
        ? currentValue
        : [this.min(), this.max()];
      this.control().setValue([min, max]);
      this.control().updateValueAndValidity();
      return;
    }

    this.control().setValue(
      typeof currentValue === "number" ? currentValue : this.min(),
    );
    this.control().updateValueAndValidity();
  });

  constructor() {
    effect((onDestroy) => {
      const subscription = this.control()
        .valueChanges.pipe(takeUntil(this.destroyed$), distinctUntilChanged())
        .subscribe((value) => {
          if (value === null && this.active() && !this.alwaysActiveMode()) {
            this.active.set(false);
          }
        });
      onDestroy(() => subscription.unsubscribe());
    });
  }

  private readonly destroyed$ = new Subject<void>();

  protected formatValue(value: number): string {
    const ratio = this.ratio();
    if (ratio === 0) {
      // Avoid division by zero
      return value.toLocaleString("fr-FR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
    }
    const scaled = value / ratio;
    return scaled.toLocaleString("fr-FR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }

  protected isRangeMode(value: SliderValue): value is [number, number] {
    return Array.isArray(value);
  }

  protected asNumber(value: SliderValue): number | null {
    return typeof value === "number" ? value : null;
  }

  protected getRangeStart(value: SliderValue): number {
    return Array.isArray(value) ? value[0] : this.min();
  }

  protected getRangeEnd(value: SliderValue): number {
    return Array.isArray(value) ? value[1] : this.max();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
