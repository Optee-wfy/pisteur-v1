import {
  ExternalContactSeniority,
  ExternalContactType,
  formatAndGroupDomain,
  HUNTER_DEPARTMENTS_SORTED,
} from "@optee/constants";
import { MailersendProvider } from "@optee/mailersend-server";
import { z } from "zod";

/* ---------- Schemas ---------- */
/**
 * Schema for a single source inside an email entry
 */
const EmailSourceSchema = z.object({
  domain: z.string().optional(),
  uri: z.string().url().optional(),
  extracted_on: z.string().optional(), // keep as string, parsed below maybe
  last_seen_on: z.string().optional(),
  still_on_page: z.boolean().optional(),
});

/**
 * Schema for verification object (we convert date -> Date with preprocess)
 */
const VerificationSchema = z.object({
  date: z.preprocess((v) => {
    if (typeof v === "string") {
      const d = new Date(String(v));
      if (!isNaN(d.getTime())) {
        return d;
      }
      return undefined;
    }
    if (typeof v === "number") {
      const d = new Date(v);
      if (!isNaN(d.getTime())) {
        return d;
      }
      return undefined;
    }
    return v;
  }, z.date().optional().nullable()),

  // allow string | undefined | null
  status: z.string().optional().nullable(),
});

/**
 * Schema for a single email entry
 */
const EmailEntrySchema = z.object({
  value: z.string().email(),
  type: z.nativeEnum(ExternalContactType).optional(),
  confidence: z.number().optional(),
  sources: z.array(EmailSourceSchema).optional().default([]),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  position_raw: z.string().optional().nullable(),
  seniority: z.nativeEnum(ExternalContactSeniority).optional().nullable(),
  department: z.string().optional().nullable(),
  linkedin: z.string().url().optional().nullable(),
  twitter: z.string().url().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  verification: VerificationSchema.optional().nullable(),
});

/**
 * Top-level `data` object schema returned by Hunter
 */
const HunterDataSchema = z.object({
  domain: z.string(),
  disposable: z.boolean().optional(),
  webmail: z.boolean().optional(),
  accept_all: z.boolean().optional(),
  pattern: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  linked_domains: z.array(z.string()).optional().default([]),
  emails: z.array(EmailEntrySchema).optional().default([]),
});

export type HunterData = z.infer<typeof HunterDataSchema>;
export type HunterEmail = z.infer<typeof EmailEntrySchema>;

const HUNTER_API_KEY = process.env["HUNTER_API_KEY"];
const HUNTER_URL = "https://api.hunter.io/v2/domain-search?";
const HUNTER_REQUIRED_FIELDS = ["full_name", "position"] as const;

const HUNTER_QUERY_DEFAULTS = {
  limit: "5",
  verification_status: "valid",
  required_field: HUNTER_REQUIRED_FIELDS.join(","),
  department: HUNTER_DEPARTMENTS_SORTED.join(","),
} as const;

const isCompatibleEnvironment = ["production", "preview"].includes(
  process.env["VITE_ENV"] ?? "",
);

if (!HUNTER_API_KEY && isCompatibleEnvironment) {
  throw new Error("Missing env var: HUNTER_API_KEY must be set.");
}

const MOCK_HUNTER_DATA: HunterData = {
  domain: "www.test.com",
  emails: [
    {
      value: "test@example.com",
      type: ExternalContactType.PERSONAL,
      confidence: 90,
      first_name: "Test",
      last_name: "User",
      position: "Software Engineer",
      position_raw: "Software Engineer",
      twitter: null,
      linkedin: null,
      phone_number: null,
      sources: [
        {
          domain: "example.com",
          uri: "http://example.com/source1",
          extracted_on: "2023-01-01",
          last_seen_on: "2023-06-01",
          still_on_page: true,
        },
      ],
      verification: {
        date: new Date("2023-06-15"),
        status: "verified",
      },
    },
    {
      value: "contact@example.com",
      type: ExternalContactType.GENERIC,
      confidence: 40,
      first_name: "",
      last_name: "",
      position: "Contact officer",
      position_raw: "Contact officer",
      twitter: null,
      linkedin: null,
      phone_number: null,
      sources: [
        {
          domain: "example.com",
          uri: "http://example.com/source1",
          extracted_on: "2023-01-01",
          last_seen_on: "2023-06-01",
          still_on_page: true,
        },
      ],
      verification: {
        date: new Date("2023-06-15"),
        status: "verified",
      },
    },
  ],
  linked_domains: [],
};

/**
 * Provides methods to interact with Hunter API.
 *
 * @see https://hunter.io/api-documentation/v2#domain-search
 */
export const HunterProvider = {
  async fetchHunterData(domain: string) {
    if (!isCompatibleEnvironment) {
      return MOCK_HUNTER_DATA;
    }

    const { formattedDomain } = formatAndGroupDomain(domain);

    const queryParams = new URLSearchParams({
      api_key: HUNTER_API_KEY!, // We checked its presence above
      domain: formattedDomain,
      ...HUNTER_QUERY_DEFAULTS,
    });

    const url = `${HUNTER_URL}${queryParams.toString()}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 429) {
          try {
            await MailersendProvider.notifyInsufficientCredits("Hunter");
          } catch (err) {
            console.error("Failed to send Hunter credits alert email", err);
          }
        }
        throw new Error(`Hunter API returned ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();

      const rawData = json?.data;
      if (!rawData) {
        throw new Error("Hunter response missing `data` field");
      }

      const parsed = HunterDataSchema.safeParse(rawData);
      if (!parsed.success) {
        // format errors into something readable for logs/errors
        const issues = parsed.error.issues
          .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
          .join("; ");
        throw new Error(`Invalid Hunter data shape: ${issues}`);
      }

      return parsed.data;
    } catch (err) {
      throw new Error(`Hunter API error: ${String(err)}`);
    }
  },
};
