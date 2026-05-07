import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-arrow",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clip-rule="evenodd"
        d="M14.5281 8.14808C14.5724 8.10385 14.6076 8.05131 14.6316 7.99346C14.6556 7.93561 14.668 7.87359 14.668 7.81096C14.668 7.74833 14.6556 7.68631 14.6316 7.62846C14.6076 7.57062 14.5724 7.51807 14.5281 7.47384L11.195 4.14072C11.1284 4.07395 11.0434 4.02847 10.951 4.01002C10.8585 3.99158 10.7626 4.00101 10.6755 4.03712C10.5884 4.07323 10.514 4.13439 10.4617 4.21285C10.4093 4.29131 10.3815 4.38354 10.3817 4.47784L10.3817 6.85864L2.28696 6.85864C2.03438 6.85864 1.79216 6.95897 1.61356 7.13757C1.43497 7.31616 1.33463 7.55839 1.33463 7.81096C1.33463 8.06353 1.43497 8.30576 1.61356 8.48435C1.79216 8.66295 2.03438 8.76328 2.28696 8.76328L10.3817 8.76328L10.3817 11.1441C10.3815 11.2384 10.4093 11.3306 10.4617 11.4091C10.514 11.4875 10.5884 11.5487 10.6755 11.5848C10.7626 11.6209 10.8585 11.6303 10.951 11.6119C11.0434 11.5935 11.1284 11.548 11.195 11.4812L14.5281 8.14808Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconArrowComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
