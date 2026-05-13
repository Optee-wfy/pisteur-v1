import { OPTEE_ADMIN_EMAILS, OPTEE_EMAIL_DOMAINS } from "@optee/constants/optee-email-domains.constant";
import type { nullish } from "../../../types/nullish.type";

export function isEmailFromOptee(email: string | nullish): boolean {
  if (!email) return false;
  if ((OPTEE_ADMIN_EMAILS as readonly string[]).includes(email)) return true;
  return OPTEE_EMAIL_DOMAINS.some((domain) => email.endsWith(`@${domain}`));
}
