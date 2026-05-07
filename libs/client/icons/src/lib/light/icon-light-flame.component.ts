import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "icon-light-flame",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 24 25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.6342 2.14192C10.5373 2.08403 10.4265 2.05347 10.3137 2.05347C10.2008 2.05347 10.09 2.08403 9.9931 2.14192C9.91316 2.20526 9.85923 2.2957 9.8415 2.39614C9.82379 2.49657 9.84351 2.60001 9.89693 2.68688C11.8684 6.1009 12.2851 10.7491 9.59239 13.3136C8.55636 12.443 7.73386 11.3463 7.18816 10.108C6.19237 10.661 5.36712 11.4763 4.80198 12.4653C4.23685 13.4543 3.95343 14.5792 3.9825 15.7178C4.02316 16.7217 4.26418 17.7072 4.69139 18.6165C5.11861 19.5258 5.72337 20.3403 6.47012 21.0124C7.21686 21.6846 8.09049 22.2004 9.03958 22.5299C9.9887 22.8592 10.9941 22.9955 11.9966 22.9306C17.1577 22.9306 19.8344 19.725 20.0107 15.7178C20.2192 10.9094 16.8051 4.99496 10.6342 2.14192Z"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLightFlameComponent {}
