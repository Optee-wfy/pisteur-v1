import {
  CONTACT_LOCATION_ASSOCIATIONS,
  type ContactLocationAssociation,
} from "@optee/constants";
import type {
  ContactHsId,
  ContactLocationUuid,
  ContactUuid,
  LocationHsId,
  LocationUuid,
} from "@optee/models";
import {
  hsAssociationsContactsLocationsTable,
  hsContactsTable,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { isNotNullish } from "@optee/utils";
import { and, eq, inArray, or, sql } from "drizzle-orm";

export const ContactLocationRepository = {
  async create(
    contactUuid: ContactUuid,
    locationUuid: LocationUuid,
    associationType: ContactLocationAssociation,
  ) {
    await db.insert(hsAssociationsContactsLocationsTable).values({
      contactUuid,
      locationUuid,
      associationTypeId: associationType.id,
      associationLabel: associationType.label,
    });
  },

  getByContact(contactUuid: ContactUuid) {
    return db
      .select()
      .from(hsAssociationsContactsLocationsTable)
      .where(eq(hsAssociationsContactsLocationsTable.contactUuid, contactUuid));
  },

  getByContactAndLocation(
    contactUuid: ContactUuid,
    locationUuid: LocationUuid,
  ) {
    return db
      .select()
      .from(hsAssociationsContactsLocationsTable)
      .where(
        and(
          eq(hsAssociationsContactsLocationsTable.contactUuid, contactUuid),
          eq(hsAssociationsContactsLocationsTable.locationUuid, locationUuid),
        ),
      );
  },

  getAllWithDuplicatedAssociations() {
    return db
      .select({
        contactUuid: hsAssociationsContactsLocationsTable.contactUuid,
        locationUuid: hsAssociationsContactsLocationsTable.locationUuid,
      })
      .from(hsAssociationsContactsLocationsTable)
      .groupBy(
        hsAssociationsContactsLocationsTable.contactUuid,
        hsAssociationsContactsLocationsTable.locationUuid,
      )
      .having(sql`COUNT(*) > 1`);
  },

  getAllAdministrators(locationUuid: LocationUuid) {
    return db
      .selectDistinctOn([hsContactsTable.uuid], { contact: hsContactsTable })
      .from(hsAssociationsContactsLocationsTable)
      .where(
        and(
          eq(hsAssociationsContactsLocationsTable.locationUuid, locationUuid),
          eq(
            hsAssociationsContactsLocationsTable.associationTypeId,
            CONTACT_LOCATION_ASSOCIATIONS.ADMINISTRATOR.id,
          ),
        ),
      )
      .innerJoin(
        hsContactsTable,
        eq(
          hsAssociationsContactsLocationsTable.contactUuid,
          hsContactsTable.uuid,
        ),
      );
  },

  delete(
    data:
      | { contactHsId: ContactHsId; locationHsId: LocationHsId }
      | { contactUuid: ContactUuid; locationUuid: LocationUuid },
  ) {
    return db
      .delete(hsAssociationsContactsLocationsTable)
      .where(
        "contactHsId" in data
          ? and(
              eq(
                hsAssociationsContactsLocationsTable.contactId,
                data.contactHsId,
              ),
              eq(
                hsAssociationsContactsLocationsTable.locationId,
                data.locationHsId,
              ),
            )
          : and(
              eq(
                hsAssociationsContactsLocationsTable.contactUuid,
                data.contactUuid,
              ),
              eq(
                hsAssociationsContactsLocationsTable.locationUuid,
                data.locationUuid,
              ),
            ),
      )
      .returning();
  },

  async deleteBatch(associations: ContactLocationUuid[]) {
    if (!associations || associations.length === 0) {
      return;
    }
    await db
      .delete(hsAssociationsContactsLocationsTable)
      .where(inArray(hsAssociationsContactsLocationsTable.uuid, associations));
  },

  async deleteAllForContact({
    contactUuid,
    contactHsId,
  }: {
    contactUuid?: ContactUuid | null;
    contactHsId?: ContactHsId | null;
  }) {
    if (!contactUuid && !contactHsId) {
      throw new Error("contactUuid or contactHsId must be provided");
    }

    const conditions = [
      contactHsId
        ? eq(hsAssociationsContactsLocationsTable.contactId, contactHsId)
        : undefined,
      contactUuid
        ? eq(hsAssociationsContactsLocationsTable.contactUuid, contactUuid)
        : undefined,
    ].filter(isNotNullish);

    const predicate =
      conditions.length === 1 ? conditions[0] : or(...conditions);

    await db.delete(hsAssociationsContactsLocationsTable).where(predicate);
  },
};
