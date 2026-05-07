import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "icon-light-ventilation",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.4354 2.85718H4.36398C3.47639 2.85718 2.75684 3.57673 2.75684 4.46432V11.6965C2.75684 12.5841 3.47639 13.3036 4.36398 13.3036H20.4354C21.323 13.3036 22.0425 12.5841 22.0425 11.6965V4.46432C22.0425 3.57673 21.323 2.85718 20.4354 2.85718Z"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M18.0249 13.3035V10.8928C18.0249 10.4665 17.8555 10.0578 17.5542 9.75636C17.2528 9.45497 16.844 9.28564 16.4178 9.28564H8.38205C7.9558 9.28564 7.54702 9.45497 7.24562 9.75636C6.94423 10.0578 6.7749 10.4665 6.7749 10.8928V13.3035"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M5.16748 20.5357H5.32819C6.57084 20.5357 7.57819 19.5283 7.57819 18.2857V16.5178"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M19.6319 20.5357H19.4712C18.2285 20.5357 17.2212 19.5283 17.2212 18.2857V16.5178"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M12.3999 22.1428V16.5178"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLightVentilationComponent {}
