import type { ProLocationAssociationLabel } from "@optee/constants";
import type { LocationBdnbUuid, ProUuid } from "@optee/models";
import { associationProsExternalLocationsTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";

/**
 * Fetch pro associations for the current page (aggregated).
 */
export const fetchProAssociations = (
  locationUuids: LocationBdnbUuid[],
  proUuid: ProUuid,
) =>
  db
    .select({
      locationUuid: associationProsExternalLocationsTable.locationUuid,
      associationLabel: sql<ProLocationAssociationLabel | null>`
        (array_agg(${associationProsExternalLocationsTable.associationLabel}
          ORDER BY ${associationProsExternalLocationsTable.associationTypeId} DESC NULLS LAST
        ))[1]
      `.as("associationLabel"),
    })
    .from(associationProsExternalLocationsTable)
    .where(
      and(
        eq(associationProsExternalLocationsTable.proUuid, proUuid),
        isNotNull(associationProsExternalLocationsTable.associationLabel),
        inArray(
          associationProsExternalLocationsTable.locationUuid,
          locationUuids,
        ),
      ),
    )
    .groupBy(associationProsExternalLocationsTable.locationUuid);
