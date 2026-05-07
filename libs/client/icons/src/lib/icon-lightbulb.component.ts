import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-lightbulb",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 15 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clip-rule="evenodd"
        d="M3.57227 18.9289C3.57227 18.7882 3.59998 18.6488 3.65383 18.5188C3.70767 18.3889 3.78659 18.2707 3.88609 18.1712C3.98558 18.0718 4.1037 17.9928 4.23369 17.939C4.36369 17.8851 4.50301 17.8574 4.64372 17.8574H9.64384C9.92801 17.8574 10.2005 17.9703 10.4015 18.1712C10.6024 18.3722 10.7153 18.6447 10.7153 18.9289C10.7153 19.213 10.6024 19.4856 10.4015 19.6865C10.2005 19.8874 9.92801 20.0003 9.64384 20.0003H4.64372C4.35955 20.0003 4.08702 19.8874 3.88609 19.6865C3.68515 19.4856 3.57227 19.213 3.57227 18.9289Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-400'
        "
      />
      <path
        clip-rule="evenodd"
        d="M10.7145 13.3291C12.0763 12.5429 13.1406 11.3293 13.7423 9.87655C14.3441 8.42381 14.4496 6.81312 14.0427 5.29428C13.6357 3.77543 12.7389 2.43331 11.4914 1.47608C10.2439 0.518851 8.71546 0 7.14303 0C5.57061 0 4.04212 0.518851 2.79463 1.47608C1.54714 2.43331 0.650369 3.77543 0.243395 5.29428C-0.163578 6.81312 -0.0580078 8.42381 0.543733 9.87655C1.14547 11.3293 2.20976 12.5429 3.57152 13.3291V14.9991C3.57152 15.378 3.72203 15.7414 3.98995 16.0093C4.25786 16.2772 4.62123 16.4277 5.00012 16.4277H9.28594C9.66483 16.4277 10.0282 16.2772 10.2961 16.0093C10.564 15.7414 10.7145 15.378 10.7145 14.9991V13.3291Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLightbulbComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
