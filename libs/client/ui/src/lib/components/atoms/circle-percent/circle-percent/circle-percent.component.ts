import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

@Component({
  selector: "oui-circle-percent",
  host: {
    class: "inline-block rounded-full p-1 shrink-0",
  },
  template: `
    <svg class="max-h-full max-w-full fill-none" viewBox="0 0 36 36">
      <defs>
        <linearGradient
          id="redGradient"
          gradientUnits="userSpaceOnUse"
          x1="30"
          x2="2"
          y1="0.999999"
          y2="27.4091"
        >
          <stop stop-color="#ED1B2F" />
          <stop offset="1" stop-color="#B11B2F" />
        </linearGradient>

        <linearGradient
          id="orangeGradient"
          gradientUnits="userSpaceOnUse"
          x1="33.6413"
          x2="-1.14914"
          y1="7.01185"
          y2="23.4759"
        >
          <stop stop-color="#E8BF02" />
          <stop offset="1" stop-color="#E88302" />
        </linearGradient>

        <linearGradient
          id="greenGradient"
          gradientUnits="userSpaceOnUse"
          x1="33.6413"
          x2="-1.14914"
          y1="7.01185"
          y2="23.4759"
        >
          <stop stop-color="#00FF55" />
          <stop offset="1" stop-color="#009933" />
        </linearGradient>

        <linearGradient
          id="primaryGradient"
          gradientUnits="userSpaceOnUse"
          x1="33.6413"
          x2="-1.14914"
          y1="7.01185"
          y2="23.4759"
        >
          <stop stop-color="#4C7FFF" />
          <stop offset="1" stop-color="#001A99" />
        </linearGradient>

        <linearGradient
          id="whiteGradient"
          gradientUnits="userSpaceOnUse"
          x1="33.6413"
          x2="-1.14914"
          y1="7.01185"
          y2="23.4759"
        >
          <stop stop-color="#FFF" />
          <stop offset="1" stop-color="#FFF" />
        </linearGradient>
      </defs>

      <path
        class="file-none"
        d="M18 2.0845
        a 15.9155 15.9155 0 0 1 0 31.831
        a 15.9155 15.9155 0 0 1 0 -31.831"
        style="stroke-width: 4; stroke-linecap: round; transition: stroke-dasharray 0.6s ease; "
        [attr.stroke-dasharray]="displayedValue() + ', 100'"
        [attr.stroke-dashoffset]="-(100 - displayedValue())"
        [attr.stroke]="colorGradient()"
      />

      <text
        class="fill-primary-900 select-none text-sm font-medium leading-tight tracking-tight"
        style="text-anchor: middle; dominant-baseline: central;"
        x="18"
        y="18"
      >
        {{ value() }}{{ showPercent() ? "%" : "" }}
      </text>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CirclePercentComponent {
  /**
   * Percentage value to display (impact stroke-dasharray & color)
   */
  readonly value = input.required<number>();

  readonly maxValue = input<number>();

  /**
   * If set to true, display '%' character next to the value
   */
  readonly showPercent = input(false, { transform: booleanAttribute });

  readonly higherIsWorse = input(false, { transform: booleanAttribute });

  readonly color = input<"primary" | "white">();

  protected displayedValue(): number {
    const maxValue = this.maxValue();
    if (!maxValue) {
      return this.value();
    }
    return Math.round((this.value() / maxValue) * 100);
  }

  protected readonly colorGradient = computed(() => {
    if (this.color()) {
      return this.color();
    }
    const value = this.displayedValue();

    if (this.higherIsWorse()) {
      if (value < 41) {
        return "#66FF99";
      }
      if (value < 71) {
        return "#fb923c";
      }
      return "#B01B2F";
    }

    if (value < 41) {
      return "#B01B2F";
    }
    if (value < 71) {
      return "#fb923c";
    }
    return "#66FF99";
  });
}
