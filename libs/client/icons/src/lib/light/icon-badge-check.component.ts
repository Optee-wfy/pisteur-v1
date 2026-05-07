import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "icon-badge-check",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      >
      <g>
        <path
          class=""
          clip-rule="evenodd"
          d="M9.22 3.32a3.59 3.59 0 0 1 5.56 0c.338.413.86.63 1.392.576a3.59 3.59 0 0 1 3.932 3.932 1.59 1.59 0 0 0 .576 1.391 3.59 3.59 0 0 1 0 5.562c-.413.337-.63.86-.576 1.39a3.59 3.59 0 0 1-3.932 3.933 1.589 1.589 0 0 0-1.391.576 3.59 3.59 0 0 1-5.562 0 1.59 1.59 0 0 0-1.39-.576 3.59 3.59 0 0 1-3.933-3.932 1.59 1.59 0 0 0-.576-1.391 3.59 3.59 0 0 1 0-5.562c.413-.337.63-.86.576-1.39a3.59 3.59 0 0 1 3.932-3.933A1.59 1.59 0 0 0 9.22 3.32zm6.659 6.157a1 1 0 0 0-1.758-.954l-2.64 4.862-1.797-1.686a1 1 0 0 0-1.368 1.46l2.743 2.57a1 1 0 0 0 1.563-.252z"
          data-original="#000000"
          fill="currentColor"
          fill-rule="evenodd"
          opacity="1"
        ></path>
      </g>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconBadgeCheckComponent {}
