import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-chart-bis",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m.5 23.6c0 .5.4.9.9.9h2.7c.5 0 .9-.4.9-.9v-4.6c0-.5-.4-.9-.9-.9h-2.7c-.5 0-.9.4-.9.9z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="m7.9 24.4h2.7c.5 0 .9-.4.9-.9v-8.7c0-.5-.4-.9-.9-.9h-2.7c-.5.1-.9.5-.9.9v8.7c0 .6.4.9.9.9z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="m14.4 14.9c-.5 0-.9.4-.9.9v7.8c0 .5.4.9.9.9h2.7c.5 0 .9-.4.9-.9v-7.8c0-.5-.4-.9-.9-.9z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="m24.5 23.6v-12.8c0-.5-.4-.9-.9-.9h-2.7c-.5 0-.9.4-.9.9v12.8c0 .5.4.9.9.9h2.7c.5-.1.9-.5.9-.9z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="m2 10.5c.4.4 1 .4 1.4 0l5.9-5.5 5.8 5.6c.2.2.4.3.7.3.3 0 .5-.1.7-.3l5.3-5.6.6.5c.3.2.7.3 1 .2.3-.2.6-.5.6-.9l.4-3.1c0-.3-.1-.7-.3-.9-.2-.2-.6-.3-.9-.2l-3.1.7c-.4.1-.6.4-.7.7-.1.4 0 .7.3 1l.6.5-4.6 4.8-5.7-5.4c-.4-.4-1-.4-1.4 0l-6.6 6.1c-.4.4-.4 1.1 0 1.5z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconChartBisComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
