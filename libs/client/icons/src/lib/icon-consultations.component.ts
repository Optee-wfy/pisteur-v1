import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-consultations",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        clip-rule="evenodd"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-700'
        "
      >
        <path
          d="m4 16c0-7.73199 6.268-14 14-14h22c7.732 0 14 6.26801 14 14v17.1814c-.6486-.1192-1.317-.1814-2-.1814h-10c-6.0751 0-11 4.9249-11 11v10c0 3.1521 1.3258 5.9945 3.4501 8h-16.4501c-7.732 0-14-6.268-14-14zm13 10c-1.1046 0-2 .8954-2 2s.8954 2 2 2h24c1.1046 0 2-.8954 2-2s-.8954-2-2-2zm-2-6c0-1.1046.8954-2 2-2h14c1.1046 0 2 .8954 2 2s-.8954 2-2 2h-14c-1.1046 0-2-.8954-2-2z"
        />
        <path
          d="m42 36c-4.4183 0-8 3.5817-8 8v10c0 4.4183 3.5817 8 8 8h10c4.4183 0 8-3.5817 8-8v-10c0-4.4183-3.5817-8-8-8zm10.5909 11.2121c.6694-.8786.4998-2.1335-.3788-2.803-.8786-.6694-2.1335-.4998-2.803.3788l-3.8051 4.9943-1.0616-1.2861c-.7031-.8519-1.9637-.9724-2.8155-.2693-.8519.7031-.9725 1.9637-.2693 2.8156l2.6666 3.2307c.3886.4709.971.7384 1.5814.7265s1.1819-.3019 1.5519-.7875z"
        />
      </g>
    </svg>
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconConsultationsComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
