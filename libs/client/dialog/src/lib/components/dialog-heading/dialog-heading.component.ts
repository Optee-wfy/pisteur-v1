import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "op-dialog-heading",
  host: {
    class: "flex flex-col items-center gap-2",
  },
  template: `
    <div class="flex flex-col items-center gap-3 lg:gap-6">
      <ng-content select="[iconSlot]" />

      <h2 class="font-display text-center text-2xl font-semibold">
        {{ heading() }}
      </h2>
    </div>

    <div class="font-display text-center text-sm text-gray-600 lg:text-base">
      <ng-content />
    </div>
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogHeadingComponent {
  heading = input<string>();
}
