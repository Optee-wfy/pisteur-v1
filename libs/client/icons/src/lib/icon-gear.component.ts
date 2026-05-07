import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-gear",
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
        d="m3.97.492-.332.854-1.138.646-.908-.138a.77.77 0 0 0-.769.377l-.308.538a.77.77 0 0 0 .062.87l.577.715v1.292l-.562.716a.77.77 0 0 0-.061.869l.307.538a.769.769 0 0 0 .77.377l.907-.138 1.123.646.331.854a.769.769 0 0 0 .716.492h.646a.769.769 0 0 0 .715-.492l.33-.854L7.5 8.008l.908.138a.77.77 0 0 0 .769-.377l.308-.538a.77.77 0 0 0-.062-.87l-.577-.715V4.354l.562-.716a.77.77 0 0 0 .061-.869l-.307-.538a.769.769 0 0 0-.77-.377l-.907.138-1.123-.646L6.03.492A.77.77 0 0 0 5.315 0h-.63a.77.77 0 0 0-.716.492ZM5 6.607a1.607 1.607 0 1 0 0-3.214 1.607 1.607 0 0 0 0 3.214Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'current' ? 'fill-current' : 'fill-primary-700'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconGearComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
