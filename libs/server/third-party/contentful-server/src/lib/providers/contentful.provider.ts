import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import type { Document } from "@contentful/rich-text-types";
import { CONTENTFUL_ACCESS_TOKEN, CONTENTFUL_SPACE_ID } from "@optee/utils";
import { createClient } from "contentful";
import type { Contentful } from "../types/contentful.type";

const client = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_ACCESS_TOKEN,
});

// Yup... that's the expected type from Contentful SDK
export type ContentfulInclude =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | undefined;

export const ContentfulProvider = {
  getEntries: async (contentType: string, limit?: number) => {
    if (limit && limit > 10) {
      throw new Error(`Limit must be less than 11, received ${limit}`); // Yup... Contentful can't handle more than 10 somehow
    }

    return await client.getEntries({
      content_type: contentType,
      include: limit as ContentfulInclude,
    });
  },

  async getBySlug(contentType: string, slug: string) {
    const response = await client.getEntries({
      content_type: contentType,
      "fields.slug": slug,
      include: 10,
    });

    return response.items[0] ?? null;
  },

  async getRelatedEntries(contentType: string, ids: string[]) {
    return client.getEntries({
      content_type: contentType,
      "sys.id[in]": ids,
      include: 10,
    });
  },

  formatImage: (image: Contentful.Image) => {
    return {
      title: image.fields.title,
      description: image.fields.description,
      url: image.fields.file.url,
    };
  },

  formatLogo: (logo: Contentful.Logo) => {
    return {
      title: logo.fields.title,
      description: logo.fields.description,
      url: logo.fields.file.url,
    };
  },

  formatVideo: (video: Contentful.Video) => {
    return {
      title: video.fields.title,
      description: video.fields.description,
      url: video.fields.file.url,
    };
  },

  formatTags: (tags: Contentful.Tag[]) => {
    return tags.map((tag: Contentful.Tag) => ({
      title: tag.fields.title,
      slug: tag.fields.slug,
    }));
  },

  formatAuthor: (author: Contentful.Author) => {
    const image = author.fields.image
      ? ContentfulProvider.formatImage(author.fields.image)
      : null;

    return {
      name: author.fields.name,
      image,
    };
  },

  formatCategories: (categories: Contentful.Category[]) => {
    return categories.map((category: Contentful.Category) => ({
      title: category.fields.title,
      slug: category.fields.slug,
    }));
  },

  formatMetaData: (seoFields: Contentful.MetaData) => {
    return {
      metaTitle: seoFields.fields.metaTitle,
      metaDescription: seoFields.fields.metaDescription,
      ogImage: ContentfulProvider.formatImage(seoFields.fields.ogImage),
    };
  },

  formatContent: (content: Document) => {
    const formattedHTML = documentToHtmlString(content, {
      renderNode: {
        "embedded-asset-block": (node) => {
          const { title, file } = node.data["target"].fields;
          const url = file.url;
          return `<img title="${title}" src="${url}" alt="${title}" />`;
        },
        "embedded-entry-inline": (node) => {
          const { featuredContent } = node.data["target"].fields;
          return `
            <div class="featured">
              ${documentToHtmlString(featuredContent)}
            </div>
          `;
        },
      },
    });

    const highlightRegex = /\[\[\[(.*?)\]\]\]/g;
    const btnRegex = /\{\{<a([^>]*)>([^<]+)<\/a>\}\}/g;

    return formattedHTML
      .replace(highlightRegex, '<div class="highlight">$1</div>')
      .replace(btnRegex, `<a class="btn-cta"$1>$2</a>`);
  },
};
