import { inject, makeStateKey, TransferState } from "@angular/core";
import type { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import type { BlogPost } from "@optee/blog";
import { trpcClient } from "../../trpc-client";

// Clés pour TransferState
const BLOG_POSTS_KEY = makeStateKey<BlogPost[]>("blog-posts");
const BLOG_POST_DETAIL_KEY = (slug: string) =>
  makeStateKey<{
    detail: BlogPost | null;
    relatedBlogPosts: BlogPost[];
  }>(`blog-post-${slug}`);

/**
 * Resolver pour récupérer tous les blog posts
 * Utilise TransferState pour éviter les re-fetch côté client
 */
export const blogPostsResolver: ResolveFn<BlogPost[]> = async () => {
  const transferState = inject(TransferState);

  // Vérifier si les données sont déjà en cache
  if (transferState.hasKey(BLOG_POSTS_KEY)) {
    return transferState.get(BLOG_POSTS_KEY, []);
  }

  const blogPosts = await trpcClient.blogPost.getAll.query({
    limit: undefined,
  });
  transferState.set(BLOG_POSTS_KEY, blogPosts);
  return blogPosts;
};

/**
 * Resolver pour récupérer un blog post spécifique par slug
 * Utilise TransferState pour éviter les re-fetch côté client
 */
export const blogPostPageResolver: ResolveFn<{
  detail: BlogPost | null;
  relatedBlogPosts: BlogPost[];
}> = async (route: ActivatedRouteSnapshot) => {
  const transferState = inject(TransferState);
  const slug = route.paramMap.get("slug");

  if (!slug) {
    return { detail: null, relatedBlogPosts: [] };
  }

  const stateKey = BLOG_POST_DETAIL_KEY(slug);

  // Vérifier si les données sont déjà en cache
  if (transferState.hasKey(stateKey)) {
    return transferState.get(stateKey, { detail: null, relatedBlogPosts: [] });
  }

  // D'abord récupérer le blog post principal pour avoir les IDs des related
  const blogPost = await trpcClient.blogPost.getBySlug.query(slug);
  if (!blogPost?.relatedPostIds?.length) {
    const result = { detail: blogPost, relatedBlogPosts: [] };
    transferState.set(stateKey, result);
    return result;
  }

  const relatedBlogPosts = await trpcClient.blogPost.getRelatedEntries.query(
    blogPost.relatedPostIds,
  );

  const result = { detail: blogPost, relatedBlogPosts };
  transferState.set(stateKey, result);
  return result;
};
