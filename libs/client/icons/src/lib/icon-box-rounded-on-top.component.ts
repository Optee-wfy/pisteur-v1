import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-box-rounded-on-top",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 17 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5 0C6.24566 0 4.08365 0.504401 2.48959 1.40224C0.895532 2.30008 0 3.51781 0 4.78755V16H17V4.78755C17 3.51781 16.1045 2.30008 14.5104 1.40224C12.9163 0.504401 10.7543 0 8.5 0Z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconBoxRoundedOnTopComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
