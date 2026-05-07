import { Injectable } from "@angular/core";
import type { BlogPostCardProps } from "@optee/blog";
import trpcClient from "../../trpc-client";

@Injectable({
  providedIn: "root",
})
export class BlogPostService {
  async getAll(options: { limit?: number }): Promise<BlogPostCardProps[]> {
    try {
      const posts = await trpcClient.blogPost.getAll.query(options);

      // Transformer les données pour assurer la compatibilité avec BlogPostCardComponent
      const transformedPosts = posts.map((post) => ({
        ...post,
        categories: post.categories || [], // ✅ Garantir que categories est toujours un tableau
      }));

      // Trier par date de publication (plus récent en premier)
      const sortedPosts = transformedPosts.sort(
        (a, b) =>
          new Date(b.publishedDate).getTime() -
          new Date(a.publishedDate).getTime(),
      );

      // Appliquer la limite si spécifiée
      if (options?.limit) {
        return sortedPosts.slice(0, options.limit);
      }

      return sortedPosts;
    } catch (error) {
      console.error("Erreur lors de la récupération des blog posts", error);
      return [];
    }
  }
}
