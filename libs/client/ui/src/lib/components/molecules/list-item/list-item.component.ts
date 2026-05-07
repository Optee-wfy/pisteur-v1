import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "oui-list-item",
  host: {
    class: "flex items-center justify-between gap-4 text-base h-7",
  },
  template: `
    <div class="font-light text-gray-600">
      {{ label() }}
    </div>
    <div class="text-granite-700 max-w-[150px] truncate font-medium">
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemComponent {
  label = input<string>();
}
