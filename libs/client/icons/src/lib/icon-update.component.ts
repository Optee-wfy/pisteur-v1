import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-update",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m18 8v3.5a.3.3 0 0 1 -.087.211l-5.978 6.011a1.5 1.5 0 0 0 -.435 1.058v.92a.3.3 0 0 1 -.3.3h-5.2a2.652 2.652 0 0 1 -3-3v-12a2.652 2.652 0 0 1 3-3h6v3a3 3 0 0 0 3 3z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-400' : 'fill-current'
        "
      />
      <path
        d="m15 8h3l-6-6v3a2.652 2.652 0 0 0 3 3z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="m7.75 11a.75.75 0 1 1 -.75-.75.75.75 0 0 1 .75.75zm-.75 3.25a.75.75 0 1 0 .75.75.75.75 0 0 0 -.75-.75zm7.75-3.25a.75.75 0 0 0 -.75-.75h-4.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 .75-.75zm-3 4a.75.75 0 0 0 -.75-.75h-1.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 .75-.75z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="m16.98 14.78 2.24 2.24-4 3.98h-2.22v-2.22zm3.76-.53-.99-.99a.887.887 0 0 0 -1.26 0l-.81.82 2.24 2.24.82-.81a.887.887 0 0 0 0-1.26z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconUpdateComponent {
  colorMode = input<"current" | "colored">("current");
}
