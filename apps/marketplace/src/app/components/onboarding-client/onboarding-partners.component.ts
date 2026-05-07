import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "mkp-onboarding-partners",
  host: {
    class: "grid grid-cols-2 items-center justify-center gap-6 md:flex",
  },
  template: `
    @for (partner of partners(); track partner.alt) {
      <img [alt]="partner.alt" [class]="partner.size" [src]="partner.path" />
    }
  `,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingPartnersComponent {
  partners = input.required<
    Array<{
      path: string;
      alt: string;
      size: string;
    }>
  >();
}
