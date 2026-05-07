import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-dpe",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 32 33"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 4.5C0 2.29086 1.79086 0.5 4 0.5H28C30.2091 0.5 32 2.29086 32 4.5V28.5C32 30.7091 30.2091 32.5 28 32.5H4C1.79086 32.5 0 30.7091 0 28.5V4.5Z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="M17.7909 15.904C18.3882 16.0253 18.8689 16.31 19.2329 16.758C19.6062 17.206 19.7929 17.7287 19.7929 18.326C19.7929 19.1473 19.5175 19.8007 18.9669 20.286C18.4162 20.762 17.6182 21 16.5729 21H12.6389V11.116H16.5029C17.4922 11.116 18.2482 11.34 18.7709 11.788C19.3029 12.2267 19.5689 12.8333 19.5689 13.608C19.5689 14.2333 19.4055 14.742 19.0789 15.134C18.7522 15.5167 18.3229 15.7733 17.7909 15.904ZM14.2349 15.372H16.2089C16.7689 15.372 17.1935 15.2413 17.4829 14.98C17.7815 14.7187 17.9309 14.3547 17.9309 13.888C17.9309 13.4307 17.7815 13.0713 17.4829 12.81C17.1935 12.5487 16.7502 12.418 16.1529 12.418H14.2349V15.372ZM16.2509 19.684C16.8575 19.684 17.3242 19.5487 17.6509 19.278C17.9869 18.998 18.1549 18.6107 18.1549 18.116C18.1549 17.6213 17.9869 17.234 17.6509 16.954C17.3149 16.674 16.8435 16.534 16.2369 16.534H14.2349V19.684H16.2509Z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconDpeComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
