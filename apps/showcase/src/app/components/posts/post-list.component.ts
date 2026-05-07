import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { BlogPostCardComponent, blogPostSchema } from "@optee/blog";
import { IconChevronRightComponent } from "@optee/icons";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { CtaBlockComponent } from "@optee/ui/components/molecules/cta-block/cta-block.component";
import { ProjectsComponent } from "@optee/ui/components/organisms/projects/projects.component";
import z from "zod";
import { HeaderComponent } from "../layout/navigation/header/header.component";

export const blogPostsRouteDataSchema = z.object({
  blogPosts: blogPostSchema.array(),
});

@Component({
  selector: "swc-posts-list",
  template: `
    <header class="bg-primary-900">
      <swc-header />

      @if (lastPost) {
        <div
          class="shadow-o relative z-10 mx-auto flex w-[80%] max-w-screen-lg translate-y-16 flex-col gap-4 overflow-hidden rounded-3xl bg-white md:flex-row"
        >
          @if (lastPost.image?.url; as imgPath) {
            <img
              class="w-full object-cover md:w-1/2"
              [alt]="lastPost.image?.title"
              [height]="816"
              [src]="imgPath"
              [width]="1456"
            />
          }
          <div
            class="flex flex-1 shrink-0 flex-col items-start justify-between gap-4 self-stretch px-14 py-6 md:py-24"
          >
            <div class="flex gap-2 md:min-h-6">
              @for (
                category of lastPost.categories;
                track category.slug;
                let i = $index
              ) {
                <span
                  class="bg-primary-200 text-primary-700 rounded-3xl px-4 py-1 text-sm font-medium"
                >
                  {{ category.title }}
                </span>
              }
            </div>
            <div class="flex flex-1 flex-col gap-2">
              <h4
                class="font-display line-clamp-2 min-h-12 max-w-prose text-lg font-semibold lg:text-2xl"
              >
                {{ lastPost.title }}
              </h4>

              <p class="line-clamp-3 min-h-16 text-justify text-gray-600">
                {{ lastPost.metaData.metaDescription }}
              </p>
            </div>
            <a
              class="text-primary-700 flex items-center gap-1"
              [routerLink]="['/blog', lastPost.slug]"
            >
              <span class="font-display text-sm underline">En savoir plus</span>

              <icon-chevron-right class="size-4" />
            </a>
          </div>
        </div>
      }
    </header>

    <div
      class="relative flex flex-col gap-10 overflow-hidden bg-white px-6 py-4 !pb-60 !pt-20 xl:gap-20 xl:py-20"
    >
      <oui-circle
        class="-left-[629px] bottom-[100px] w-[945px]"
        theme="light"
      />
      <oui-circle class="-right-[248px] top-[158px] w-[600px]" theme="light" />

      <h3
        class="mx-auto text-pretty p-4 text-center text-2xl font-semibold !leading-relaxed xl:max-w-screen-lg xl:text-4xl"
      >
        Toute l'actualité de la rénovation énergétique
      </h3>

      <div
        class="mx-auto grid max-w-screen-xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
      >
        @for (post of posts; track post.slug) {
          @if ($index > 0) {
            <op-blog-post-card
              class="cursor-pointer"
              [post]="post"
              [routerLink]="['/blog', post.slug]"
            />
          }
        } @empty {
          <li>Aucun article trouvé</li>
        }
      </div>
    </div>
    <div class="relative">
      <oui-cta-block
        class="absolute -top-36 left-1/2 -translate-x-1/2"
        ctaTitle="Améliorez l’efficacité énergétique de vos bâtiments maintenant."
      />
    </div>

    <div class="relative overflow-hidden">
      <oui-circle
        class="-bottom-[235px] -right-[400px] w-[749px]"
        theme="light"
      />

      <oui-projects class="mt-96 xl:mt-52" />
    </div>
  `,
  imports: [
    HeaderComponent,
    CircleComponent,
    BlogPostCardComponent,
    CtaBlockComponent,
    ProjectsComponent,
    IconChevronRightComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostsListComponent {
  private readonly route = inject(ActivatedRoute);

  // ✅ Données pré-chargées par le resolver (pour SSG) mais navigation via href
  routeData = blogPostsRouteDataSchema.parse(this.route.snapshot.data);

  posts = this.routeData.blogPosts.sort(
    (a, b) =>
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime(),
  );

  lastPost = this.posts[0];
}
