import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-send",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m5.15 12h17.41l-19.8-9a.53.53 0 0 0 -.55.09.5.5 0 0 0 -.13.54z"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-400'
        "
      />
      <path
        d="m5.15 13-3.07 8.33a.5.5 0 0 0 .13.54.55.55 0 0 0 .34.13.52.52 0 0 0 .21 0l19.8-9z"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-400'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconSendComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
