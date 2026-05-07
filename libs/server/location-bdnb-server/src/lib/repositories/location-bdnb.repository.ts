import { getCachedValue } from "@optee/bdd-server";
import { BdnbProvider } from "@optee/bdnb-server";
import type {
  BuildingOccupancyCounts,
  LocationBdnbLegalEntityFilterPro,
  LocationsBdnbLegalEntityProListInput,
} from "@optee/constants";
import { LEGAL_ENTITY_TYPES, type LegalEntityType } from "@optee/constants";
import type {
  LegalEntityUuid,
  LocationBdnbUuid,
  NewLocationBdnb,
  ProUuid,
} from "@optee/models";
import {
  associationsLocationsBdnbLegalEntityTable,
  LeadHistoryTable,
  legalEntityTable,
  locationBdnbStatsTable,
  locationsBdnbTable,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, desc, eq, ilike, sql } from "drizzle-orm";

import {
  buildScopedCacheKey,
  invalidateCacheByScope,
  LocationBdnbLegalEntityRepository,
  shouldLogSQL,
} from "@optee/location-bdnb-legal-entity-server";
import {
  buildBaseCtes,
  buildCountsQuery,
  buildItems,
  buildLegalEntitiesMap,
  buildLocationMap,
  buildLockedQuery,
  buildProAssocMap,
  buildSortExpr,
  buildUnlockedAssociations,
  buildUnlockedQuery,
  fetchLegalEntitiesByLocation,
  fetchLocationsByUuids,
  fetchOccupancyCountsByLocation,
  fetchPageRows,
  fetchProAssociations,
  type OccupancyCountsRow,
} from "../functions";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbExecutor = typeof db | DbTransaction;

const TOTAL_CACHE_TTL_MS = 60_000;
const TOTAL_CACHE_MAX_ENTRIES = 500;
const totalCache = new Map<
  string,
  { value: { total: number; unlocked: number }; expiresAt: number }
>();
const PARIS_TIMEZONE = "Europe/Paris";

const toValidDate = (value: Date | string | null | undefined) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const getParisDayKey = (value: Date | string | null | undefined) => {
  const date = toValidDate(value);
  if (!date) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const getPart = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value ?? "";

  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");

  return year && month && day ? `${year}-${month}-${day}` : null;
};

const getCurrentParisWeekRange = () => {
  const now = new Date();
  const todayDayKey = getParisDayKey(now);

  if (!todayDayKey) {
    return null;
  }

  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: PARIS_TIMEZONE,
    weekday: "short",
  }).format(now);

  const daysSinceMonday =
    {
      Mon: 0,
      Tue: 1,
      Wed: 2,
      Thu: 3,
      Fri: 4,
      Sat: 5,
      Sun: 6,
    }[weekday] ?? 0;

  const startOfWeek = new Date(`${todayDayKey}T00:00:00Z`);
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - daysSinceMonday);

  return {
    startDayKey: getParisDayKey(startOfWeek),
    todayDayKey,
  };
};

export const LocationBdnbRepository = {
  async create(input: NewLocationBdnb, options?: { tx?: DbTransaction }) {
    const executor: DbExecutor = options?.tx ?? db;
    const [data] = await executor
      .insert(locationsBdnbTable)
      .values(input)
      .returning();
    return data?.uuid ?? null;
  },

  async get(locationBdnbUuid: LocationBdnbUuid) {
    const rows = await db
      .select()
      .from(locationsBdnbTable)
      .leftJoin(
        associationsLocationsBdnbLegalEntityTable,
        eq(
          locationsBdnbTable.uuid,
          associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
        ),
      )
      .leftJoin(
        legalEntityTable,
        eq(
          associationsLocationsBdnbLegalEntityTable.legalEntityUuid,
          legalEntityTable.uuid,
        ),
      )
      .where(eq(locationsBdnbTable.uuid, locationBdnbUuid));

    if (rows.length === 0) {
      return null;
    }

    const batiments_bdnb = rows[0]?.batiments_bdnb || null;

    if (!batiments_bdnb) {
      return null;
    }

    const legalEntitiesMap = new Map<
      string,
      {
        uuid: LegalEntityUuid;
        type: LegalEntityType;
        name: string | null;
        mainBusinessActivity: string | null;
      }
    >();

    for (const { personne_morale: legalEntity } of rows) {
      if (!legalEntity) {
        continue;
      }

      const { name, type, uuid, mainBusinessActivity } = legalEntity;

      if (
        !uuid ||
        typeof type !== "string" ||
        !LEGAL_ENTITY_TYPES.includes(type)
      ) {
        continue;
      }

      legalEntitiesMap.set(uuid, {
        uuid: uuid,
        type: type,
        name: typeof name === "string" && name.trim().length ? name : null,
        mainBusinessActivity:
          typeof mainBusinessActivity === "string" &&
          mainBusinessActivity.trim().length
            ? mainBusinessActivity
            : null,
      });
    }

    const personnesMorales = Array.from(legalEntitiesMap.values()).sort(
      (a, b) =>
        a.type.localeCompare(b.type) ||
        (a.name ?? "").localeCompare(b.name ?? ""),
    );
    const [stats] = await db
      .select({
        nbRelatedPros:
          sql<number>`coalesce(${locationBdnbStatsTable.nbRelatedPros}, 0)`.as(
            "nbRelatedPros",
          ),
      })
      .from(locationBdnbStatsTable)
      .where(eq(locationBdnbStatsTable.locationBdnbUuid, locationBdnbUuid))
      .limit(1);

    return {
      batiments_bdnb,
      personnes_morales: personnesMorales, // @todo <--- est-ce qu'on veut vraiment les personnes morales ici ?
      nbRelatedPros: Number(stats?.nbRelatedPros ?? 0),
    };
  },

  getByLocationGroupId(
    locationGroupId: string,
    options?: { tx?: DbTransaction },
  ) {
    const executor: DbExecutor = options?.tx ?? db;
    return executor
      .select()
      .from(locationsBdnbTable)
      .where(eq(locationsBdnbTable.locationGroupId, locationGroupId))
      .limit(1)
      .then((res) => res[0] || null);
  },

  getByAddress(addressInput: string) {
    const { streetName, streetNumber, city, zipcode } =
      BdnbProvider.extractAddress(addressInput);

    const fieldCount = [streetNumber, streetName, city, zipcode].filter(
      Boolean,
    ).length;
    if (fieldCount < 2) {
      return Promise.resolve(null);
    }

    return db
      .select()
      .from(locationsBdnbTable)
      .where(
        and(
          streetNumber
            ? eq(locationsBdnbTable.streetNumber, streetNumber)
            : sql<boolean>`true`,
          streetName
            ? ilike(locationsBdnbTable.streetName, streetName)
            : sql<boolean>`true`,
          city ? ilike(locationsBdnbTable.city, city) : sql<boolean>`true`,
          zipcode
            ? eq(locationsBdnbTable.zipcode, zipcode)
            : sql<boolean>`true`,
        ),
      )
      .limit(1)
      .then((res) => res[0] || null);
  },

  async getAllForProPaginated({
    filters,
    proUuid,
  }: {
    filters: LocationsBdnbLegalEntityProListInput;
    proUuid: ProUuid;
  }) {
    const { base, locationScope, locationsAgg } = await buildBaseCtes({
      filters,
      proUuid,
    });

    const unlockedAssociations = buildUnlockedAssociations(proUuid);

    const countRow = await getCachedValue(
      totalCache,
      buildScopedCacheKey("locations-counts", proUuid, filters),
      TOTAL_CACHE_TTL_MS,
      TOTAL_CACHE_MAX_ENTRIES,
      async () => {
        const countsQuery = buildCountsQuery({
          base,
          locationScope,
          locationsAgg,
          unlockedAssociations,
        });
        if (shouldLogSQL) {
          const { sql: sqlText, params } = countsQuery.toSQL();
          console.log(
            "[sql] getAllForProPaginated.counts",
            sqlText,
            params ?? [],
          );
        }
        const [row] = await countsQuery;
        return row ?? { total: 0, unlocked: 0 };
      },
    );

    const sortExpr = buildSortExpr(filters.sort, locationsAgg);

    const queryInput = {
      base,
      locationScope,
      locationsAgg,
      unlockedAssociations,
      sortExpr,
    };

    const pageRows = await fetchPageRows({
      unlockedQuery: buildUnlockedQuery(queryInput),
      lockedQuery: buildLockedQuery(queryInput),
      offset: filters.page * filters.pageSize,
      pageSize: filters.pageSize,
      unlockedCount: Number(countRow?.unlocked ?? 0),
    });

    const locationUuids = pageRows.map((r) => r.locationUuid);

    if (locationUuids.length === 0) {
      return { items: [], total: Number(countRow?.total ?? 0) };
    }

    // Données de base des bâtiments pour ces UUID
    const locations = await fetchLocationsByUuids(locationUuids);
    const locationByUuid = buildLocationMap(locations);

    // Pro associations (agrégées, mais seulement pour la page)
    const proAssocRows = await fetchProAssociations(locationUuids, proUuid);
    const proAssocByLocationUuid = buildProAssocMap(proAssocRows);

    // Entités légales (agrégées pour la page uniquement)
    const legalEntitiesRows = await fetchLegalEntitiesByLocation(locationUuids);
    const legalEntitiesByLocationUuid =
      buildLegalEntitiesMap(legalEntitiesRows);

    // Comptes d'occupation (agrégés pour la page uniquement)
    const occupancyCountsRows: OccupancyCountsRow[] =
      await fetchOccupancyCountsByLocation(locationUuids);
    const occupancyCountsByLocationUuid = new Map<
      LocationBdnbUuid,
      BuildingOccupancyCounts
    >(
      occupancyCountsRows.map((row) => [
        row.locationUuid,
        {
          siretCount: row.siretCount,
          sirenOnlyCount: row.sirenOnlyCount,
        },
      ]),
    );

    // Construction des items dans l’ordre de la page
    const items = buildItems({
      pageRows,
      locationByUuid,
      proAssocByLocationUuid,
      legalEntitiesByLocationUuid,
      occupancyCountsByLocationUuid,
    });
    return { items, total: Number(countRow?.total ?? 0) };
  },

  async getAllLeadHistoryPaginatedForPro({
    filters,
    proUuid,
  }: {
    filters: LocationsBdnbLegalEntityProListInput;
    proUuid: ProUuid;
  }) {
    const { base, locationScope } = await buildBaseCtes({
      filters,
      proUuid,
    });

    const lastSentAt = sql<Date>`max(${LeadHistoryTable.createdAt})`;

    const leadHistoryScope = db.$with("lead_history_scope").as(
      db
        .select({
          locationUuid: LeadHistoryTable.locationBdnbUuid,
          lastSentAt: lastSentAt.as("lastSentAt"),
        })
        .from(LeadHistoryTable)
        .innerJoin(
          locationScope,
          eq(LeadHistoryTable.locationBdnbUuid, locationScope.locationUuid),
        )
        .where(eq(LeadHistoryTable.proUuid, proUuid))
        .groupBy(LeadHistoryTable.locationBdnbUuid),
    );

    const currentWeekRange = getCurrentParisWeekRange();
    const isLeadFromCurrentWeek =
      currentWeekRange?.startDayKey && currentWeekRange.todayDayKey
        ? sql<boolean>`to_char(timezone(${PARIS_TIMEZONE}, ${leadHistoryScope.lastSentAt}), 'YYYY-MM-DD')
            between ${currentWeekRange.startDayKey} and ${currentWeekRange.todayDayKey}`
        : undefined;
    const leadStatusFilter =
      filters.leadStatus === "new"
        ? isLeadFromCurrentWeek
        : filters.leadStatus === "archived"
          ? isLeadFromCurrentWeek
            ? sql<boolean>`not (${isLeadFromCurrentWeek})`
            : undefined
          : undefined;

    const [countRow] = await db
      .with(base, locationScope, leadHistoryScope)
      .select({
        total: sql<number>`count(*)`.as("total"),
        weeklyNewCount: currentWeekRange?.startDayKey
          ? sql<number>`count(*) filter (
              where to_char(timezone(${PARIS_TIMEZONE}, ${leadHistoryScope.lastSentAt}), 'YYYY-MM-DD')
              between ${currentWeekRange.startDayKey} and ${currentWeekRange.todayDayKey}
            )`.as("weeklyNewCount")
          : sql<number>`0`.as("weeklyNewCount"),
      })
      .from(leadHistoryScope)
      .where(leadStatusFilter);

    const [companyRow] = await db
      .with(base, locationScope, leadHistoryScope)
      .select({
        totalCompanies:
          sql<number>`count(distinct ${associationsLocationsBdnbLegalEntityTable.legalEntityUuid})`.as(
            "totalCompanies",
          ),
      })
      .from(leadHistoryScope)
      .leftJoin(
        associationsLocationsBdnbLegalEntityTable,
        eq(
          associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
          leadHistoryScope.locationUuid,
        ),
      )
      .where(leadStatusFilter);

    const pageRows = await db
      .with(base, locationScope, leadHistoryScope)
      .select({
        locationUuid: leadHistoryScope.locationUuid,
        isLocked: sql<number>`0`.as("isLocked"),
        lastSentAt: leadHistoryScope.lastSentAt,
      })
      .from(leadHistoryScope)
      .where(leadStatusFilter)
      .orderBy(desc(leadHistoryScope.lastSentAt))
      .limit(filters.pageSize)
      .offset(filters.page * filters.pageSize);

    const locationUuids = pageRows.map((row) => row.locationUuid);

    if (locationUuids.length === 0) {
      return {
        items: [],
        total: Number(countRow?.total ?? 0),
        weeklyNewCount: Number(countRow?.weeklyNewCount ?? 0),
        totalCompanies: Number(companyRow?.totalCompanies ?? 0),
      };
    }

    const locations = await fetchLocationsByUuids(locationUuids);
    const locationByUuid = buildLocationMap(locations);

    const proAssocRows = await fetchProAssociations(locationUuids, proUuid);
    const proAssocByLocationUuid = buildProAssocMap(proAssocRows);

    const legalEntitiesRows = await fetchLegalEntitiesByLocation(locationUuids);
    const legalEntitiesByLocationUuid =
      buildLegalEntitiesMap(legalEntitiesRows);

    const occupancyCountsRows: OccupancyCountsRow[] =
      await fetchOccupancyCountsByLocation(locationUuids);
    const occupancyCountsByLocationUuid = new Map<
      LocationBdnbUuid,
      BuildingOccupancyCounts
    >(
      occupancyCountsRows.map((row) => [
        row.locationUuid,
        {
          siretCount: row.siretCount,
          sirenOnlyCount: row.sirenOnlyCount,
        },
      ]),
    );

    const lastSentAtByLocationUuid = new Map(
      pageRows.map((row) => [row.locationUuid, row.lastSentAt ?? null]),
    );

    const items = buildItems({
      pageRows,
      locationByUuid,
      proAssocByLocationUuid,
      legalEntitiesByLocationUuid,
      occupancyCountsByLocationUuid,
    });

    return {
      items: items.map((item) => {
        const lastSentAt = lastSentAtByLocationUuid.get(item.location.uuid);
        const lastSentDayKey = getParisDayKey(lastSentAt);
        const isNew =
          !!currentWeekRange?.startDayKey &&
          !!currentWeekRange.todayDayKey &&
          !!lastSentDayKey &&
          lastSentDayKey >= currentWeekRange.startDayKey &&
          lastSentDayKey <= currentWeekRange.todayDayKey;

        return {
          ...item,
          leadStatus: isNew ? "new" : "archived",
        };
      }),
      total: Number(countRow?.total ?? 0),
      weeklyNewCount: Number(countRow?.weeklyNewCount ?? 0),
      totalCompanies: Number(companyRow?.totalCompanies ?? 0),
    };
  },

  async update(
    uuid: LocationBdnbUuid,
    data: Partial<NewLocationBdnb>,
    options?: { tx?: DbTransaction },
  ) {
    const executor: DbExecutor = options?.tx ?? db;
    return executor
      .update(locationsBdnbTable)
      .set({ ...data })
      .where(eq(locationsBdnbTable.uuid, uuid))
      .returning()
      .then((rows) => rows[0] || null);
  },

  invalidateCountsCache() {
    invalidateCacheByScope(totalCache, "locations-counts", shouldLogSQL);
  },

  async countMatchingLocations(
    criteria: LocationBdnbLegalEntityFilterPro,
    proUuid: ProUuid,
  ) {
    const filters: LocationsBdnbLegalEntityProListInput = {
      ...criteria,
      page: 0,
      pageSize: 1,
      sort: null,
      show: criteria.show ?? "new",
    };

    const { base, locationScope, locationsAgg } = await buildBaseCtes({
      filters,
      proUuid,
    });

    const unlockedAssociations = buildUnlockedAssociations(proUuid);
    const countsQuery = buildCountsQuery({
      base,
      locationScope,
      locationsAgg,
      unlockedAssociations,
    });
    const [countsRow] = await countsQuery;

    const baseCompanies = LocationBdnbLegalEntityRepository.buildBaseScopeCTE({
      filters,
      proUuid,
      forceAssociationJoin: true,
      cteName: "base_companies",
    });

    const [companyRow] = await db
      .with(base, locationScope, locationsAgg, baseCompanies)
      .select({
        companyCount: sql<number>`count(distinct ${baseCompanies.legalEntityUuid})`,
      })
      .from(baseCompanies)
      .innerJoin(
        locationsAgg,
        eq(baseCompanies.locationUuid, locationsAgg.locationUuid),
      );

    return {
      buildingCount: Number(countsRow?.total ?? 0),
      companyCount: Number(companyRow?.companyCount ?? 0),
    };
  },
};
