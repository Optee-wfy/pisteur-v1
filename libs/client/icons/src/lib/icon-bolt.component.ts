import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-bolt",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.52258 1.80991C9.52252 1.70832 9.48996 1.6094 9.42968 1.52762C9.36939 1.44584 9.28453 1.38549 9.1875 1.35538C9.09046 1.32527 8.98634 1.32698 8.89035 1.36027C8.79436 1.39355 8.71153 1.45666 8.65397 1.54038L3.41565 9.15975C3.36656 9.23125 3.33793 9.3148 3.33285 9.40138C3.32777 9.48796 3.34643 9.57428 3.38681 9.65103C3.4272 9.72779 3.48778 9.79205 3.56201 9.83689C3.63625 9.88174 3.72132 9.90546 3.80805 9.90549H6.66531V14.1914C6.66537 14.293 6.69792 14.3919 6.75821 14.4737C6.8185 14.5555 6.90336 14.6158 7.00039 14.6459C7.09742 14.676 7.20154 14.6743 7.29754 14.641C7.39353 14.6078 7.47636 14.5446 7.53392 14.4609L12.7722 6.84156C12.8213 6.77006 12.85 6.68651 12.855 6.59993C12.8601 6.51335 12.8415 6.42702 12.8011 6.35027C12.7607 6.27352 12.7001 6.20925 12.6259 6.16441C12.5516 6.11956 12.4666 6.09584 12.3798 6.09581H9.52258V1.80991Z"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-700'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconBoltComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
