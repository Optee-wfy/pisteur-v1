import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-signature",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      version="1.1"
      viewBox="0 0 512 512"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <g>
          <path
            d="&#10;&#9;&#9;&#9;M417.123,344.999c-27.31-2.426-52.589,9.443-68.458,29.415l-33.258,0l18.502,30.139c-0.921,3.788-1.572,7.691-1.928,11.692&#10;&#9;&#9;&#9;c-3.837,43.185,28.062,81.304,71.247,85.141c43.185,3.837,81.305-28.062,85.141-71.247S460.308,348.836,417.123,344.999z"
            style="fill:none;0;stroke-width:20;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;"
            [class]="
              colorMode() === 'current'
                ? 'stroke-current'
                : 'stroke-primary-400'
            "
          />
        </g>

        <polygon
          points="&#10;&#9;&#9;354.467,10 354.467,56.32 69.647,56.32 69.647,455.68 23.317,455.68 23.317,10 &#9;"
          style="fill:none;stroke-width:20;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;"
          [class]="
            colorMode() === 'current' ? 'stroke-current' : 'stroke-primary-400'
          "
        />
        <path
          d="&#10;&#9;&#9;M400.787,163.532V56.32H69.647V502h331.14v-0.87c-41.93-5.02-72.57-42.52-68.8-84.88c0.35-4.01,1-7.91,1.92-11.7l-18.5-30.14h33.26&#10;&#9;&#9;c12.65-15.91,31.26-26.68,52.12-29.16v-93.729"
          style="fill:none;stroke-width:20;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;"
          [class]="
            colorMode() === 'current' ? 'stroke-current' : 'stroke-primary-400'
          "
        />

        <line
          style="fill:none;stroke-width:20;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;"
          x1="400.787"
          x2="400.787"
          y1="207.526"
          y2="207.526"
          [class]="
            colorMode() === 'current' ? 'stroke-current' : 'stroke-primary-400'
          "
        />

        <polyline
          points="&#10;&#9;&#9;129.717,444.472 155.923,391.631 181.002,444.472 198.3,418.051 214.036,444.472 258.54,444.472 &#9;"
          style="fill:none;stroke-width:20;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;"
          [class]="
            colorMode() === 'current' ? 'stroke-current' : 'stroke-primary-400'
          "
        />

        <line
          style="fill:none;stroke-width:20;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;"
          x1="129.804"
          x2="274.026"
          y1="334.409"
          y2="334.409"
          [class]="
            colorMode() === 'current' ? 'stroke-current' : 'stroke-primary-400'
          "
        />

        <line
          style="fill:none;stroke-width:20;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;"
          x1="129.804"
          x2="340.289"
          y1="294.102"
          y2="294.102"
          [class]="
            colorMode() === 'current' ? 'stroke-current' : 'stroke-primary-400'
          "
        />

        <line
          style="fill:none;stroke-width:20;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;"
          x1="129.804"
          x2="274.026"
          y1="226.735"
          y2="226.735"
          [class]="
            colorMode() === 'current' ? 'stroke-current' : 'stroke-primary-400'
          "
        />

        <line
          style="fill:none;stroke-width:20;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;"
          x1="129.804"
          x2="320.501"
          y1="187.08"
          y2="187.08"
          [class]="
            colorMode() === 'current' ? 'stroke-current' : 'stroke-primary-400'
          "
        />

        <line
          style="fill:none;stroke-width:20;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;"
          x1="129.804"
          x2="167.921"
          y1="117.09"
          y2="117.09"
          [class]="
            colorMode() === 'current' ? 'stroke-current' : 'stroke-primary-400'
          "
        />

        <polyline
          points="&#10;&#9;&#9;374.391,427.193 397.745,450.547 444.452,403.839 &#9;"
          style="fill:none;stroke-width:20;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;"
          [class]="
            colorMode() === 'current' ? 'stroke-current' : 'stroke-primary-400'
          "
        />
      </g>
    </svg>
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconSignatureComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
