import { z } from "zod";

export const useCaseCategorySchema = z.object({
  title: z.string(),
  slug: z.string(),
});

export const useCaseTagSchema = z.object({
  title: z.string(),
  slug: z.string(),
});

export const useCaseImageSchema = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string(),
});

export const useCaseAuthorSchema = z.object({
  name: z.string(),
  image: useCaseImageSchema.nullable(),
});

export const useCaseMetaDataSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  ogImage: useCaseImageSchema,
});

export const useCaseLogoSchema = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string(),
});

export const useCaseVideoSchema = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string(),
});

export const useCaseSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  surface: z.number().nullish(),
  initialCost: z.number().nullish(),
  funding: z.number().nullish(),
  impact: z.number().nullish(),
  finalCost: z.number().nullish(),
  content: z.string(),
  image: useCaseImageSchema.nullish(),
  logo: useCaseLogoSchema.nullish(),
  video: useCaseVideoSchema.nullish(),
  publishedDate: z.string(),
  metaData: useCaseMetaDataSchema,
  relatedUseCaseIds: z.array(z.string()),
  categories: useCaseCategorySchema.array().nullish(),
  tags: useCaseTagSchema.array().nullish(),
});

export type UseCase = z.infer<typeof useCaseSchema>;
