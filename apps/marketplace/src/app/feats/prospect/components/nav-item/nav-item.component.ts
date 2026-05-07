import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: "mkp-nav-item",
  host: {
    "[class.opacity-50]": "disabled()",
    "[class.pointer-events-none]": "disabled()",
  },
  template: `
    <a
      class="hover:bg-granite-100 text-granite-900 flex min-h-11 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
      routerLinkActive="bg-granite-100"
      [class.bg-granite-100]="active()"
      [routerLink]="routerLink()"
    >
      <ng-content select="[slot=icon]" />
      <span><ng-content /></span>
    </a>
  `,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavItemComponent {
  readonly routerLink = input<string | string[]>();
  readonly disabled = input<boolean>(false);
  readonly active = input<boolean>(false);
}
