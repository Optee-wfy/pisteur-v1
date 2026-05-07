import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-circular-diagram",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m52.97 34.05h-22.95v-22.95a.99654.99654 0 0 0 -1-1c-33.09786 1.36544-33.09279 48.53744.00019 49.90007a24.975 24.975 0 0 0 24.94981-24.95007 1.00291 1.00291 0 0 0 -1-1z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="m34.98 4a1.003 1.003 0 0 0 -1 1v23.95a1.003 1.003 0 0 0 1 1h23.95a.99654.99654 0 0 0 1-1 24.975 24.975 0 0 0 -24.95-24.95z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconCircularDiagramComponent {
  colorMode = input<"current" | "colored">("current");
}
