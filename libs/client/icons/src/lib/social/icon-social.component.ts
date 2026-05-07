import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { SocialNetwork } from "@optee/constants";
import { IconSocialsFacebookComponent } from "./icon-social-facebook.component";
import { IconSocialsInstagramComponent } from "./icon-social-instagram.component";
import { IconSocialsLinkedinComponent } from "./icon-social-linkedin.component";
import { IconSocialsTwitterComponent } from "./icon-social-twitter.component";
import { IconSocialsYoutubeComponent } from "./icon-social-youtube.component";

@Component({
  selector: "icon-social",
  template: `
    @switch (socialNetwork()) {
      @case ("facebook") {
        <icon-social-facebook [colorMode]="colorMode()" />
      }
      @case ("instagram") {
        <icon-social-instagram [colorMode]="colorMode()" />
      }
      @case ("linkedin") {
        <icon-social-linkedin [colorMode]="colorMode()" />
      }
      @case ("twitter") {
        <icon-social-twitter [colorMode]="colorMode()" />
      }
      @case ("youtube") {
        <icon-social-youtube [colorMode]="colorMode()" />
      }
      @default {
        <svg
          class="flex h-full max-h-full w-full max-w-full items-center justify-center"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="50"
            cy="50"
            fill="none"
            r="30"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="4"
          />
          <text
            fill="currentColor"
            font-family="Arial, sans-serif"
            font-size="16"
            text-anchor="middle"
            x="50"
            y="58"
          >
            ?
          </text>
        </svg>
      }
    }
  `,
  imports: [
    IconSocialsFacebookComponent,
    IconSocialsInstagramComponent,
    IconSocialsLinkedinComponent,
    IconSocialsTwitterComponent,
    IconSocialsYoutubeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconSocialComponent {
  socialNetwork = input.required<SocialNetwork | null>();
  colorMode = input<"current" | "semi" | "colored">("current");
}
