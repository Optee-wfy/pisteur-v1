import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import {
  IconBoltComponent,
  IconChartComponent,
  IconHeaterComponent,
  IconHomeComponent,
  IconSquareGridComponent,
} from "@optee/icons";
import { DpeLabelComponent } from "@optee/ui/components/atoms/dpe-label/dpe-label.component";

@Component({
  selector: "mkp-lead-details-card",
  template: `
    <div
      [class]="
        'flex h-full min-h-[100px] flex-col justify-between rounded-xl p-4 ' +
        (variant() === 'green'
          ? 'bg-green-100 text-green-900'
          : 'bg-gray-100 text-gray-800')
      "
    >
      <div class="flex items-center gap-2">
        <div
          [class]="
            'size-4 ' +
            (variant() === 'green' ? 'text-green-700' : 'text-gray-500')
          "
        >
          @switch (icon()) {
            @case ("dpe") {
              <icon-heater />
            }
            @case ("surface") {
              <icon-square-grid />
            }
            @case ("type") {
              <icon-home />
            }
            @case ("consumption") {
              <icon-chart />
            }
            @case ("energy") {
              <icon-bolt />
            }
          }
        </div>

        <span
          [class]="
            'text-xs ' +
            (variant() === 'green' ? 'text-green-700' : 'text-gray-500')
          "
        >
          {{ label() }}
        </span>
      </div>
      @if (icon() === "dpe") {
        <oui-dpe-label
          variant="rounded-square"
          [letter]="$any(value()) || '?'"
        />
      } @else {
        <div class="flex flex-wrap items-end gap-x-1 gap-y-0">
          <span class="text-lg font-semibold leading-tight">
            {{ value() }}
          </span>

          @if (suffix()) {
            <span
              class="whitespace-nowrap text-sm font-medium leading-tight opacity-75"
            >
              {{ suffix() }}
            </span>
          }
        </div>
      }
    </div>
  `,
  imports: [
    DpeLabelComponent,
    IconBoltComponent,
    IconChartComponent,
    IconHeaterComponent,
    IconHomeComponent,
    IconSquareGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadDetailsCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly suffix = input<string | null>(null);
  readonly variant = input<"green" | "gray">("gray");
  readonly icon = input<"dpe" | "surface" | "type" | "consumption" | "energy">(
    "dpe",
  );
}
