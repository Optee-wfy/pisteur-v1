import { Contentful, ContentfulProvider } from "@optee/contentful-server";
import type { Entry, EntrySkeletonType } from "contentful";

const POST_TYPE_ID = "pageBlogPost";

export const BlogPostProvider = {
  async getEntries(limit?: number) {
    const response = await ContentfulProvider.getEntries(POST_TYPE_ID, limit);
    return response.items.map((entry) => BlogPostProvider.format(entry));
  },

  async getBySlug(slug: string) {
    const entry = await ContentfulProvider.getBySlug(POST_TYPE_ID, slug);
    return entry ? BlogPostProvider.format(entry) : null;
  },

  async getRelatedEntries(ids: string[]) {
    const response = await ContentfulProvider.getRelatedEntries(
      POST_TYPE_ID,
      ids,
    );

    return response.items.map((entry) => BlogPostProvider.format(entry));
  },

  format: (post: Entry<EntrySkeletonType>) => {
    const postFields = Contentful.PostSchema.parse(post.fields);

    return {
      title: postFields.title,
      slug: postFields.slug,
      content: ContentfulProvider.formatContent(postFields.content),
      publishedDate: postFields.publishedDate, // We don't want a date here because of TransferState in the resolver
      author: ContentfulProvider.formatAuthor(postFields.author),
      metaData: ContentfulProvider.formatMetaData(postFields.seoFields),
      relatedPostIds:
        postFields.relatedBlogPosts?.map((post) => post.sys.id) || [],
      categories: postFields.categories
        ? ContentfulProvider.formatCategories(postFields.categories)
        : undefined,
      tags: postFields.tags
        ? ContentfulProvider.formatTags(postFields.tags)
        : undefined,
      image: postFields.image
        ? ContentfulProvider.formatImage(postFields.image)
        : undefined,
    };
  },
};
