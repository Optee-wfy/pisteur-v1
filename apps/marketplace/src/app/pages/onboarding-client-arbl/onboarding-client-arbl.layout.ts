import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { BlogPostListComponent } from "@optee/blog";
import { ARCADES, buildAssetUrl, SHOWCASE_URL } from "@optee/constants";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { ArcadeComponent } from "@optee/ui/components/molecules/arcade/arcade/arcade.component";
import { ArcadesTutorialComponent } from "@optee/ui/components/molecules/arcade/arcades-tutorial/arcades-tutorial.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { QuestionsComponent } from "@optee/ui/components/organisms/questions/questions.component";
import { OnboardingHeadComponent } from "../../components/onboarding-client/onboarding-head.component";
import { OnboardingPartnersComponent } from "../../components/onboarding-client/onboarding-partners.component";
import { OnboardingTestimonyComponent } from "../../components/onboarding-client/onboarding-testimony.component";
import { BlogPostService } from "../../services/blog-post.service";
import { OnboardingService } from "../../services/onboarding.service";

const parisRoofPng = buildAssetUrl("images/paris-roofs.jpeg");

@Component({
  selector: "mkp-onboarding-client-arbl-layout",
  host: {
    class: "relative bg-cover bg-center bg-fixed block h-full",
  },
  template: `
    <div
      class="relative size-full overflow-auto bg-gradient-to-t from-white to-white/30"
      [style.scrollbar-color]="'#A3C0FF transparent'"
    >
      <div
        class="flex flex-wrap items-center justify-center gap-6 sm:p-4 md:gap-12 md:p-6"
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
          class="relative flex max-w-screen-md flex-col items-center justify-between gap-6 md:gap-12"
        >
          <oui-arcade class="h-[300px] w-full" [flowId]="arcadeId" />
          <mkp-onboarding-testimony [job]="content().julieJob" />
          <mkp-onboarding-partners [partners]="content().otherPartners" />
        </section>
      </div>

      <div class="flex flex-col gap-6 p-4 md:gap-12 md:p-6">
        <oui-arcades-tutorial class="m-auto w-full max-w-[1300px]" />

        @if (blogPosts$ | async; as posts) {
          <op-blog-post-list
            class="m-auto w-full max-w-[1300px]"
            (postClick)="onPostClick($event)"
            [posts]="posts"
          />
        }

        <oui-questions
          class="bg-primary-50 w-full rounded-3xl p-4 lg:p-8"
          theme="light"
        />
      </div>
    </div>
  `,
  styles: `
    :host {
      background-image: url("${parisRoofPng}");
    }
  `,
  imports: [
    AsyncPipe,
    EveComponent,
    OnboardingTestimonyComponent,
    BlogPostListComponent,
    ArcadesTutorialComponent,
    OnboardingHeadComponent,
    QuestionsComponent,
    ArcadeComponent,
    OnboardingPartnersComponent,
    RouterModule,
    CircleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OnboardingClientArblLayoutComponent {
  protected readonly onboardingService = inject(OnboardingService);
  private readonly blogPostService = inject(BlogPostService);

  protected readonly content = computed(() => this.onboardingService.content());
  protected readonly arcadeId = ARCADES[0].id;

  readonly blogPosts$ = this.blogPostService.getAll({ limit: 6 });

  onPostClick(slug: string) {
    window.open(`${SHOWCASE_URL}/blog/${slug}`, "_blank");
  }
}
