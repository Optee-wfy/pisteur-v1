import type { LocationBdnbLegalEntityRepository } from "@optee/location-bdnb-legal-entity-server";
import { locationsBdnbTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { asc, eq, sql } from "drizzle-orm";
import type {
  LocationScopeCte,
  LocationsAggCte,
} from "./build-base-ctes.function";
import type { buildSortExpr } from "./build-sort-expr.function";
import type { buildUnlockedAssociations } from "./build-unlocked-associations.function";

/**
 * Page query for unlocked locations only (sorted).
 */
export const buildUnlockedQuery = ({
  base,
  locationScope,
  locationsAgg,
  unlockedAssociations,
  sortExpr,
}: {
  base: ReturnType<typeof LocationBdnbLegalEntityRepository.buildBaseScopeCTE>;
  locationScope: LocationScopeCte;
  locationsAgg: LocationsAggCte;
  unlockedAssociations: ReturnType<typeof buildUnlockedAssociations>;
  sortExpr: ReturnType<typeof buildSortExpr>;
}) =>
  db
    .with(base, locationScope, locationsAgg)
    .select({
      locationUuid: locationsAgg.locationUuid,
      // 0 = unlocked, 1 = locked; tag used for merging (sorting happens later).
      isLocked: sql<number>`0`.as("is_locked"),
    })
    .from(locationsAgg)
    .innerJoin(
      unlockedAssociations,
      eq(locationsAgg.locationUuid, unlockedAssociations.locationUuid),
    )
    .innerJoin(
      locationsBdnbTable,
      eq(locationsAgg.locationUuid, locationsBdnbTable.uuid),
    )
    .orderBy(sortExpr, asc(locationsAgg.locationUuid));
