import type { FullEnrichDataEntry } from "@optee/constants";
import {
  AssociationProExternalContactType,
  FullEnrichSocialMediaType,
} from "@optee/constants";
import { ExternalContactRepository } from "@optee/external-contact-server";
import type { ExternalContact, ExternalContactUuid } from "@optee/models";
import { getChargeableCounts } from "./fullenrich-credits";

type FinishedEntryCounts = {
  emailCount: number;
  phoneCount: number;
};

type FinishedEntryError = {
  entryIndex: number;
  externalContactUuid?: ExternalContactUuid;
  reason:
    | "missing-external-contact-uuid"
    | "missing-external-contact"
    | "process-entry-failed";
  error?: unknown;
};

const resolveContactOutputs = (entry: FullEnrichDataEntry) => {
  const contact = entry.contact;
  const mostProbableEmail =
    contact?.most_probable_email ?? contact?.emails?.[0]?.email;
  const mostProbablePhone =
    contact?.most_probable_phone ?? contact?.phones?.[0]?.number;

  const resolvedEmail = (mostProbableEmail ?? "").trim();
  const resolvedPhone = (mostProbablePhone ?? "").trim();

  return { contact, resolvedEmail, resolvedPhone };
};

const resolveLinkedInUrl = (entry: FullEnrichDataEntry) => {
  const linkedInUrlFullEnrich =
    entry.contact?.profile?.linkedin_url ??
    entry.contact?.social_medias?.find(
      (s) => s.type === FullEnrichSocialMediaType.LINKEDIN,
    )?.url;
  const linkedInUrlExisting = entry.custom?.["linkedInUrl"] as
    | string
    | undefined;
  return linkedInUrlFullEnrich ?? linkedInUrlExisting ?? null;
};

const isAssociationType = (
  value: unknown,
): value is AssociationProExternalContactType =>
  Object.values(AssociationProExternalContactType).includes(
    value as AssociationProExternalContactType,
  );

const getEntryAssociationTypes = (entry: FullEnrichDataEntry) => {
  const rawType = entry.custom?.["associationType"];
  const type = isAssociationType(rawType)
    ? rawType
    : AssociationProExternalContactType.NONE;
  const rawPreviousType = entry.custom?.["previousAssociationType"];
  const previousAssociationType = isAssociationType(rawPreviousType)
    ? rawPreviousType
    : AssociationProExternalContactType.NONE;

  return { type, previousAssociationType };
};

const computeUnavailableFlags = ({
  type,
  resolvedEmail,
  resolvedPhone,
  existingEmail,
  existingPhone,
}: {
  type: AssociationProExternalContactType;
  resolvedEmail: string;
  resolvedPhone: string;
  existingEmail: string;
  existingPhone: string;
}) => {
  const isBothRequest = type === AssociationProExternalContactType.BOTH;
  const isMailRequest = type === AssociationProExternalContactType.MAIL;
  const isPhoneRequest = type === AssociationProExternalContactType.PHONE;

  const missingAllOnBothRequest =
    isBothRequest &&
    !resolvedEmail &&
    !resolvedPhone &&
    !existingEmail &&
    !existingPhone;
  const missingMailOnMailRequest = isMailRequest && !resolvedEmail;
  const missingPhoneOnPhoneRequest = isPhoneRequest && !resolvedPhone;

  const shouldMarkMailUnavailable =
    missingAllOnBothRequest || missingMailOnMailRequest;
  const shouldMarkPhoneUnavailable =
    missingAllOnBothRequest || missingPhoneOnPhoneRequest;

  return { shouldMarkMailUnavailable, shouldMarkPhoneUnavailable };
};

const buildUnavailableUpdates = ({
  existingContact,
  shouldMarkMailUnavailable,
  shouldMarkPhoneUnavailable,
}: {
  existingContact: ExternalContact | null;
  shouldMarkMailUnavailable: boolean;
  shouldMarkPhoneUnavailable: boolean;
}) => {
  const nextMailUnavailable =
    shouldMarkMailUnavailable ||
    (existingContact?.isMailUnavailableForFullEnrich ?? false);
  const nextPhoneUnavailable =
    shouldMarkPhoneUnavailable ||
    (existingContact?.isPhoneUnavailableForFullEnrich ?? false);

  return { nextMailUnavailable, nextPhoneUnavailable };
};

const processFinishedEntryWithContact = async (
  entry: FullEnrichDataEntry,
  existingContact: ExternalContact,
): Promise<FinishedEntryCounts> => {
  const { resolvedEmail, resolvedPhone } = resolveContactOutputs(entry);
  const existingEmail = (existingContact.email ?? "").trim();
  const existingPhone = (existingContact.phone ?? "").trim();
  const { type, previousAssociationType } = getEntryAssociationTypes(entry);

  const { shouldMarkMailUnavailable, shouldMarkPhoneUnavailable } =
    computeUnavailableFlags({
      type,
      resolvedEmail,
      resolvedPhone,
      existingEmail,
      existingPhone,
    });

  if (shouldMarkMailUnavailable || shouldMarkPhoneUnavailable) {
    const { nextMailUnavailable, nextPhoneUnavailable } =
      buildUnavailableUpdates({
        existingContact,
        shouldMarkMailUnavailable,
        shouldMarkPhoneUnavailable,
      });

    await ExternalContactRepository.update(existingContact.uuid, {
      isMailUnavailableForFullEnrich: nextMailUnavailable,
      isPhoneUnavailableForFullEnrich: nextPhoneUnavailable,
      isUnavailableForFullEnrich: nextMailUnavailable && nextPhoneUnavailable,
      lastFetchedAtForFullEnrich: new Date(),
      updatedAt: new Date(),
    });
    return { emailCount: 0, phoneCount: 0 };
  }

  const counts = getChargeableCounts({
    type,
    hasEmail: Boolean(resolvedEmail),
    hasPhone: Boolean(resolvedPhone),
    previousAssociationType,
  });

  const linkedInUrl = resolveLinkedInUrl(entry);
  const nextMailUnavailable = resolvedEmail
    ? false
    : (existingContact.isMailUnavailableForFullEnrich ?? false);
  const nextPhoneUnavailable = resolvedPhone
    ? false
    : (existingContact.isPhoneUnavailableForFullEnrich ?? false);

  await ExternalContactRepository.update(existingContact.uuid, {
    email:
      resolvedEmail !== "" ? resolvedEmail : (existingContact?.email ?? null),
    phone:
      resolvedPhone !== "" ? resolvedPhone : (existingContact?.phone ?? null),
    linkedInUrl,
    isMailUnavailableForFullEnrich: nextMailUnavailable,
    isPhoneUnavailableForFullEnrich: nextPhoneUnavailable,
    isUnavailableForFullEnrich: nextMailUnavailable && nextPhoneUnavailable,
    lastFetchedAtForFullEnrich: new Date(),
    updatedAt: new Date(),
  });

  return { emailCount: counts.emailCount, phoneCount: counts.phoneCount };
};

export const processFinishedEntries = async (
  entries: FullEnrichDataEntry[],
): Promise<{
  results: FinishedEntryCounts[];
  errors: FinishedEntryError[];
}> => {
  const externalContactUuids = entries
    .map(
      (entry) =>
        entry.custom?.["externalContactUuid"] as
          | ExternalContactUuid
          | undefined,
    )
    .filter((uuid): uuid is ExternalContactUuid => Boolean(uuid));

  const contacts =
    await ExternalContactRepository.getByUuids(externalContactUuids);
  const contactMap = new Map(
    contacts.map((contact) => [contact.uuid, contact]),
  );

  const results: FinishedEntryCounts[] = [];
  const errors: FinishedEntryError[] = [];
  for (const [entryIndex, entry] of entries.entries()) {
    const externalContactUuid = entry.custom?.["externalContactUuid"] as
      | ExternalContactUuid
      | undefined;
    if (!externalContactUuid) {
      errors.push({
        entryIndex,
        reason: "missing-external-contact-uuid",
      });
      continue;
    }
    const existingContact = contactMap.get(externalContactUuid);
    if (!existingContact) {
      console.error(
        `[FullEnrich] Missing external contact for ${externalContactUuid}; skipping entry.`,
      );
      errors.push({
        entryIndex,
        externalContactUuid,
        reason: "missing-external-contact",
      });
      continue;
    }
    try {
      results.push(
        await processFinishedEntryWithContact(entry, existingContact),
      );
    } catch (error) {
      errors.push({
        entryIndex,
        externalContactUuid,
        reason: "process-entry-failed",
        error,
      });
    }
  }

  return { results, errors };
};
