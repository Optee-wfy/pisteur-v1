import {
  AssociationProExternalContactType,
  SIX_MONTHS_DURATION,
} from "@optee/constants";
import type { ExternalContact } from "@optee/models";

export type EnrichmentRequestFlags = {
  requestEmail: boolean;
  requestPhone: boolean;
};

const normalize = (value: string | null | undefined) => value?.trim() ?? "";

export const getContactPresence = (contact: ExternalContact) => {
  const hasEmail = normalize(contact.email).length > 0;
  const hasPhone = normalize(contact.phone).length > 0;
  return { hasEmail, hasPhone };
};

export const getPaidFlags = (
  previousAssociationType: AssociationProExternalContactType,
) => {
  const hasPaidEmail =
    previousAssociationType === AssociationProExternalContactType.MAIL ||
    previousAssociationType === AssociationProExternalContactType.BOTH;
  const hasPaidPhone =
    previousAssociationType === AssociationProExternalContactType.PHONE ||
    previousAssociationType === AssociationProExternalContactType.BOTH;
  return { hasPaidEmail, hasPaidPhone };
};

export const getRequestedType = ({
  type,
  hasPaidEmail,
  hasPaidPhone,
}: {
  type: AssociationProExternalContactType;
  hasPaidEmail: boolean;
  hasPaidPhone: boolean;
}): EnrichmentRequestFlags => {
  const requestEmail =
    (type === AssociationProExternalContactType.MAIL ||
      type === AssociationProExternalContactType.BOTH) &&
    !hasPaidEmail;
  const requestPhone =
    (type === AssociationProExternalContactType.PHONE ||
      type === AssociationProExternalContactType.BOTH) &&
    !hasPaidPhone;
  return { requestEmail, requestPhone };
};

export const getEnrichmentFlags = ({
  requestEmail,
  requestPhone,
  hasEmail,
  hasPhone,
}: {
  requestEmail: boolean;
  requestPhone: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
}) => {
  const allRequestedDataPresent =
    (!requestEmail || hasEmail) && (!requestPhone || hasPhone);
  const shouldEnrichEmail = requestEmail && !hasEmail;
  const shouldEnrichPhone = requestPhone && !hasPhone;
  return { allRequestedDataPresent, shouldEnrichEmail, shouldEnrichPhone };
};

export const getDebitType = ({
  requestEmail,
  requestPhone,
  hasEmail,
  hasPhone,
  hasPaidEmail,
  hasPaidPhone,
}: {
  requestEmail: boolean;
  requestPhone: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  hasPaidEmail: boolean;
  hasPaidPhone: boolean;
}) => {
  const debitEmail = requestEmail && hasEmail && !hasPaidEmail;
  const debitPhone = requestPhone && hasPhone && !hasPaidPhone;
  const debitType = getAssociationTypeFromFlags({
    hasEmail: debitEmail,
    hasPhone: debitPhone,
  });
  return { debitEmail, debitPhone, debitType };
};

export const getRecentlyFetched = (contact: ExternalContact) => {
  if (!contact.lastFetchedAtForFullEnrich) {
    return false;
  }
  return (
    Date.now() - contact.lastFetchedAtForFullEnrich.getTime() <
    SIX_MONTHS_DURATION
  );
};

export const getSkipReasons = ({
  contact,
  requestedType,
  allRequestedDataPresent,
  hasRequestedSameTypeAsBefore,
  recentlyFetched,
}: {
  contact: ExternalContact;
  requestedType: AssociationProExternalContactType;
  allRequestedDataPresent: boolean;
  hasRequestedSameTypeAsBefore: boolean;
  recentlyFetched: boolean;
}) => {
  const isUnavailableForFullEnrich =
    contact.isMailUnavailableForFullEnrich &&
    contact.isPhoneUnavailableForFullEnrich;
  const reasons = [];
  if (!contact.firstName) {
    reasons.push("missing_first_name");
  }
  if (!contact.lastName) {
    reasons.push("missing_last_name");
  }
  if (requestedType === AssociationProExternalContactType.NONE) {
    reasons.push("requested_type_none");
  }
  if (allRequestedDataPresent) {
    reasons.push("requested_data_already_present");
  }
  if (hasRequestedSameTypeAsBefore) {
    reasons.push("requested_same_data_as_before");
  }
  if (
    (requestedType === AssociationProExternalContactType.MAIL &&
      contact.isMailUnavailableForFullEnrich) ||
    (requestedType === AssociationProExternalContactType.PHONE &&
      contact.isPhoneUnavailableForFullEnrich) ||
    (requestedType === AssociationProExternalContactType.BOTH &&
      isUnavailableForFullEnrich)
  ) {
    reasons.push("unavailable_for_fullenrich");
  }
  if (
    recentlyFetched &&
    (allRequestedDataPresent || hasRequestedSameTypeAsBefore)
  ) {
    reasons.push("recently_fetched");
  }
  return reasons;
};

export const buildEnrichFields = ({
  shouldEnrichEmail,
  shouldEnrichPhone,
}: {
  shouldEnrichEmail: boolean;
  shouldEnrichPhone: boolean;
}) => {
  const enrichFields = [];
  if (shouldEnrichEmail) {
    enrichFields.push("contact.emails");
  }
  if (shouldEnrichPhone) {
    enrichFields.push("contact.phones");
  }
  return enrichFields;
};

export const getAssociationTypeFromFlags = ({
  hasEmail,
  hasPhone,
}: {
  hasEmail: boolean;
  hasPhone: boolean;
}) => {
  if (hasEmail && hasPhone) {
    return AssociationProExternalContactType.BOTH;
  }
  if (hasEmail) {
    return AssociationProExternalContactType.MAIL;
  }
  if (hasPhone) {
    return AssociationProExternalContactType.PHONE;
  }
  return AssociationProExternalContactType.NONE;
};

export const buildRequestedEnrichmentType = ({
  shouldEnrichEmail,
  shouldEnrichPhone,
}: {
  shouldEnrichEmail: boolean;
  shouldEnrichPhone: boolean;
}) =>
  getAssociationTypeFromFlags({
    hasEmail: shouldEnrichEmail,
    hasPhone: shouldEnrichPhone,
  });
