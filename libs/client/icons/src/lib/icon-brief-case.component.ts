import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-brief-case",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m26.667 6.87h-4.184v-2.037c0-1.519-1.235-2.754-2.754-2.754h-7.459c-1.519 0-2.754 1.235-2.754 2.754v2.037h-4.183c-2.334 0-4.233 1.9-4.233 4.234v13.091c0 3.157 2.569 5.726 5.727 5.726h18.351c3.156 0 5.724-2.567 5.724-5.723v-13.094c-.002-2.334-1.901-4.234-4.235-4.234zm-15.35-2.037c0-.525.428-.953.953-.953h7.459c.525 0 .953.428.953.953v2.037h-9.365zm17.783 9.817c0 .278-.128.539-.347.71l-3.163 2.46c-.52.41-1.19.64-1.87.64h-4.66v.64c0 1.077-.873 1.95-1.95 1.95h-2.21c-1.078 0-1.96-.882-1.96-1.96v-.63h-4.66c-.68 0-1.35-.23-1.87-.64l-3.163-2.46c-.219-.17-.347-.432-.347-.71 0-.749.861-1.169 1.452-.71l3.148 2.452c.223.174.498.268.78.268h4.66v-.64c0-1.077.873-1.95 1.95-1.95h2.21c1.078 0 1.96.882 1.96 1.96v.63h4.66c.283 0 .557-.094.78-.268l3.148-2.451c.591-.46 1.452-.039 1.452.709z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        d="m17.1 15.87h-2.2c-.09 0-.16.06-.16.15v3.08c0 .08.07.15.16.15h2.2c.09 0 .16-.07.16-.15v-3.08c0-.09-.07-.15-.16-.15z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconBriefCaseComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
