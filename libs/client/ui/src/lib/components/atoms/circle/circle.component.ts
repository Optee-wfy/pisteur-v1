import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

@Component({
  selector: "oui-circle",
  host: {
    class: "pointer-events-none absolute z-0",
  },
  template: `
    <svg
      shape-rendering="geometricPrecision"
      text-rendering="geometricPrecision"
      viewBox="0 0 300 300"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
      [class.opacity-15]="theme() === 'light'"
      [class.opacity-30]="theme() === 'dark-white'"
      [class.opacity-5]="theme() === 'dark'"
    >
      <defs>
        <linearGradient
          gradientTransform="translate(0 0)"
          gradientUnits="objectBoundingBox"
          spreadMethod="pad"
          x1="-0.120892"
          x2="1.120892"
          y1="1.120892"
          y2="-0.120892"
          [attr.id]="uniqueId"
        >
          <stop offset="0%" [attr.stop-color]="fromColor()" />
          <stop offset="100%" [attr.stop-color]="toColor()" />
        </linearGradient>
      </defs>
      <ellipse
        fill="none"
        rx="127.102376"
        ry="127.102376"
        stroke-width="60"
        transform="matrix(.950367 0 0 0.950368 150 150)"
        [attr.stroke]="'url(#' + uniqueId + ')'"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CircleComponent {
  theme = input<"light" | "dark" | "dark-white">("dark");

  fromColor = computed(() => {
    if (this.theme() === "dark") {
      return "#FFF";
    }
    if (this.theme() === "dark-white") {
      return "#FFF";
    }
    return "#001A99";
  });

  toColor = computed(() => {
    if (this.theme() === "dark") {
      return "#719CC2";
    }
    if (this.theme() === "dark-white") {
      return "#1103A0";
    }
    return "#FFF";
  });

  uniqueId = "gradient-" + Math.random().toString(36).substr(2, 9);
}
