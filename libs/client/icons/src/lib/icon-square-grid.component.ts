import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-square-grid",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 512 512"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
    >
      <clipPath id="clip0_260_8270"><path d="m0 0h512v512h-512z" /></clipPath>
      <g
        clip-path="url(#clip0_260_8270)"
        clip-rule="evenodd"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-700'
        "
      >
        <path
          d="m0 50.2266c0-27.6142 22.3858-50.000038 50-50.000038h132.521c27.614 0 50 22.385738 50 50.000038v132.8724c0 27.615-22.386 50-50 50h-132.521c-27.6143 0-50-22.385-50-50z"
        />
        <path
          d="m0 329.128c0-27.615 22.3858-50.001 50-50.001h132.521c27.614 0 50 22.386 50 50v132.873c0 27.614-22.386 50-50 50h-132.521c-27.6143 0-50-22.386-50-50z"
        />
        <path
          d="m329.477.226562c-27.615 0-50 22.385838-50 50.000038v132.8724c0 27.615 22.385 50 50 50h132.52c27.615 0 50-22.385 50-50v-132.8724c0-27.6143-22.385-50.000038-50-50.000038z"
        />
        <path
          d="m279.477 329.128c0-27.615 22.385-50.001 50-50.001h132.52c27.615 0 50 22.386 50 50v132.873c0 27.614-22.385 50-50 50h-132.52c-27.615 0-50-22.386-50-50z"
        />
      </g>
    </svg>
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconSquareGridComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
