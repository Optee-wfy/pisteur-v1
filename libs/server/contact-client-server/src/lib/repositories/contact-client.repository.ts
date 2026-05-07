import {
  CONTACT_CLIENT_ASSOCIATIONS,
  type ContactClientAssociation,
} from "@optee/constants";
import type {
  ClientHsId,
  ClientUuid,
  ContactClientUuid,
  ContactHsId,
  ContactUuid,
} from "@optee/models";
import {
  hsAssociationsContactsClientsTable,
  hsContactsTable,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq, inArray, sql } from "drizzle-orm";

export const ContactClientRepository = {
  async create(
    contactUuid: ContactUuid,
    clientUuid: ClientUuid,
    associationType: ContactClientAssociation,
  ) {
    await db.insert(hsAssociationsContactsClientsTable).values({
      contactUuid,
      clientUuid,
      associationTypeId: associationType.id,
      associationLabel: associationType.label,
    });
  },

  getByContact(contactUuid: ContactUuid) {
    return db
      .select()
      .from(hsAssociationsContactsClientsTable)
      .where(eq(hsAssociationsContactsClientsTable.contactUuid, contactUuid));
  },

  getAllMembers(clientUuid: ClientUuid, type?: ContactClientAssociation) {
    const predicate = type
      ? and(
          eq(hsAssociationsContactsClientsTable.clientUuid, clientUuid),
          eq(hsAssociationsContactsClientsTable.associationTypeId, type.id),
        )
      : eq(hsAssociationsContactsClientsTable.clientUuid, clientUuid);

    return db
      .selectDistinctOn([hsContactsTable.uuid], {
        contact: hsContactsTable,
        type: hsAssociationsContactsClientsTable.associationLabel,
      })
      .from(hsAssociationsContactsClientsTable)
      .where(predicate)
      .innerJoin(
        hsContactsTable,
        eq(
          hsContactsTable.uuid,
          hsAssociationsContactsClientsTable.contactUuid,
        ),
      );
  },

  getAllAdministrators(clientUuid: ClientUuid) {
    return ContactClientRepository.getAllMembers(
      clientUuid,
      CONTACT_CLIENT_ASSOCIATIONS.ADMINISTRATOR,
    );
  },

  getAllWithDuplicatedAssociations() {
    return db
      .select({
        contactUuid: hsAssociationsContactsClientsTable.contactUuid,
        clientUuid: hsAssociationsContactsClientsTable.clientUuid,
      })
      .from(hsAssociationsContactsClientsTable)
      .groupBy(
        hsAssociationsContactsClientsTable.contactUuid,
        hsAssociationsContactsClientsTable.clientUuid,
      )
      .having(sql`COUNT(*) > 1`);
  },

  delete(
    data:
      | { contactHsId: ContactHsId; clientHsId: ClientHsId }
      | { contactUuid: ContactUuid; clientUuid: ClientUuid },
  ) {
    return db
      .delete(hsAssociationsContactsClientsTable)
      .where(
        "contactHsId" in data
          ? and(
              eq(
                hsAssociationsContactsClientsTable.contactId,
                data.contactHsId,
              ),
              eq(hsAssociationsContactsClientsTable.clientId, data.clientHsId),
            )
          : and(
              eq(
                hsAssociationsContactsClientsTable.contactUuid,
                data.contactUuid,
              ),
              eq(
                hsAssociationsContactsClientsTable.clientUuid,
                data.clientUuid,
              ),
            ),
      )
      .returning({
        contactId: hsAssociationsContactsClientsTable.contactId,
        clientId: hsAssociationsContactsClientsTable.clientId,
      });
  },

  async deleteBatch(associations: ContactClientUuid[]) {
    if (associations.length === 0) {
      return;
    }

    await db
      .delete(hsAssociationsContactsClientsTable)
      .where(inArray(hsAssociationsContactsClientsTable.uuid, associations));
  },
};
