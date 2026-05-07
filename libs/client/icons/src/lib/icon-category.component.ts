import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-category",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 34 34"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        id="XMLID_622_"
        d="m16 21.5v8c0 1.93-1.57 3.5-3.5 3.5h-8c-1.93 0-3.5-1.57-3.5-3.5v-8c0-1.93 1.57-3.5 3.5-3.5h8c1.93 0 3.5 1.57 3.5 3.5z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        id="XMLID_621_"
        d="m33 4.5v8c0 1.93-1.57 3.5-3.5 3.5h-8c-1.93 0-3.5-1.57-3.5-3.5v-8c0-1.93 1.57-3.5 3.5-3.5h8c1.93 0 3.5 1.57 3.5 3.5z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        id="XMLID_620_"
        d="m33 21.5v8c0 1.93-1.57 3.5-3.5 3.5h-8c-1.93 0-3.5-1.57-3.5-3.5v-8c0-1.93 1.57-3.5 3.5-3.5h8c1.93 0 3.5 1.57 3.5 3.5z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        id="XMLID_619_"
        d="m16 4.5v8c0 1.93-1.57 3.5-3.5 3.5h-8c-1.93 0-3.5-1.57-3.5-3.5v-8c0-1.93 1.57-3.5 3.5-3.5h8c1.93 0 3.5 1.57 3.5 3.5z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconCategoryComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
