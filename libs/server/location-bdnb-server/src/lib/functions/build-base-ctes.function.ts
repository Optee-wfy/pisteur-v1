import { buildSqlRangeWhere } from "@optee/bdd-server";
import type { LocationsBdnbLegalEntityProListInput } from "@optee/constants";
import { LocationBdnbLegalEntityRepository } from "@optee/location-bdnb-legal-entity-server";
import type { ProUuid } from "@optee/models";
import { locationBdnbStatsTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { eq, sql } from "drizzle-orm";
import { buildNbLegalEntitiesExpr } from "./build-nb-legal-entities-expr.function";

/**
 * Build base CTEs used by both counts and paging:
 * - base_scope_filtered
 * - location_scope (distinct location UUIDs)
 * - locations_agg (stats join + entity range filter)
 */
export const buildBaseCtes = async ({
  filters,
  proUuid,
}: {
  filters: LocationsBdnbLegalEntityProListInput;
  proUuid: ProUuid;
}) => {
  const base = await LocationBdnbLegalEntityRepository.buildBaseScopeCTE({
    filters,
    proUuid,
    cteName: "base_scope_filtered",
  });

  const locationScope = db.$with("location_scope").as(
    db
      .selectDistinct({
        locationUuid: base.locationUuid,
      })
      .from(base),
  );

  const [minEntities, maxEntities] = filters.nbLegalEntitiesPerLocation ?? [
    null,
    null,
  ];

  const nbLegalEntitiesExpr = buildNbLegalEntitiesExpr();
  const whereEntities = buildSqlRangeWhere(
    nbLegalEntitiesExpr,
    minEntities,
    maxEntities,
  );

  const locationsAgg = db.$with("locations_agg").as(
    db
      .select({
        locationUuid: locationScope.locationUuid,
        nbLegalEntities: nbLegalEntitiesExpr.as("nbLegalEntities"),
        nbRelatedPros:
          sql<number>`coalesce(${locationBdnbStatsTable.nbRelatedPros}, 0)`.as(
            "nbRelatedPros",
          ),
      })
      .from(locationScope)
      .leftJoin(
        locationBdnbStatsTable,
        eq(locationScope.locationUuid, locationBdnbStatsTable.locationBdnbUuid),
      )
      .where(whereEntities ?? sql`true`),
  );

  return { base, locationScope, locationsAgg };
};

export type BaseCtes = Awaited<ReturnType<typeof buildBaseCtes>>;
export type LocationScopeCte = BaseCtes["locationScope"];
export type LocationsAggCte = BaseCtes["locationsAgg"];
