import {
  hsAssociationProsSavedLocationsTable,
  type LocationUuid,
  type ProUuid,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq } from "drizzle-orm";

export const ProSavedLocationRepository = {
  async create({
    locationUuid,
    proUuid,
  }: {
    locationUuid: LocationUuid;
    proUuid: ProUuid;
  }) {
    await db.insert(hsAssociationProsSavedLocationsTable).values({
      locationUuid,
      proUuid,
    });
  },

  get({
    locationUuid,
    proUuid,
  }: {
    locationUuid: LocationUuid;
    proUuid: ProUuid;
    associationTypeId?: number;
  }) {
    return db
      .select()
      .from(hsAssociationProsSavedLocationsTable)
      .where(
        and(
          eq(hsAssociationProsSavedLocationsTable.locationUuid, locationUuid),
          eq(hsAssociationProsSavedLocationsTable.proUuid, proUuid),
        ),
      );
  },

  delete({
    locationUuid,
    proUuid,
  }: {
    locationUuid: LocationUuid;
    proUuid: ProUuid;
  }) {
    return db
      .delete(hsAssociationProsSavedLocationsTable)
      .where(
        and(
          eq(hsAssociationProsSavedLocationsTable.locationUuid, locationUuid),
          eq(hsAssociationProsSavedLocationsTable.proUuid, proUuid),
        ),
      )
      .returning();
  },
};
