import { CurrencyPipe, DecimalPipe, PercentPipe } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from "@angular/core";

@Component({
  selector: "oui-highlight-number",
  template: `
    <div
      class="text-primary-700 flex items-start justify-between gap-2 font-semibold"
      [class]="withLineBreak() ? 'flex-col justify-start' : ''"
    >
      <div class="font-display max-w-72 font-semibold">{{ label() }}</div>

      <div [class]="withBackground() ? 'z-10 rounded-lg bg-white' : ''">
        <h4
          class="px-2 text-2xl font-bold"
          [class.text-green-700]="color() === 'green'"
          [class.text-primary-700]="color() === 'blue'"
          [class.text-primary-700]="color() === 'dark-blue'"
        >
          {{ prefix() }}

          @if (type() === "number") {
            {{ value() | number: digitalInfo() }}
          }
          @if (type() === "amount") {
            {{ value() | currency: "EUR" : "symbol" : digitalInfo() }}
          }
          @if (type() === "percent") {
            {{ value() | percent: digitalInfo() }}
          }

          {{ suffix() }}
        </h4>
      </div>
    </div>
  `,
  imports: [CurrencyPipe, PercentPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighlightNumberComponent {
  readonly value = input.required<number>();
  readonly type = input.required<"number" | "amount" | "percent">();
  readonly prefix = input<string>();
  readonly suffix = input<string>();
  readonly digitalInfo = input<string>("1.0-0"); // Source: https://angular.dev/tutorials/learn-angular/23-pipes-format-data#format-a-number-with-decimalpipe
  readonly color = input<"green" | "blue" | "dark-blue">("dark-blue");
  readonly withBackground = input(false, { transform: booleanAttribute });
  readonly label = input.required<string>();
  readonly withLineBreak = input(false, { transform: booleanAttribute });
}
