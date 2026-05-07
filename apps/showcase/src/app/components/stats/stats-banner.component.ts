import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { DividerVerticalComponent } from "@optee/ui/components/atoms/divider/divider-vertical/divider-vertical.component";

@Component({
  selector: "swc-stats-banner",
  host: {
    class:
      "text-center relative overflow-hidden bg-primary-50 flex flex-col justify-center gap-x-12 px-6 py-8 md:flex-row xl:gap-x-24 xl:px-44 xl:py-20 bg-primary-50",
  },
  template: `
    @for (stat of stats(); track stat) {
      <div class="flex-col items-center justify-start gap-2 py-6">
        <div class="mb-3 self-stretch text-center">
          <div class="bigValue flex items-end justify-center gap-1">
            {{ stat.prefix }}{{ stat.value | number: "1.0" }}
            <span class="bigValueUnit">
              {{ stat.unit }}
            </span>
          </div>
        </div>
        <span class="mx-auto block max-w-56 text-center text-sm font-medium">
          {{ stat.description }}
        </span>
      </div>
      @if (!$last) {
        <oui-divider-vertical class="hidden shrink-0 md:block" />
      }
    }
    <oui-circle class="left-[900px] top-[200px] w-[400px]" theme="light" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DividerVerticalComponent, CommonModule, CircleComponent],
})
export class StatsBannerComponent {
  stats = input.required<
    {
      prefix?: string;
      value: number;
      unit?: string;
      description: string;
    }[]
  >();
}
