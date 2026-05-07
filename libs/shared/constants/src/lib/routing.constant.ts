// ONBOARDING

import { MARKETPLACE_UI_URL } from "./generic.constant";

export const ONBOARDING_PARTNER_QUERY_PARAM = "partenaire";
export const ONBOARDING_OTP_PARAM = "otp";
export const ONBOARDING_UTM_TERM_QUERY_PARAM = "utm_term";
export const ONBOARDING_UTM_MEDIUM_QUERY_PARAM = "utm_medium";
export const ONBOARDING_UTM_SOURCE_QUERY_PARAM = "utm_source";
export const ONBOARDING_UTM_CONTENT_QUERY_PARAM = "utm_content";
export const ONBOARDING_UTM_CAMPAIGN_QUERY_PARAM = "utm_campaign";

export const API_BASE_ROUTE = "/api";
export const API_TRPC_BASE_ROUTE = `${API_BASE_ROUTE}/trpc`;

export const ONBOARDING_PARTNERS = ["unis"] as const;
export type OnboardingPartner = (typeof ONBOARDING_PARTNERS)[number];

export type OnboardingPageQueryParams = {
  [ONBOARDING_PARTNER_QUERY_PARAM]?: string;
  [ONBOARDING_OTP_PARAM]?: string;
  [ONBOARDING_UTM_TERM_QUERY_PARAM]?: string;
  [ONBOARDING_UTM_MEDIUM_QUERY_PARAM]?: string;
  [ONBOARDING_UTM_SOURCE_QUERY_PARAM]?: string;
  [ONBOARDING_UTM_CONTENT_QUERY_PARAM]?: string;
  [ONBOARDING_UTM_CAMPAIGN_QUERY_PARAM]?: string;
};

export function getOnboardingPath({
  step,
  variant,
  queryParams,
  useAbsoluteUrl = false,
}: {
  step: "contact" | "client";
  variant: "2025" | "arbl";
  queryParams?: OnboardingPageQueryParams;
  useAbsoluteUrl?: boolean;
}): string {
  const params = new URLSearchParams();

  const { [ONBOARDING_PARTNER_QUERY_PARAM]: partner, ...rest } =
    queryParams || {};

  // Make sure the partner is legit
  const onboardingPartner = partner
    ? ONBOARDING_PARTNERS.find((p) => p === partner)
    : undefined;

  const onboardingParams = {
    [ONBOARDING_PARTNER_QUERY_PARAM]: onboardingPartner,
    ...rest,
  };

  Object.entries(onboardingParams).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });

  const basePath =
    step === "contact"
      ? `/onboarding-client-${variant}`
      : `/onboarding-client-${variant}/client`;

  return `${useAbsoluteUrl ? MARKETPLACE_UI_URL : ""}${basePath}${params.toString() ? `?${params.toString()}` : ""}`;
}
