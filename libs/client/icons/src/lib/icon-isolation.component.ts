import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-isolation",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 6.94436C2 4.81263 2 3.74677 2.25168 3.38819C2.50335 3.02961 3.50555 2.68656 5.50994 2.00045L5.89182 1.86973C6.93666 1.51208 7.45907 1.33325 8 1.33325C8.54093 1.33325 9.06335 1.51208 10.1082 1.86973L10.4901 2.00045C12.4945 2.68656 13.4966 3.02961 13.7483 3.38819C14 3.74677 14 4.81263 14 6.94436C14 7.26635 14 7.61553 14 7.99416C14 11.7529 11.174 13.5769 9.40096 14.3514C8.91999 14.5615 8.67951 14.6666 8 14.6666C7.32049 14.6666 7.08001 14.5615 6.59904 14.3514C4.82597 13.5769 2 11.7529 2 7.99416C2 7.61553 2 7.26635 2 6.94436Z"
        stroke="none"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="M10.6666 7.70016L8.39992 6.00016C8.16288 5.82238 7.83696 5.82239 7.59992 6.00016L5.33325 7.70016M9.33325 9.36683L7.99992 8.36683L6.66659 9.36683"
        stroke="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconIsolationComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
