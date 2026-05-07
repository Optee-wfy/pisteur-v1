import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-social-facebook",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 11 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.31339 18.7522V10.5416H10.2081L10.6415 7.3417H7.31331V5.29873C7.31331 4.3723 7.58348 3.74098 8.97893 3.74098L10.7586 3.74019V0.878269C10.4508 0.839343 9.39429 0.752197 8.16531 0.752197C5.59929 0.752197 3.84255 2.24337 3.84255 4.98192V7.3417H0.94043V10.5416H3.84255V18.7521H7.31339V18.7522Z"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconSocialsFacebookComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
