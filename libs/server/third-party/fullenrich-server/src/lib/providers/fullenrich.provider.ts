import { faker } from "@faker-js/faker";
import type {
  FullEnrichEnrichmentId,
  FullEnrichWebhookEventPayload,
} from "@optee/constants";
import {
  AssociationProExternalContactType,
  fullEnrichBulkStartResponseSchema,
  FullEnrichEnrichmentStatus,
  fullEnrichErrorResponseSchema,
  fullEnrichFeatureEnabled,
  MAIL_CONTACT_ENRICHMENT_COST,
  PHONE_CONTACT_ENRICHMENT_COST,
} from "@optee/constants";
import { EnrichmentRepository } from "@optee/enrichment-server";
import { ExternalContactRepository } from "@optee/external-contact-server";
import { MailersendProvider } from "@optee/mailersend-server";
import type {
  ContactUuid,
  ExternalContact,
  ExternalContactUuid,
  LegalEntityUuid,
  ProUuid,
} from "@optee/models";
import { ProProvider } from "@optee/pro-server";
import { formatZodError, isNotNullish } from "@optee/utils";
import { randomUUID } from "crypto";
import type { z } from "zod";
import { type ZodTypeAny } from "zod";
import { getChargeableCounts } from "../helpers/fullenrich-credits";
import { processFinishedEntries } from "../helpers/fullenrich-finished";

/**
 * Payload accepted by the Start Bulk Enrichment endpoint.
 *
 * Example:
 * {
 *   "name": "Phone Only Enrichment",
 *   "datas": [{
 *     "firstname": "john",
 *     "lastname": "snow",
 *     "domain": "example.com",
 *     "enrich_fields": ["contact.emails", "contact.phones"],
 *     "company_name": "Example Inc."
 *     "webhook_url": "https://yourdomain.com/webhook-endpoint",
 *   }]
 * }
 *
 * FullEnrich recommends sending at least firstname + lastname + company information
 * (via domain or company_name) or a linkedin_url. Enrich fields control which data
 * points are retrieved: contact.emails, contact.personal_emails, contact.phones.
 */

const FULL_ENRICH_BASE_URL = "https://app.fullenrich.com/api/v1";
const ENRICHMENTS_PATH = "/contact/enrich/bulk";

const BASE_URL = fullEnrichFeatureEnabled.baseUrl;

if (!BASE_URL) {
  throw new Error(
    "[FullEnrich] Missing baseUrl from fullEnrichFeatureEnabled; cannot build webhook_url",
  );
}

const updateEnrichmentStatus = async (
  enrichmentId: FullEnrichEnrichmentId,
  status: FullEnrichWebhookEventPayload["status"],
) => {
  await EnrichmentRepository.update(enrichmentId, { status });
};

const getPrimaryFirstName = (firstName?: string | null) => {
  if (!firstName) {
    return "";
  }
  return (
    firstName
      .split(/[,\s]+/)
      .map((token) => token.trim())
      .find((token) => token.length > 0) ?? ""
  );
};

const getProUuidFromPayload = (
  payload: FullEnrichWebhookEventPayload,
  enrichmentId: FullEnrichEnrichmentId,
): ProUuid => {
  const proUuid = payload.datas?.[0]?.custom?.["proUuid"] as
    | ProUuid
    | undefined;
  if (!proUuid) {
    console.error(
      "[FullEnrich] proUuid not found in enrichment entries' custom data",
      { enrichmentId },
    );
    throw new Error("proUuid missing from enrichment data");
  }
  return proUuid;
};

const handleInsufficientCredits = async (
  payload: FullEnrichWebhookEventPayload,
  proUuid: ProUuid,
) => {
  const externalContactsUuids =
    payload.datas
      ?.map(
        (entry) => entry.custom?.["externalContactUuid"] as ExternalContactUuid,
      )
      .filter(isNotNullish) ?? [];
  await Promise.all(
    externalContactsUuids.map((contactUuid) =>
      ExternalContactRepository.disassociateFromPro(proUuid, contactUuid),
    ),
  );
  await MailersendProvider.notifyInsufficientCredits("FullEnrich");
};

export const FullEnrichProvider = {
  /**
   * Triggers a bulk enrichment job on FullEnrich
   * @returns The enrichment id
   */
  async startBulkEnrichment(
    dataToEnrich: {
      contact: ExternalContact;
      website: string;
      name: string;
      previousAssociationType: AssociationProExternalContactType;
      associationType: AssociationProExternalContactType;
      enrichFields: string[];
    }[],
    proUuid: ProUuid,
  ) {
    // Workflow step 3: build and send the FullEnrich bulk request for filtered contacts only.
    // If VITE_ENV is not preview or production, we are in development environment
    if (
      process.env["VITE_ENV"] !== "preview" &&
      process.env["VITE_ENV"] !== "production"
    ) {
      // If we want to test in environment without using credits
      // payload = {
      //   name: "Contact Enrichment - Test Env",
      //   webhook_url: BASE_URL + "/v1/fullenrich",
      //   datas: dataToEnrich.map(({ contact }) => ({
      //     firstname: "Grégoire",
      //     lastname: "Démogé",
      //     domain: "fullenrich.com",
      //     company_name: "FullEnrich",
      //     linkedIn_url: "https://www.linkedin.com/in/demoge/",
      //     enrich_fields: ["contact.emails", "contact.phones"],
      //     custom: {
      //       externalContactUuid: contact.uuid,
      //       proUuid,
      //     },
      //   })),
      // };

      for (const { contact, associationType } of dataToEnrich) {
        const shouldFillEmail =
          associationType === AssociationProExternalContactType.MAIL ||
          associationType === AssociationProExternalContactType.BOTH;
        const shouldFillPhone =
          associationType === AssociationProExternalContactType.PHONE ||
          associationType === AssociationProExternalContactType.BOTH;
        //We want to simulate an enrichment that returns no email nor phone
        if (contact.lastName === "Meunier") {
          await ExternalContactRepository.update(contact.uuid, {
            ...(shouldFillEmail ? { email: "" } : {}),
            ...(shouldFillPhone ? { phone: "" } : {}),
            isMailUnavailableForFullEnrich: shouldFillEmail,
            isPhoneUnavailableForFullEnrich: shouldFillPhone,
            isUnavailableForFullEnrich: shouldFillEmail && shouldFillPhone,
            lastFetchedAtForFullEnrich: new Date(),
            updatedAt: new Date(),
          });
        } else {
          await ExternalContactRepository.update(contact.uuid, {
            ...(shouldFillEmail ? { email: faker.internet.email() } : {}),
            ...(shouldFillPhone ? { phone: faker.phone.number() } : {}),
            isMailUnavailableForFullEnrich: false,
            isPhoneUnavailableForFullEnrich: false,
            isUnavailableForFullEnrich: false,
            lastFetchedAtForFullEnrich: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      const fakeEnrichmentId = randomUUID() as FullEnrichEnrichmentId;
      return fakeEnrichmentId;
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

    const payload = {
      // Name should be the company name + the date of request to help identification
      name: dataToEnrich[0]?.name
        ? `${dataToEnrich[0].name}-${timestamp}`
        : `Contact Enrichment-${timestamp}`,
      webhook_url: BASE_URL + "/v1/fullenrich",
      datas: dataToEnrich.map(
        ({
          contact,
          website,
          name,
          previousAssociationType,
          associationType,
          enrichFields,
        }) => {
          return {
            firstname: getPrimaryFirstName(contact.firstName),
            lastname: contact.lastName,
            domain: website,
            company_name: name,
            enrich_fields: enrichFields,
            custom: {
              externalContactUuid: contact.uuid,
              proUuid,
              linkedInUrl: contact.linkedInUrl, // to keep existing LinkedIn URL if FullEnrich does not return one
              associationType,
              previousAssociationType:
                previousAssociationType ??
                AssociationProExternalContactType.NONE,
            },
          };
        },
      ),
    };

    const response = await fetch(FULL_ENRICH_BASE_URL + ENRICHMENTS_PATH, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });

    const res = await parseResponse(
      response,
      fullEnrichBulkStartResponseSchema,
      "start bulk enrichment",
    );

    // If no enrichment_id is returned, mark contacts as unavailable for FullEnrich.
    if (!res.enrichment_id) {
      for (const { contact, associationType } of dataToEnrich) {
        const entryType = associationType;
        const markMailUnavailable =
          entryType === AssociationProExternalContactType.MAIL ||
          entryType === AssociationProExternalContactType.BOTH;
        const markPhoneUnavailable =
          entryType === AssociationProExternalContactType.PHONE ||
          entryType === AssociationProExternalContactType.BOTH;
        await ExternalContactRepository.update(contact.uuid, {
          isMailUnavailableForFullEnrich: markMailUnavailable,
          isPhoneUnavailableForFullEnrich: markPhoneUnavailable,
          isUnavailableForFullEnrich:
            markMailUnavailable && markPhoneUnavailable,
          lastFetchedAtForFullEnrich: new Date(),
          updatedAt: new Date(),
        });
      }
      return null;
    }

    return res.enrichment_id;
  },

  async decrementProCredits({
    emailEnrichedCount = 0,
    phoneEnrichedCount = 0,
    proUuid,
  }: {
    emailEnrichedCount?: number;
    phoneEnrichedCount?: number;
    proUuid: ProUuid;
  }) {
    const creditsToDecrement =
      emailEnrichedCount * MAIL_CONTACT_ENRICHMENT_COST +
      phoneEnrichedCount * PHONE_CONTACT_ENRICHMENT_COST;

    if (creditsToDecrement > 0) {
      await ProProvider.decrementCredits({
        proUuid,
        creditsToDecrement,
      });
    }
  },

  async decrementCreditsForExistingData({
    contactsToDebit,
    proUuid,
  }: {
    contactsToDebit: {
      contact: ExternalContact;
      previousAssociationType?: AssociationProExternalContactType;
      requestedType: AssociationProExternalContactType;
    }[];
    proUuid: ProUuid;
  }) {
    // Workflow step 2b: debit for data already present in DB (no FullEnrich call).
    let emailEnrichedCount = 0;
    let phoneEnrichedCount = 0;

    for (const {
      contact,
      previousAssociationType,
      requestedType,
    } of contactsToDebit) {
      const hasEmail = (contact.email ?? "").trim().length > 0;
      const hasPhone = (contact.phone ?? "").trim().length > 0;
      const counts = getChargeableCounts({
        type: requestedType,
        hasEmail,
        hasPhone,
        previousAssociationType:
          previousAssociationType ?? AssociationProExternalContactType.NONE,
      });
      emailEnrichedCount += counts.emailCount;
      phoneEnrichedCount += counts.phoneCount;
    }

    if (emailEnrichedCount + phoneEnrichedCount > 0) {
      await FullEnrichProvider.decrementProCredits({
        emailEnrichedCount,
        phoneEnrichedCount,
        proUuid,
      });
    }
  },

  async createFakeEnrichmentAndDecrementCredits({
    enrichmentId,
    legalEntityUuid,
    contactsToEnrich,
    proUuid,
    contactUuid,
  }: {
    enrichmentId: FullEnrichEnrichmentId;
    legalEntityUuid: LegalEntityUuid;
    contactsToEnrich: {
      contact: ExternalContact;
      previousAssociationType?: AssociationProExternalContactType;
      associationType: AssociationProExternalContactType;
    }[];
    proUuid: ProUuid;
    contactUuid: ContactUuid;
  }) {
    const contacts = contactsToEnrich.map(
      ({ contact }) => contact.uuid as ExternalContactUuid,
    );

    await EnrichmentRepository.create({
      enrichmentId,
      legalEntityUuid,
      contacts,
      status: FullEnrichEnrichmentStatus.FAKE_ENRICH,
      startedAt: new Date(),
      proUuid,
      contactUuid,
    });

    // Re-read contacts to get the most up-to-date data after the simulated update.
    const allContactsData = await Promise.all(
      contactsToEnrich.map(
        async ({ contact, previousAssociationType, associationType }) => ({
          contact:
            (await ExternalContactRepository.get(
              contact.uuid as ExternalContactUuid,
            )) ?? contact,
          previousAssociationType:
            previousAssociationType ?? AssociationProExternalContactType.NONE,
          associationType,
        }),
      ),
    );

    let emailEnrichedCount = 0;
    let phoneEnrichedCount = 0;

    for (const {
      contact,
      previousAssociationType,
      associationType,
    } of allContactsData) {
      const hasEmail = (contact.email ?? "").trim().length > 0;
      const hasPhone = (contact.phone ?? "").trim().length > 0;

      const counts = getChargeableCounts({
        type: associationType,
        hasEmail,
        hasPhone,
        previousAssociationType:
          previousAssociationType ?? AssociationProExternalContactType.NONE,
      });
      emailEnrichedCount += counts.emailCount;
      phoneEnrichedCount += counts.phoneCount;
    }

    if (emailEnrichedCount + phoneEnrichedCount > 0) {
      await FullEnrichProvider.decrementProCredits({
        emailEnrichedCount,
        phoneEnrichedCount,
        proUuid,
      });
    }

    return enrichmentId;
  },

  async handleFullEnrichEvent(
    payload: FullEnrichWebhookEventPayload,
    enrichmentId: FullEnrichEnrichmentId,
  ) {
    const enrichment = await EnrichmentRepository.get(enrichmentId);

    if (!enrichment) {
      console.error(
        `[FullEnrich] Enrichment record not found for ID: ${enrichmentId}`,
      );
      return;
    }

    await updateEnrichmentStatus(enrichmentId, payload.status);
    // We get the proUuid from the first entry's custom data because all entries should share the same proUuid
    const proUuid = getProUuidFromPayload(payload, enrichmentId);

    switch (payload.status) {
      // If the job is completed, we update the enrichment status and the related contacts and decrement credits
      case FullEnrichEnrichmentStatus.FINISHED: {
        // Workflow step 6: consume FullEnrich results, update contacts, then debit credits for data actually returned.
        let emailEnrichedCount = 0;
        let phoneEnrichedCount = 0;

        const { results: finishedCounts, errors: finishedErrors } =
          await processFinishedEntries(payload.datas ?? []);
        if (finishedErrors.length > 0) {
          console.error(
            `[FullEnrich] Failed to process ${finishedErrors.length} finished entries`,
            { enrichmentId, errors: finishedErrors },
          );
        }
        for (const counts of finishedCounts) {
          emailEnrichedCount += counts.emailCount;
          phoneEnrichedCount += counts.phoneCount;
        }

        if (emailEnrichedCount + phoneEnrichedCount > 0) {
          await FullEnrichProvider.decrementProCredits({
            emailEnrichedCount,
            phoneEnrichedCount,
            proUuid,
          });
        }

        break;
      }

      case FullEnrichEnrichmentStatus.CANCELED:
      case FullEnrichEnrichmentStatus.RATE_LIMIT:
      case FullEnrichEnrichmentStatus.UNKNOWN: {
        console.warn(
          `[FullEnrich] Enrichment job encountered an issue: ${payload.status}`,
          { enrichmentId: enrichment.enrichmentId },
        );

        break;
      }
      case FullEnrichEnrichmentStatus.CREDITS_INSUFFICIENT: {
        console.warn(
          `[FullEnrich] Enrichment job could not be completed due to insufficient credits`,
          { enrichmentId: enrichment.enrichmentId },
        );
        try {
          await handleInsufficientCredits(payload, proUuid);
        } catch (err) {
          console.error("Failed to send FullEnrich credits alert email", err);
        }
        break;
      }
      default: {
        console.warn(
          `[FullEnrich] Unhandled enrichment status: ${payload.status}`,
          { enrichmentId },
        );
        break;
      }
    }
  },
};

function buildHeaders({
  includeContentType = true,
}: { includeContentType?: boolean } = {}): Record<string, string> {
  const apiKey = process.env["FULLENRICH_API_KEY"];

  if (!apiKey) {
    throw new Error(
      "Missing required environment variable: FULLENRICH_API_KEY",
    );
  }

  const headers: Record<string, string> = {
    accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

type FullEnrichResponse = Awaited<ReturnType<typeof fetch>>;

async function parseResponse<Schema extends ZodTypeAny>(
  response: FullEnrichResponse,
  schema: Schema,
  actionPerformed: string,
): Promise<z.infer<Schema>> {
  const bodyText = await response.text();
  let payload: unknown = null;

  if (bodyText) {
    try {
      payload = JSON.parse(bodyText);
    } catch (error) {
      console.error(
        `[FullEnrich] Failed to parse JSON while attempting to ${actionPerformed}`,
        {
          bodyText,
          status: response.status,
          statusText: response.statusText,
          error,
        },
      );
      throw new Error(
        `[FullEnrich] ${actionPerformed} failed because the API returned invalid JSON.`,
      );
    }
  }

  if (response.ok) {
    const parsed = schema.safeParse(payload);
    if (parsed.success) {
      return parsed.data;
    }

    const formattedErrors = formatZodError(parsed.error).errors?.join(", ");
    console.error(
      `[FullEnrich] Unexpected response shape while attempting to ${actionPerformed}`,
      {
        payload,
        status: response.status,
        statusText: response.statusText,
        errors: formattedErrors,
      },
    );
    throw new Error(
      `[FullEnrich] ${actionPerformed} succeeded but the payload shape was invalid: ${formattedErrors ?? "Unknown validation error"}`,
    );
  }

  const fullEnrichError = fullEnrichErrorResponseSchema.safeParse(payload);
  if (fullEnrichError.success) {
    throw new Error(
      `[FullEnrich] ${actionPerformed} failed (${fullEnrichError.data.code}): ${fullEnrichError.data.message}`,
    );
  }

  throw new Error(
    `[FullEnrich] ${actionPerformed} failed with status ${response.status}: ${response.statusText}`,
  );
}
