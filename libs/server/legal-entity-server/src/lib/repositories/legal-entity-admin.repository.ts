import type { AdminLegalEntitySortField } from "@optee/constants";
import type { LegalEntityUuid, LocationBdnbUuid, ProUuid } from "@optee/models";
import {
  associationProsExternalLocationsTable,
  associationsProLegalEntityTable,
  associationsLocationsBdnbLegalEntityTable,
  hsProsTable,
  legalEntityStatsTable,
  legalEntityTable,
  locationsBdnbTable,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  or,
  sql,
  type SQLWrapper,
} from "drizzle-orm";
import { LegalEntityRepository } from "./legal-entity.repository";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbExecutor = typeof db | DbTransaction;

type AdminCleanupPro = {
  proUuid: ProUuid;
  proName: string | null;
  nbRelationsWithAffectedLocations: number;
  nbAffectedLocations: number;
  nbRelationsOnDeletedLocations: number;
  nbDeletedLocationsRelated: number;
};

export type DeleteLegalEntityForAdminResult = {
  status: "deleted";
  legalEntity: {
    uuid: LegalEntityUuid;
    name: string | null;
  };
  cleanup: {
    affectedLocationsCount: number;
    removedLegalEntityLocationRelationsCount: number;
    deletedLocationsCount: number;
    retainedLocationsCount: number;
    removedProLocationRelationsCount: number;
    removedProLegalEntityRelationsCount: number;
    removedProLegalEntityProsCount: number;
  };
  impactedPros: AdminCleanupPro[];
};

type AdminImpactedProsRow = {
  proUuid: ProUuid | null;
  proName: string | null;
  locationUuid: LocationBdnbUuid | null;
};

const buildImpactedProsFromRows = ({
  rows,
  deletedLocationUuids,
}: {
  rows: AdminImpactedProsRow[];
  deletedLocationUuids: Set<LocationBdnbUuid>;
}): AdminCleanupPro[] => {
  const impactedProsMap = new Map<
    ProUuid,
    {
      proUuid: ProUuid;
      proName: string | null;
      nbRelationsWithAffectedLocations: number;
      affectedLocations: Set<LocationBdnbUuid>;
      nbRelationsOnDeletedLocations: number;
      deletedLocations: Set<LocationBdnbUuid>;
    }
  >();

  for (const row of rows) {
    if (!row.proUuid || !row.locationUuid) {
      continue;
    }

    const existing = impactedProsMap.get(row.proUuid) ?? {
      proUuid: row.proUuid,
      proName: row.proName,
      nbRelationsWithAffectedLocations: 0,
      affectedLocations: new Set<LocationBdnbUuid>(),
      nbRelationsOnDeletedLocations: 0,
      deletedLocations: new Set<LocationBdnbUuid>(),
    };

    existing.nbRelationsWithAffectedLocations += 1;
    existing.affectedLocations.add(row.locationUuid);

    if (deletedLocationUuids.has(row.locationUuid)) {
      existing.nbRelationsOnDeletedLocations += 1;
      existing.deletedLocations.add(row.locationUuid);
    }

    impactedProsMap.set(row.proUuid, existing);
  }

  return Array.from(impactedProsMap.values())
    .map((item) => ({
      proUuid: item.proUuid,
      proName: item.proName,
      nbRelationsWithAffectedLocations: item.nbRelationsWithAffectedLocations,
      nbAffectedLocations: item.affectedLocations.size,
      nbRelationsOnDeletedLocations: item.nbRelationsOnDeletedLocations,
      nbDeletedLocationsRelated: item.deletedLocations.size,
    }))
    .sort(
      (a, b) =>
        b.nbRelationsOnDeletedLocations - a.nbRelationsOnDeletedLocations ||
        b.nbRelationsWithAffectedLocations - a.nbRelationsWithAffectedLocations,
    );
};

export const LegalEntityAdminRepository = {
  runInTransaction<T>(callback: (tx: DbTransaction) => Promise<T>) {
    return db.transaction(callback);
  },

  invalidateAdminTotalCache() {
    LegalEntityRepository.invalidateTotalCache();
  },

  async deleteProRelationsForLegalEntityForAdmin(
    legalEntityUuid: LegalEntityUuid,
    executor: DbExecutor = db,
  ) {
    const removedRows = await executor
      .delete(associationsProLegalEntityTable)
      .where(
        eq(associationsProLegalEntityTable.legalEntityUuid, legalEntityUuid),
      )
      .returning({
        proUuid: associationsProLegalEntityTable.proUuid,
      });

    const uniqueProUuids = new Set(
      removedRows
        .map((row) => row.proUuid)
        .filter((proUuid): proUuid is ProUuid => proUuid !== null),
    );

    return {
      removedProLegalEntityRelationsCount: removedRows.length,
      removedProLegalEntityProsCount: uniqueProUuids.size,
    };
  },

  async getAssociatedLocationUuidsForAdmin(
    legalEntityUuid: LegalEntityUuid,
    executor: DbExecutor = db,
  ) {
    const associatedLocationsRows = await executor
      .select({
        locationBdnbUuid:
          associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
      })
      .from(associationsLocationsBdnbLegalEntityTable)
      .where(
        eq(
          associationsLocationsBdnbLegalEntityTable.legalEntityUuid,
          legalEntityUuid,
        ),
      );

    return Array.from(
      new Set(
        associatedLocationsRows
          .map((row) => row.locationBdnbUuid)
          .filter(
            (locationBdnbUuid): locationBdnbUuid is LocationBdnbUuid =>
              locationBdnbUuid !== null,
          ),
      ).values(),
    );
  },

  async getAssociationCountsByLocationUuidsForAdmin(
    locationUuids: LocationBdnbUuid[],
    executor: DbExecutor = db,
  ) {
    if (locationUuids.length === 0) {
      return new Map<LocationBdnbUuid, number>();
    }

    const rows = await executor
      .select({
        locationBdnbUuid:
          associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
        total: sql<number>`count(distinct ${associationsLocationsBdnbLegalEntityTable.legalEntityUuid})`,
      })
      .from(associationsLocationsBdnbLegalEntityTable)
      .where(
        inArray(
          associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
          locationUuids,
        ),
      )
      .groupBy(associationsLocationsBdnbLegalEntityTable.locationBdnbUuid);

    const entries = rows
      .filter(
        (
          row,
        ): row is {
          locationBdnbUuid: LocationBdnbUuid;
          total: number;
        } => row.locationBdnbUuid !== null,
      )
      .map((row) => [row.locationBdnbUuid, Number(row.total ?? 0)] as const);

    return new Map<LocationBdnbUuid, number>(entries);
  },

  async getImpactedProsForAdminByLocationUuids(
    locationUuids: LocationBdnbUuid[],
    locationUuidsToDelete: LocationBdnbUuid[],
    executor: DbExecutor = db,
  ) {
    if (locationUuids.length === 0) {
      return [] as AdminCleanupPro[];
    }

    const rows = await executor
      .select({
        proUuid: associationProsExternalLocationsTable.proUuid,
        proName: hsProsTable.name,
        locationUuid: associationProsExternalLocationsTable.locationUuid,
      })
      .from(associationProsExternalLocationsTable)
      .leftJoin(
        hsProsTable,
        eq(associationProsExternalLocationsTable.proUuid, hsProsTable.uuid),
      )
      .where(
        and(
          inArray(
            associationProsExternalLocationsTable.locationUuid,
            locationUuids,
          ),
          isNotNull(associationProsExternalLocationsTable.proUuid),
          isNotNull(associationProsExternalLocationsTable.locationUuid),
        ),
      );

    return buildImpactedProsFromRows({
      rows: rows as AdminImpactedProsRow[],
      deletedLocationUuids: new Set(locationUuidsToDelete),
    });
  },

  async countProLocationRelationsByLocationUuidsForAdmin(
    locationUuids: LocationBdnbUuid[],
    executor: DbExecutor = db,
  ) {
    if (locationUuids.length === 0) {
      return 0;
    }

    const [row] = await executor
      .select({ count: sql<number>`count(*)` })
      .from(associationProsExternalLocationsTable)
      .where(
        inArray(
          associationProsExternalLocationsTable.locationUuid,
          locationUuids,
        ),
      );

    return Number(row?.count ?? 0);
  },

  async deleteLocationRelationsForLegalEntityForAdmin(
    legalEntityUuid: LegalEntityUuid,
    executor: DbExecutor = db,
  ) {
    const removed = await executor
      .delete(associationsLocationsBdnbLegalEntityTable)
      .where(
        eq(
          associationsLocationsBdnbLegalEntityTable.legalEntityUuid,
          legalEntityUuid,
        ),
      )
      .returning({
        locationBdnbUuid:
          associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
      });

    return removed.length;
  },

  async deleteLocationsByUuidsForAdmin(
    locationUuids: LocationBdnbUuid[],
    executor: DbExecutor = db,
  ) {
    if (locationUuids.length === 0) {
      return 0;
    }

    const deleted = await executor
      .delete(locationsBdnbTable)
      .where(inArray(locationsBdnbTable.uuid, locationUuids))
      .returning({ uuid: locationsBdnbTable.uuid });

    return deleted.length;
  },

  async deleteLegalEntityByUuidForAdmin(
    legalEntityUuid: LegalEntityUuid,
    executor: DbExecutor = db,
  ) {
    const [deletedLegalEntity] = await executor
      .delete(legalEntityTable)
      .where(eq(legalEntityTable.uuid, legalEntityUuid))
      .returning({
        uuid: legalEntityTable.uuid,
        name: legalEntityTable.name,
      });

    return deletedLegalEntity ?? null;
  },

  async getAllForAdmin({
    term,
    page,
    pageSize,
    sort,
  }: {
    term: string | null | undefined;
    page: number;
    pageSize: number;
    sort?: {
      sortBy: AdminLegalEntitySortField;
      sortOrder: "asc" | "desc";
    } | null;
  }) {
    const trimmedTerm = term?.trim();
    const escapedTerm = trimmedTerm?.replace(/([\\%_])/g, "\\$1") ?? null;
    const digitsTerm = trimmedTerm?.replace(/\D/g, "") ?? "";

    const textualSearchCondition = escapedTerm
      ? or(
          ilike(legalEntityTable.name, `%${escapedTerm}%`),
          ilike(legalEntityTable.usualName, `%${escapedTerm}%`),
          ilike(legalEntityTable.siret, `%${escapedTerm}%`),
          ilike(legalEntityTable.siren, `%${escapedTerm}%`),
        )
      : null;

    const numericSearchCondition = digitsTerm
      ? or(
          sql<boolean>`regexp_replace(coalesce(${legalEntityTable.siret}, ''), '[^0-9]', '', 'g') ILIKE ${`%${digitsTerm}%`}`,
          sql<boolean>`regexp_replace(coalesce(${legalEntityTable.siren}, ''), '[^0-9]', '', 'g') ILIKE ${`%${digitsTerm}%`}`,
        )
      : null;

    const whereSearch =
      textualSearchCondition && numericSearchCondition
        ? or(textualSearchCondition, numericSearchCondition)
        : (textualSearchCondition ?? numericSearchCondition);

    const relatedProsByLegalEntity = db
      .select({
        legalEntityUuid: associationsProLegalEntityTable.legalEntityUuid,
        nbRelatedPros:
          sql<number>`count(distinct ${associationsProLegalEntityTable.proUuid})`.as(
            "nbRelatedPros",
          ),
      })
      .from(associationsProLegalEntityTable)
      .where(isNotNull(associationsProLegalEntityTable.proUuid))
      .groupBy(associationsProLegalEntityTable.legalEntityUuid)
      .as("related_pros_by_legal_entity");

    const nbRelatedLocationsExpr = sql<number>`
      coalesce(${legalEntityStatsTable.nbRelatedLocations}, 0)
    `;
    const nbRelatedProsExpr = sql<number>`
      coalesce(${relatedProsByLegalEntity.nbRelatedPros}, 0)
    `;
    const nameSortExpr = sql<string>`
      coalesce(${legalEntityTable.name}, ${legalEntityTable.usualName}, '')
    `;

    const sortableColumns: Record<AdminLegalEntitySortField, SQLWrapper> = {
      name: nameSortExpr,
      siren: sql<string>`coalesce(${legalEntityTable.siren}, '')`,
      siret: sql<string>`coalesce(${legalEntityTable.siret}, '')`,
      nbRelatedPros: nbRelatedProsExpr,
      nbRelatedLocations: nbRelatedLocationsExpr,
      type: sql<string>`coalesce(${legalEntityTable.type}, '')`,
      mainBusinessActivity: sql<string>`coalesce(${legalEntityTable.mainBusinessActivity}, '')`,
      zipCode: sql<string>`coalesce(${legalEntityTable.zipCode}, '')`,
    };

    const sortBy = sort?.sortBy ?? "nbRelatedLocations";
    const sortOrder = sort?.sortOrder ?? "desc";
    const sortColumn = sortableColumns[sortBy] ?? nbRelatedLocationsExpr;
    const primaryOrder =
      sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn);

    const [rows, totalRows] = await Promise.all([
      db
        .select({
          uuid: legalEntityTable.uuid,
          name: legalEntityTable.name,
          usualName: legalEntityTable.usualName,
          type: legalEntityTable.type,
          siren: legalEntityTable.siren,
          siret: legalEntityTable.siret,
          zipCode: legalEntityTable.zipCode,
          mainBusinessActivity: legalEntityTable.mainBusinessActivity,
          nbPremises: legalEntityTable.nbPremises,
          noContactCanBeFound: legalEntityTable.noContactCanBeFound,
          isUnavailableForGoogle: legalEntityTable.isUnavailableForGoogle,
          isUnavailableForPappers: legalEntityTable.isUnavailableForPappers,
          isUnavailableForHunter: legalEntityTable.isUnavailableForHunter,
          isUnavailableForSocieteInfo:
            legalEntityTable.isUnavailableForSocieteInfo,
          nbRelatedLocations: nbRelatedLocationsExpr.as("nbRelatedLocations"),
          nbRelatedPros: nbRelatedProsExpr.as("nbRelatedPros"),
        })
        .from(legalEntityTable)
        .leftJoin(
          legalEntityStatsTable,
          eq(legalEntityTable.uuid, legalEntityStatsTable.legalEntityUuid),
        )
        .leftJoin(
          relatedProsByLegalEntity,
          eq(legalEntityTable.uuid, relatedProsByLegalEntity.legalEntityUuid),
        )
        .where(whereSearch ?? sql`true`)
        .orderBy(primaryOrder, asc(nameSortExpr), asc(legalEntityTable.uuid))
        .limit(pageSize)
        .offset(page * pageSize),
      db
        .select({
          total: sql<number>`count(*)`,
        })
        .from(legalEntityTable)
        .where(whereSearch ?? sql`true`),
    ]);

    return {
      items: rows,
      total: Number(totalRows[0]?.total ?? 0),
    };
  },
};
