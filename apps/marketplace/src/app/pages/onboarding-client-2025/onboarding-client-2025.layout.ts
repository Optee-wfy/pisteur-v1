import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { buildAssetUrl } from "@optee/constants";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { OnboardingBubblesComponent } from "../../components/onboarding-client/onboarding-bubbles.component";
import { OnboardingHeadComponent } from "../../components/onboarding-client/onboarding-head.component";
import { OnboardingPartnersComponent } from "../../components/onboarding-client/onboarding-partners.component";
import { OnboardingTestimonyComponent } from "../../components/onboarding-client/onboarding-testimony.component";
import { OnboardingService } from "../../services/onboarding.service";

const parisRoofPng = buildAssetUrl("images/paris-roofs.jpeg");

@Component({
  selector: "mkp-onboarding-client-2025-layout",
  host: {
    class: "relative bg-cover bg-center bg-fixed block h-full",
  },
  template: `
    <div
      class="relative flex size-full flex-wrap items-center justify-center gap-12 overflow-auto bg-gradient-to-t from-white to-white/30 sm:p-4 md:p-6"
      [style.scrollbar-color]="'#A3C0FF transparent'"
    >
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <oui-circle
          class="-right-[390px] -top-[175px] w-[745px]"
          theme="light"
        />
      </div>

      <oui-eve
        class="font-display xs:min-w-[480px] relative w-full max-w-screen-md flex-1 overflow-hidden"
      >
        <oui-circle
          class="-left-[390px] -top-[375px] w-[745px]"
          theme="light"
        />

        <div class="relative mx-auto max-w-[600px]">
          <mkp-onboarding-head
            class="mb-8 mt-2"
            [partnerLogo]="content().partnerLogo"
          />
          <router-outlet />
        </div>
      </oui-eve>

      <section
        class="relative flex max-w-screen-md flex-col items-center justify-between gap-12"
      >
        <mkp-onboarding-bubbles />
        <mkp-onboarding-testimony [job]="content().julieJob" />
        <mkp-onboarding-partners [partners]="content().otherPartners" />
      </section>
    </div>
  `,
  styles: `
    :host {
      background-image: url("${parisRoofPng}");
    }
  `,
  imports: [
    EveComponent,
    OnboardingTestimonyComponent,
    OnboardingHeadComponent,
    OnboardingBubblesComponent,
    OnboardingPartnersComponent,
    RouterModule,
    CircleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OnboardingClient2025LayoutComponent {
  protected readonly onboardingService = inject(OnboardingService);

  protected readonly content = computed(() => this.onboardingService.content());
}
