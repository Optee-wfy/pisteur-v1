import { CONTACT_CLIENT_ASSOCIATIONS } from "@optee/constants";
import { ContactRepository } from "@optee/contact-server";
import type {
  ClientUuid,
  HubspotNewClient,
  LocationUuid,
  UserUuid,
} from "@optee/models";
import {
  hsAssociationsContactsClientsTable,
  hsAssociationsLocationsClientsTable,
  hsClientsTable,
  hsContactsTable,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { isNotNullish } from "@optee/utils";
import { and, asc, eq, ilike } from "drizzle-orm";

export const ClientRepository = {
  async create(input: HubspotNewClient) {
    const [client] = await db.insert(hsClientsTable).values(input).returning();
    if (!client || !client.uuid) {
      throw new Error("Échec de la création du client: " + input.name);
    }
    return client;
  },

  async get(clientUuid: ClientUuid) {
    const [row] = await db
      .select()
      .from(hsClientsTable)
      .where(eq(hsClientsTable.uuid, clientUuid));

    return row ?? null;
  },

  async getByUser(userUuid: UserUuid) {
    const [row] = await db
      .select({ client: hsClientsTable })
      .from(hsClientsTable)
      .leftJoin(
        hsAssociationsContactsClientsTable,
        eq(hsClientsTable.uuid, hsAssociationsContactsClientsTable.clientUuid),
      )
      .leftJoin(
        hsContactsTable,
        eq(
          hsAssociationsContactsClientsTable.contactUuid,
          hsContactsTable.uuid,
        ),
      )
      .where(eq(hsContactsTable.userUuid, userUuid))
      .limit(1);

    return row?.client ?? null;
  },

  async getUuidByLocation(locationUuid: LocationUuid) {
    const [client] = await db
      .select({ uuid: hsAssociationsLocationsClientsTable.clientUuid })
      .from(hsAssociationsLocationsClientsTable)
      .where(
        eq(hsAssociationsLocationsClientsTable.locationUuid, locationUuid),
      );

    return client?.uuid ?? null;
  },

  async getAdminContacts(clientUuid: ClientUuid) {
    const rows = await db
      .select()
      .from(hsAssociationsContactsClientsTable)
      .leftJoin(
        hsContactsTable,
        eq(
          hsAssociationsContactsClientsTable.contactUuid,
          hsContactsTable.uuid,
        ),
      )
      .where(
        and(
          eq(hsAssociationsContactsClientsTable.clientUuid, clientUuid),
          eq(
            hsAssociationsContactsClientsTable.associationTypeId,
            CONTACT_CLIENT_ASSOCIATIONS.ADMINISTRATOR.id,
          ),
        ),
      );

    return rows.map((row) => row.contacts).filter(isNotNullish);
  },

  async getAll(filter: string) {
    return db
      .select({ uuid: hsClientsTable.uuid, name: hsClientsTable.name })
      .from(hsClientsTable)
      .where(ilike(hsClientsTable.name, `%${filter}%`))
      .orderBy(asc(hsClientsTable.name))
      .limit(5);
  },

  async setUserAsClientAdmin({
    clientUuid,
    userUuid,
  }: {
    clientUuid: ClientUuid;
    userUuid: UserUuid;
  }) {
    const contact = await ContactRepository.getByUser(userUuid);

    if (!contact) {
      throw new Error(
        "Impossible de mettre à jour le contact, aucun contact trouvé pour l'utilisateur connecté.",
      );
    }

    await db
      .delete(hsAssociationsContactsClientsTable)
      .where(eq(hsAssociationsContactsClientsTable.contactUuid, contact.uuid));

    await db.insert(hsAssociationsContactsClientsTable).values({
      contactUuid: contact.uuid,
      clientUuid,
      associationTypeId: CONTACT_CLIENT_ASSOCIATIONS.ADMINISTRATOR.id,
      associationLabel: CONTACT_CLIENT_ASSOCIATIONS.ADMINISTRATOR.label,
    });
  },
};
