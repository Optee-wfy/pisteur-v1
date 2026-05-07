import {
  mapEntrepriseToUsage,
  nafToCategory,
  type IpeMacroUsage,
  type NafCategory,
  type ReferenceCompanySelectionReason,
} from "@optee/constants";
import { LegalEntityRepository } from "@optee/legal-entity-server";
import type { LegalEntity, LegalEntityUuid, LocationBdnb } from "@optee/models";

const EXCLUDED_OTHER_CATEGORIES = new Set<NafCategory>([
  "GESTION_IMMOBILIERE",
  "FINANCE_IMMOBILIER",
]);

type Candidate = {
  legalEntityUuid: LegalEntityUuid;
  hasKnownEmployees: boolean;
  ipeUsage: IpeMacroUsage | null;
  nafCategory: ReturnType<typeof nafToCategory>;
};

const rankByEnergyIntensity = (items: Candidate[]): Candidate[] => {
  // TODO: définir un classement des secteurs les plus énergivores
  // En attendant, on explicite l'ordre déterministe par UUID
  return [...items].sort((left, right) =>
    left.legalEntityUuid.localeCompare(right.legalEntityUuid),
  );
};

export type ReferenceCompanySelectionResult = {
  legalEntityUuid: LegalEntityUuid | null;
  selectionReason: ReferenceCompanySelectionReason;
};

type ReferenceCompanySelectionContext = {
  locationUuid: LocationBdnb["uuid"] | null;
  buildingUsage: LocationBdnb["buildingUsage"];
};

const logSelectionError = (
  context: ReferenceCompanySelectionContext,
  reason: ReferenceCompanySelectionReason,
  details?: Record<string, unknown>,
) => {
  console.warn("[selectReferenceCompany] unexpected selection case", {
    locationUuid: context.locationUuid,
    buildingUsage: context.buildingUsage ?? null,
    reason,
    ...details,
  });
};

type ReferenceCompanySelectionEntity = Pick<
  LegalEntity,
  "uuid" | "mainBusinessActivity" | "nbEmployeesRange"
>;

const buildCandidates = (
  entities: ReferenceCompanySelectionEntity[],
): Candidate[] =>
  entities.map((legalEntity) => {
    const nafCategory = nafToCategory(legalEntity.mainBusinessActivity ?? "");
    return {
      legalEntityUuid: legalEntity.uuid,
      hasKnownEmployees: legalEntity.nbEmployeesRange != null,
      ipeUsage: nafCategory ? mapEntrepriseToUsage(nafCategory) : null,
      nafCategory,
    };
  });

export async function selectReferenceCompany(
  location: Pick<LocationBdnb, "uuid" | "buildingUsage">,
): Promise<ReferenceCompanySelectionResult> {
  if (!location.buildingUsage) {
    logSelectionError(
      { locationUuid: location.uuid, buildingUsage: location.buildingUsage },
      "ERROR_NO_BUILDING_USAGE",
    );
    return {
      legalEntityUuid: null,
      selectionReason: "ERROR_NO_BUILDING_USAGE",
    };
  }

  const entities = await LegalEntityRepository.getAllByLocation(location.uuid);
  if (!entities.length) {
    logSelectionError(
      { locationUuid: location.uuid, buildingUsage: location.buildingUsage },
      "ERROR_NO_COMPANY",
    );
    return { legalEntityUuid: null, selectionReason: "ERROR_NO_COMPANY" };
  }

  const candidates = buildCandidates(
    entities.map((e) => ({ ...e.legalEntity })),
  );

  return selectReferenceCompanyFromCandidates(
    { locationUuid: location.uuid, buildingUsage: location.buildingUsage },
    candidates,
    entities.length,
  );
}

export function selectReferenceCompanyFromEntities(params: {
  buildingUsage: LocationBdnb["buildingUsage"];
  entities: ReferenceCompanySelectionEntity[];
}): ReferenceCompanySelectionResult {
  if (!params.buildingUsage) {
    return {
      legalEntityUuid: null,
      selectionReason: "ERROR_NO_BUILDING_USAGE",
    };
  }

  if (params.entities.length === 0) {
    return { legalEntityUuid: null, selectionReason: "ERROR_NO_COMPANY" };
  }

  const candidates = buildCandidates(params.entities);
  return selectReferenceCompanyFromCandidates(
    { locationUuid: null, buildingUsage: params.buildingUsage },
    candidates,
    params.entities.length,
    false,
  );
}

const selectReferenceCompanyFromCandidates = (
  context: ReferenceCompanySelectionContext,
  candidates: Candidate[],
  legalEntityCount: number,
  logErrors = true,
): ReferenceCompanySelectionResult => {
  if (
    context.buildingUsage !== "other" &&
    context.buildingUsage !== "residential"
  ) {
    const matched = candidates.filter(
      (candidate) => candidate.ipeUsage === context.buildingUsage,
    );
    if (!matched.length) {
      if (logErrors) {
        logSelectionError(context, "ERROR_NO_COMPANY_MATCHING_USAGE", {
          legalEntityCount,
        });
      }
      return {
        legalEntityUuid: null,
        selectionReason: "ERROR_NO_COMPANY_MATCHING_USAGE",
      };
    }
    return selectFromCandidates(matched, "USAGE_MATCH");
  }

  const filtered = candidates.filter(
    (candidate) =>
      candidate.nafCategory != null &&
      !EXCLUDED_OTHER_CATEGORIES.has(candidate.nafCategory),
  );
  if (!filtered.length) {
    return {
      legalEntityUuid: null,
      selectionReason: "NO_COMPANY_AFTER_EXCLUSION",
    };
  }

  return selectFromCandidates(filtered, "OTHER_EXCLUSION");
};

const selectFromCandidates = (
  candidates: Candidate[],
  baseReason: "USAGE_MATCH" | "OTHER_EXCLUSION",
): ReferenceCompanySelectionResult => {
  if (candidates.length === 1) {
    return {
      legalEntityUuid: candidates[0]?.legalEntityUuid ?? null,
      selectionReason: baseReason,
    };
  }

  const withKnownEmployees = candidates.filter(
    (candidate) => candidate.hasKnownEmployees,
  );
  const preferred =
    withKnownEmployees.length > 0 ? withKnownEmployees : candidates;

  const ranked = rankByEnergyIntensity(preferred);
  const selected = ranked[0]?.legalEntityUuid ?? null;

  const selectionReason = resolveSelectionReason(
    baseReason,
    withKnownEmployees.length > 0,
  );

  return {
    legalEntityUuid: selected,
    selectionReason: selectionReason,
  };
};

const resolveSelectionReason = (
  baseReason: "USAGE_MATCH" | "OTHER_EXCLUSION",
  hasKnownEmployees: boolean,
): ReferenceCompanySelectionReason => {
  if (baseReason === "USAGE_MATCH") {
    return hasKnownEmployees
      ? "USAGE_MATCH_PREFERRED_KNOWN_EMPLOYEES"
      : "USAGE_MATCH_FALLBACK_ENERGY_INTENSITY";
  }

  return hasKnownEmployees
    ? "OTHER_EXCLUSION_PREFERRED_KNOWN_EMPLOYEES"
    : "OTHER_EXCLUSION_FALLBACK_ENERGY_INTENSITY";
};
