import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-social-linkedin",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 19 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.849609 2.81507C0.849609 2.23786 1.05232 1.76167 1.45772 1.3865C1.86312 1.01131 2.39016 0.82373 3.0388 0.82373C3.67587 0.82373 4.1913 1.00842 4.58513 1.37784C4.99053 1.7588 5.19324 2.25518 5.19324 2.86702C5.19324 3.42113 4.99633 3.88288 4.6025 4.2523C4.19711 4.63325 3.66428 4.82373 3.00405 4.82373H2.98668C2.3496 4.82373 1.83417 4.63325 1.44034 4.2523C1.04651 3.87135 0.849609 3.39227 0.849609 2.81507ZM1.07548 17.9666V6.39949H4.93262V17.9666H1.07548ZM7.06969 17.9666H10.9268V11.5077C10.9268 11.1037 10.9732 10.792 11.0658 10.5726C11.228 10.1801 11.4741 9.84825 11.8042 9.57697C12.1344 9.30568 12.5484 9.17005 13.0465 9.17005C14.3438 9.17005 14.9925 10.0416 14.9925 11.7848V17.9666H18.8496V11.3345C18.8496 9.62603 18.4442 8.33022 17.6334 7.4471C16.8226 6.56399 15.7512 6.12243 14.4191 6.12243C12.9249 6.12243 11.7608 6.76312 10.9268 8.04451V8.07914H10.9095L10.9268 8.04451V6.39949H7.06969C7.09285 6.76889 7.10444 7.91751 7.10444 9.84537C7.10444 11.7732 7.09285 14.4803 7.06969 17.9666Z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconSocialsLinkedinComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
