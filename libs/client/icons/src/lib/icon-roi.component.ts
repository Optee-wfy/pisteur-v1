import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-roi",
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
        d="M34.8124 4.01955C34.2406 3.92426 33.6676 4.18277 33.3609 4.67454C33.054 5.16631 33.0735 5.79449 33.4105 6.26617L35.0626 8.57928L26.5805 14.0016L20.9799 7.45276C20.3325 6.69571 19.2498 6.48261 18.3637 6.93784L6.16773 13.2041C5.11172 13.7466 4.6955 15.0425 5.23807 16.0986C5.78064 17.1546 7.07655 17.5708 8.13256 17.0282L18.8169 11.5386L24.5286 18.2175C25.2256 19.0324 26.4167 19.2091 27.3202 18.6315L37.5649 12.0825L39.5526 14.8651C39.8894 15.3368 40.4773 15.5591 41.0422 15.4283C41.6069 15.2975 42.0371 14.8395 42.1325 14.2677L43.3607 6.89722C43.4232 6.52229 43.3344 6.13791 43.1134 5.82862C42.8924 5.51933 42.5579 5.31046 42.183 5.24798L34.8124 4.01955Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="M19.2472 18.5703C18.6582 17.5395 17.345 17.1814 16.3142 17.7704L6.28233 23.5029C5.61254 23.8857 5.19919 24.5979 5.19919 25.3694V41.8503C5.19919 43.0375 6.16164 44 7.34888 44H40.3108C41.498 44 42.4605 43.0375 42.4605 41.8503V21.07C42.4605 20.325 42.0747 19.633 41.4409 19.2414C40.8072 18.8497 40.0158 18.8141 39.3494 19.1473L23.9708 26.8366L19.2472 18.5703Z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="M19.2455 18.5703C18.6565 17.5395 17.3433 17.1814 16.3125 17.7704V44H30.6364V23.5029L23.9691 26.8366L19.2455 18.5703Z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconRoiComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
