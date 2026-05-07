import { ChangeDetectionStrategy, Component } from "@angular/core";
import { LandingProfessionalsComponent } from "../components/landing-professionals/landing-professionals.component";

@Component({
  selector: "swc-professionnel-home-page",
  template: `
    <swc-landing-professionals
      firstTitle="La machine à projets B2B"
      secondTitle="pour les professionnels du bâtiment."
    />
  `,
  imports: [LandingProfessionalsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionnelHomePageComponent {}
