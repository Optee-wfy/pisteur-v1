import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-bicolor-house",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.4285714285714284 22.285714285714285V12l8.571428571428571 -8.571428571428571 8.571428571428571 8.571428571428571v10.285714285714285a1.7142857142857142 1.7142857142857142 0 0 1 -1.7142857142857142 1.7142857142857142H5.142857142857142a1.7142857142857142 1.7142857142857142 0 0 1 -1.7142857142857142 -1.7142857142857142Z"
        stroke-width="1"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        clip-rule="evenodd"
        d="M10.788 2.216571428571428a1.7142857142857142 1.7142857142857142 0 0 1 2.424 0l10.285714285714285 10.285714285714285a1.7142857142857142 1.7142857142857142 0 0 1 -2.424 2.424L12 5.852571428571428 2.926285714285714 14.926285714285715A1.7142857142857142 1.7142857142857142 0 0 1 0.5022857142857142 12.502285714285714l10.285714285714285 -10.285714285714285Z"
        fill-rule="evenodd"
        stroke-width="1"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-300'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconBicolorHouseComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
