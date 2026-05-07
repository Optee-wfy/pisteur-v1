import type { LocationBdnbLegalEntityRepository } from "@optee/location-bdnb-legal-entity-server";
import { db } from "@optee/supabase-server";
import { eq, sql } from "drizzle-orm";
import type {
  LocationScopeCte,
  LocationsAggCte,
} from "./build-base-ctes.function";
import type { buildUnlockedAssociations } from "./build-unlocked-associations.function";

/**
 * Counts query (total + unlocked) using the shared CTEs.
 */
export const buildCountsQuery = ({
  base,
  locationScope,
  locationsAgg,
  unlockedAssociations,
}: {
  base: ReturnType<typeof LocationBdnbLegalEntityRepository.buildBaseScopeCTE>;
  locationScope: LocationScopeCte;
  locationsAgg: LocationsAggCte;
  unlockedAssociations: ReturnType<typeof buildUnlockedAssociations>;
}) =>
  db
    .with(base, locationScope, locationsAgg)
    .select({
      total: sql<number>`count(*)`,
      unlocked: sql<number>`count(*) filter (where ${unlockedAssociations.locationUuid} is not null)`,
    })
    .from(locationsAgg)
    .leftJoin(
      unlockedAssociations,
      eq(locationsAgg.locationUuid, unlockedAssociations.locationUuid),
    );
