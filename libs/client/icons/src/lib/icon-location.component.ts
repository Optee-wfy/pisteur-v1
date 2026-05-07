import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-location",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21,12.198l3.182,1.363c1.102969.473102,1.818004,1.557848,1.818,2.758L26,27c0,.552285-.447715,1-1,1h-4.171c.111-.313.171-.649.171-1v-14.802Z"
        fill-rule="evenodd"
        transform="matrix(1.333333 0 0 1.333333-5.333328-5.333332)"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-400'
        "
      />
      <path
        d="M18.012,4c.547593.006572.988039.452368.988,1v22c.000046.547248-.439799.992886-.987,1L7,28c-.552285,0-1-.447715-1-1v-16.599c-.000226-1.261805.789129-2.388883,1.975-2.82L17.658,4.06c.106-.038.215-.058.324-.06h.015.015ZM14.013,21c.552285-.00359.99709-.454215.9935-1.0065s-.454215-.99709-1.0065-.9935h-3c-.552285,0-1,.447715-1,1s.447715,1,1,1h3h.013Zm0-4c.552285-.00359.99709-.454215.9935-1.0065s-.454215-.99709-1.0065-.9935h-3c-.552285,0-1,.447715-1,1s.447715,1,1,1h3h.013Zm0-4c.552285-.00359.99709-.454215.9935-1.0065s-.454215-.99709-1.0065-.9935h-3c-.552285,0-1,.447715-1,1s.447715,1,1,1h3h.013Z"
        fill-rule="evenodd"
        transform="matrix(1.333333 0 0 1.333333-5.333328-5.333332)"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLocationComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
