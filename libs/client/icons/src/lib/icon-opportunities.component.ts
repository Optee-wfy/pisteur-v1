import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-opportunities",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 426.667 426.667"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M213.333,236.8c13.013,0,23.467-10.56,23.467-23.467s-10.453-23.467-23.467-23.467c-12.907,0-23.467,10.56-23.467,23.467
				S200.427,236.8,213.333,236.8z"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-700'
        "
      />
      <path
        d="M213.333,0C95.467,0,0,95.467,0,213.333c0,117.76,95.467,213.333,213.333,213.333s213.333-95.573,213.333-213.333
				C426.667,95.467,331.2,0,213.333,0z M260.053,260.053l-174.72,81.28l81.28-174.72l174.72-81.28L260.053,260.053z"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-700'
        "
      />
    </svg>
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconOpportunitiesComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
