import type { NumberRange } from "./generic.constant";

export const getLegalEntityTypeLabel = (
  type?: LegalEntityType | "mixte" | null,
) => {
  switch (type) {
    case "copro":
      return "Copropriété";
    case "tertiaire":
      return "Tertiaire";
    case "public":
      return "Public";
    case "mixte":
      return "Mixte";
    default:
      return null;
  }
}; // LEGAL ENTITY TYPES

export const LEGAL_ENTITY_TYPES = ["public", "copro", "tertiaire"] as const;
export type LegalEntityType = (typeof LEGAL_ENTITY_TYPES)[number];
export const LEGAL_ENTITY_FILTER_TYPES = [
  ...LEGAL_ENTITY_TYPES,
  "mixte",
] as const;
export type LegalEntityFilterType = (typeof LEGAL_ENTITY_FILTER_TYPES)[number];

export const ADMIN_LEGAL_ENTITY_SORT_FIELDS = [
  "name",
  "siren",
  "siret",
  "nbRelatedPros",
  "nbRelatedLocations",
  "type",
  "mainBusinessActivity",
  "zipCode",
] as const;

export type AdminLegalEntitySortField =
  (typeof ADMIN_LEGAL_ENTITY_SORT_FIELDS)[number];

export const EMPLOYEE_RANGES = [
  "1 ou 2 salariés",
  "3 à 5 salariés",
  "6 à 9 salariés",
  "10 à 19 salariés",
  "20 à 49 salariés",
  "50 à 99 salariés",
  "100 à 199 salariés",
  "200 à 249 salariés",
  "250 à 499 salariés",
  "500 à 999 salariés",
  "1 000 à 1 999 salariés",
  "2 000 à 4 999 salariés",
  "5 000 à 9 999 salariés",
  "10 000 salariés et plus",
  "0 salarié",
  "Unité non-employeuse",
] as const;
export type EmployeeRange = (typeof EMPLOYEE_RANGES)[number];

const parseEmployeeRange = (value: EmployeeRange) => {
  const trimmed = value.trim();
  if (trimmed === "0 salarié" || trimmed === "Unité non-employeuse") {
    return { min: 0, max: 0 };
  }

  const parseNumber = (raw: string) => Number(raw.replace(/[^\d]/g, ""));

  const plusMatch = trimmed.match(/^([\d\s]+)\s+salariés\s+et\s+plus$/);
  if (plusMatch?.[1]) {
    return { min: parseNumber(plusMatch[1]), max: null };
  }

  const rangeMatch = trimmed.match(
    /^([\d\s]+)\s+(?:à|ou)\s+([\d\s]+)\s+salariés$/,
  );
  if (rangeMatch?.[1] && rangeMatch?.[2]) {
    return {
      min: parseNumber(rangeMatch[1]),
      max: parseNumber(rangeMatch[2]),
    };
  }

  return null;
};

export const buildEmployeeRangesFromNumberRange = (
  range: NumberRange | null,
): EmployeeRange[] => {
  if (!range) {
    return [];
  }

  const [min, max] = range;
  const safeMax = Number.isFinite(max) ? max : Infinity;
  const safeMin = Number.isFinite(min) ? min : 0;

  const selected = EMPLOYEE_RANGES.filter((label) => {
    const parsed = parseEmployeeRange(label);
    if (!parsed) {
      return false;
    }
    const rangeMax = parsed.max ?? Infinity;
    return rangeMax >= safeMin && parsed.min <= safeMax;
  });

  return selected;
};

export const LEGAL_FORM = [
  "ASS",
  "AUDA",
  "AUPM",
  "CCOM",
  "COAG",
  "COLL",
  "COM",
  "COMU",
  "DEPT",
  "EPA",
  "EPIC",
  "ETAT",
  "GFO",
  "MET",
  "REGI",
  "SA",
  "SARL",
  "SSRG",
  "SCOM",
  "CCAM",
  "SCI",
  "SIVO",
  "HOSP",
  "CCM",
  "FON",
  "IRC",
  "SCPI",
  "SNC",
  "SAS",
  "GIE",
  "STE",
  "OPRO",
  "SEM",
  "SLRL",
  "COME",
  "SCCP",
  "SC",
  "MUT",
] as const;
export type LegalForm = (typeof LEGAL_FORM)[number];

export const MAX_CONSTRUCTION_PERIOD = [
  "AVANT_1949",
  "DE_1949_A_1960",
  "DE_1961_A_1974",
  "DE_1975_A_1993",
  "DE_1994_A_2000",
  "DE_2001_A_2010",
  "APRES_2010",
] as const;
export type MaxConstructionPeriod = (typeof MAX_CONSTRUCTION_PERIOD)[number];

export function getLegalEntityTypeLabelFromArray(
  legalEntities: { type: LegalEntityType }[],
) {
  const uniqueTypes = new Set(legalEntities.map((e) => e.type));
  if (uniqueTypes.size === 0) {
    return null;
  } else if (uniqueTypes.size === 1) {
    return getLegalEntityTypeLabel([...uniqueTypes][0]);
  }
  return "Mixte";
}

export const LEGAL_ENTITY_FILTER_RANGES: Record<
  "NB_RELATED_LOCATIONS" | "NB_UNITS" | "NB_DWELLINGS" | "NB_PREMISES",
  [number, number]
> = {
  NB_RELATED_LOCATIONS: [0, 5000],
  NB_UNITS: [1, 5000],
  NB_DWELLINGS: [1, 50],
  NB_PREMISES: [1, 1_000],
};

export const HUNTER_DEPARTMENTS_SORTED = [
  "operations",
  "management",
  "executive",
  "finance",
  "it",
  "legal",
] as const;

/**
 * Legal forms to exclude from Google Places and Hunter searches.
 * SCI (Société Civile Immobilière) is excluded because these entities often do not have reliable contact information available through these services.
 */
export const LEGAL_FORM_TO_EXCLUDE_FROM_GOOGLE_AND_HUNTER_SEARCH = [
  "SCI",
] as const;

export type LegalFormToExcludeFromGoogleAndHunterSearch =
  (typeof LEGAL_FORM_TO_EXCLUDE_FROM_GOOGLE_AND_HUNTER_SEARCH)[number];

export function formatAndGroupDomain(domain: string) {
  let formattedDomain = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "");

  // Extract path after domain
  const slashIndex = formattedDomain.indexOf("/");
  let path = "";
  if (slashIndex !== -1) {
    path = formattedDomain.slice(slashIndex); // includes the first /
    formattedDomain = formattedDomain.slice(0, slashIndex);
  }

  // Remove subdomain only if there are more than 2 segments
  // (keep the main domain + TLD intact)
  const parts = formattedDomain.split(".");
  if (parts.length > 2) {
    formattedDomain = parts.slice(-2).join(".");
  }

  // Count path segments (ignore empty segments)
  const pathSegments = path.split("/").filter(Boolean);

  // If there are at least two path segments, it's a group domain
  const isGroupDomain = pathSegments.length >= 2;

  return { formattedDomain, isGroupDomain };
}

export function isGroupEntity(website: string | null | undefined): boolean {
  if (!website) {
    return false;
  }
  const { isGroupDomain } = formatAndGroupDomain(website);
  return isGroupDomain;
}

export const LEGAL_ENTITY_RANGES: Record<
  "NB_RELATED_LOCATIONS" | "NB_EMPLOYEES",
  [number, number]
> = {
  NB_RELATED_LOCATIONS: [1, 5000],
  NB_EMPLOYEES: [0, 100_000],
};
