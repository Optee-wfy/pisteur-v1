import { faker } from "@faker-js/faker";
import type { EmployeeRange } from "@optee/constants";
import { MailersendProvider } from "@optee/mailersend-server";
import { z } from "zod";

/* ---------- Schemas ---------- */

const ActivitySchema = z.object({
  code: z.string(),
  name: z.string(),
});

const LocalActivitySchema = z.object({
  code: z.string(),
  name: z.string(),
  classification: z.string().nullable().optional(),
});

const HeadOfficeSchema = z
  .object({
    address_line_1: z.string().nullable().optional(),
    address_line_2: z.string().nullable().optional(),
    postal_code: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    country_code: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const OfficerSchema = z
  .object({
    type: z.enum(["legal", "physical"]).nullable().optional(),
    role: z.string().nullable().optional(),
    date_of_appointment: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    first_name: z.string().nullable().optional(),
    assumed_name: z.string().nullable().optional(),
    gender: z.string().nullable().optional(),
    date_of_birth: z.string().nullable().optional(),
    date_of_birth_format: z.string().nullable().optional(),
    nationality: z.string().nullable().optional(),
    nationality_code: z.string().nullable().optional(),
    company_name: z.string().nullable().optional(),
    company_number: z.string().nullable().optional(),
    address_line_1: z.string().nullable().optional(),
    address_line_2: z.string().nullable().optional(),
    postal_code: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    country_code: z.string().nullable().optional(),
  })
  .passthrough();

const UboSchema = z
  .object({
    // UBO structure varies across responses — accept common fields but allow extra
    role: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    first_name: z.string().nullable().optional(),
    date_of_birth: z.string().nullable().optional(),
    nationality: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    company_name: z.string().nullable().optional(),
    company_number: z.string().nullable().optional(),
  })
  .passthrough();

const ContactSchema = z
  .object({
    // contact objects vary; accept common fields and allow extras
    type: z.string().nullable().optional(),
    label: z.string().nullable().optional(),
    value: z.string().nullable().optional(),
  })
  .passthrough();

const EstablishmentSchema = z
  .object({
    number: z.string(),
    name: z.string().nullable().optional(),
    trade_name: z.string().nullable().optional(),
    acronym: z.string().nullable().optional(),

    activities: z.array(ActivitySchema).nullable().optional(),
    fields_of_activity: z.array(z.string()).nullable().optional(),
    local_activities: z.array(LocalActivitySchema).nullable().optional(),

    date_of_creation: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    date_of_cessation: z.string().nullable().optional(),

    address_line_1: z.string().nullable().optional(),
    address_line_2: z.string().nullable().optional(),
    postal_code: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    country_code: z.string().nullable().optional(),
  })
  .passthrough();

/* Main company schema */
export const CompanySchema = z
  .object({
    company_number: z.string(),
    country_code: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    trade_name: z.string().nullable().optional(),
    acronym: z.string().nullable().optional(),
    vat_number: z.string().nullable().optional(),
    legal_form_code: z.string().nullable().optional(),
    local_legal_form_code: z.string().nullable().optional(),
    local_legal_form_name: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    activities: z.array(ActivitySchema).nullable().optional(),
    fields_of_activity: z.array(z.string()).nullable().optional(),
    local_activities: z.array(LocalActivitySchema).nullable().optional(),
    purpose: z.string().nullable().optional(),
    date_of_creation: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    date_of_cessation: z.string().nullable().optional(),
    workforce: z.number().nullable().optional(),
    workforce_range: z.string().nullable().optional(),
    head_office: HeadOfficeSchema,
    commercial_register_registration_status: z.string().nullable().optional(),
    commercial_register_registration_location: z.string().nullable().optional(),
    commercial_register_registration_date: z.string().nullable().optional(),
    commercial_register_cessation_date: z.string().nullable().optional(),
    share_capital: z.number().nullable().optional(),
    share_capital_currency: z.string().nullable().optional(),
    next_fiscal_year_end: z.string().nullable().optional(),
    fiscal_year_end: z.string().nullable().optional(),
    officers: z.array(OfficerSchema),
    ubos: z.array(UboSchema).nullable().optional(),
    contacts: z.array(ContactSchema).nullable().optional(),
    establishments: z.array(EstablishmentSchema).nullable().optional(),
  })
  .passthrough(); // allow other fields returned by Pappers that we don't explicitly model

export type Company = z.infer<typeof CompanySchema>;
export type Officer = z.infer<typeof OfficerSchema>;

export const isCompatibleEnvironment = ["production", "preview"].includes(
  process.env["VITE_ENV"] ?? "",
);

export const PAPPERS_TO_INTERNAL_RANGE: Record<string, EmployeeRange> = {
  "1-2": "1 ou 2 salariés",
  "3-5": "3 à 5 salariés",
  "6-9": "6 à 9 salariés",
  "10-19": "10 à 19 salariés",
  "20-49": "20 à 49 salariés",
  "50-99": "50 à 99 salariés",
  "100-199": "100 à 199 salariés",
  "200-249": "200 à 249 salariés",
  "250-499": "250 à 499 salariés",
  "500-999": "500 à 999 salariés",
  "1000-1999": "1 000 à 1 999 salariés",
  "2000-4999": "2 000 à 4 999 salariés",
  "5000-9999": "5 000 à 9 999 salariés",
  "10000+": "10 000 salariés et plus",
  "0": "0 salarié",
  "non-employeuse": "Unité non-employeuse",
};

export function mapPappersWorkforceRange(
  value: string | null | undefined,
): EmployeeRange | null {
  if (!value) {
    return null;
  }

  return PAPPERS_TO_INTERNAL_RANGE[value] ?? null;
}

/**
 * Provides methods to interact with Pappers API.
 *
 * @see https://www.pappers.in/api/documentation#tag/Company/operation/company
 */
export const PappersProvider = {
  async fetchCompanyInfo(siren: string): Promise<Company | undefined> {
    if (!isCompatibleEnvironment) {
      return {
        company_number: siren,
        country_code: "FR",
        name: faker.company.name(),
        trade_name: faker.company.name(),
        officers: [
          {
            type: "physical",
            role: "Directeur Général",
            last_name: faker.person.lastName(),
            first_name: faker.person.firstName(),
          },
          {
            type: "physical",
            role: "Président",
            last_name: faker.person.lastName(),
            first_name: faker.person.firstName(),
          },
          {
            type: "physical",
            role: faker.person.jobTitle(),
            last_name: faker.person.lastName(),
            first_name: faker.person.firstName(),
          },
          {
            type: "physical",
            role: faker.person.jobTitle(),
            last_name: faker.person.lastName(),
            first_name: faker.person.firstName(),
          },

          // Fake contact without email or phone to test enrichment credit deduction
          {
            type: "physical",
            role: faker.person.jobTitle(),
            last_name: "Meunier",
            first_name: faker.person.firstName(),
          },
        ],
        ubos: [],
        contacts: [],
        purpose: "Activité de test en environnement non-produit",
      };
    }

    const PAPPERS_API_KEY = process.env["PAPPERS_API_KEY"];
    if (!/^\d{9}$/.test(siren)) {
      throw new Error(
        `Invalid SIREN format: expected 9 digits, got "${siren}"`,
      );
    }
    if (!PAPPERS_API_KEY) {
      throw new Error("Missing env var: PAPPERS_API_KEY must be set.");
    }
    const PAPPERS_URL = "https://api.pappers.in/v1/company";
    const url = `${PAPPERS_URL}?api_token=${PAPPERS_API_KEY}&country_code=FR&company_number=${siren}&fields=contacts,officers,ubos,establishments`;
    try {
      const res = await fetch(url);
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        if (body && body.statusCode === 401) {
          if (body.message === "Your api_token is incorrect") {
            throw new Error("401 : Pappers api_token is incorrect");
          } else if (
            body.message.startsWith(
              "You no longer have enough tokens to perform this request",
            )
          ) {
            try {
              await MailersendProvider.notifyInsufficientCredits("Pappers");
            } catch (err) {
              console.error("Failed to send Pappers credits alert email", err);
            }
            throw new Error("401 : Not enough Pappers credits");
          }
          throw new Error(
            `401 : ${body.message || "Unknown authorization error"}`,
          );
        }
        if (!body || body.statusCode !== 401) {
          throw new Error(
            `Pappers API returned ${res.status}: ${res.statusText}`,
          );
        }
      }

      if (!body) {
        throw new Error("Pappers API returned an empty or non-JSON response.");
      }

      const parsed = CompanySchema.safeParse(body);

      if (!parsed.success) {
        throw new Error(
          `Réponse invalide de Pappers: ${
            parsed.error.flatten().fieldErrors
              ? JSON.stringify(parsed.error.flatten().fieldErrors)
              : parsed.error.message
          }`,
        );
      }

      return parsed.data;
    } catch (err) {
      throw new Error(`Pappers API error: ${String(err)}`);
    }
  },
};
