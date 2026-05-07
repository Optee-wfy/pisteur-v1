import { ChangeDetectionStrategy, Component } from "@angular/core";
import { LandingProfessionalsComponent } from "../../components/landing-professionals/landing-professionals.component";

@Component({
  selector: "swc-landing-pro-btp-marketplace-page",
  template: `
    <swc-landing-professionals
      firstTitle="Entreprise BTP :"
      secondTitle="Trouvez plus de clients qualifiés sans passer vos journées à prospecter"
      skipNav
    />
  `,
  imports: [LandingProfessionalsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingProMarketplaceBtpPageComponent {}
