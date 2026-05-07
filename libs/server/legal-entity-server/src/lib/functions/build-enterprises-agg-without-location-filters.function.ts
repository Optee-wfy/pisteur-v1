import type { LocationsBdnbLegalEntityProListInput } from "@optee/constants";
import { LocationBdnbLegalEntityRepository } from "@optee/location-bdnb-legal-entity-server";
import type { ProUuid } from "@optee/models";
import { legalEntityStatsTable, legalEntityTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq, sql, type SQL } from "drizzle-orm";
import type { buildNbRelatedLocationsExpr } from "./build-nb-related-locations-expr.function";
import { buildShowFilter } from "./build-show-filter.function";

/**
 * Direct aggregation from legal entities + stats when there are no location filters.
 */
export const buildEnterprisesAggWithoutLocationFilters = ({
  filters,
  proUuid,
  show,
  nbRelatedLocationsExpr,
  whereNbRelated,
}: {
  filters: LocationsBdnbLegalEntityProListInput;
  proUuid: ProUuid;
  show: LocationsBdnbLegalEntityProListInput["show"];
  nbRelatedLocationsExpr: ReturnType<typeof buildNbRelatedLocationsExpr>;
  whereNbRelated: SQL<unknown> | undefined;
}) => {
  const legalEntityFilter =
    LocationBdnbLegalEntityRepository.buildLegalEntityFilterWheres({
      legalEntityUuid: filters.legalEntityUuid ?? null,
      tertiaryActivityTypes: filters.mainBusinessActivity ?? [],
      locationBuildingTypes: filters.locationBuildingType ?? [],
      filters,
    });

  const showFilterDirect = buildShowFilter({
    show,
    proUuid,
    legalEntityUuidSql: legalEntityTable.uuid,
  });

  const nbRelatedProsExpr = sql<number>`coalesce(${legalEntityStatsTable.nbRelatedPros}, 0)`;

  const noLocationAgg = db
    .select({
      legalEntityUuid: legalEntityTable.uuid,
      nbRelatedLocations: nbRelatedLocationsExpr.as("nbRelatedLocations"),
      nbRelatedPros: nbRelatedProsExpr.as("nbRelatedPros"),
    })
    .from(legalEntityTable)
    .leftJoin(
      legalEntityStatsTable,
      eq(legalEntityTable.uuid, legalEntityStatsTable.legalEntityUuid),
    )
    .where(
      and(
        showFilterDirect,
        whereNbRelated ?? sql`true`,
        ...(legalEntityFilter.hasFilters ? legalEntityFilter.wheres : []),
      ),
    )
    .groupBy(
      legalEntityTable.uuid,
      legalEntityStatsTable.nbRelatedLocations,
      legalEntityStatsTable.nbRelatedPros,
    );

  return db.$with("enterprises_agg").as(noLocationAgg);
};
