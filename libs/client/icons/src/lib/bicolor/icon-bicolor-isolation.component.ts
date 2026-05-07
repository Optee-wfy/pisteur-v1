import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-bicolor-isolation",
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
        d="M2.99943 20.9987C2.68421 21.2926 2.43282 21.6483 2.26089 22.0435C2.08895 22.4387 2.00015 22.8651 2 23.2961V41.2858C2 41.9049 2.12194 42.5179 2.35885 43.0899C2.59577 43.6619 2.94302 44.1816 3.38078 44.6193C3.81854 45.0571 4.33824 45.4043 4.91021 45.6413C5.48217 45.8782 6.0952 46.0001 6.71429 46.0001H41.2857C42.536 46.0001 43.7351 45.5034 44.6192 44.6193C45.5033 43.7352 46 42.5361 46 41.2858V23.2961C45.9998 22.8651 45.911 22.4387 45.7391 22.0435C45.5672 21.6483 45.3158 21.2926 45.0006 20.9987L25.0214 2.37725C24.7368 2.13379 24.3746 2 24 2C23.6254 2 23.2632 2.13379 22.9786 2.37725L2.99943 20.9987Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        clip-rule="evenodd"
        d="M23.2143 29.4996H23.2771H24.7229H24.7857H28.7237V20.071H19.2951V29.4996H23.2143ZM16.916 42.071H16.982H18.4246H18.4874H22.4286V32.6425H13V42.071H16.916ZM29.5566 42.071H29.4906H25.5714V32.6425H35V42.071H31.062H30.9991H29.5566Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-300'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconBicolorIsolationComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
