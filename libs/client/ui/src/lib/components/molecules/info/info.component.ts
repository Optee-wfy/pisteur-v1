import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "oui-info",
  host: {
    class: "flex flex-col",
  },
  template: `
    <h2
      class="font-display"
      [class.font-normal]="variant() === 'default'"
      [class.font-semibold]="variant() === 'highlighted'"
      [class.text-gray-600]="variant() === 'default'"
      [class.text-primary-900]="variant() === 'highlighted'"
      [class.text-sm]="variant() === 'default'"
    >
      {{ heading() }}
    </h2>

    <div
      class="text-sm"
      [class.font-medium]="variant() === 'default'"
      [class.font-normal]="variant() === 'highlighted'"
      [class.text-gray-600]="variant() === 'highlighted'"
      [class.text-primary-900]="variant() === 'default'"
    >
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent {
  heading = input<string>("");
  variant = input<"highlighted" | "default">("default");
}
