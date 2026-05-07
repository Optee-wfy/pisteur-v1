import { ChangeDetectionStrategy, Component } from "@angular/core";
import { LandingProfessionalsComponent } from "../../components/landing-professionals/landing-professionals.component";

@Component({
  selector: "swc-landing-pro-searchengine-marketplace-page",
  template: `
    <swc-landing-professionals
      firstTitle="Gagnez 4h par semaine"
      secondTitle="grâce à notre moteur de données bâtiment"
      skipNav
    />
  `,
  imports: [LandingProfessionalsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingProMarketplaceSearchEnginePageComponent {}
