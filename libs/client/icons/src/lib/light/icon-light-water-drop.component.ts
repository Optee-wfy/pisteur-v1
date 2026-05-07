import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "icon-light-water-drop",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.8356 14.9106C20.8356 19.3486 17.2379 22.9463 12.7999 22.9463C8.36188 22.9463 4.76416 19.3486 4.76416 14.9106C4.76416 10.0892 12.7999 2.05347 12.7999 2.05347C12.7999 2.05347 20.8356 10.0892 20.8356 14.9106Z"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLightWaterDropComponent {}
