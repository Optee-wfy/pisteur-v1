import { Contentful, ContentfulProvider } from "@optee/contentful-server";
import type { Entry, EntrySkeletonType } from "contentful";

const USE_CASE_TYPE_ID = "useCase";

export const UseCaseProvider = {
  getEntries: async (limit?: number) => {
    const response = await ContentfulProvider.getEntries(
      USE_CASE_TYPE_ID,
      limit,
    );
    return response.items.map((entry) => UseCaseProvider.format(entry));
  },

  async getBySlug(slug: string) {
    const entry = await ContentfulProvider.getBySlug(USE_CASE_TYPE_ID, slug);
    return entry ? UseCaseProvider.format(entry) : null;
  },

  async getRelatedEntries(ids: string[]) {
    const response = await ContentfulProvider.getRelatedEntries(
      USE_CASE_TYPE_ID,
      ids,
    );

    return response.items.map((entry) => UseCaseProvider.format(entry));
  },

  format: (useCase: Entry<EntrySkeletonType>) => {
    const useCaseFields = Contentful.UseCaseSchema.parse(useCase.fields);

    return {
      title: useCaseFields.title,
      slug: useCaseFields.slug,
      description: useCaseFields.description,
      surface: useCaseFields.surface,
      initialCost: useCaseFields.initialCost,
      funding: useCaseFields.funding,
      impact: useCaseFields.impact,
      finalCost: useCaseFields.finalCost,
      content: ContentfulProvider.formatContent(useCaseFields.content),
      image: ContentfulProvider.formatImage(useCaseFields.image),
      logo: ContentfulProvider.formatLogo(useCaseFields.logo),
      video: useCaseFields.video
        ? ContentfulProvider.formatVideo(useCaseFields.video)
        : null,
      publishedDate: useCaseFields.publishedDate, // We don't want a date here because of TransferState in the resolver
      metaData: ContentfulProvider.formatMetaData(useCaseFields.seoFields),
      relatedUseCaseIds:
        useCaseFields.relatedUseCases?.map((useCase) => useCase.sys.id) || [],
      categories: useCaseFields.categories
        ? ContentfulProvider.formatCategories(useCaseFields.categories)
        : [],
      tags: useCaseFields.tags
        ? ContentfulProvider.formatTags(useCaseFields.tags)
        : [],
    };
  },
};
