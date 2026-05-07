import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-electronic-signature",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      enable-background="new 0 0 512 512"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="m15 158.533c8.284 0 15-6.716 15-15v-113.533h113.533c19.881-.738 19.866-29.269 0-30h-128.533c-8.284 0-15 6.716-15 15v128.533c0 8.284 6.716 15 15 15z"
          [class]="
            colorMode() === 'current' ? 'fill-current' : 'fill-primary-400'
          "
        />
        <path
          d="m143.533 482h-113.533v-113.533c-.738-19.881-29.269-19.866-30 0v128.533c0 8.284 6.716 15 15 15h128.533c19.881-.738 19.866-29.269 0-30z"
          [class]="
            colorMode() === 'current' ? 'fill-current' : 'fill-primary-400'
          "
        />
        <path
          d="m497 0h-128.533c-19.881.738-19.866 29.269 0 30h113.533v113.533c.738 19.881 29.269 19.866 30 0v-128.533c0-8.284-6.716-15-15-15z"
          [class]="
            colorMode() === 'current' ? 'fill-current' : 'fill-primary-400'
          "
        />
        <path
          d="m497 353.467c-8.284 0-15 6.716-15 15v113.533h-113.533c-19.881.738-19.866 29.269 0 30h128.533c8.284 0 15-6.716 15-15v-128.533c0-8.284-6.716-15-15-15z"
          [class]="
            colorMode() === 'current' ? 'fill-current' : 'fill-primary-400'
          "
        />
        <path
          d="m497 208.866c-99.45 0-154.787 80.334-176.733 80.334-8.834 0-4.084-21.604-1.836-28.457 3.234-9.705-4-19.743-14.23-19.743-13.572 0-24.029 12.251-38.502 29.206-64.986 76.775-53.627 11.891-28.416-39.632 2.325-4.649 2.077-10.172-.656-14.594-2.733-4.423-7.562-7.114-12.76-7.114-14.667 0-24.133 15.195-58.009 73.291-16.889 28.629-49.599 86.804-69.516 102.266-15.311-33.895 44.383-220.8 73.864-246.35 5.858-5.858 5.858-15.355 0-21.213-5.857-5.857-15.355-5.857-21.213 0-22.469 22.469-47.591 86.489-62.276 134.484-31.315 102.337-30.888 164.256 8.616 164.256 24.063 0 48.19-35.863 92.672-111.879 2.926 21.223 17.65 31.546 35.861 31.546 24.716 0 45.589-23.3 62.557-43.134 1.583 7.162 8.133 27.067 33.844 27.067 41.83 0 83.717-80.334 176.733-80.334 19.828-.708 19.912-29.256 0-30z"
          [class]="
            colorMode() === 'current' ? 'fill-current' : 'fill-primary-400'
          "
        />
      </g>
    </svg>
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconElectronicSignatureComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
