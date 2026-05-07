import type { LocationsBdnbLegalEntityProListInput } from "@optee/constants";
import type { LocationBdnbLegalEntityRepository } from "@optee/location-bdnb-legal-entity-server";
import type { ProUuid } from "@optee/models";
import { legalEntityStatsTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq, isNotNull, sql, type SQL } from "drizzle-orm";
import type { buildNbRelatedLocationsExpr } from "./build-nb-related-locations-expr.function";
import { buildShowFilter } from "./build-show-filter.function";

/**
 * Aggregation from base CTE when location filters are active.
 */
export const buildEnterprisesAggWithLocationFilters = ({
  base,
  proUuid,
  show,
  nbRelatedLocationsExpr,
  whereNbRelated,
}: {
  base: ReturnType<typeof LocationBdnbLegalEntityRepository.buildBaseScopeCTE>;
  proUuid: ProUuid;
  show: LocationsBdnbLegalEntityProListInput["show"];
  nbRelatedLocationsExpr: ReturnType<typeof buildNbRelatedLocationsExpr>;
  whereNbRelated: SQL<unknown> | undefined;
}) => {
  const showFilter = buildShowFilter({
    show,
    proUuid,
    legalEntityUuidSql: base.legalEntityUuid,
  });

  return db.$with("enterprises_agg").as(
    db
      .select({
        legalEntityUuid: base.legalEntityUuid,
        nbRelatedLocations: nbRelatedLocationsExpr.as("nbRelatedLocations"),
        nbRelatedPros:
          sql<number>`coalesce(${legalEntityStatsTable.nbRelatedPros}, 0)`.as(
            "nbRelatedPros",
          ),
      })
      .from(base)
      .leftJoin(
        legalEntityStatsTable,
        eq(base.legalEntityUuid, legalEntityStatsTable.legalEntityUuid),
      )
      .where(
        and(
          isNotNull(base.legalEntityUuid),
          showFilter,
          whereNbRelated ?? sql`true`,
        ),
      )
      .groupBy(
        base.legalEntityUuid,
        nbRelatedLocationsExpr,
        legalEntityStatsTable.nbRelatedPros,
      ),
  );
};
