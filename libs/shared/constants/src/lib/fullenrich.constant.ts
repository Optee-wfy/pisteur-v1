import { environment } from "@optee/env";
import { z } from "zod";
import { MARKETPLACE_API_URL } from "./generic.constant";

// this constant must be set if we want to enable FullEnrich in preview, if not wanted then it must be left as undefined
const PREVIEW_API_URL = undefined; // <--- Leave undefined if FullEnrich is not wanted in preview
// "https://optee-app--preview-pr-818-tldwpizd.web.app/api"; // <--- Set to the right preview URL if needed

// Enable fullEnrich feature

const includedEnvironments = ["production", "development"]; // If we want to enable in preview, add '"preview"',

export const fullEnrichFeatureEnabled = {
  isEnabled: includedEnvironments.includes(environment.slug),
  baseUrl:
    environment.slug === "preview" && PREVIEW_API_URL
      ? PREVIEW_API_URL
      : MARKETPLACE_API_URL,
} as const;

// Identifiers returned by FullEnrich endpoints.
export const fullEnrichRequestId = z
  .string()
  .uuid()
  .brand<"FullEnrichRequestId">();
export type FullEnrichRequestId = z.infer<typeof fullEnrichRequestId>;

export const fullEnrichEnrichmentId = z
  .string()
  .uuid()
  .brand<"FullEnrichEnrichmentId">();
export type FullEnrichEnrichmentId = z.infer<typeof fullEnrichEnrichmentId>;

// Status values observed in enrichment lifecycle responses/webhooks.
export enum FullEnrichEnrichmentStatus {
  CREATED = "CREATED",
  IN_PROGRESS = "IN_PROGRESS",
  CANCELED = "CANCELED",
  CREDITS_INSUFFICIENT = "CREDITS_INSUFFICIENT",
  FINISHED = "FINISHED",
  RATE_LIMIT = "RATE_LIMIT",
  UNKNOWN = "UNKNOWN",
  FAKE_ENRICH = "FAKE_ENRICH",
}

// Status values observed for deliverability
export enum FullEnrichEmailDeliverabilityStatus {
  DELIVERABLE = "DELIVERABLE",
  HIGH_PROBABILITY = "HIGH_PROBABILITY",
  CATCH_ALL = "CATCH_ALL",
  INVALID = "INVALID",
}

// Type of social media
export enum FullEnrichSocialMediaType {
  LINKEDIN = "LINKEDIN",
  UNKNOWN = "UNKNOWN",
  WEBSITE = "WEBSITE",
  BLOG = "BLOG",
  TWITTER = "TWITTER",
  YOUTUBE = "YOUTUBE",
  FACEBOOK = "FACEBOOK",
  MEDIUM = "MEDIUM",
  INSTAGRAM = "INSTAGRAM",
  TIKTOK = "TIKTOK",
  GITHUB = "GITHUB",
}

// Error payload returned by FullEnrich when a request is rejected (HTTP 4xx).
export const fullEnrichErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
});
export type FullEnrichErrorResponse = z.infer<
  typeof fullEnrichErrorResponseSchema
>;

// Response returned by the Start Bulk Enrichment endpoint.
export const fullEnrichBulkStartResponseSchema = z.object({
  enrichment_id: fullEnrichEnrichmentId,
});
export type FullEnrichBulkStartResponse = z.infer<
  typeof fullEnrichBulkStartResponseSchema
>;

const fullEnrichEmailSchema = z.object({
  email: z.string(),
  status: z.nativeEnum(FullEnrichEmailDeliverabilityStatus),
});

const fullEnrichPhoneSchema = z.object({
  number: z.string(),
  region: z.string().nullish(),
});

const fullEnrichSocialMediaSchema = z.object({
  url: z.string(),
  type: z.nativeEnum(FullEnrichSocialMediaType),
});

const fullEnrichCompanyLocationSchema = z.object({
  region: z.string().nullish(),
  city: z.string().nullish(),
  country: z.string().nullish(),
  country_code: z.string().nullish(),
  postal_code: z.string().nullish(),
  address_line_1: z.string().nullish(),
  address_line_2: z.string().nullish(),
});

const fullEnrichCompanySchema = z.object({
  linkedin_id: z.number().optional(),
  linkedin_url: z.string().optional(),
  linkedin_handle: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  domain: z.string().optional(),
  industry: z.string().optional(),
  type: z.string().optional(),
  year_founded: z.number().optional(),
  headcount: z.number().optional(),
  headcount_range: z.string().optional(),
  headquarters: fullEnrichCompanyLocationSchema.optional(),
});

const fullEnrichDateFragmentSchema = z.object({
  month: z.number().optional(),
  year: z.number().optional(),
});

const fullEnrichProfilePositionSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  start_at: fullEnrichDateFragmentSchema.optional(),
  end_at: fullEnrichDateFragmentSchema.optional(),
  company: fullEnrichCompanySchema.optional(),
});

const fullEnrichProfileSchema = z.object({
  linkedin_id: z.number().optional(),
  linkedin_url: z.string().optional(),
  linkedin_handle: z.string().optional(),
  sales_navigator_id: z.string().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  premium_account: z.boolean().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  headline: z.string().optional(),
  position: fullEnrichProfilePositionSchema.optional(),
});

const fullEnrichContactSchema = z.object({
  firstname: z.string().nullish(),
  lastname: z.string().nullish(),
  domain: z.string().nullish(),
  most_probable_email: z.string().nullish(),
  most_probable_email_status: z
    .nativeEnum(FullEnrichEmailDeliverabilityStatus)
    .or(z.literal(""))
    .nullish(),
  most_probable_personal_email: z.string(),
  most_probable_personal_email_status: z
    .nativeEnum(FullEnrichEmailDeliverabilityStatus)
    .or(z.literal(""))
    .optional(),
  most_probable_phone: z.string().optional(),
  emails: z.array(fullEnrichEmailSchema).optional(),
  personal_emails: z.array(fullEnrichEmailSchema).optional(),
  phones: z.array(fullEnrichPhoneSchema).optional(),
  social_medias: z.array(fullEnrichSocialMediaSchema).optional(),
  profile: fullEnrichProfileSchema.optional(),
});

export const fullEnrichDataEntrySchema = z.object({
  custom: z.record(z.unknown()).optional(),
  contact: fullEnrichContactSchema.optional(),
});
export type FullEnrichDataEntry = z.infer<typeof fullEnrichDataEntrySchema>;

export const fullEnrichWebhookEventSchema = z.object({
  status: z.nativeEnum(FullEnrichEnrichmentStatus),
  id: fullEnrichEnrichmentId,
  name: z.string().optional(),
  datas: z.array(fullEnrichDataEntrySchema).optional(),
  cost: z
    .object({
      credits: z.number().optional(),
    })
    .optional(),
});
export type FullEnrichWebhookEventPayload = z.infer<
  typeof fullEnrichWebhookEventSchema
>;

export const isEnrichmentDone = (
  status: FullEnrichEnrichmentStatus,
): boolean => {
  return (
    status === FullEnrichEnrichmentStatus.FINISHED ||
    status === FullEnrichEnrichmentStatus.CANCELED ||
    status === FullEnrichEnrichmentStatus.CREDITS_INSUFFICIENT ||
    status === FullEnrichEnrichmentStatus.RATE_LIMIT ||
    status === FullEnrichEnrichmentStatus.UNKNOWN
  );
};

export const averageLoadingTimePerContactMs = 56000; // 56 seconds per contact on average
