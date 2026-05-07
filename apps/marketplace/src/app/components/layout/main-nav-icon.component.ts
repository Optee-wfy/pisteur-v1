import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import {
  IconConsultationsComponent,
  IconHomeComponent,
  IconLocationComponent,
  IconOpportunitiesComponent,
  IconRechercheComponent,
  IconSquareGridComponent,
  IconUserComponent,
} from "@optee/icons";

@Component({
  selector: "mkp-main-nav-icon",
  host: { class: "block" },
  template: `
    @if (headerIcon() === "home") {
      <icon-home [colorMode]="colorMode()" />
    }

    @if (headerIcon() === "dashboard") {
      <icon-square-grid [colorMode]="colorMode()" />
    }

    @if (headerIcon() === "opportunities") {
      <icon-opportunities [colorMode]="colorMode()" />
    }

    @if (headerIcon() === "consultations") {
      <icon-consultations [colorMode]="colorMode()" />
    }

    @if (headerIcon() === "sites") {
      <icon-location [colorMode]="colorMode()" />
    }

    @if (headerIcon() === "lens") {
      <icon-recherche [colorMode]="colorMode()" />
    }
    @if (headerIcon() === "user") {
      <icon-user [colorMode]="colorMode()" />
    }
  `,
  imports: [
    IconHomeComponent,
    IconSquareGridComponent,
    IconOpportunitiesComponent,
    IconConsultationsComponent,
    IconLocationComponent,
    IconRechercheComponent,
    IconUserComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNavIconComponent {
  headerIcon = input.required<HeaderIcon>();
  colorMode = input<"current" | "semi" | "colored">("current");
}

export type HeaderIcon =
  | "home"
  | "dashboard"
  | "opportunities"
  | "consultations"
  | "sites"
  | "user"
  | "lens";
