import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-play-circle",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 26 27"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="11.9707"
        cy="17.5568"
        fill="currentColor"
        rx="9.12837"
        ry="9"
        transform="rotate(90 11.9707 17.5568)"
      />
      <path
        d="M16.4461 16.5623C17.108 16.9499 17.108 17.9189 16.4461 18.3066L10.4887 21.7951C9.82676 22.1827 8.99935 21.6982 8.99935 20.923L8.99935 13.9459C8.99935 13.1706 9.82676 12.6861 10.4887 13.0737L16.4461 16.5623Z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPlayCircleComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
