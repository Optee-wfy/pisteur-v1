import type { LocationBdnbLegalEntityRepository } from "@optee/location-bdnb-legal-entity-server";
import { locationsBdnbTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { asc, eq, isNull, sql } from "drizzle-orm";
import type {
  LocationScopeCte,
  LocationsAggCte,
} from "./build-base-ctes.function";
import type { buildSortExpr } from "./build-sort-expr.function";
import type { buildUnlockedAssociations } from "./build-unlocked-associations.function";

/**
 * Page query for locked locations only (sorted).
 */
export const buildLockedQuery = ({
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
      isLocked: sql<number>`1`.as("is_locked"),
    })
    .from(locationsAgg)
    .innerJoin(
      locationsBdnbTable,
      eq(locationsAgg.locationUuid, locationsBdnbTable.uuid),
    )
    .leftJoin(
      unlockedAssociations,
      eq(locationsAgg.locationUuid, unlockedAssociations.locationUuid),
    )
    .where(isNull(unlockedAssociations.locationUuid))
    .orderBy(sortExpr, asc(locationsAgg.locationUuid));
