import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-person",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clip-rule="evenodd"
        d="M2.14425 2.5C2.14425 1.11929 3.26355 0 4.64425 0C6.02497 0 7.14425 1.11929 7.14425 2.5C7.14425 3.88071 6.02497 5 4.64425 5C3.26355 5 2.14425 3.88071 2.14425 2.5ZM4.64417 5.71429C2.56365 5.71429 0.780731 6.98493 0.0275152 8.79114C-0.0184527 8.90136 -0.00627983 9.02729 0.0599537 9.12664C0.126187 9.226 0.237714 9.28572 0.357144 9.28572H8.93118C9.05061 9.28572 9.16218 9.226 9.2284 9.12664C9.29461 9.02729 9.30682 8.90136 9.26082 8.79114C8.50761 6.98493 6.7247 5.71429 4.64417 5.71429Z"
        fill="currentColor"
        fill-rule="evenodd"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPersonComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
