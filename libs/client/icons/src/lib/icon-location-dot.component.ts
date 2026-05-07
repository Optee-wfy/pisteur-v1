import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-location-dot",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m32 3.25a28.75 28.75 0 0 0 -28.75 28.75 28.75 28.75 0 0 0 28.75 28.75 28.75 28.75 0 0 0 28.75-28.75 28.75 28.75 0 0 0 -28.75-28.75zm.56 46.75a.75.75 0 0 1 -1.12 0c-.52-.58-12.84-14.4-12.84-22 0-7.83 6-14.21 13.4-14.21s13.4 6.34 13.4 14.21c0 7.6-12.32 21.42-12.84 22z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <circle cx="32" cy="26.73" r="5.69" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLocationDotComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
