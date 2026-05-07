import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { BlogPostListComponent } from "@optee/blog";
import { SHOWCASE_URL } from "@optee/constants";
import { ArcadesTutorialComponent } from "@optee/ui/components/molecules/arcade/arcades-tutorial/arcades-tutorial.component";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";
import { RadarMeetComponent } from "@optee/ui/components/organisms/radar-meet/radar-meet.component";
import { DashboardPortfolioClientComponent } from "../../../components/dashboard/dashboard-portfolio/dashboard-portfolio-client.component";
import { BlogPostService } from "../../../services/blog-post.service";

@Component({
  selector: "mkp-welcome-page",
  host: {
    class: "mx-auto flex max-w-[1200px] flex-col gap-8 p-4 lg:gap-12 lg:p-8",
  },
  template: `
    <mkp-dashboard-portfolio-client />

    <oui-radar-meet />

    <oui-arcades-tutorial />

    <oui-title-tight>
      Toute l'actualité de la rénovation énergétique
    </oui-title-tight>

    @if (blogPosts$ | async; as posts) {
      <op-blog-post-list (postClick)="onPostClick($event)" [posts]="posts" />
    }
  `,
  imports: [
    AsyncPipe,
    TitleTightComponent,
    BlogPostListComponent,
    DashboardPortfolioClientComponent,
    ArcadesTutorialComponent,
    RadarMeetComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WelcomePageComponent {
  private readonly blogPostService = inject(BlogPostService);

  readonly blogPosts$ = this.blogPostService.getAll({ limit: 6 });

  onPostClick(slug: string) {
    window.open(`${SHOWCASE_URL}/blog/${slug}`, "_blank");
  }
}
