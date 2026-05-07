import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "icon-light-lightbulb-on",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.76095 13.3037H2.15381"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M21.4395 13.3037H23.0466"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M18.8506 7.0534L19.987 5.91699"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M6.34981 7.0534L5.21338 5.91699"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M12.6001 4.46432V2.85718"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M12.6 7.27686C9.27152 7.27686 6.57324 9.97514 6.57324 13.3036C6.57324 15.775 8.06077 17.8989 10.1893 18.829V21.3394C10.1893 21.7831 10.5491 22.1429 10.9929 22.1429H14.2072C14.651 22.1429 15.0107 21.7831 15.0107 21.3394V18.829C17.1393 17.8989 18.6268 15.775 18.6268 13.3036C18.6268 9.97514 15.9285 7.27686 12.6 7.27686Z"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLightLightbulbOnComponent {}
