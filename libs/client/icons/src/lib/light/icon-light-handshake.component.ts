import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-light-handshake",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.2931 16.9766L14.2652 20.7008C13.2021 21.5008 11.7866 21.5534 10.6647 20.8345L1.95361 15.2527"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        [class]="
          colorMode() === 'colored' ? 'stroke-primary-700' : 'stroke-current'
        "
      />
      <path
        d="M22.8462 14.3512L19.293 16.964L13.7418 11.337L11.8127 12.8246C10.9389 13.4985 9.68223 13.3219 9.02772 12.4333C8.42498 11.615 8.54412 10.4721 9.30265 9.79586L11.8008 7.5687C12.6259 6.8331 13.6786 6.40343 14.7825 6.35161L18.4481 6.1796L22.8462 3.66064"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        [class]="
          colorMode() === 'colored' ? 'stroke-primary-700' : 'stroke-current'
        "
      />
      <path
        d="M13.7427 11.3459C15.0748 12.6029 16.964 11.9616 17.6665 10.9355"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        [class]="
          colorMode() === 'colored' ? 'stroke-primary-700' : 'stroke-current'
        "
      />
      <path
        d="M1.95361 4.44067L5.52031 6.47461L8.70045 5.89118C9.77795 5.69351 10.8797 6.01898 11.7028 6.77812L12.1551 7.26127"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        [class]="
          colorMode() === 'colored' ? 'stroke-primary-700' : 'stroke-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLightHandshakeComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
