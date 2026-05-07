import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "oui-circle-percent-idle",
  host: {
    class: "inline-block rounded-full p-1 shrink-0",
  },
  template: `
    <svg class="max-h-full max-w-full fill-none" viewBox="0 0 36 36">
      <defs>
        <linearGradient
          id="whiteGradient"
          gradientUnits="userSpaceOnUse"
          x1="33.6413"
          x2="-1.14914"
          y1="7.01185"
          y2="23.4759"
        >
          <stop stop-color="currentColor" />
          <stop offset="1" stop-color="currentColor" />
        </linearGradient>
      </defs>

      <path
        class="file-none"
        d="M18 2.0845
        a 15.9155 15.9155 0 0 1 0 31.831
        a 15.9155 15.9155 0 0 1 0 -31.831"
        style="stroke-width: 4; stroke-linecap: round; transition: stroke-dasharray 0.6s ease; "
        [attr.stroke-dasharray]="'95, 100'"
        [attr.stroke-dashoffset]="5"
        [attr.stroke]="'url(#whiteGradient)'"
      />

      <text
        class="fill-primary-900 select-none text-sm font-medium leading-tight tracking-tight"
        style="text-anchor: middle; dominant-baseline: central;"
        x="18"
        y="18"
      >
        --
      </text>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CirclePercentIdleComponent {}
