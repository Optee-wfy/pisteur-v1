import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-home",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      height="24"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M9 22V12h6v10" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconHomeComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
