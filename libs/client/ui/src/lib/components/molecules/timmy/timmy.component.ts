import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "oui-timmy",
  host: {
    class: "rounded-lg bg-white p-2 flex justify-between flex-start",
  },
  template: `
    <div class="flex-auto">
      <div class="select-none text-xs text-gray-600">
        {{ label() }}
      </div>

      <div class="text-primary-900 flex gap-1 text-sm font-medium">
        <ng-content />
      </div>
    </div>

    <div class="shrink-0">
      <ng-content select="[icon]" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimmyComponent {
  readonly label = input.required<string>();
}
