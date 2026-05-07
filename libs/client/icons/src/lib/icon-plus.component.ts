import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-plus",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 448 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPlusComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
