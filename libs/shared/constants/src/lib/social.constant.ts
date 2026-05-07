export const SOCIAL_NETWORKS = [
  "facebook",
  "instagram",
  "linkedin",
  "twitter",
  "youtube",
] as const;

export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];
