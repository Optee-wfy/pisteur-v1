import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "icon-pappers-logo",
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect fill="#1A46A8" height="24" rx="4" width="24" />
      <path
        d="M9 6h4.2c2.1 0 3.8 1.7 3.8 3.8S15.3 13.5 13.2 13.5H11v4.5H9V6zm2 2v3.5h2.2c1 0 1.8-.8 1.8-1.8S14.2 8 13.2 8H11z"
        fill="white"
      />
    </svg>
  `,
})
export class IconPappersLogoComponent {}
