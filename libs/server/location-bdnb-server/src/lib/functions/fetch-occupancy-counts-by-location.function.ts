import type { LocationBdnbUuid } from "@optee/models";
import { locationBdnbStatsTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { inArray, sql } from "drizzle-orm";

export type OccupancyCountsRow = {
  locationUuid: LocationBdnbUuid;
  siretCount: number;
  sirenOnlyCount: number;
};

/**
 * Fetch occupancy counts (siret/siren-only) for the current page.
 */
export const fetchOccupancyCountsByLocation = (
  locationUuids: LocationBdnbUuid[],
): Promise<OccupancyCountsRow[]> => {
  if (!locationUuids?.length) {
    return Promise.resolve([]);
  }

  return db
    .select({
      locationUuid: sql<LocationBdnbUuid>`
        ${locationBdnbStatsTable.locationBdnbUuid}
      `.as("locationUuid"),
      siretCount:
        sql<number>`coalesce(${locationBdnbStatsTable.nbSiret}, 0)`.as(
          "siretCount",
        ),
      sirenOnlyCount: sql<number>`
        coalesce(${locationBdnbStatsTable.nbSirenOnly}, 0)
      `.as("sirenOnlyCount"),
    })
    .from(locationBdnbStatsTable)
    .where(inArray(locationBdnbStatsTable.locationBdnbUuid, locationUuids));
};
