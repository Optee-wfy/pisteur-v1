import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "icon-security",
  host: { class: "block", "aria-hidden": "true" },
  template: `
    <svg
      class="flex h-full max-h-full w-full max-w-full items-center justify-center"
      fill="none"
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clip-rule="evenodd"
        d="M3.52369 0.666626C1.96189 0.666626 0.666748 1.95796 0.666748 3.52356V8.95746C0.666748 16.835 5.44736 24.2059 12.8773 27.1047C13.1954 27.2285 13.5725 27.3295 13.9858 27.3333C14.3752 27.3294 14.7604 27.2519 15.121 27.1047C22.5509 24.2059 27.3315 16.835 27.3315 8.95746V3.52356C27.3315 1.96177 26.0364 0.666626 24.4746 0.666626H3.52369Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
      <path
        clip-rule="evenodd"
        d="M20.6641 7.21858C20.947 7.47003 21.1185 7.82348 21.141 8.2013C21.1635 8.57912 21.0351 8.95042 20.7841 9.23367L13.1656 17.8045C12.9276 18.0726 12.5974 18.2414 12.2407 18.2774C11.884 18.3134 11.5268 18.2139 11.24 17.9988L7.43076 15.1418C7.28069 15.0293 7.15426 14.8883 7.05868 14.7268C6.96311 14.5654 6.90026 14.3868 6.87373 14.2011C6.8472 14.0154 6.85751 13.8262 6.90407 13.6445C6.95062 13.4628 7.03252 13.292 7.14507 13.142C7.25762 12.9919 7.39863 12.8655 7.56005 12.7699C7.72146 12.6743 7.90012 12.6115 8.08583 12.5849C8.27153 12.5584 8.46064 12.5687 8.64236 12.6153C8.82408 12.6618 8.99485 12.7437 9.14493 12.8563L11.9028 14.9247L18.6471 7.33666C18.7717 7.19603 18.9227 7.08136 19.0917 6.9992C19.2606 6.91704 19.4441 6.86901 19.6317 6.85786C19.8192 6.84672 20.0071 6.87267 20.1846 6.93424C20.3621 6.99581 20.5257 7.09179 20.666 7.21667L20.6641 7.21858Z"
        fill-rule="evenodd"
        [class]="
          colorMode() === 'colored' ? 'fill-primary-700' : 'fill-current'
        "
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconSecurityComponent {
  colorMode = input<"current" | "semi" | "colored">("current");
}
