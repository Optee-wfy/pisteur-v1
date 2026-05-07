import { z } from "zod";

export namespace Contentful {
  export const ImageSchema = z.object({
    fields: z
      .object({
        title: z.string(),
        description: z.string(),
        file: z
          .object({
            url: z.string(),
          })
          .required(),
      })
      .required(),
  });

  export const LogoSchema = z.object({
    fields: z
      .object({
        title: z.string(),
        description: z.string(),
        file: z
          .object({
            url: z.string(),
          })
          .required(),
      })
      .required(),
  });

  export const VideoSchema = z.object({
    fields: z
      .object({
        title: z.string(),
        description: z.string(),
        file: z
          .object({
            url: z.string(),
          })
          .required(),
      })
      .required(),
  });

  export type Image = z.infer<typeof ImageSchema>;

  export type Logo = z.infer<typeof LogoSchema>;

  export type Video = z.infer<typeof VideoSchema>;

  export const AuthorSchema = z.object({
    fields: z.object({
      name: z.string(),
      image: ImageSchema.nullish(),
    }),
  });

  export type Author = z.infer<typeof AuthorSchema>;

  export const CategorySchema = z.object({
    fields: z.object({
      title: z.string(),
      slug: z.string(),
    }),
  });

  export type Category = z.infer<typeof CategorySchema>;

  export const MetaDataSchema = z.object({
    fields: z.object({
      metaTitle: z.string(),
      metaDescription: z.string(),
      ogImage: ImageSchema,
    }),
  });

  export type MetaData = z.infer<typeof MetaDataSchema>;

  export const TagSchema = z.object({
    fields: z.object({
      title: z.string(),
      slug: z.string(),
    }),
  });

  export type Tag = z.infer<typeof TagSchema>;

  export const PostSchema = z.object({
    title: z.string(),
    slug: z.string(),
    content: z.any(),
    publishedDate: z.string(),
    relatedBlogPosts: z
      .array(
        z.object({
          sys: z.object({
            id: z.string(),
          }),
        }),
      )
      .optional(),
    categories: z.array(CategorySchema).optional(),
    tags: z.array(TagSchema).optional(),
    seoFields: MetaDataSchema,
    author: AuthorSchema,
    image: ImageSchema.optional(),
  });

  export type Post = z.infer<typeof PostSchema>;

  export const UseCaseSchema = z.object({
    title: z.string(),
    slug: z.string(),
    content: z.any(),
    image: ImageSchema,
    logo: LogoSchema,
    video: VideoSchema.optional(),
    publishedDate: z.string(),
    description: z.string(),
    surface: z.number().optional(),
    initialCost: z.number().optional(),
    funding: z.number().optional(),
    impact: z.number().optional(),
    finalCost: z.number().optional(),
    relatedUseCases: z
      .array(
        z.object({
          sys: z.object({
            id: z.string(),
          }),
        }),
      )
      .optional(),
    categories: z.array(CategorySchema).optional(),
    tags: z.array(TagSchema).optional(),
    seoFields: MetaDataSchema,
  });

  export type UseCase = z.infer<typeof UseCaseSchema>;
}
