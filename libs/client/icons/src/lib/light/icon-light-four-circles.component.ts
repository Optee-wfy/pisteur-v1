import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "icon-light-four-circles",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="25"
        cy="25"
        fill="none"
        r="14"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="5"
      />
      <circle
        cx="75"
        cy="25"
        fill="none"
        r="14"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="5"
      />
      <circle
        cx="25"
        cy="75"
        fill="none"
        r="14"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="5"
      />
      <circle
        cx="75"
        cy="75"
        fill="none"
        r="14"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="5"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLightFourCirclesComponent {}
