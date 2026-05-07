import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "icon-microsoft-logo",
  template: `
    <svg viewBox="0 0 23 23" aria-hidden="true">
      <path d="M0 0h23v23H0z" fill="#f3f3f3" />
      <path d="M1 1h10v10H1z" fill="#f35325" />
      <path d="M12 1h10v10H12z" fill="#81bc06" />
      <path d="M1 12h10v10H1z" fill="#05a6f0" />
      <path d="M12 12h10v10H12z" fill="#ffba08" />
    </svg>
  `,
})
export class IconMicrosoftLogoComponent {}
