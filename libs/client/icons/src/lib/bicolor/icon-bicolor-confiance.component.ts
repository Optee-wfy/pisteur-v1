import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-bicolor-confiance",
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
        d="M8.28541 4C5.94272 4 4 5.937 4 8.28541V16.4363C4 28.2526 11.1709 39.3089 22.3158 43.6572C22.7929 43.8429 23.3586 43.9943 23.9786 44C24.5627 43.9942 25.1405 43.8779 25.6813 43.6572C36.8262 39.3089 43.9971 28.2526 43.9971 16.4363V8.28541C43.9971 5.94272 42.0544 4 39.7117 4H8.28541Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        clip-rule="evenodd"
        d="M33.9942 13.8279C34.4185 14.2051 34.6758 14.7353 34.7095 15.302C34.7433 15.8687 34.5508 16.4257 34.1742 16.8505L22.7464 29.7068C22.3894 30.1089 21.8942 30.3622 21.3591 30.4161C20.824 30.4701 20.2882 30.3209 19.8581 29.9982L14.1442 25.7128C13.9191 25.5439 13.7294 25.3324 13.5861 25.0903C13.4427 24.8482 13.3484 24.5802 13.3086 24.3016C13.2689 24.0231 13.2843 23.7394 13.3541 23.4668C13.424 23.1942 13.5468 22.9381 13.7157 22.713C13.8845 22.4879 14.096 22.2982 14.3381 22.1549C14.5802 22.0115 14.8482 21.9172 15.1268 21.8774C15.4053 21.8376 15.689 21.8531 15.9616 21.9229C16.2342 21.9928 16.4903 22.1156 16.7154 22.2844L20.8523 25.3871L30.9687 14.005C31.1556 13.7941 31.3822 13.6221 31.6356 13.4988C31.889 13.3756 32.1642 13.3035 32.4455 13.2868C32.7268 13.2701 33.0087 13.309 33.2749 13.4014C33.5411 13.4937 33.7865 13.6377 33.9971 13.825L33.9942 13.8279Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-300'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconBicolorConfianceComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
