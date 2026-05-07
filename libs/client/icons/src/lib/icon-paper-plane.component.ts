import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-paper-plane",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <!-- The negative margin left is to center the icon in the button -->
    <svg
      class="-ml-[10%] flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 288L512 0 448 480 271.8 404.5 208 512l-48-16 0-80 0-32L384 160 133 345 0 288z"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-400'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPaperPlaneComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
