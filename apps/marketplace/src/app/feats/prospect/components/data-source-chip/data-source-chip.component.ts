import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "mkp-data-source-chip",
  template: `
    <span
      class="text-primary-500 bg-primary-100 text-nowrap rounded-lg px-2 py-1 text-xs font-medium"
    >
      {{ label() }}
    </span>
  `,
  imports: [],
})
export class DataSourceChipComponent {
  readonly label = input.required<string>();
  readonly bgColor = input.required<string>();
}
