import { z } from "zod";

export const blogPostCategorySchema = z.object({
  title: z.string(),
  slug: z.string(),
});

export const blogPostTagSchema = z.object({
  title: z.string(),
  slug: z.string(),
});

export const blogPostImageSchema = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string(),
});

export const blogPostAuthorSchema = z.object({
  name: z.string(),
  image: blogPostImageSchema.nullable(),
});

export const blogPostMetaDataSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  ogImage: blogPostImageSchema,
});

export const blogPostSchema = z.object({
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  publishedDate: z.string(),
  author: blogPostAuthorSchema,
  metaData: blogPostMetaDataSchema,
  relatedPostIds: z.array(z.string()),
  categories: blogPostCategorySchema.array().nullish(),
  tags: blogPostTagSchema.array().nullish(),
  image: blogPostImageSchema.nullish(),
});

export type BlogPost = z.infer<typeof blogPostSchema>;
