import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { IconSocialsLinkedinComponent } from "@optee/icons";
import { Tooltip } from "primeng/tooltip";

@Component({
  selector: "mkp-linkedin-button",
  template: `
    <span
      [pTooltip]="
        linkedInUrl() ? 'Voir le profil LinkedIn' : 'Profil non disponible'
      "
    >
      <a
        class="bg-primary-500 hover:bg-primary-600 inline-flex items-center gap-2 rounded-lg p-1 text-white disabled:cursor-not-allowed disabled:opacity-50"
        rel="noopener noreferrer"
        target="_blank"
        [attr.aria-disabled]="!linkedInUrl() ? 'true' : null"
        [attr.tabindex]="!linkedInUrl() ? -1 : 0"
        [class.mx-4]="size() !== 'sm'"
        [class.opacity-50]="!linkedInUrl()"
        [class.pointer-events-none]="!linkedInUrl()"
        [href]="linkedInUrl()"
      >
        <icon-social-linkedin
          class="text-white"
          [class.size-2]="size() === 'sm'"
          [class.size-3]="size() === 'md'"
          [class.size-4]="size() === 'lg'"
        />
      </a>
    </span>
  `,
  imports: [IconSocialsLinkedinComponent, Tooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkedInLinkButtonComponent {
  readonly linkedInUrl = input.required<string | null>();
  readonly size = input<"sm" | "md" | "lg">("md");
}
