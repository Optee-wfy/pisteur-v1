import {
  ChangeDetectionStrategy,
  Component,
  inject,
  type OnInit,
} from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { BlogPostCardComponent, blogPostSchema } from "@optee/blog";
import { SHOWCASE_URL } from "@optee/constants";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { CtaBlockComponent } from "@optee/ui/components/molecules/cta-block/cta-block.component";
import { ProjectsComponent } from "@optee/ui/components/organisms/projects/projects.component";
import z from "zod";
import { HeroSectionHorizontalComponent } from "../hero-section-horizontal/hero-section-horizontal.component";

export const blogPostRouteDataSchema = z.object({
  blogPost: z.object({
    detail: blogPostSchema.nullish(),
    relatedBlogPosts: blogPostSchema.array().nullish(),
  }),
});

@Component({
  selector: "swc-post-detail",
  template: `
    <article>
      <swc-hero-section-horizontal
        [breadcrumbCurrent]="post?.title"
        [breadcrumbParent]="{ label: 'Blog', uri: 'blog' }"
        [singleImgUrl]="post?.image?.url"
      >
        <div title>
          {{ post?.title ?? "Article non trouvé" }}
        </div>

        <p text>
          @if (post) {
            {{ post.metaData.metaDescription }}
          }
        </p>
      </swc-hero-section-horizontal>

      <div class="relative bg-white px-12 py-12 !pb-60 text-gray-600 xl:px-24">
        <oui-circle
          class="-left-[629px] bottom-[100px] w-[945px]"
          theme="light"
        />
        <oui-circle
          class="-right-[248px] top-[158px] w-[600px]"
          theme="light"
        />
        @if (post) {
          <div class="contentfull-content" [innerHTML]="post.content"></div>
        } @else {
          <div class="contentfull-content">
            <p>
              Oups, il semblerait que cet article n'existe pas.
              <a [routerLink]="['/blog']">Retourner à la liste des articles</a>
            </p>
          </div>
        }
      </div>

      <div class="relative">
        <oui-cta-block
          class="absolute -top-48 left-1/2 -translate-x-1/2 md:-top-36"
          ctaTitle="Améliorez l’efficacité énergétique de vos bâtiments maintenant."
        />
      </div>

      <div class="content-centered mt-96 px-6 xl:mt-52">
        @if (relatedPosts.length) {
          <h3
            class="mx-auto mb-14 text-pretty text-center text-3xl font-semibold xl:mb-20 xl:max-w-screen-lg xl:text-4xl"
          >
            Découvrez nos autres articles
          </h3>
          <div class="my-14 flex flex-wrap justify-center gap-16">
            @for (relatedPost of relatedPosts; track relatedPost.slug) {
              <op-blog-post-card
                class="cursor-pointer"
                [post]="relatedPost"
                [routerLink]="['/blog', relatedPost.slug]"
              />
            } @empty {
              <li>Aucun autre cas client</li>
            }
          </div>
        }
      </div>

      <oui-projects />
    </article>
  `,
  imports: [
    RouterLink,
    CtaBlockComponent,
    ProjectsComponent,
    BlogPostCardComponent,
    HeroSectionHorizontalComponent,
    CircleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  // ✅ Données pré-chargées par les resolvers (pour SSG) mais navigation via href
  routeData = blogPostRouteDataSchema.parse(this.route.snapshot.data);

  post = this.routeData.blogPost.detail
    ? {
        ...this.routeData.blogPost.detail,
        content: this.routeData.blogPost.detail?.content
          .replace(/<p><\/p>/gi, "")
          .replace(/<p><\/div><\/p>/gi, ""),
      }
    : null;

  relatedPosts = this.routeData.blogPost.relatedBlogPosts ?? [];

  ngOnInit(): void {
    const post = this.post;
    if (!post) {
      return;
    }

    // ✅ Métadonnées définies de manière synchrone avec les données du resolver (optimal pour SSG)

    // Titre de la page
    this.title.setTitle(post.metaData.metaTitle);

    // Meta tags pour SEO
    this.meta.updateTag({
      name: "description",
      content: post.metaData.metaDescription,
    });
    this.meta.updateTag({ name: "author", content: post.author.name });

    // Open Graph tags pour les réseaux sociaux
    this.meta.updateTag({
      property: "og:title",
      content: post.metaData.metaTitle,
    });
    this.meta.updateTag({
      property: "og:description",
      content: post.metaData.metaDescription,
    });
    this.meta.updateTag({ property: "og:type", content: "article" });
    this.meta.updateTag({
      property: "og:url",
      content: `${SHOWCASE_URL}/blog/${post.slug}`,
    });

    if (post.image?.url) {
      this.meta.updateTag({
        property: "og:image",
        content: post.image.url,
      });
    }

    // Twitter Card
    this.meta.updateTag({
      name: "twitter:card",
      content: "summary_large_image",
    });
    this.meta.updateTag({
      name: "twitter:title",
      content: post.metaData.metaTitle,
    });
    this.meta.updateTag({
      name: "twitter:description",
      content: post.metaData.metaDescription,
    });

    if (post.image?.url) {
      this.meta.updateTag({
        name: "twitter:image",
        content: post.image.url,
      });
    }
  }
}
