import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "icon-light-house-leaf",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.55664 12.4034V20.5357C2.55664 21.4234 3.27619 22.1429 4.16378 22.1429H20.2352C21.1228 22.1429 21.8424 21.4234 21.8424 20.5357V12.4034C21.8424 11.953 21.6534 11.5231 21.3212 11.2187L12.1995 2.85718L3.0778 11.2187C2.74572 11.5231 2.55664 11.953 2.55664 12.4034Z"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M13.7769 15.8772C12.903 17.2621 12.1994 19.3272 12.1994 22.1429C12.1994 20.8429 11.4648 19.221 10.1729 17.9411"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M17.1183 15.8119C16.1768 16.7533 14.6505 16.7533 13.709 15.8119C12.7676 14.8704 12.7676 13.3441 13.709 12.4026C14.6505 11.4612 17.8244 11.6966 17.8244 11.6966C17.8244 11.6966 18.0596 14.8704 17.1183 15.8119Z"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M6.50323 18.2486C7.44468 19.1901 8.97106 19.1901 9.91249 18.2486C10.8539 17.3072 10.8539 15.7808 9.91249 14.8394C8.97106 13.8979 5.79714 14.1333 5.79714 14.1333C5.79714 14.1333 5.5618 17.3072 6.50323 18.2486Z"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLightHouseLeafComponent {}
