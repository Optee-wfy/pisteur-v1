import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-exclamation-diamond",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m23.161,9.873L14.122.834c-1.134-1.133-3.11-1.133-4.243,0L.839,9.873c-1.17,1.17-1.17,3.073,0,4.243l9.039,9.039c.567.566,1.32.879,2.122.879s1.555-.312,2.121-.879l9.04-9.039c1.17-1.17,1.17-3.073,0-4.243Zm-10.161,8.127h-2v-2h2v2Zm0-4h-2V6h2v8Z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconExclamationDiamondComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
