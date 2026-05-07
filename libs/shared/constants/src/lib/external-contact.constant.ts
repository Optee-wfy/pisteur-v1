import type { Prettify } from "@optee/utils";
import { paginationRequestSchema } from "@optee/utils";
import z from "zod";

export enum AssociationProExternalContactStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  CLOSED_WON = "CLOSED_WON",
  CLOSED_LOST = "CLOSED_LOST",
  ARCHIVED = "ARCHIVED",
}

// EXTERNAL CONTACT SOURCES

export enum ExternalContactSource {
  PAPPERS = "pappers",
  HUNTER = "hunter",
  HUNTER_GROUP = "hunter_group",
  SOCIETE_INFO = "societe_info",
}
// EXTERNAL CONTACT TYPES

export enum ExternalContactType {
  PERSONAL = "personal",
  GENERIC = "generic",
}

export enum ExternalContactSeniority {
  JUNIOR = "junior",
  SENIOR = "senior",
  EXECUTIVE = "executive",
  MANDATAIRE = "MANDATAIRE",
  DIRIGEANT = "DIRIGEANT",
  GERANT = "GERANT",
  DIRECTEUR = "DIRECTEUR",
  RESPONSABLE = "RESPONSABLE",
  ASSIST = "ASSIST",
  COLLAB = "COLLAB",
  AUTRE = "AUTRE",
}

export const ExternalContactStatusLabels: Record<
  AssociationProExternalContactStatus,
  string
> = {
  [AssociationProExternalContactStatus.NEW]: "Nouveau",
  [AssociationProExternalContactStatus.IN_PROGRESS]: "En cours",
  [AssociationProExternalContactStatus.CLOSED_WON]: "Gagné",
  [AssociationProExternalContactStatus.CLOSED_LOST]: "Perdu",
  [AssociationProExternalContactStatus.ARCHIVED]: "Archivé",
};

// Type of association between a pro and an external contact
export enum AssociationProExternalContactType {
  SEARCHED = "SEARCHED", // Pro has searched for the contact but not enriched it
  NONE = "NONE", // Pro is associated but no data enriched
  PHONE = "PHONE", // Pro has enriched phone number only
  MAIL = "MAIL", // Pro has enriched email only
  BOTH = "BOTH", // Pro has enriched both email and phone number
}

export const AssociationProExternalContactsLabels: Record<
  AssociationProExternalContactType,
  string
> = {
  [AssociationProExternalContactType.SEARCHED]: "Recherché",
  [AssociationProExternalContactType.NONE]: "A enrichir",
  [AssociationProExternalContactType.PHONE]: "Téléphone uniquement",
  [AssociationProExternalContactType.MAIL]: "Email uniquement",
  [AssociationProExternalContactType.BOTH]: "Email + téléphone",
};

export const externalContactSortFields = ["name"] as const;

export const externalContactFiltersSchema = z.object({
  unlockedOnly: z.boolean().nullish(),
  associationProExternalContacts: z
    .array(z.nativeEnum(AssociationProExternalContactType))
    .nullish(),

  search: z
    .string()
    .transform((s) => s.trim())
    .transform((s) => (s.length < 2 ? null : s))
    .nullish(),
  role: z.array(z.string()).nullish(),
  status: z.array(z.nativeEnum(AssociationProExternalContactStatus)).nullish(),
  ownerUuid: z.array(z.string().brand("ContactUuid")).nullish(),
  legalEntityUuids: z.array(z.string().brand("LegalEntityUuid")).nullish(),
  sort: z
    .object({
      sortBy: z.enum(externalContactSortFields),
      sortOrder: z.enum(["asc", "desc"]),
    })
    .nullish(),
});

export type ExternalContactFilters = z.infer<
  typeof externalContactFiltersSchema
>;

export const externalContactListInputSchema = externalContactFiltersSchema.and(
  paginationRequestSchema,
);
export type ExternalContactListInput = Prettify<
  z.infer<typeof externalContactListInputSchema>
>;

export const CONFIDENCE_SCORE_PAPPERS = 99;
export const CONFIDENCE_SCORE_GROUP_ENTITY = 50;
export const CONFIDENCE_SCORE_MULTI_ENTITY_PENALTY = 50;

export const WORK_DOMAINS = [
  "DG",
  "ADMIN_FINANCE",
  "ACHAT",
  "RH",
  "IT",
  "MARKETING",
  "COMMUNICATION",
  "CONFORMITE",
  "COMMERCE",
  "JURIDIQUE",
  "R_D",
  "SAV",
  "PROD_LOGISTIQUE",
  "AGRI",
  "ARMEE",
  "ART",
  "AUTOMOBILE",
  "BANQ_ASSUR",
  "BEAUTE",
  "BTP",
  "CAISSIER",
  "CHR",
  "FORMATION_ENSEIGN",
  "FUNERAIRE",
  "LOISIR",
  "MAGASIN",
  "PHARMA",
  "PRESSING",
  "PUBLIC_SOCIAL",
  "SECURITE",
  "SANTE",
  "TEXTILE",
] as const;

export type WorkDomain = (typeof WORK_DOMAINS)[number];
// Synced with Societe Info work domains and labels
export const WORK_DOMAIN_LABELS: Record<WorkDomain, string> = {
  DG: "Direction Générale",
  ADMIN_FINANCE: "Administration et Finance",
  ACHAT: "Achats",
  RH: "Ressources Humaines",
  IT: "Informatique",
  MARKETING: "Marketing",
  COMMUNICATION: "Communication",
  CONFORMITE: "Conformité",
  COMMERCE: "Commerce",
  JURIDIQUE: "Juridique",
  R_D: "Recherche et Développement",
  SAV: "Relation et support client",
  PROD_LOGISTIQUE: "Production et Logistique",
  AGRI: "Agricole",
  ARMEE: "Armée et Défense",
  ART: "Art et Design",
  AUTOMOBILE: "Automobile",
  BANQ_ASSUR: "Banque Assurance",
  BEAUTE: "Soin Beauté Cosmétique",
  BTP: "Construction",
  CAISSIER: "Personnel de caisse",
  CHR: "Café Hotellerie Restauration",
  FORMATION_ENSEIGN: "Formation et Enseignement",
  FUNERAIRE: "Services funéraires",
  LOISIR: "Loisir",
  MAGASIN: "Magasin",
  PHARMA: "Pharmacie",
  PRESSING: "Pressing",
  PUBLIC_SOCIAL: "Adminstration publiques et sociales",
  SECURITE: "Sécurité",
  SANTE: "Santé et Médical",
  TEXTILE: "Textile",
};
export const getWorkDomainByLabel = (label: string): WorkDomain | null => {
  const entry = Object.entries(WORK_DOMAIN_LABELS).find(
    ([, value]) => value === label,
  );
  return entry ? (entry[0] as WorkDomain) : null;
};

export const getWorkDomainLabelByValue = (value: string): string | null => {
  return WORK_DOMAIN_LABELS[value as WorkDomain] ?? null;
};

export const CONTACT_LEVELS = [
  "MANDATAIRE",
  "DIRIGEANT",
  "GERANT",
  "DIRECTEUR",
  "RESPONSABLE",
  "ASSIST",
  "COLLAB",
  "AUTRE",
] as const;

export type ContactLevel = (typeof CONTACT_LEVELS)[number];
export const CONTACT_LEVEL_LABELS: Record<ContactLevel, string> = {
  MANDATAIRE: "Mandataire",
  DIRIGEANT: "Dirigeant",
  GERANT: "Gérant",
  DIRECTEUR: "Directeur",
  RESPONSABLE: "Responsable",
  ASSIST: "Assistant",
  COLLAB: "Collaborateur",
  AUTRE: "Autre",
};

export const externalContactSearchFiltersSchema = z.object({
  domains: z.array(z.enum(WORK_DOMAINS)).optional().default([]),
  levels: z.array(z.enum(CONTACT_LEVELS)).optional().default([]),
  search: z.string().optional().default(""),
});

export type ExternalContactSearchFilters = z.infer<
  typeof externalContactSearchFiltersSchema
>;

export const DEFAULT_EXTERNAL_CONTACT_SEARCH_FILTERS: ExternalContactSearchFilters =
  {
    domains: [],
    levels: [],
    search: "",
  };

const CONTACT_LEVEL_BY_LABEL = new Map(
  Object.entries(CONTACT_LEVEL_LABELS).map(([level, label]) => [
    label.toLowerCase(),
    level as ContactLevel,
  ]),
);

const EXTERNAL_CONTACT_SENIORITY_VALUES = new Set(
  Object.values(ExternalContactSeniority),
);

const EXTERNAL_SENIORITY_BY_LOWER = new Map(
  Object.values(ExternalContactSeniority).map((value) => [
    value.toLowerCase(),
    value,
  ]),
);

export const EXTERNAL_SENIORITY_TO_CONTACT_LEVEL: Record<
  ExternalContactSeniority,
  ContactLevel
> = {
  [ExternalContactSeniority.JUNIOR]: "COLLAB",
  [ExternalContactSeniority.SENIOR]: "RESPONSABLE",
  [ExternalContactSeniority.EXECUTIVE]: "DIRECTEUR",
  [ExternalContactSeniority.MANDATAIRE]: "MANDATAIRE",
  [ExternalContactSeniority.DIRIGEANT]: "DIRIGEANT",
  [ExternalContactSeniority.GERANT]: "GERANT",
  [ExternalContactSeniority.DIRECTEUR]: "DIRECTEUR",
  [ExternalContactSeniority.RESPONSABLE]: "RESPONSABLE",
  [ExternalContactSeniority.ASSIST]: "ASSIST",
  [ExternalContactSeniority.COLLAB]: "COLLAB",
  [ExternalContactSeniority.AUTRE]: "AUTRE",
};

export const coerceSeniority = (
  value: string | null | undefined,
): ExternalContactSeniority | null => {
  if (!value) {
    return null;
  }

  if (
    EXTERNAL_CONTACT_SENIORITY_VALUES.has(value as ExternalContactSeniority)
  ) {
    return value as ExternalContactSeniority;
  }

  const normalized = value.trim().toLowerCase();
  const normalizedByValue = EXTERNAL_SENIORITY_BY_LOWER.get(normalized);
  if (normalizedByValue) {
    return normalizedByValue;
  }
  const level = CONTACT_LEVEL_BY_LABEL.get(normalized);
  if (!level) {
    return null;
  }
  return ExternalContactSeniority[level] ?? null;
};
