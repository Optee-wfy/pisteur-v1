import { OPTEE_EMAIL_DOMAINS } from "./optee-email-domains.constant";

// These users will see all entities made for test (location, operation etc)
export const OPTEE_TESTERS = [
  "louis.godlewski",
  "victor.joudrier",
  "lisa",
  "chayma.ghrab",
  "noemie.mendes",
  "mourad",
  "maxime",
] as const;
const opteeTesters = new Set<string>(OPTEE_TESTERS);

export function isOpteeTester(email?: string | null) {
  const name = email?.split("@").at(0)?.split("+").at(0)?.toLowerCase();
  if (
    !email ||
    !OPTEE_EMAIL_DOMAINS.some((domain) => email.endsWith(`@${domain}`)) ||
    !name
  ) {
    return false;
  }

  return opteeTesters.has(name);
}

export const OPTEE_ALERT_EMAILS = [
  "louis.godlewski@optee.io",
  "maxime@optee.io",
  "tech@optee.io",
];
