import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-optimise",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 27 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clip-rule="evenodd"
        d="M20.5417 0.679723C20.1605 0.616195 19.7785 0.788534 19.574 1.11638C19.3694 1.44423 19.3824 1.86302 19.6071 2.17747L20.7085 3.71954L15.0537 7.33444L11.32 2.96853C10.8884 2.46382 10.1666 2.32176 9.57591 2.62525L1.44524 6.80273C0.741229 7.16443 0.463745 8.02838 0.825458 8.73239C1.18717 9.4364 2.05112 9.71387 2.75512 9.35215L9.87805 5.69244L13.6858 10.145C14.1505 10.6883 14.9445 10.8061 15.5469 10.421L22.3767 6.055L23.7018 7.9101C23.9264 8.22457 24.3183 8.37275 24.6949 8.28558C25.0713 8.19839 25.3581 7.89302 25.4218 7.51184L26.2406 2.59817C26.2822 2.34821 26.223 2.09196 26.0757 1.88577C25.9283 1.67957 25.7053 1.54033 25.4554 1.49867L20.5417 0.679723Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="M10.1649 10.3802C9.77221 9.69302 8.89678 9.45428 8.20959 9.84696L1.52166 13.6686C1.07513 13.9238 0.799561 14.3986 0.799561 14.9129V25.9002C0.799561 26.6917 1.44119 27.3334 2.23269 27.3334H24.2073C24.9988 27.3334 25.6404 26.6917 25.6404 25.9002V12.0467C25.6404 11.55 25.3832 11.0887 24.9607 10.8276C24.5382 10.5665 24.0107 10.5427 23.5664 10.7649L13.314 15.8911L10.1649 10.3802Z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="M10.1638 10.3802C9.77114 9.69302 8.89571 9.45428 8.2085 9.84696V27.3334H17.7577V13.6686L13.3129 15.8911L10.1638 10.3802Z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconOptimiseComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
