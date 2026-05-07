import type { LegalEntityUuid } from "@optee/models";
import { legalEntityTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { asc, desc, eq, sql, type SQLWrapper } from "drizzle-orm";
import type { buildEnterprisesAggWithLocationFilters } from "./build-enterprises-agg-with-location-filters.function";
import type { buildEnterprisesAggWithoutLocationFilters } from "./build-enterprises-agg-without-location-filters.function";

type EnterprisesAgg =
  | ReturnType<typeof buildEnterprisesAggWithLocationFilters>
  | ReturnType<typeof buildEnterprisesAggWithoutLocationFilters>;

/**
 * Page query (sorted + paginated) over enterprises aggregation CTE.
 */
export const buildEnterprisesPageQuery = ({
  enterprisesAgg,
  withCtes,
  sortColumn,
  sortOrder,
  pageSize,
  offset,
}: {
  enterprisesAgg: EnterprisesAgg;
  withCtes: Parameters<typeof db.with>;
  sortColumn: SQLWrapper;
  sortOrder: "asc" | "desc";
  pageSize: number;
  offset: number;
}) =>
  db
    .with(...withCtes)
    .select({
      legalEntityUuid:
        sql<LegalEntityUuid | null>`${enterprisesAgg.legalEntityUuid}`.as(
          "legalEntityUuid",
        ),
      nbRelatedLocations: sql<
        number | null
      >`${enterprisesAgg.nbRelatedLocations}`.as("nbRelatedLocations"),
      nbRelatedPros: sql<number | null>`${enterprisesAgg.nbRelatedPros}`.as(
        "nbRelatedPros",
      ),
    })
    .from(enterprisesAgg)
    .innerJoin(
      legalEntityTable,
      eq(
        sql<LegalEntityUuid | null>`${enterprisesAgg.legalEntityUuid}`,
        legalEntityTable.uuid,
      ),
    )
    .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
    .limit(pageSize)
    .offset(offset);
