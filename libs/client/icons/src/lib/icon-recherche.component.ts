import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-recherche",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clip-rule="evenodd"
        d="M6.4761 14.0951C6.4761 9.88722 9.88722 6.4761 14.0951 6.4761C18.3029 6.4761 21.714 9.88722 21.714 14.0951C21.714 18.3029 18.3029 21.714 14.0951 21.714C9.88722 21.714 6.4761 18.3029 6.4761 14.0951ZM14.0951 2.66663C7.78331 2.66663 2.66663 7.78331 2.66663 14.0951C2.66663 20.4068 7.78331 25.5235 14.0951 25.5235C16.5632 25.5235 18.8486 24.741 20.7167 23.4107L26.0814 28.7754C26.8252 29.5192 28.0313 29.5192 28.7751 28.7754C29.5189 28.0316 29.5189 26.8256 28.7751 26.0818L23.4106 20.7172C24.741 18.8489 25.5235 16.5634 25.5235 14.0951C25.5235 7.78331 20.4068 2.66663 14.0951 2.66663Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconRechercheComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
