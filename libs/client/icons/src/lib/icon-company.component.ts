import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-company",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    @if (displayMode() === "lined") {
      <svg
        class="flex h-full max-h-full w-full max-w-full items-center justify-center"
        fill="none"
        viewBox="0 0 14 16"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.33929 1.26782H11.6607C11.9354 1.26782 12.1989 1.37694 12.3931 1.57118C12.5873 1.76541 12.6964 2.02884 12.6964 2.30354V14.7321H1.30357V2.30354C1.30357 2.02884 1.41269 1.76541 1.60692 1.57118C1.80116 1.37694 2.06459 1.26782 2.33929 1.26782Z"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        />
        <path
          d="M3.89286 3.85706H5.44643"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        />
        <path
          d="M8.55357 3.85706H10.1071"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        />
        <path
          d="M3.89286 6.44641H5.44643"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        />
        <path
          d="M8.55357 6.44641H10.1071"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        />
        <path
          d="M3.89286 9.03564H5.44643"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        />
        <path
          d="M8.55357 9.03564H10.1071"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        />
        <path
          d="M8.29464 11.625H5.70536V14.7321H8.29464V11.625Z"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        />
      </svg>
    } @else {
      <svg
        class="flex h-full max-h-full w-full max-w-full items-center justify-center"
        height="140"
        viewBox="0 0 120 140"
        width="120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clip-rule="evenodd"
          d="M4.3934 4.3934C7.2064 1.58035 11.0218 0 15 0H105C108.978 0 112.794 1.58035 115.607 4.3934C118.42 7.20644 120 11.0217 120 15V135C120 137.761 117.761 140 115 140H75V115C75 112.239 72.7614 110 70 110H50C47.2386 110 45 112.239 45 115V140H5C2.2386 140 0 137.761 0 135V15C0 11.0218 1.5804 7.20644 4.3934 4.3934ZM26.3153 22.9083C22.8635 22.9083 20.0653 25.7065 20.0653 29.1583C20.0653 32.6101 22.8635 35.4083 26.3153 35.4083H43.1576C46.6094 35.4083 49.4076 32.6101 49.4076 29.1583C49.4076 25.7065 46.6094 22.9083 43.1576 22.9083H26.3153ZM70.5923 29.1583C70.5923 25.7065 73.3906 22.9083 76.8423 22.9083H93.685C97.136 22.9083 99.935 25.7065 99.935 29.1583C99.935 32.6101 97.136 35.4083 93.685 35.4083H76.8423C73.3906 35.4083 70.5923 32.6101 70.5923 29.1583ZM26.3153 48.5298C22.8635 48.5298 20.0653 51.328 20.0653 54.7798C20.0653 58.2316 22.8635 61.0298 26.3153 61.0298H43.1576C46.6094 61.0298 49.4076 58.2316 49.4076 54.7798C49.4076 51.328 46.6094 48.5298 43.1576 48.5298H26.3153ZM70.5923 54.7798C70.5923 51.328 73.3906 48.5298 76.8423 48.5298H93.685C97.136 48.5298 99.935 51.328 99.935 54.7798C99.935 58.2316 97.136 61.0298 93.685 61.0298H76.8423C73.3906 61.0298 70.5923 58.2316 70.5923 54.7798ZM26.3153 74.1513C22.8635 74.1513 20.0653 76.9495 20.0653 80.4013C20.0653 83.8531 22.8635 86.6513 26.3153 86.6513H43.1576C46.6094 86.6513 49.4076 83.8531 49.4076 80.4013C49.4076 76.9495 46.6094 74.1513 43.1576 74.1513H26.3153ZM70.5923 80.4013C70.5923 76.9495 73.3906 74.1513 76.8423 74.1513H93.685C97.136 74.1513 99.935 76.9495 99.935 80.4013C99.935 83.8531 97.136 86.6513 93.685 86.6513H76.8423C73.3906 86.6513 70.5923 83.8531 70.5923 80.4013Z"
          fill="currentColor"
          fill-rule="evenodd"
        />
      </svg>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconCompanyComponent {
  displayMode = input<"full" | "lined">("lined");
  colorMode = input<"current" | "colored">("current");
}
