import type { EmployeeRange } from "./legal-entity.constant";
import type { BuildingUsage } from "./location.constant";
import {
  INDUSTRIAL_NAF_CATEGORIES,
  TERTIARY_NAF_CATEGORIES,
  type NafCategory,
} from "./naf-code.constant";

export const IPE_MACRO_USAGE = ["industrial", "tertiary", "other"] as const;
export type IpeMacroUsage = (typeof IPE_MACRO_USAGE)[number];

export const IPE_EFFECTIVE_USAGE = [
  "residential",
  "tertiary",
  "industrial",
] as const;
export type IpeEffectiveUsage = (typeof IPE_EFFECTIVE_USAGE)[number];

export const IPE_USAGE_REASON = [
  "BUILDING_USAGE", // Usage bâtiment renseigné dans les données de base
  "REFERENCE_COMPANY", // Usage déduit de l'entreprise de référence
  "FALLBACK_TERTIARY", // Usage par défaut (tertiaire) en l'absence d'information
] as const;
export type IpeUsageReason = (typeof IPE_USAGE_REASON)[number];

export const IPE_NORMALIZED_SCORE_RANGE: [number, number] = [1, 10];

export const REFERENCE_COMPANY_SELECTION_REASONS = [
  // Cas inattendu: usage bâtiment absent (devrait être calculé à l'import).
  "ERROR_NO_BUILDING_USAGE",
  // Cas inattendu: aucune entreprise liée (devrait être associé à l'import).
  "ERROR_NO_COMPANY",
  // Cas inattendu: aucune entreprise ne matche l'usage bâtiment (NAF manquant/invalide).
  "ERROR_NO_COMPANY_MATCHING_USAGE",
  // Toutes les entreprises ont été exclues (finance/gestion immobilière).
  "NO_COMPANY_AFTER_EXCLUSION",
  // Entreprise sélectionnée après filtrage sur l'usage IPE.
  "USAGE_MATCH",
  // Après filtrage usage IPE, priorité donnée à effectifs connus.
  "USAGE_MATCH_PREFERRED_KNOWN_EMPLOYEES",
  // Après filtrage usage IPE, fallback intensité énergétique (TODO classement).
  "USAGE_MATCH_FALLBACK_ENERGY_INTENSITY",
  // Entreprise sélectionnée après exclusion des secteurs non pertinents.
  "OTHER_EXCLUSION",
  // Après exclusion "other", priorité donnée à effectifs connus.
  "OTHER_EXCLUSION_PREFERRED_KNOWN_EMPLOYEES",
  // Après exclusion "other", fallback intensité énergétique (TODO classement).
  "OTHER_EXCLUSION_FALLBACK_ENERGY_INTENSITY",
] as const;

export type ReferenceCompanySelectionReason =
  (typeof REFERENCE_COMPANY_SELECTION_REASONS)[number];

export const REFERENCE_COMPANY_NULL_OK_REASONS = [
  "ERROR_NO_BUILDING_USAGE",
  "ERROR_NO_COMPANY",
  "ERROR_NO_COMPANY_MATCHING_USAGE",
  "NO_COMPANY_AFTER_EXCLUSION",
] as const satisfies ReferenceCompanySelectionReason[];

export const IPE_BUILDING_USAGE_SCORE = {
  residential: 1,
  tertiary: 3,
  industrial: 5,
  other: 0,
} as const satisfies Record<BuildingUsage, number>;

export const IPE_SECTOR_SCORE_BY_NAF_CATEGORY = {
  TECHNIQUES_INDETERMINEES: 0,
  EXPLOITATIONS_AGRICOLES_SITES_RURAUX: 4,
  EXTRACTION_INDUSTRIES_PRIMAIRES: 7,
  INDUSTRIE_AGROALIMENTAIRE_BOISSONS: 7,
  INDUSTRIE_MANUFACTURIERE_LEGERE: 5,
  INDUSTRIE_LOURDE_CHIMIE_MATERIAUX: 8,
  METALLURGIE_TRANSFORMATION_METAUX: 7,
  INDUSTRIE_EQUIPEMENTS_MACHINES: 6,
  INDUSTRIE_TRANSPORT_MOBILITE: 6,
  INDUSTRIE_DIVERSE_MAINTENANCE: 6,
  ENERGIE_EAU_ENVIRONNEMENT: 7,
  BTP_TRAVAUX: 4,
  COMMERCE_DISTRIBUTION: 4,
  TRANSPORT_LOGISTIQUE: 4,
  HOTELLERIE_RESTAURATION: 5,
  BUREAUX_SERVICES_NUMERIQUES: 2,
  FINANCE_IMMOBILIER: 2,
  GESTION_IMMOBILIERE: 2,
  SERVICES_PROFESSIONNELS: 2,
  SERVICES_OPERATIONNELS_SUPPORT: 3,
  SECTEUR_MEDICO_SOCIAL: 6,
  SECTEUR_PUBLIC: 3,
  CULTURE_SPORT_SERVICES_PERSONNE: 4,
} as const satisfies Record<NafCategory, number>;

export const IPE_EMPLOYEE_RANGE_SCORE = {
  "1 ou 2 salariés": 0,
  "3 à 5 salariés": 0,
  "6 à 9 salariés": 0,
  "10 à 19 salariés": 1,
  "20 à 49 salariés": 1,
  "50 à 99 salariés": 2,
  "100 à 199 salariés": 2,
  "200 à 249 salariés": 3,
  "250 à 499 salariés": 3,
  "500 à 999 salariés": 3,
  "1 000 à 1 999 salariés": 4,
  "2 000 à 4 999 salariés": 4,
  "5 000 à 9 999 salariés": 4,
  "10 000 salariés et plus": 4,
  "0 salarié": 0,
  "Unité non-employeuse": 0,
} as const satisfies Record<EmployeeRange, number>;

export function mapEntrepriseToUsage(
  secteur: NafCategory | null | undefined,
): IpeMacroUsage {
  if (!secteur) {
    return "other";
  }

  if (INDUSTRIAL_NAF_CATEGORIES.includes(secteur)) {
    return "industrial";
  }

  if (TERTIARY_NAF_CATEGORIES.includes(secteur)) {
    return "tertiary";
  }

  return "other";
}

export function scoreBuildingUsage(
  usage: BuildingUsage | null | undefined,
): number {
  if (!usage) {
    return 0;
  }
  return IPE_BUILDING_USAGE_SCORE[usage];
}

export function scoreReferenceCompanySector(
  nafCategory: NafCategory | null | undefined,
): number {
  if (!nafCategory) {
    return 0;
  }
  return IPE_SECTOR_SCORE_BY_NAF_CATEGORY[nafCategory] ?? 0;
}

export function scoreSurfaceThatRequiresHeating(
  surfaceThatRequiresHeating: number | null | undefined,
): number {
  if (surfaceThatRequiresHeating == null) {
    return 0;
  }
  if (surfaceThatRequiresHeating < 500) {
    return 0;
  }
  if (surfaceThatRequiresHeating < 1500) {
    return 1;
  }
  if (surfaceThatRequiresHeating <= 5000) {
    return 2;
  }
  if (surfaceThatRequiresHeating <= 10000) {
    return 3;
  }
  return 4;
}

export function scoreConstructionYear(
  creationDate: Date | string | number | null | undefined,
): number {
  if (!creationDate) {
    return 2;
  }
  const year =
    typeof creationDate === "number"
      ? creationDate
      : new Date(creationDate).getFullYear();
  if (!Number.isFinite(year)) {
    return 2;
  }
  if (year >= 2015) {
    return 0;
  }
  if (year >= 2005) {
    return 1;
  }
  if (year >= 1990) {
    return 2;
  }
  if (year >= 1975) {
    return 3;
  }
  return 4;
}

export function scoreBuildingHeight(height: number | null | undefined): number {
  if (height == null) {
    return 0;
  }
  if (height <= 3) {
    return 0;
  }
  if (height <= 6) {
    return 1;
  }
  if (height <= 9) {
    return 2;
  }
  return 3;
}

export function scoreEmployeesRange(
  nbEmployeesRange: EmployeeRange | null | undefined,
): number {
  if (!nbEmployeesRange) {
    return 1;
  }
  return IPE_EMPLOYEE_RANGE_SCORE[nbEmployeesRange];
}

export type IpeScoreCriteria =
  | "usage"
  | "sector"
  | "surface"
  | "constructionYear"
  | "height"
  | "employees";

export const IPE_SCORE_WEIGHTS = {
  residential: {
    usage: 0.7,
    sector: 0,
    surface: 0.7,
    constructionYear: 1,
    height: 0.3,
    employees: 0,
  },
  tertiary: {
    usage: 0.8,
    sector: 0.8,
    surface: 0.6,
    constructionYear: 0.6,
    height: 0.4,
    employees: 0.2,
  },
  industrial: {
    usage: 0.9,
    sector: 0.9,
    surface: 0.7,
    constructionYear: 0.5,
    height: 0.6,
    employees: 0.3,
  },
} as const;

const IPE_MAX_SCORES: Record<IpeScoreCriteria, number> = {
  usage: Math.max(...Object.values(IPE_BUILDING_USAGE_SCORE)),
  sector: Math.max(...Object.values(IPE_SECTOR_SCORE_BY_NAF_CATEGORY)),
  surface: 4,
  constructionYear: 4,
  height: 3,
  employees: Math.max(...Object.values(IPE_EMPLOYEE_RANGE_SCORE)),
};

const getIpeRawScoreMaxForUsage = (usage: IpeEffectiveUsage): number => {
  const weights = IPE_SCORE_WEIGHTS[usage];
  return (
    IPE_MAX_SCORES.usage * weights.usage +
    IPE_MAX_SCORES.sector * weights.sector +
    IPE_MAX_SCORES.surface * weights.surface +
    IPE_MAX_SCORES.constructionYear * weights.constructionYear +
    IPE_MAX_SCORES.height * weights.height +
    IPE_MAX_SCORES.employees * weights.employees
  );
};

export const IPE_RAW_SCORE_MAX = Math.max(
  getIpeRawScoreMaxForUsage("residential"),
  getIpeRawScoreMaxForUsage("tertiary"),
  getIpeRawScoreMaxForUsage("industrial"),
);

export function getIpeScoreWeights(
  effectiveUsage: IpeEffectiveUsage | null | undefined,
): Record<IpeScoreCriteria, number> {
  if (!effectiveUsage) {
    return IPE_SCORE_WEIGHTS.tertiary;
  }
  return IPE_SCORE_WEIGHTS[effectiveUsage];
}

export function getIpeRawScore(params: {
  effectiveUsage: IpeEffectiveUsage | null | undefined;
  referenceCompanyNafCategory: NafCategory | null | undefined;
  surfaceThatRequiresHeating: number | null | undefined;
  creationDate: Date | string | number | null | undefined;
  height: number | null | undefined;
  nbEmployeesRange: EmployeeRange | null | undefined;
}): number {
  const effectiveUsage = params.effectiveUsage ?? "tertiary";
  const weights = getIpeScoreWeights(effectiveUsage);
  const usageScore = scoreBuildingUsage(effectiveUsage);
  const sectorScore = scoreReferenceCompanySector(
    params.referenceCompanyNafCategory,
  );
  const surfaceScore = scoreSurfaceThatRequiresHeating(
    params.surfaceThatRequiresHeating,
  );
  const yearScore = scoreConstructionYear(params.creationDate);
  const heightScore = scoreBuildingHeight(params.height);
  const employeesScore = scoreEmployeesRange(params.nbEmployeesRange);

  return (
    usageScore * weights.usage +
    sectorScore * weights.sector +
    surfaceScore * weights.surface +
    yearScore * weights.constructionYear +
    heightScore * weights.height +
    employeesScore * weights.employees
  );
}

export function getIpeNormalizedScore(rawScore: number): number {
  const normalized = Math.round(1 + (9 * rawScore) / IPE_RAW_SCORE_MAX);
  return Math.min(10, Math.max(1, normalized));
}
