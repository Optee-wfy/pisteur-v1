import { getCachedValue } from "@optee/bdd-server";
import type { LocationsBdnbLegalEntityProListInput } from "@optee/constants";
import {
  buildScopedCacheKey,
  invalidateCacheByScope,
  shouldLogSQL,
} from "@optee/location-bdnb-legal-entity-server";
import type {
  LegalEntity,
  LegalEntityUuid,
  LocationBdnbUuid,
  NewLegalEntity,
  ProUuid,
  SnapshotPublicLocationBdnb,
} from "@optee/models";
import {
  associationsLocationsBdnbLegalEntityTable,
  corruptLegalEntityTable,
  legalEntityStatsTable,
  legalEntityTable,
  locationsBdnbTable,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, asc, eq, sql } from "drizzle-orm";
import {
  buildEnterprisesAggContext,
  buildEnterprisesCountQuery,
  buildEnterprisesPageQuery,
  buildLegalEntityItems,
  fetchLegalEntitiesByUuids,
  type LegalEntityPageRow,
} from "../functions";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbExecutor = typeof db | DbTransaction;

const TOTAL_CACHE_TTL_MS = 60_000;
const TOTAL_CACHE_MAX_ENTRIES = 500;
const totalCache = new Map<string, { value: number; expiresAt: number }>();

/**
 * Stats-backed expression for number of related locations per legal entity.
 */
export const LegalEntityRepository = {
  async create(input: NewLegalEntity) {
    const [data] = await db.insert(legalEntityTable).values(input).returning();
    return data?.uuid ?? null;
  },

  async createOrGetByName(
    input: NewLegalEntity & { name: string },
    options?: { tx?: DbTransaction },
  ) {
    const normalizedName = input.name.trim();
    if (!normalizedName) {
      return null;
    }

    const findOrCreateInTx = async (tx: DbTransaction) => {
      // Serialize concurrent create/read operations for the same legal-entity name.
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext(${normalizedName}))`,
      );

      const [existing] = await tx
        .select({ uuid: legalEntityTable.uuid })
        .from(legalEntityTable)
        .where(eq(legalEntityTable.name, normalizedName))
        .limit(1);

      if (existing?.uuid) {
        return existing.uuid;
      }

      const [created] = await tx
        .insert(legalEntityTable)
        .values({ ...input, name: normalizedName })
        .returning({ uuid: legalEntityTable.uuid });

      return created?.uuid ?? null;
    };

    if (options?.tx) {
      return findOrCreateInTx(options.tx);
    }

    return db.transaction(async (tx) => {
      return findOrCreateInTx(tx);
    });
  },

  async createAssociationWithLocationBdnb(
    locationBdnbUuid: LocationBdnbUuid,
    legalEntityUuid: LegalEntityUuid,
    options?: { tx?: DbTransaction },
  ) {
    const executor: DbExecutor = options?.tx ?? db;
    const [existing] = await executor
      .select()
      .from(associationsLocationsBdnbLegalEntityTable)
      .where(
        and(
          eq(
            associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
            locationBdnbUuid,
          ),
          eq(
            associationsLocationsBdnbLegalEntityTable.legalEntityUuid,
            legalEntityUuid,
          ),
        ),
      )
      .limit(1);

    if (existing) {
      return existing.uuid;
    }

    const [created] = await executor
      .insert(associationsLocationsBdnbLegalEntityTable)
      .values({
        locationBdnbUuid,
        legalEntityUuid,
      })
      .returning();
    if (created?.uuid) {
      await LegalEntityRepository.refreshLegalEntityLocationStats(
        legalEntityUuid,
        { tx: options?.tx },
      );
    }
    return created?.uuid ?? null;
  },

  async refreshLegalEntityLocationStats(
    legalEntityUuid: LegalEntityUuid,
    options?: { tx?: DbTransaction },
  ) {
    const executor: DbExecutor = options?.tx ?? db;
    const [row] = await executor
      .select({
        total: sql<number>`
          count(distinct ${associationsLocationsBdnbLegalEntityTable.locationBdnbUuid})
        `,
      })
      .from(associationsLocationsBdnbLegalEntityTable)
      .where(
        eq(
          associationsLocationsBdnbLegalEntityTable.legalEntityUuid,
          legalEntityUuid,
        ),
      );

    const nbRelatedLocations = Number(row?.total ?? 0);

    await executor
      .insert(legalEntityStatsTable)
      .values({
        legalEntityUuid,
        nbRelatedLocations,
      })
      .onConflictDoUpdate({
        target: legalEntityStatsTable.legalEntityUuid,
        set: { nbRelatedLocations },
      });

    invalidateCacheByScope(totalCache, "legal-entities-total", shouldLogSQL);
  },

  async get(uuid: LegalEntityUuid) {
    const [res] = await db
      .select()
      .from(legalEntityTable)
      .where(eq(legalEntityTable.uuid, uuid))
      .limit(1);

    return res ?? null;
  },

  async getNbRelatedPros(legalEntityUuid: LegalEntityUuid) {
    const [stats] = await db
      .select({
        nbRelatedPros:
          sql<number>`coalesce(${legalEntityStatsTable.nbRelatedPros}, 0)`.as(
            "nbRelatedPros",
          ),
      })
      .from(legalEntityStatsTable)
      .where(eq(legalEntityStatsTable.legalEntityUuid, legalEntityUuid))
      .limit(1);

    return Number(stats?.nbRelatedPros ?? 0);
  },

  async getLocationBdnbAddressAndStreetview(legalEntityUuid: LegalEntityUuid) {
    const [res] = await db
      .select({
        locationBdnbUuid: locationsBdnbTable.uuid,
        streetViewUrl: locationsBdnbTable.streetViewUrl,
        streetNumber: locationsBdnbTable.streetNumber,
        streetName: locationsBdnbTable.streetName,
        city: locationsBdnbTable.city,
        zipCode: locationsBdnbTable.zipcode,
      })
      .from(locationsBdnbTable)
      .innerJoin(
        associationsLocationsBdnbLegalEntityTable,
        eq(
          locationsBdnbTable.uuid,
          associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
        ),
      )
      .where(
        eq(
          associationsLocationsBdnbLegalEntityTable.legalEntityUuid,
          legalEntityUuid,
        ),
      )
      .limit(1);

    return res ?? null;
  },

  async update(
    uuid: LegalEntityUuid,
    data: Partial<Omit<LegalEntity, "uuid">>,
  ) {
    return db
      .update(legalEntityTable)
      .set(data)
      .where(eq(legalEntityTable.uuid, uuid))
      .returning()
      .then((rows) => rows[0] || null);
  },

  getByName: async (name: string) => {
    const [res] = await db
      .select()
      .from(legalEntityTable)
      .where(eq(legalEntityTable.name, name))
      .limit(1);

    return res ?? null;
  },

  getAllByLocation(locationBdnbUuid: LocationBdnbUuid) {
    return db
      .selectDistinctOn(
        [associationsLocationsBdnbLegalEntityTable.legalEntityUuid],
        {
          legalEntity: legalEntityTable,
          nbRelatedLocations: legalEntityStatsTable.nbRelatedLocations,
          nbRelatedPros: legalEntityStatsTable.nbRelatedPros,
        },
      )
      .from(associationsLocationsBdnbLegalEntityTable)
      .innerJoin(
        legalEntityTable,
        eq(
          associationsLocationsBdnbLegalEntityTable.legalEntityUuid,
          legalEntityTable.uuid,
        ),
      )
      .leftJoin(
        legalEntityStatsTable,
        eq(legalEntityStatsTable.legalEntityUuid, legalEntityTable.uuid),
      )
      .orderBy(asc(associationsLocationsBdnbLegalEntityTable.legalEntityUuid))
      .where(
        eq(
          associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
          locationBdnbUuid,
        ),
      )

      .then((res) =>
        res.map(({ legalEntity, nbRelatedLocations, nbRelatedPros }) => ({
          legalEntity,
          nbRelatedLocations: nbRelatedLocations ?? null,
          nbRelatedPros: nbRelatedPros ?? null,
        })),
      );
  },

  countByLocation(locationBdnbUuid: LocationBdnbUuid) {
    return db
      .select({
        count: sql<number>`count(distinct ${associationsLocationsBdnbLegalEntityTable.legalEntityUuid})`,
      })
      .from(associationsLocationsBdnbLegalEntityTable)
      .where(
        eq(
          associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
          locationBdnbUuid,
        ),
      )
      .then((res) => Number(res[0]?.count ?? 0));
  },

  flagLegalEntityAsCorrupted({
    name,
    reason,
    raw,
  }: {
    name: string;
    reason: string;
    raw: SnapshotPublicLocationBdnb;
  }) {
    const timeLog = new Date().toISOString().split(".")[0];
    return db
      .insert(corruptLegalEntityTable)
      .values({
        name,
        reason: `[${timeLog}] ${reason}`,
        raw,
        bdnbId: raw.locationGroupId,
      })
      .returning()
      .then((rows) => rows[0] || null);
  },

  async getAllPaginated({
    filters,
    proUuid,
  }: {
    filters: LocationsBdnbLegalEntityProListInput;
    proUuid: ProUuid;
  }) {
    // Filters + aggregation context.
    const { enterprisesAgg, sortColumn, withCtes } = buildEnterprisesAggContext(
      {
        filters,
        proUuid,
      },
    );

    const pageQuery = buildEnterprisesPageQuery({
      enterprisesAgg,
      withCtes,
      sortColumn,
      sortOrder: filters.sort?.sortOrder === "desc" ? "desc" : "asc",
      pageSize: filters.pageSize,
      offset: filters.page * filters.pageSize,
    });

    if (shouldLogSQL) {
      const { sql: sqlText, params } = pageQuery.toSQL();
      console.log("[sql] getAllPaginated.page", sqlText, params ?? []);
    }

    const pageRows = (await pageQuery) as LegalEntityPageRow[];

    // Cached total count for pagination.
    const total = await getCachedValue(
      totalCache,
      buildScopedCacheKey("legal-entities-total", proUuid, filters),
      TOTAL_CACHE_TTL_MS,
      TOTAL_CACHE_MAX_ENTRIES,
      async () => {
        const countQuery = buildEnterprisesCountQuery({
          enterprisesAgg,
          withCtes,
        });
        if (shouldLogSQL) {
          const { sql: sqlText, params } = countQuery.toSQL();
          console.log("[sql] getAllPaginated.total", sqlText, params ?? []);
        }
        const [count] = await countQuery;
        return Number(count?.total ?? 0);
      },
    );

    if (pageRows.length === 0) {
      return { items: [], total };
    }

    // Fetch legal entities for current page.
    const legalEntityUuids = pageRows
      .map((r) => r.legalEntityUuid)
      .filter((uuid): uuid is LegalEntityUuid => uuid !== null);

    const legalEntities = await fetchLegalEntitiesByUuids(legalEntityUuids);
    const legalEntityByUuid = new Map(
      legalEntities.map((entity) => [entity.legalEntityUuid, entity]),
    );
    const items = buildLegalEntityItems({
      pageRows,
      legalEntityByUuid,
    });

    return {
      items,
      total,
    };
  },

  invalidateTotalCache() {
    invalidateCacheByScope(totalCache, "legal-entities-total", shouldLogSQL);
  },
};
