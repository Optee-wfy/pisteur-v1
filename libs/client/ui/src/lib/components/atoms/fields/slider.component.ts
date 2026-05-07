import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  model,
  untracked,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { FormValueControl } from "@angular/forms/signals";
import { SliderModule } from "primeng/slider";
import { ToggleSwitch } from "primeng/toggleswitch";
import { FieldLayoutComponent } from "./field-layout.component";
import { FieldSkeleton } from "./field-skeleton.directive";

type SliderValue = number | [number, number] | null | undefined;

@Component({
  selector: "oui-slider",
  host: { class: "flex flex-col gap-1" },
  template: `
    <oui-field-layout
      (clear)="value.set(null)"
      [disabled]="disabled()"
      [formattedValue]="formattedValue()"
      [hideClearButton]="!showClearButton()"
      [isFilterAccessible]="!restrictedAccess()"
      [label]="label()"
      [mode]="mode()"
    >
      <div class="flex items-center gap-6">
        @if (!alwaysActiveMode()) {
          <p-toggleswitch [(ngModel)]="active" />
        }

        @if (active()) {
          <div class="flex flex-1 flex-col gap-3 px-4 pb-1 pt-3">
            <p-slider
              [(ngModel)]="value"
              [ariaLabel]="label()"
              [max]="maxValue()"
              [min]="minValue()"
              [range]="sliderMode() === 'range'"
            />

            @let parsedValue = value();

            @if (isRangeMode(parsedValue)) {
              <div
                class="text-granite-400 -mx-2 flex items-center justify-between gap-2 text-xs"
              >
                <span class="rounded-lg">
                  {{ formatValue(parsedValue?.at(0) ?? minValue()) }}
                  {{ suffix() }}
                </span>
                <span class="rounded-lg">
                  {{ formatValue(parsedValue?.at(1) ?? maxValue()) }}
                  {{ suffix() }}
                </span>
              </div>
            } @else {
              <span class="text-granite-400 -mx-2 rounded-lg text-xs">
                {{ formatValue(parsedValue ?? minValue()) }}
                {{ suffix() }}
              </span>
            }
          </div>
        } @else {
          <span
            class="text-granite-400 cursor-pointer py-2 italic hover:text-black"
            (click)="active.set(true)"
          >
            Spécifier un intervalle
          </span>
        }
      </div>
    </oui-field-layout>
  `,
  imports: [SliderModule, FormsModule, FieldLayoutComponent, ToggleSwitch],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent
  extends FieldSkeleton
  implements FormValueControl<SliderValue>
{
  readonly value = model<SliderValue>(null);
  readonly sliderMode = input<"single" | "range">("range");
  readonly minValue = input<number>(0);
  readonly maxValue = input<number>(100);
  readonly suffix = input<string>();
  readonly ratio = input<number>(1);
  readonly alwaysActiveMode = input(false, { transform: booleanAttribute });

  protected readonly active = linkedSignal(() => {
    if (this.alwaysActiveMode()) {
      return true;
    }

    const mode = this.sliderMode();
    const value = this.value();

    if (mode === "single") {
      return typeof value === "number";
    }
    return Array.isArray(value);
  });

  private readonly forceActive = effect(() => {
    if (this.alwaysActiveMode()) {
      this.value.update((v) => {
        if (v === null || v === undefined) {
          return this.sliderMode() === "range"
            ? [this.minValue(), this.maxValue()]
            : this.minValue();
        }
        return v;
      });
      this.active.set(true);
    }
  });

  private readonly syncControlActiveness = effect(() => {
    const mode = this.sliderMode();
    const isActive = this.active();
    const currentValue = untracked(() => this.value());
    const defaultValue =
      mode === "range"
        ? ([
            untracked(() => this.minValue()),
            untracked(() => this.maxValue()),
          ] as [number, number])
        : untracked(() => this.minValue());

    if (!isActive) {
      this.value.set(null);
      return;
    }

    if (mode === "range") {
      this.value.set(
        Array.isArray(currentValue)
          ? currentValue
          : (defaultValue as [number, number]),
      );
      return;
    }

    this.value.set(
      typeof currentValue === "number"
        ? currentValue
        : (defaultValue as number),
    );
  });

  protected formatValue(value: number): string {
    const ratio = this.ratio();
    if (ratio === 0) {
      // Avoid division by zero
      return value.toLocaleString("fr-FR", {
        maximumFractionDigits: 0,
      });
    }
    const scaled = value / ratio;
    return scaled.toLocaleString("fr-FR", {
      maximumFractionDigits: 0,
    });
  }

  protected isRangeMode(value: SliderValue): value is [number, number] {
    return Array.isArray(value);
  }

  protected readonly formattedValue = computed(() => {
    const v = this.value();
    if (v === null || v === undefined) {
      return "";
    }
    if (Array.isArray(v)) {
      return `${this.formatValue(v[0])} - ${this.formatValue(v[1])} ${this.suffix() ?? ""}`.trim();
    }
    return `${this.formatValue(v)} ${this.suffix() ?? ""}`.trim();
  });
}
