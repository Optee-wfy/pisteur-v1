import type { LegalEntityType } from "@optee/constants";
import type { LegalEntityUuid, LocationBdnbUuid } from "@optee/models";
import {
  associationsLocationsBdnbLegalEntityTable,
  legalEntityTable,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { eq, inArray, sql } from "drizzle-orm";

/**
 * Fetch legal entities for the current page (aggregated).
 */
export const fetchLegalEntitiesByLocation = (
  locationUuids: LocationBdnbUuid[],
) => {
  if (!locationUuids?.length) {
    return Promise.resolve([]);
  }

  return db
    .select({
      locationUuid: associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
      entities: sql<Array<{
        uuid: LegalEntityUuid;
        name: string | null;
        type: LegalEntityType;
        mainBusinessActivity: string | null;
      }> | null>`
        jsonb_agg(
          jsonb_build_object(
            'uuid', ${legalEntityTable.uuid},
            'name', ${legalEntityTable.name},
            'type', ${legalEntityTable.type},
            'mainBusinessActivity', ${legalEntityTable.mainBusinessActivity}
          )
          ORDER BY ${legalEntityTable.name} NULLS LAST
        )
      `.as("entities"),
    })
    .from(associationsLocationsBdnbLegalEntityTable)
    .innerJoin(
      legalEntityTable,
      eq(
        associationsLocationsBdnbLegalEntityTable.legalEntityUuid,
        legalEntityTable.uuid,
      ),
    )
    .where(
      inArray(
        associationsLocationsBdnbLegalEntityTable.locationBdnbUuid,
        locationUuids,
      ),
    )
    .groupBy(associationsLocationsBdnbLegalEntityTable.locationBdnbUuid);
};
