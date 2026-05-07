import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-spinner",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 53 53"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M46.5 26.5C46.5 37.5457 37.5457 46.5 26.5 46.5C15.4543 46.5 6.5 37.5457 6.5 26.5C6.5 15.4543 15.4543 6.5 26.5 6.5"
        stroke="url(#paint0_linear_8353_7984)"
        stroke-linecap="round"
        stroke-width="12"
      />
      <defs>
        <linearGradient
          id="paint0_linear_8353_7984"
          gradientUnits="userSpaceOnUse"
          x1="46.5"
          x2="6.5"
          y1="6.5"
          y2="44.2273"
        >
          <stop
            [attr.stop-color]="
              colorMode() === 'current' ? 'currentColor' : '#4C7FFF'
            "
          />
          <stop
            offset="1"
            [attr.stop-color]="
              colorMode() === 'current' ? 'currentColor' : '#001A99'
            "
          />
        </linearGradient>
      </defs>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconSpinnerComponent {
  colorMode = input<"current" | "colored">("current");
}
