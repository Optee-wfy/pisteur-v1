import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-bicolor-eclairage",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clip-rule="evenodd"
        d="M15.8594 43.6456C15.8594 43.3361 15.9203 43.0295 16.0388 42.7435C16.1573 42.4575 16.3309 42.1977 16.5498 41.9788C16.7687 41.7599 17.0286 41.5862 17.3146 41.4678C17.6006 41.3493 17.9071 41.2883 18.2167 41.2883H29.2174C29.8425 41.2883 30.4421 41.5367 30.8842 41.9788C31.3263 42.4208 31.5746 43.0204 31.5746 43.6456C31.5746 44.2708 31.3263 44.8704 30.8842 45.3125C30.4421 45.7546 29.8425 46.0029 29.2174 46.0029H18.2167C17.5915 46.0029 16.9919 45.7546 16.5498 45.3125C16.1077 44.8704 15.8594 44.2708 15.8594 43.6456Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-300'
        "
      />
      <path
        clip-rule="evenodd"
        d="M31.5729 31.328C34.5689 29.5983 36.9104 26.9283 38.2343 23.7322C39.5582 20.536 39.7904 16.9924 38.8951 13.6508C37.9997 10.3092 36.0267 7.35643 33.2821 5.25044C30.5375 3.14445 27.1747 2.00293 23.7153 2.00293C20.2558 2.00293 16.893 3.14445 14.1484 5.25044C11.4038 7.35643 9.43087 10.3092 8.53549 13.6508C7.64011 16.9924 7.87238 20.536 9.19626 23.7322C10.5201 26.9283 12.8617 29.5983 15.8576 31.328V35.0022C15.8576 35.8358 16.1888 36.6353 16.7782 37.2247C17.3677 37.8142 18.1671 38.1453 19.0007 38.1453H28.4298C29.2634 38.1453 30.0629 37.8142 30.6523 37.2247C31.2418 36.6353 31.5729 35.8358 31.5729 35.0022V31.328Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconBicolorEclairageComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
