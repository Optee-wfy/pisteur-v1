import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "icon-light-shield",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.2427 9.79241V6.8749C22.2427 5.9873 21.5232 5.26775 20.6356 5.26775H18.8727C17.413 5.26775 15.9967 4.77095 14.8569 3.85904L12.5999 2.05347L10.3429 3.85906C9.20303 4.77095 7.78675 5.26775 6.32702 5.26775H4.56417C3.67658 5.26775 2.95703 5.9873 2.95703 6.8749V9.79241C2.95703 15.634 6.93272 20.7259 12.5999 22.1428C18.267 20.7259 22.2427 15.634 22.2427 9.79241Z"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLightShieldComponent {}
