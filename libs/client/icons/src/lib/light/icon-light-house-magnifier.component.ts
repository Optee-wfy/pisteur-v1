import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "icon-light-house-magnifier",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.3963 21.3392C16.7219 21.3392 21.0391 17.0219 21.0391 11.6963C21.0391 6.37072 16.7219 2.05347 11.3963 2.05347C6.07067 2.05347 1.75342 6.37072 1.75342 11.6963C1.75342 17.0219 6.07067 21.3392 11.3963 21.3392Z"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M18.2104 18.5105L22.6462 22.9462"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M6.97656 9.68736L11.3962 6.07129L15.8158 9.68736V14.107C15.8158 14.9946 15.0963 15.7141 14.2087 15.7141H8.58371C7.69611 15.7141 6.97656 14.9946 6.97656 14.107V9.68736Z"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLightHouseMagnifierComponent {}
