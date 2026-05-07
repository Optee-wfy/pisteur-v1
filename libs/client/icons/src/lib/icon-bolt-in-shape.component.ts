import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-bolt-in-shape",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m12 1c-7.71 0-11 3.29-11 11s3.29 11 11 11 11-3.29 11-11-3.29-11-11-11zm.64 17.768c-.422.352-1.053.298-1.408-.128-.353-.423-.296-1.053.126-1.407.023-.02 2.072-1.772 2.545-4.233h-4.903c-.552 0-1-.448-1-1 0-3.923 3.223-6.654 3.36-6.768.424-.354 1.055-.297 1.408.128.354.424.296 1.055-.128 1.408-.021.019-2.07 1.771-2.543 4.232h4.903c.552 0 1 .448 1 1 0 3.923-3.223 6.654-3.36 6.768z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconBoltInShapeComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
