import type { LocationClientAssociation } from "@optee/constants";
import type { ClientUuid, LocationUuid } from "@optee/models";
import { hsAssociationsLocationsClientsTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq } from "drizzle-orm";

export const LocationClientRepository = {
  async create(
    clientUuid: ClientUuid,
    locationUuid: LocationUuid,
    associationType: LocationClientAssociation,
  ) {
    await db.insert(hsAssociationsLocationsClientsTable).values({
      clientUuid,
      locationUuid,
      associationTypeId: associationType.id,
      associationLabel: associationType.label,
    });
  },

  checkAssociation: async ({
    clientUuid,
    locationUuid,
  }: {
    clientUuid: ClientUuid;
    locationUuid: LocationUuid;
  }) => {
    const res = await db
      .select()
      .from(hsAssociationsLocationsClientsTable)
      .where(
        and(
          eq(hsAssociationsLocationsClientsTable.clientUuid, clientUuid),
          eq(hsAssociationsLocationsClientsTable.locationUuid, locationUuid),
        ),
      )
      .limit(1);

    return res.length > 0;
  },
};
