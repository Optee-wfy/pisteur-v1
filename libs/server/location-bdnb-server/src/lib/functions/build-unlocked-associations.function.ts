import { PRO_LOCATION_ASSOCIATIONS } from "@optee/constants";
import type { ProUuid } from "@optee/models";
import { associationProsExternalLocationsTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq } from "drizzle-orm";

/**
 * CTE of unlocked locations for a pro (used for counts + page ordering).
 */
export const buildUnlockedAssociations = (proUuid: ProUuid) =>
  db
    .selectDistinct({
      locationUuid: associationProsExternalLocationsTable.locationUuid,
    })
    .from(associationProsExternalLocationsTable)
    .where(
      and(
        eq(associationProsExternalLocationsTable.proUuid, proUuid),
        eq(
          associationProsExternalLocationsTable.associationLabel,
          PRO_LOCATION_ASSOCIATIONS.UNBLOCKED.label,
        ),
      ),
    )
    .as("unlocked_assoc");
