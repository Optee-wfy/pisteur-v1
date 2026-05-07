import {
  buildRangeWhere,
  buildSqlRangeWhere,
  buildValuesInCondition,
} from "@optee/bdd-server";
import {
  BUILDING_OCCUPANCY_STATUS,
  BUILDING_OCCUPANCY_STATUS_RULES,
  type BuildingOccupancyStatus,
  IPE_RAW_SCORE_MAX,
  type LocationsBdnbLegalEntityProListInput,
} from "@optee/constants";
import type { LegalEntityUuid, LocationBdnbUuid, ProUuid } from "@optee/models";
import {
  associationProsExternalLocationsTable,
  associationsLocationsBdnbLegalEntityTable,
  legalEntityStatsTable,
  legalEntityTable,
  locationBdnbStatsTable,
  locationsBdnbTable,
} from "@optee/models";
import { isNotNullish } from "@optee/utils";
import type { SQL } from "drizzle-orm";
import { and, eq, isNotNull, isNull, or, sql } from "drizzle-orm";
import { db } from "../../../../supabase-server/src";

// export const shouldLogSQL = ["development", "preview", "local"].includes(
//   process.env["VITE_ENV"] ?? "",
// );

export const shouldLogSQL = false;

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbExecutor = typeof db | DbTransaction;

const buildOccupancyStatusConditions = ({
  siretCount,
  sirenOnlyCount,
  hasSyndic,
  selectedStatuses,
}: {
  siretCount: SQL<number>;
  sirenOnlyCount: SQL<number>;
  hasSyndic: SQL<boolean>;
  selectedStatuses: BuildingOccupancyStatus[];
}) =>
  selectedStatuses
    .map((status) => {
      const rule = BUILDING_OCCUPANCY_STATUS_RULES.find(
        (candidate) => candidate.status === status,
      );
      if (!rule) {
        return undefined;
      }

      const parts: SQL<unknown>[] = [];
      if (rule.syndic === true) {
        parts.push(sql<boolean>`(${hasSyndic})`);
      }
      if (rule.syndic === false) {
        parts.push(sql<boolean>`NOT (${hasSyndic})`);
      }
      if (rule.siret.eq !== undefined) {
        parts.push(sql<boolean>`(${siretCount} = ${rule.siret.eq})`);
      }
      if (rule.siret.min !== undefined) {
        parts.push(sql<boolean>`(${siretCount} >= ${rule.siret.min})`);
      }
      if (rule.sirenOnly?.eq !== undefined) {
        parts.push(sql<boolean>`(${sirenOnlyCount} = ${rule.sirenOnly.eq})`);
      }

      return sql<boolean>`(${sql.join(parts, sql.raw(" AND "))})`;
    })
    .filter(isNotNullish);

export const LocationBdnbLegalEntityRepository = {
  buildBaseScopeCTE({
    filters,
    proUuid,
    includeLegalEntityFilters = true,
    forceAssociationJoin = false,
    cteName = "base_scope",
  }: {
    filters: LocationsBdnbLegalEntityProListInput;
    proUuid: ProUuid;
    includeLegalEntityFilters?: boolean;
    forceAssociationJoin?: boolean;
    cteName?: string;
  }) {
    const occupancyStatusValues = Array.from(
      new Set(filters.buildingOccupancyStatus ?? []),
    );
    const shouldFilterByOccupancyStatus =
      occupancyStatusValues.length > 0 &&
      occupancyStatusValues.length < BUILDING_OCCUPANCY_STATUS.length;

    const { locationFilters, showFilter } =
      LocationBdnbLegalEntityRepository.buildLocationFiltersSQL({
        filters,
      });

    const legalEntityFilter = includeLegalEntityFilters
      ? LocationBdnbLegalEntityRepository.buildLegalEntityFilterWheres({
          legalEntityUuid: filters.legalEntityUuid ?? null,
          tertiaryActivityTypes: filters.mainBusinessActivity ?? [],
          locationBuildingTypes: filters.locationBuildingType ?? [],
          filters,
        })
      : {
          hasFilters: false,
          wheres: [],
          prefilterWheres: [],
          postJoinWheres: [],
        };

    const [minRelated, maxRelated] = filters.nbRelatedLocations ?? [null, null];
    const nbRelatedLocationsExpr = sql<number>`coalesce(${legalEntityStatsTable.nbRelatedLocations}, 0)`;
    const nbRelatedLocationsWhere = buildSqlRangeWhere(
      nbRelatedLocationsExpr,
      minRelated,
      maxRelated,
    );
    const shouldFilterByNbRelatedLocations =
      includeLegalEntityFilters && nbRelatedLocationsWhere !== undefined;

    const shouldJoinLegalEntity =
      includeLegalEntityFilters && legalEntityFilter.hasFilters;
    const shouldJoinAssociations =
      forceAssociationJoin ||
      shouldJoinLegalEntity ||
      shouldFilterByNbRelatedLocations;
    const shouldPrefilterLegalEntities =
      shouldJoinLegalEntity && legalEntityFilter.prefilterWheres.length > 0;
    const shouldJoinLegalEntityTable =
      shouldJoinLegalEntity &&
      (!shouldPrefilterLegalEntities ||
        legalEntityFilter.postJoinWheres.length > 0);
    const legalEntityWheresForBase = shouldJoinLegalEntity
      ? shouldPrefilterLegalEntities
        ? legalEntityFilter.postJoinWheres
        : legalEntityFilter.wheres
      : [];

    const baseSelect = {
      locationUuid: locationsBdnbTable.uuid,
      legalEntityUuid: sql<LegalEntityUuid | null>`
        ${associationsLocationsBdnbLegalEntityTable.legalEntityUuid}
      `.as("legalEntityUuid"),
    };

    let baseQuery;
    if (!shouldJoinAssociations) {
      baseQuery = db
        .select({
          locationUuid: locationsBdnbTable.uuid,
          legalEntityUuid: sql<LegalEntityUuid | null>`NULL::uuid`.as(
            "legalEntityUuid",
          ),
        })
        .from(locationsBdnbTable);
    } else {
      baseQuery = db
        .select(baseSelect)
        .from(locationsBdnbTable)
        .innerJoin(
          associationsLocationsBdnbLegalEntityTable,
          eq(
            locationsBdnbTable.uuid,
            associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
          ),
        );

      if (shouldPrefilterLegalEntities) {
        const filteredLegalEntities = db
          .select({
            uuid: legalEntityTable.uuid,
          })
          .from(legalEntityTable)
          .where(and(...legalEntityFilter.prefilterWheres))
          .as("filtered_legal_entities");

        baseQuery = baseQuery.innerJoin(
          filteredLegalEntities,
          eq(
            filteredLegalEntities.uuid,
            associationsLocationsBdnbLegalEntityTable.legalEntityUuid,
          ),
        );
      }

      if (shouldJoinLegalEntityTable) {
        baseQuery = baseQuery.innerJoin(
          legalEntityTable,
          eq(
            associationsLocationsBdnbLegalEntityTable.legalEntityUuid,
            legalEntityTable.uuid,
          ),
        );
      }
    }

    if (shouldFilterByNbRelatedLocations) {
      baseQuery = baseQuery.leftJoin(
        legalEntityStatsTable,
        eq(
          associationsLocationsBdnbLegalEntityTable.legalEntityUuid,
          legalEntityStatsTable.legalEntityUuid,
        ),
      );
    }

    if (shouldFilterByOccupancyStatus) {
      baseQuery = baseQuery.leftJoin(
        locationBdnbStatsTable,
        eq(locationsBdnbTable.uuid, locationBdnbStatsTable.locationBdnbUuid),
      );

      const siretCount = sql<number>`coalesce(${locationBdnbStatsTable.nbSiret}, 0)`;
      const sirenOnlyCount = sql<number>`coalesce(${locationBdnbStatsTable.nbSirenOnly}, 0)`;
      const hasSyndic = sql<boolean>`EXISTS (
        ${db
          .select({ one: sql`1` })
          .from(associationsLocationsBdnbLegalEntityTable)
          .innerJoin(
            legalEntityTable,
            eq(
              associationsLocationsBdnbLegalEntityTable.legalEntityUuid,
              legalEntityTable.uuid,
            ),
          )
          .where(
            and(
              eq(
                associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
                locationsBdnbTable.uuid,
              ),
              eq(legalEntityTable.type, "copro"),
            ),
          )}
      )`;

      const statusConditions = buildOccupancyStatusConditions({
        siretCount,
        sirenOnlyCount,
        hasSyndic,
        selectedStatuses: occupancyStatusValues,
      });

      if (statusConditions.length > 0) {
        locationFilters.push(
          sql<boolean>`(${sql.join(statusConditions, sql.raw(" OR "))})`,
        );
      }
    }

    const legalEntityWheres = [
      ...legalEntityWheresForBase,
      ...(shouldFilterByNbRelatedLocations && nbRelatedLocationsWhere
        ? [nbRelatedLocationsWhere]
        : []),
    ];

    if (showFilter !== "all") {
      const unlockedLocations = db
        .selectDistinct({
          locationUuid: associationProsExternalLocationsTable.locationUuid,
        })
        .from(associationProsExternalLocationsTable)
        .where(
          and(
            eq(associationProsExternalLocationsTable.proUuid, proUuid),
            eq(
              associationProsExternalLocationsTable.associationLabel,
              "Débloqué",
            ),
          ),
        )
        .as("unlocked_locations");

      baseQuery = baseQuery.leftJoin(
        unlockedLocations,
        eq(unlockedLocations.locationUuid, locationsBdnbTable.uuid),
      );

      locationFilters.push(
        showFilter === "unlocked"
          ? isNotNull(unlockedLocations.locationUuid)
          : isNull(unlockedLocations.locationUuid),
      );
    }

    return db
      .$with(cteName)
      .as(baseQuery.where(and(...locationFilters, ...legalEntityWheres)));
  },

  async refreshLocationLegalEntityStats(
    locationBdnbUuid: LocationBdnbUuid,
    options?: { nbLegalEntities?: number; tx?: DbTransaction },
  ) {
    const executor: DbExecutor = options?.tx ?? db;
    const [row] = await executor
      .select({
        total: sql<number>`
          count(distinct ${associationsLocationsBdnbLegalEntityTable.legalEntityUuid})
        `,
        nbSiret: sql<number>`
          count(
            distinct case
              when ${legalEntityTable.siret} is not null
                and ${legalEntityTable.siret} <> ''
                then ${associationsLocationsBdnbLegalEntityTable.legalEntityUuid}
            end
          )
        `,
        nbSirenOnly: sql<number>`
          count(
            distinct case
              when (${legalEntityTable.siren} is not null
                and ${legalEntityTable.siren} <> '')
                and (${legalEntityTable.siret} is null
                  or ${legalEntityTable.siret} = '')
                then ${associationsLocationsBdnbLegalEntityTable.legalEntityUuid}
            end
          )
        `,
      })
      .from(associationsLocationsBdnbLegalEntityTable)
      .leftJoin(
        legalEntityTable,
        eq(
          associationsLocationsBdnbLegalEntityTable.legalEntityUuid,
          legalEntityTable.uuid,
        ),
      )
      .where(
        eq(
          associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
          locationBdnbUuid,
        ),
      );

    const nbLegalEntities = options?.nbLegalEntities ?? Number(row?.total ?? 0);
    const nbSiret = Number(row?.nbSiret ?? 0);
    const nbSirenOnly = Number(row?.nbSirenOnly ?? 0);

    await executor
      .insert(locationBdnbStatsTable)
      .values({
        locationBdnbUuid,
        nbLegalEntities,
        nbSiret,
        nbSirenOnly,
      })
      .onConflictDoUpdate({
        target: locationBdnbStatsTable.locationBdnbUuid,
        set: { nbLegalEntities, nbSiret, nbSirenOnly },
      });
  },

  buildNafCodesCondition(nafCodes: string[]) {
    if (nafCodes.length === 0) {
      return sql<boolean>`true`;
    }
    return buildValuesInCondition(
      legalEntityTable.mainBusinessActivity,
      nafCodes,
    );
  },

  buildLegalEntityFilterWheres({
    legalEntityUuid,
    tertiaryActivityTypes,
    locationBuildingTypes,
    filters,
  }: {
    legalEntityUuid: LegalEntityUuid | null;
    filters: LocationsBdnbLegalEntityProListInput;
    tertiaryActivityTypes: string[];
    locationBuildingTypes: string[];
  }) {
    const wheres: SQL<unknown>[] = [];
    const prefilterWheres: SQL<unknown>[] = [];
    const postJoinWheres: SQL<unknown>[] = [];

    if (legalEntityUuid) {
      const condition = eq(legalEntityTable.uuid, legalEntityUuid);
      wheres.push(condition);
      prefilterWheres.push(condition);
    }

    if (tertiaryActivityTypes.length > 0) {
      const condition =
        LocationBdnbLegalEntityRepository.buildNafCodesCondition(
          tertiaryActivityTypes,
        );
      wheres.push(condition);
      prefilterWheres.push(condition);
    }

    if (locationBuildingTypes.length > 0) {
      const condition =
        LocationBdnbLegalEntityRepository.buildNafCodesCondition(
          locationBuildingTypes,
        );
      wheres.push(condition);
      prefilterWheres.push(condition);
    }

    //  Filtres equals
    const equalsFilters = [
      { key: "nbEmployeesRange", column: legalEntityTable.nbEmployeesRange },
      { key: "legalForm", column: legalEntityTable.legalForm },
      { key: "type", column: legalEntityTable.type },
    ] as const;

    const equalsWheres = equalsFilters
      .map(({ key, column }) => {
        const values = filters[key];
        if (!Array.isArray(values) || values.length === 0) {
          return undefined;
        }

        return or(
          ...values.map((value) =>
            value !== null && value !== undefined
              ? eq(column, value)
              : isNull(column),
          ),
        );
      })
      .filter(isNotNullish);

    const numericRangeFilters = [
      { key: "nbPremises", column: legalEntityTable.nbPremises },
    ] as const;

    const numericRangeWheres = numericRangeFilters
      .map(({ key, column }) => {
        const [minRaw, maxRaw] = filters[key] ?? [null, null];
        return buildRangeWhere({
          column,
          min: minRaw,
          max: maxRaw,
        });
      })
      .filter(isNotNullish);

    // zipCode
    const zipCode = filters.zipCode?.trim();
    if (zipCode) {
      const escZip = zipCode.replace(/([\\%_])/g, "\\$1");
      const likeZip = `%${escZip}%`;
      const condition = sql<boolean>`${legalEntityTable.zipCode} ILIKE ${likeZip}`;
      wheres.push(condition);
      prefilterWheres.push(condition);
    }

    // name / usualName
    const name = filters.name?.trim();
    if (name) {
      const escName = name.replace(/([\\%_])/g, "\\$1");
      const likeName = `%${escName}%`;
      const condition = sql<boolean>`(
        ${legalEntityTable.name} ILIKE ${likeName}
        OR ${legalEntityTable.usualName} ILIKE ${likeName}
      )`;
      wheres.push(condition);
      prefilterWheres.push(condition);
    }

    if (
      filters.legalEntityDepartment &&
      filters.legalEntityDepartment.length > 0
    ) {
      const departmentPrefixes = filters.legalEntityDepartment
        .map((department) => department.split("-").at(0)?.trim())
        .map((code) => {
          if (!code) {
            return null;
          }
          // Corsica zip codes start with 20 regardless of 2A/2B suffixes.
          if (code.toUpperCase().startsWith("2A")) {
            return "20";
          }
          if (code.toUpperCase().startsWith("2B")) {
            return "20";
          }
          return code.padStart(2, "0").slice(0, 2);
        })
        .filter(isNotNullish);

      const dptFilters =
        departmentPrefixes.length > 1
          ? or(
              ...departmentPrefixes.map(
                (prefix) =>
                  sql<boolean>`${legalEntityTable.zipCode} ILIKE ${`${prefix}%`}`,
              ),
            )
          : departmentPrefixes[0]
            ? sql<boolean>`${legalEntityTable.zipCode} ILIKE ${`${departmentPrefixes[0]}%`}`
            : null;

      if (dptFilters) {
        wheres.push(dptFilters);
        prefilterWheres.push(dptFilters);
      }
    }

    wheres.push(...equalsWheres, ...numericRangeWheres);
    prefilterWheres.push(...equalsWheres, ...numericRangeWheres);

    return {
      hasFilters: wheres.length > 0,
      wheres,
      prefilterWheres,
      postJoinWheres,
    };
  },

  buildLocationFiltersSQL({
    filters,
  }: {
    filters: LocationsBdnbLegalEntityProListInput;
  }) {
    // Simple value filters
    const equalsFilters = [
      { key: "locationDepartment", column: locationsBdnbTable.department },
      { key: "sector", column: locationsBdnbTable.sector },
      { key: "buildingUsage", column: locationsBdnbTable.buildingUsage },
      { key: "ipeUsageReason", column: locationsBdnbTable.ipeUsageReason },
      { key: "energyType", column: locationsBdnbTable.energyType },
      { key: "dpe", column: locationsBdnbTable.dpeLabel },
      {
        key: "heatingSystem",
        column: locationsBdnbTable.heatingSystem,
      },
      { key: "heatingType", column: locationsBdnbTable.heatingType },
      { key: "mainGesClass", column: locationsBdnbTable.mainGesClass },
      { key: "glazingType", column: locationsBdnbTable.glazingType },
      {
        key: "ecsGeneratorType",
        column: locationsBdnbTable.ecsGeneratorType,
      },
      {
        key: "maxConstructionPeriod",
        column: locationsBdnbTable.maxConstructionPeriod,
      },
      {
        key: "heatingBackupEnergyType",
        column: locationsBdnbTable.heatingBackupEnergyType,
      },
      { key: "ventilationType", column: locationsBdnbTable.ventilationType },
      {
        key: "inertiaClass",
        column: locationsBdnbTable.inertiaClass,
      },
    ] as const;

    const equalsWheres = equalsFilters
      .map(({ key, column }) => {
        const values = filters[key];
        if (!(Array.isArray(values) && values.length)) {
          return undefined;
        }

        return or(
          ...values.map((rawValue) => {
            const value = rawValue === "NC" ? null : rawValue;
            return value !== null && value !== undefined
              ? sql<boolean>`${column} = ${value}`
              : isNull(column);
          }),
        );
      })
      .filter(isNotNullish);

    const arrayFilters = [
      {
        key: "exteriorWallInsulationType",
        column: locationsBdnbTable.exteriorWallInsulationType,
      },
      {
        key: "lowerFloorInsulationType",
        column: locationsBdnbTable.lowerFloorInsulationType,
      },
      {
        key: "upperFloorInsulationType",
        column: locationsBdnbTable.upperFloorInsulationType,
      },
    ] as const;

    const arrayWheres = arrayFilters
      .map(({ key, column }) => {
        const values = filters[key];
        if (!(Array.isArray(values) && values.length)) {
          return undefined;
        }

        return or(
          ...values.map((value) => sql<boolean>`${value} = ANY(${column})`),
        );
      })
      .filter(isNotNullish);

    //  Boolean filters
    const booleanFilters = [
      { key: "hasBalcony", column: locationsBdnbTable.hasBalcony },
      { key: "pmrAccessible", column: locationsBdnbTable.pmrAccessible },
      {
        key: "multipleExposedFacades",
        column: locationsBdnbTable.multipleExposedFacades,
      },
      { key: "solarHeating", column: locationsBdnbTable.solarHeating },
      { key: "solarEcs", column: locationsBdnbTable.solarEcs },
      { key: "isInQpv", column: locationsBdnbTable.isInQpv },
      {
        key: "hasAirConditioning",
        column: locationsBdnbTable.hasAirConditioning,
      },
      {
        key: "dpeCertified",
        column: locationsBdnbTable.dpeIdentifier,
      },
    ] as const;

    const booleanWheres = booleanFilters
      .map(({ key, column }) => {
        const value = filters[key];

        if (key === "dpeCertified" && value !== undefined) {
          return value ? isNotNull(column) : isNull(column);
        }

        if (typeof value !== "boolean") {
          return undefined;
        }
        return eq(column, value);
      })
      .filter(isNotNullish);

    // Range filters
    const numericRangeFilters = [
      { key: "surfaceArea", column: locationsBdnbTable.surfaceArea },
      {
        key: "surfaceThatRequiresHeating",
        column: locationsBdnbTable.surfaceThatRequiresHeating,
      },
      { key: "glazingArea", column: locationsBdnbTable.glazingArea },
      { key: "height", column: locationsBdnbTable.height },
      { key: "nbStoreys", column: locationsBdnbTable.nbStoreys },
      { key: "nbUnits", column: locationsBdnbTable.nbUnits },
      { key: "nbBuildings", column: locationsBdnbTable.nbBuildings },
      {
        key: "electricityConsumptionPerSquareMeter",
        column: locationsBdnbTable.electricityConsumptionPerSquareMeter,
      },
      {
        key: "greenhouseGasEmissionsPerSquareMeter",
        column: locationsBdnbTable.greenhouseGasEmissionsPerSquareMeter,
      },
      { key: "nbParkingSpots", column: locationsBdnbTable.numberOfGarparkLots },
      {
        key: "habitableSurfaceArea",
        expression: sql<number>`
          coalesce(
            ${locationsBdnbTable.habitableSurfaceBuilding},
            ${locationsBdnbTable.habitableSurface},
            ${locationsBdnbTable.habitableSurfaceDwelling}
          )
        `,
      },
      {
        key: "annualElectricityConsumption",
        column: locationsBdnbTable.annualElectricityConsumption,
      },
    ] as const;

    const dateRangeFilters = [
      { key: "creationDate", column: locationsBdnbTable.creationDate },
      {
        key: "dpeEstablishedDate",
        column: locationsBdnbTable.dpeEstablishedDate,
      },
    ] as const;

    const numericRangeWheres = numericRangeFilters
      .map((filter) => {
        const [minRaw, maxRaw] = filters[filter.key] ?? [null, null];

        if ("column" in filter) {
          return buildRangeWhere({
            column: filter.column,
            min: minRaw,
            max: maxRaw,
          });
        }

        return buildRangeWhere({
          expression: filter.expression,
          min: minRaw,
          max: maxRaw,
        });
      })
      .filter(isNotNullish);

    const dateRangeWheres = dateRangeFilters
      .map(({ key, column }) => {
        const [minRaw, maxRaw] = filters[key] ?? [null, null];
        return buildRangeWhere({
          column,
          min: minRaw,
          max: maxRaw,
          expandDateRangeToYear: true,
        });
      })
      .filter(isNotNullish);

    const ipeNormalizedScoreWhere = buildRangeWhere({
      expression: sql<number>`
        round(1 + (9 * ${locationsBdnbTable.ipeRawScore}) / ${IPE_RAW_SCORE_MAX})
      `,
      min: filters.ipeNormalizedScore?.[0] ?? null,
      max: filters.ipeNormalizedScore?.[1] ?? null,
    });

    const rangeWheres = [
      ...numericRangeWheres,
      ...dateRangeWheres,
      ...(ipeNormalizedScoreWhere ? [ipeNormalizedScoreWhere] : []),
    ];

    const locationFilters = [
      ...equalsWheres,
      ...arrayWheres,
      ...booleanWheres,
      ...rangeWheres,
    ];

    const termRaw = filters.address?.trim();
    if (termRaw && termRaw.length >= 2) {
      const esc = termRaw.replace(/([\\%_])/g, "\\$1");
      const like = `%${esc.replace(/\s+/g, "%")}%`;

      locationFilters.push(sql<boolean>`
      (
        ${locationsBdnbTable.streetNumber} ILIKE ${like}
        OR ${locationsBdnbTable.streetName} ILIKE ${like}
        OR ${locationsBdnbTable.zipcode} ILIKE ${like}
        OR ${locationsBdnbTable.city} ILIKE ${like}
        OR ${locationsBdnbTable.name} ILIKE ${like}
      )
    `);
    }

    const showPlaces = filters.show ?? "all";
    const showFilter =
      showPlaces === "unlocked" || showPlaces === "new"
        ? showPlaces
        : ("all" as const);

    return { locationFilters, showFilter };
  },
};
