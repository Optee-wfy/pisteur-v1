import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-filters",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 32 32"
    >
      <g>
        <path
          d="M6.1 21H4a1 1 0 0 0 0 2h2.1c.464 2.281 2.483 4 4.9 4s4.436-1.719 4.9-4H28a1 1 0 0 0 0-2H15.9c-.464-2.281-2.483-4-4.9-4s-4.436 1.719-4.9 4zm4.9-2a3.001 3.001 0 0 1 0 6 3.001 3.001 0 0 1 0-6zm5.1-10H4a1 1 0 0 0 0 2h12.1c.464 2.281 2.483 4 4.9 4s4.436-1.719 4.9-4H28a1 1 0 0 0 0-2h-2.1c-.464-2.281-2.483-4-4.9-4s-4.436 1.719-4.9 4zM21 7a3.001 3.001 0 0 1 0 6 3.001 3.001 0 0 1 0-6z"
          data-original="#000000"
          fill="white"
          opacity="1"
          [class]="
            colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
          "
        ></path>
      </g>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconFiltersComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
