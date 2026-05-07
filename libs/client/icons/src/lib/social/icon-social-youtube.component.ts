import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-social-youtube",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 21 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.2882 14.7321L7.22605 14.6562C5.9108 14.6297 4.59228 14.6826 3.30282 14.4085C1.34126 13.999 1.20229 11.9911 1.05688 10.3068C0.856519 7.93897 0.934085 5.52816 1.31219 3.18008C1.52565 1.86257 2.36568 1.0764 3.66476 0.990845C8.05011 0.68037 12.4646 0.717165 16.8403 0.862012C17.3024 0.875291 17.7677 0.947867 18.2234 1.03048C20.4727 1.4334 20.5275 3.70879 20.6733 5.62425C20.8187 7.55947 20.7573 9.50463 20.4794 11.4267C20.2564 13.0181 19.8298 14.3526 18.0294 14.4815C15.7737 14.6499 13.5697 14.7855 11.3076 14.7424C11.3077 14.7321 11.2947 14.7321 11.2882 14.7321ZM8.90006 10.7031C10.6 9.70573 12.2674 8.72494 13.9576 7.73422C12.2545 6.73681 10.5902 5.75602 8.90006 4.7653V10.7031Z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconSocialsYoutubeComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
