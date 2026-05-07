import { OPTEE_EMAIL_DOMAINS } from "@optee/constants/optee-email-domains.constant";
import type { nullish } from "../../../types/nullish.type";

export function isEmailFromOptee(email: string | nullish): boolean {
  return (
    !!email &&
    OPTEE_EMAIL_DOMAINS.some((domain) => email.endsWith(`@${domain}`))
  );
}
