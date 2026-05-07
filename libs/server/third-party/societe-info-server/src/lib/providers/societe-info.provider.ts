import type { ContactLevel, WorkDomain } from "@optee/constants";
import { MailersendProvider } from "@optee/mailersend-server";
import { z } from "zod";

export const isCompatibleEnvironment = ["production", "preview"].includes(
  process.env["VITE_ENV"] ?? "",
);

/* ---------- Schemas ---------- */
const UrlSchema = z.string().url().nullish();
// Societe Info sometimes returns non-YYYY-MM-DD date strings (or empty).
// Be permissive and validate downstream if needed.
const DateStringSchema = z.string().nullish();

const ContactSchema = z.object({
  id: z.string().nullish(),
  civility: z.string().nullish(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  birth_date: DateStringSchema,

  domain_code: z.string().nullish(),
  domain_label: z.string().nullish(),
  level_code: z.string().nullish(),
  level_label: z.string().nullish(),
  role: z.string().nullish(),

  email: z.union([z.string().email(), z.string()]).nullish(),
  email_score: z.number().nullish(),
  email_test_result: z.string().nullish(),
  email_test_reason: z.string().nullish(),
  email_test_date: DateStringSchema,
  email_webmail: z.boolean().nullish(),

  linkedin_url: UrlSchema,
  extraction_date: DateStringSchema,

  anonymized: z.boolean().nullish(), // vu dans show_all_anonymized :contentReference[oaicite:3]{index=3}

  hashcode: z.string().nullish(),
  contact_score: z.number().nullish(),
});

const CompanySchema = z.object({
  id: z.string().nullish(),
  registration_number: z.string().nullish(),
  full_registration_number: z.string().nullish(),
  legal_type: z.string().nullish(),
  name: z.string().nullish(),
  business_name: z.string().nullish(),
  activity: z.string().nullish(),
  formatted_address: z.string().nullish(),
  ape_code: z.string().nullish(),
  ape_name: z.string().nullish(),

  address: z
    .object({
      street: z.string().nullish(),
      postal_code: z.string().nullish(),
      city: z.string().nullish(),
      country_code: z.string().nullish(),
      country: z.string().nullish(),
      lng: z.number().nullish(),
      lat: z.number().nullish(),
    })
    .nullish(),

  juridical_form_code: z.string().nullish(),
  juridical_form_name: z.string().nullish(),
  website_url: UrlSchema,
  linkedin_url: UrlSchema,
  generic_email: z.string().nullish(),
  generic_phone: z.string().nullish(),
  last_sales: z.number().nullish(),
  last_profit: z.number().nullish(),
  last_staff: z.number().nullish(),

  insee_category: z
    .object({
      code: z.string().nullish(),
      name: z.string().nullish(),
    })
    .nullish(),
});

const EmailDomainSchema = z.object({
  domain: z.string().nullish(),
  pattern: z.string().nullish(),
});

const EmailSchema = z.object({
  value: z.union([z.string().email(), z.string()]).nullish(),
  type: z.string().nullish(),
  sources: z
    .array(
      z.object({
        url: UrlSchema,
      }),
    )
    .nullish(),
});

const SuccessResponseSchema = z.object({
  success: z.literal(true),

  // parfois présent (réponse complète) :contentReference[oaicite:4]{index=4}
  company: CompanySchema.nullish(),
  email_domains: z.array(EmailDomainSchema).nullish(),
  emails: z.array(EmailSchema).nullish(),

  // toujours possible, parfois seuls champs renvoyés :contentReference[oaicite:5]{index=5}
  contacts_count: z.number().nullish(),
  contacts: z.array(ContactSchema).nullish(),
});

const ErrorResponseSchema = z.object({
  success: z.literal(false),
  errorType: z.string(),
  errorCode: z.string(),
  errorMessage: z.string(),
});

export const SocieteInfoResponseSchema = z.discriminatedUnion("success", [
  SuccessResponseSchema,
  ErrorResponseSchema,
]);
export type Response = z.infer<typeof SocieteInfoResponseSchema>;
type SocieteInfoSuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type SocieteInfoGetErrorCode =
  | "API_MAX_MATCH_EXCEEDED"
  | "NO_MATCH"
  | "FETCH_ERROR";
export type SocieteInfoGetResult =
  | SocieteInfoSuccessResponse
  | { errorCode: SocieteInfoGetErrorCode };
const societeInfoGetErrorCodes: SocieteInfoGetErrorCode[] = [
  "API_MAX_MATCH_EXCEEDED",
  "NO_MATCH",
  "FETCH_ERROR",
];
const isSocieteInfoGetErrorResult = (
  value: unknown,
): value is { errorCode: SocieteInfoGetErrorCode } => {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (!("errorCode" in value)) {
    return false;
  }
  const errorCode = (value as { errorCode?: unknown }).errorCode;
  return (
    typeof errorCode === "string" &&
    societeInfoGetErrorCodes.includes(errorCode as SocieteInfoGetErrorCode)
  );
};

const MOCKUP = {
  success: true as const,
  company: {
    id: "000000000",
    registration_number: "000000000",
    full_registration_number: "00000000000000",
    name: "Test Company",
    legal_type: "SAS",
    activity: "Activité de test",
    formatted_address: "1 Rue de Test, 75000 Paris, France",
    ape_code: "0000Z",
    ape_name: "Activité de test",
    address: {
      street: "1 Rue de Test",
      postal_code: "75000",
      city: "Paris",
      country_code: "FR",
      country: "France",
      lng: 2.3522,
      lat: 48.8566,
    },
    juridical_form_code: "572",
    juridical_form_name: "Société par actions simplifiée",
    website_url: "https://www.testcompany.com",
    linkedin_url: "https://www.linkedin.com/company/testcompany",
    generic_email: "contact@testcompany.com",
    last_sales: 1000000,
    last_profit: 100000,
    last_staff: 10,
    insee_category: {
      code: "A",
      name: "Très petite entreprise",
    },
  },
  email_domains: [{ domain: "testcompany.com", pattern: "contact@{domain}" }],
  contacts: [
    {
      id: "test-contact-1",
      civility: "M.",
      firstName: "Jean",
      lastName: "Dupont",
      birth_date: "1980-01-01",
      domain_code: "DG-ADMIN",
      domain_label: "Direction Générale et Administration",
      level_code: "GERANT",
      level_label: "Gérant",
      role: "Directeur Général",
      email: "jean.dupont@testcompany.com",
      email_score: 0.95,
      email_test_result: "valid",
      email_test_reason: "Mailbox exists",
      email_test_date: "2024-01-01",
      email_webmail: false,
      linkedin_url: "https://www.linkedin.com/in/jeandupont",
      extraction_date: "2024-01-01",
      hashcode: "hashcode123",
      contact_score: 0.95,
    },
    {
      id: "test-contact-2",
      civility: "Mme",
      firstName: "Marie",
      lastName: "Curie",
      birth_date: "1985-05-15",
      domain_code: "TECH-DEV",
      domain_label: "Technologie et Développement",
      level_code: "DIRECTEUR",
      level_label: "Directeur",
      role: "CTO",
      email: "",
      email_score: null,
      email_test_result: null,
      email_test_reason: null,
      email_test_date: null,
      email_webmail: null,
      linkedin_url: "https://www.linkedin.com/in/mariecurie",
      extraction_date: "2024-01-01",
      hashcode: "hashcode456",
      contact_score: 0.8,
    },
  ],
  contacts_count: 1,
  emails: [],
};

/**
 * Provides methods to interact with Societe Info API.
 *
 * @see https://societeinfo.com/api-doc/#get-contacts-by-company
 */
export const SocieteInfoProvider = {
  /**
   * Fetch contacts for a given SIREN from Societe Info.
   * If contacts ids are provided, only those contacts will be fetched.
   * If no contacts ids are provided, all anonymized contacts will be fetched.
   */
  async get({
    siren,
    levels,
    domains,
    maxResults,
    contacts,
  }: {
    siren: string;
    levels: ContactLevel[];
    domains: WorkDomain[];
    contacts: string[];
    maxResults?: number;
  }): Promise<SocieteInfoGetResult> {
    if (!isCompatibleEnvironment) {
      return MOCKUP;
    }

    try {
      const apiKey = process.env["SOCIETE_INFO_API_KEY"];

      if (!apiKey) {
        throw new Error("SOCIETE_INFO_API_KEY is not defined");
      }

      const domainsFiltered = domains.filter(Boolean);
      const levelsFiltered = levels.filter(Boolean);

      const queryParamsParts: string[] = [];

      if (domainsFiltered.length > 0) {
        queryParamsParts.push(
          ...domainsFiltered.map(
            (value) => `contact_domain_code=${encodeURIComponent(value)}`,
          ),
        );
      }

      if (levelsFiltered.length > 0) {
        queryParamsParts.push(
          ...levelsFiltered.map(
            (value) => `contact_level_code=${encodeURIComponent(value)}`,
          ),
        );
      }

      queryParamsParts.push(
        `contact_max=${encodeURIComponent(maxResults ?? 100)}`,
      );

      const filteredContacts = contacts.filter(Boolean);
      if (filteredContacts.length > 0) {
        queryParamsParts.push(
          ...filteredContacts.map(
            (value) => `contact_ids=${encodeURIComponent(value)}`,
          ),
        );
      } else {
        queryParamsParts.push(`show_all_anonymized=true`);
      }

      const queryParams = queryParamsParts.join("&");

      const url = `https://societeinfo.com/app/rest/api/v2/contacts.json/${siren}?${queryParams}`;

      const res = await fetch(url, {
        headers: {
          "X-API-KEY": apiKey,
        },
      });

      const body = await res.json().catch(() => null);
      const parsedResult = SocieteInfoResponseSchema.safeParse(body);
      if (!parsedResult.success) {
        const statusDetails = `${res.status} ${res.statusText}`;
        throw new Error(
          `Invalid Societe Info response (${statusDetails}): ${parsedResult.error.message}`,
        );
      }
      const parsed = parsedResult.data;

      if (!res.ok) {
        console.error("🚩 [Societe Info] API error response:", {
          siren,
          domains,
          levels,
          response: parsed,
        });
        const statusDetails = `${res.status} ${res.statusText}`;
        const errorCode = "errorCode" in parsed ? parsed.errorCode : undefined;
        if (errorCode === "API_CONTACT_NOT_FOUND") {
          return { errorCode: "NO_MATCH" };
        }
        throw new Error(
          `Error fetching contacts from Societe Info: ${statusDetails}${
            errorCode ? ` (${errorCode})` : ""
          }`,
        );
      }
      if (!parsed.success) {
        if (parsed.errorCode === "API_MAX_MATCH_EXCEEDED") {
          try {
            await MailersendProvider.notifyInsufficientCredits("Societe Info");
          } catch (err) {
            console.error(
              "Failed to send Societe Info credits alert email",
              err,
            );
          }
          return { errorCode: "API_MAX_MATCH_EXCEEDED" };
        }
        if (parsed.errorCode === "API_CONTACT_NOT_FOUND") {
          return { errorCode: "NO_MATCH" };
        }
        return { errorCode: "FETCH_ERROR" };
      }
      return parsed;
    } catch (error) {
      console.error("🚩 [Societe Info] Failed to fetch contacts:", error, {
        siren,
        domains,
        levels,
      });
      return { errorCode: "FETCH_ERROR" };
    }
  },
};
