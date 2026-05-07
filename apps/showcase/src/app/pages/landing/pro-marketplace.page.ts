import { ChangeDetectionStrategy, Component } from "@angular/core";
import { LandingProfessionalsComponent } from "../../components/landing-professionals/landing-professionals.component";

@Component({
  selector: "swc-landing-pro-marketplace-page",
  template: `
    <swc-landing-professionals
      firstTitle="La machine à projets B2B"
      secondTitle="pour les professionnels du bâtiment."
      skipNav
    />
  `,
  imports: [LandingProfessionalsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingProMarketplacePageComponent {}
