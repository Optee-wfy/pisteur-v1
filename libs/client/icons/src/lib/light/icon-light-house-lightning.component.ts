import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "icon-light-house-lightning",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.15674 12.4034V20.5357C3.15674 21.4234 3.87629 22.1429 4.76388 22.1429H20.8353C21.7229 22.1429 22.4425 21.4234 22.4425 20.5357V12.4034C22.4425 11.953 22.2535 11.5231 21.9213 11.2187L12.7996 2.85718L3.6779 11.2187C3.34582 11.5231 3.15674 11.953 3.15674 12.4034Z"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M13.603 9.28564L10.3887 14.1071H15.2101L11.9958 18.9285"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLightHouseLightningComponent {}
