import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-user-next-to-building",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m16.5,15.5c0-1.379,1.121-2.5,2.5-2.5s2.5,1.121,2.5,2.5-1.121,2.5-2.5,2.5-2.5-1.121-2.5-2.5Zm7.5,6.5v2h-10v-2c0-1.654,1.346-3,3-3h4c1.654,0,3,1.346,3,3Zm-12,2H0V3C0,1.346,1.346,0,3,0h10c1.654,0,3,1.346,3,3v9.17c-.914.824-1.5,2.005-1.5,3.33,0,.7.174,1.354.46,1.945-1.741.783-2.96,2.526-2.96,4.555v2Zm-3-17h3v-2h-3v2Zm0,4h3v-2h-3v2Zm0,4h3v-2h-3v2Zm0,4h3v-2h-3v2Zm-2-2h-3v2h3v-2Zm0-4h-3v2h3v-2Zm0-4h-3v2h3v-2Zm0-4h-3v2h3v-2Z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconUserNextToBuildingComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
