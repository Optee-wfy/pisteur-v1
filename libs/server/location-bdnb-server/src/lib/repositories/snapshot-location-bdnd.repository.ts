import { buildValuesInCondition } from "@optee/bdd-server";
import {
  NAF_CODE_INDUSTRIALS,
  type LocationsProListInput,
} from "@optee/constants";
import {
  geomGroupTable,
  snapshotPublicLocationsBdnbTable,
  type LocationBdnbUuid,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { isNotNullish } from "@optee/utils";
import {
  and,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  not,
  or,
  sql,
} from "drizzle-orm";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbExecutor = typeof db | DbTransaction;

export const SnapshotLocationBdnbRepository = {
  getBatches: async (filters: LocationsProListInput, limit: number) => {
    const locationFilters =
      await SnapshotLocationBdnbRepository.buildLocationFiltersSQL(filters);

    return db
      .selectDistinctOn([snapshotPublicLocationsBdnbTable.uuid])
      .from(snapshotPublicLocationsBdnbTable)
      .where(and(...locationFilters))
      .leftJoin(
        geomGroupTable,
        eq(
          geomGroupTable.bdnbId,
          snapshotPublicLocationsBdnbTable.locationGroupId,
        ),
      )
      .orderBy(snapshotPublicLocationsBdnbTable.uuid)
      .limit(limit);
  },

  countRemaining: async (filters: LocationsProListInput) => {
    const locationFilters =
      await SnapshotLocationBdnbRepository.buildLocationFiltersSQL(filters);
    const [total] = await db
      .select({ count: sql<number>`count(*)` })
      .from(snapshotPublicLocationsBdnbTable)
      .where(and(...locationFilters));

    return Number(total?.count ?? 0);
  },

  setAsFailedImport: async (uuid: LocationBdnbUuid, reason: string) => {
    const timeLog = new Date().toISOString().split(".")[0];
    await db
      .update(snapshotPublicLocationsBdnbTable)
      .set({ importFailed: `[${timeLog}] ${reason}` })
      .where(eq(snapshotPublicLocationsBdnbTable.uuid, uuid));
  },

  delete: async (uuid: LocationBdnbUuid, options?: { tx?: DbTransaction }) => {
    const executor: DbExecutor = options?.tx ?? db;
    await executor
      .delete(snapshotPublicLocationsBdnbTable)
      .where(eq(snapshotPublicLocationsBdnbTable.uuid, uuid));
  },

  deleteLocationsByUuids: async (uuids: LocationBdnbUuid[]) => {
    if (uuids.length === 0) {
      return;
    }

    await db
      .delete(snapshotPublicLocationsBdnbTable)
      .where(inArray(snapshotPublicLocationsBdnbTable.uuid, uuids));
  },

  async buildLocationFiltersSQL(filters: LocationsProListInput) {
    // Simple value filters
    const table = snapshotPublicLocationsBdnbTable;

    const rangeFilters = [
      { key: "surfaceArea", column: table.surfaceArea },
      { key: "height", column: table.height },
      { key: "nbStoreys", column: table.nbStoreys },
      { key: "nbUnits", column: table.nbUnits },
      { key: "nbBuildings", column: table.nbBuildings },
    ] as const;

    const rangeWheres = rangeFilters.map(({ key, column }) => {
      const [minRaw, maxRaw] = filters[key] ?? [null, null];
      const conditions = [
        minRaw !== null ? gte(column, minRaw) : undefined,
        maxRaw !== null ? lte(column, maxRaw) : undefined,
      ].filter(isNotNullish);
      return conditions.length ? and(...conditions) : undefined;
    });

    const locationFilters = [
      isNull(snapshotPublicLocationsBdnbTable.importFailed),
      ...rangeWheres.filter(isNotNullish),
    ];

    const departmentPrefixes = (filters.department ?? [])
      .map((value) => value.split("-")[0]?.trim().toUpperCase())
      .map((departmentCode) => departmentCode?.slice(0, 2))
      .filter(isNotNullish);

    if (departmentPrefixes.length) {
      const uniquePrefixes = Array.from(new Set(departmentPrefixes));

      const departmentConditions = uniquePrefixes.map((p) =>
        ilike(table.inseeCommuneCode, `${p}%`),
      );

      if (departmentConditions.length === 1) {
        const condition = departmentConditions[0];
        if (condition) {
          locationFilters.push(condition);
        }
      } else if (departmentConditions.length > 1) {
        const orConditions = or(...departmentConditions);
        if (orConditions) {
          locationFilters.push(orConditions);
        }
      }
    }

    if (filters.legalEntityType?.length) {
      const legalEntityConditions = filters.legalEntityType
        .map((type) => {
          if (type === "public") {
            return isNotNull(table.email);
          }
          if (type === "copro") {
            return isNotNull(table.syndicSiret);
          }
          if (type === "tertiaire") {
            return isNotNull(table.siren1);
          }
          return null;
        })
        .filter(isNotNullish);

      if (legalEntityConditions.length === 1) {
        const condition = legalEntityConditions[0];
        if (condition) {
          locationFilters.push(condition);
        }
      } else if (legalEntityConditions.length > 1) {
        const orConditions = or(...legalEntityConditions);
        if (orConditions) {
          locationFilters.push(orConditions);
        }
      }
    }

    if (filters.isIndustrial !== undefined) {
      if (filters.isIndustrial === true) {
        // To filter for industrial locations, we check if the code naf ("mainBusinessActivity1", "mainBusinessActivity2", "mainBusinessActivity3") is in NAF_CODE_INDUSTRIALS
        const industrialOr = or(
          buildValuesInCondition(
            table.mainBusinessActivity1,
            NAF_CODE_INDUSTRIALS,
          ),
          buildValuesInCondition(
            table.mainBusinessActivity2,
            NAF_CODE_INDUSTRIALS,
          ),
          buildValuesInCondition(
            table.mainBusinessActivity3,
            NAF_CODE_INDUSTRIALS,
          ),
        );
        if (industrialOr) {
          locationFilters.push(industrialOr);
        }
      } else if (filters.isIndustrial === false) {
        // Non industrial = at least one code present AND none of the codes are in the industrial list.
        const anyCode = or(
          isNotNull(table.mainBusinessActivity1),
          isNotNull(table.mainBusinessActivity2),
          isNotNull(table.mainBusinessActivity3),
        );
        const noneIndustrial = and(
          or(
            isNull(table.mainBusinessActivity1),
            not(
              buildValuesInCondition(
                table.mainBusinessActivity1,
                NAF_CODE_INDUSTRIALS,
              ),
            ),
          ),
          or(
            isNull(table.mainBusinessActivity2),
            not(
              buildValuesInCondition(
                table.mainBusinessActivity2,
                NAF_CODE_INDUSTRIALS,
              ),
            ),
          ),
          or(
            isNull(table.mainBusinessActivity3),
            not(
              buildValuesInCondition(
                table.mainBusinessActivity3,
                NAF_CODE_INDUSTRIALS,
              ),
            ),
          ),
        );
        const nonIndustrialAndHasCode = and(anyCode, noneIndustrial);
        if (nonIndustrialAndHasCode) {
          locationFilters.push(nonIndustrialAndHasCode);
        }
      }
    }
    return locationFilters.filter(isNotNullish);
  },
};
