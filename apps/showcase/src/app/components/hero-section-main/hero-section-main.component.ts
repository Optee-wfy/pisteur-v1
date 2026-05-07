import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import {
  buildAssetUrl,
  getOnboardingPath,
  SHOWCASE_DEMO_URL,
} from "@optee/constants";
import {
  IconPartnerCbreComponent,
  IconPartnerEmeraComponent,
  IconPartnerFonciaComponent,
  IconPartnerGTFComponent,
  IconPartnerMercureComponent,
  IconPartnerOraliaComponent,
  IconPartnerOrpeaComponent,
  IconPartnerUnisComponent,
} from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { HeaderComponent } from "../layout/navigation/header/header.component";

@Component({
  selector: "swc-hero-section-main",
  host: {
    class: "block bg-primary-900 relative overflow-hidden text-white",
  },
  template: `
    <oui-circle
      class="-left-[519px] -top-[400px] z-[1] w-[1071px]"
      theme="dark-white"
    />

    <div
      class="pointer-events-none absolute inset-0 z-[2] hidden justify-between xl:flex"
    >
      <div class="flex h-full flex-col items-start justify-end gap-2 pb-20">
        <img class="h-[151px]" alt="" fetchpriority="high" [src]="heroLeft1" />
        <img class="h-[129px]" alt="" fetchpriority="high" [src]="heroLeft2" />
        <img class="h-[137px]" alt="" fetchpriority="high" [src]="heroLeft3" />
      </div>

      <div class="flex h-full flex-col items-end justify-end gap-2 pb-20">
        <img class="h-[150px]" alt="" fetchpriority="high" [src]="heroRight1" />
        <img class="h-[170px]" alt="" fetchpriority="high" [src]="heroRight2" />
        <img class="h-[126px]" alt="" fetchpriority="high" [src]="heroRight3" />
      </div>
    </div>

    <div class="relative z-10">
      <swc-header theme="dark" [skipNav]="skipNav()" />

      <div
        class="flex flex-col items-center justify-center gap-6 p-8 text-center lg:gap-12 lg:p-8 lg:pt-20"
      >
        <h2
          class="font-display max-w-[1150px] text-4xl font-thin lg:text-[55px] lg:leading-none"
        >
          <ng-content select="[title]" />
        </h2>

        <div
          class="font-display w-full max-w-[740px] text-sm font-light leading-snug md:text-2xl"
        >
          <ng-content select="[text]" />
        </div>

        <div class="flex flex-col gap-1">
          <oui-button
            class="my-6"
            keepQueryParams
            variant="accent"
            [href]="ctaDestination() === 'demo' ? demoUrl : onboardingUrl"
          >
            {{ ctaLabel() }}
          </oui-button>

          <div
            class="font-display w-full text-sm font-light empty:hidden lg:text-base"
          >
            <ng-content select="[underButtonText]" />
          </div>
        </div>

        <div>
          <div
            class="font-display w-full text-sm font-light empty:hidden lg:text-base"
          >
            <ng-content select="[partnerText]" />
          </div>

          <div
            class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-white lg:gap-10"
          >
            <icon-partner-cbre class="w-10 md:w-20" />
            <icon-partner-foncia class="w-10 md:w-20" />
            <icon-partner-gtf class="w-10 md:w-20" />
            <icon-partner-mercure class="w-10 md:w-20" />
            <icon-partner-orpea class="w-10 md:w-20" />
            <icon-partner-emera class="w-10 md:w-20" />
            <icon-partner-unis class="w-10 md:w-20" hideSmallText />
            <icon-partner-oralia class="w-10 md:w-20" />
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [
    RouterModule,
    HeaderComponent,
    ButtonComponent,
    CircleComponent,
    IconPartnerCbreComponent,
    IconPartnerFonciaComponent,
    IconPartnerGTFComponent,
    IconPartnerMercureComponent,
    IconPartnerEmeraComponent,
    IconPartnerUnisComponent,
    IconPartnerOrpeaComponent,
    IconPartnerOraliaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionMainComponent {
  protected readonly router = inject(Router);

  readonly ctaLabel = input("M'inscrire gratuitement");
  readonly skipNav = input(false, { transform: booleanAttribute });
  readonly ctaDestination = input<"onboarding" | "demo">("onboarding");

  protected readonly demoUrl = SHOWCASE_DEMO_URL;

  protected readonly onboardingUrl = getOnboardingPath({
    step: "contact",
    variant: "2025",
    useAbsoluteUrl: true,
  });

  protected readonly heroLeft1 = buildAssetUrl(
    "hero-section/main/hero-left-1.png",
  );

  protected readonly heroLeft2 = buildAssetUrl(
    "hero-section/main/hero-left-2.png",
  );

  protected readonly heroLeft3 = buildAssetUrl(
    "hero-section/main/hero-left-3.png",
  );

  protected readonly heroRight1 = buildAssetUrl(
    "hero-section/main/hero-right-1.png",
  );

  protected readonly heroRight2 = buildAssetUrl(
    "hero-section/main/hero-right-2.png",
  );

  protected readonly heroRight3 = buildAssetUrl(
    "hero-section/main/hero-right-3.png",
  );
}
