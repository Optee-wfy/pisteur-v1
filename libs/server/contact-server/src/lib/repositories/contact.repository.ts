import { CONTACT_PRO_ASSOCIATIONS, contactSupport } from "@optee/constants";
import type {
  ClientUuid,
  ContactHsId,
  ContactUuid,
  HubspotContact,
  HubspotNewContact,
  LocationUuid,
  ProUuid,
  UserUuid,
} from "@optee/models";
import {
  authUsersTable,
  hsAssociationsContactsClientsTable,
  hsAssociationsContactsLocationsTable,
  hsAssociationsContactsProsTable,
  hsClientsTable,
  hsContactsTable,
  hsLocationsTable,
  hsProsTable,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { isNotNullish } from "@optee/utils";
import { and, eq, ilike, inArray, or, sql } from "drizzle-orm";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbExecutor = typeof db | DbTransaction;

export const ContactRepository = {
  //@todo add UNIQUE constraint on email (update schema, Normalize email to lower-case before insert ? use OnConflict)
  async create(
    input: HubspotNewContact & { email: string },
    options?: { tx?: DbTransaction },
  ) {
    const executor: DbExecutor = options?.tx ?? db;
    const [existingContact] = await executor
      .select()
      .from(hsContactsTable)
      .where(eq(hsContactsTable.email, input.email));

    if (existingContact) {
      throw new Error(`Un contact avec l'email "${input.email}" existe déjà.`);
    }

    const [contact] = await executor
      .insert(hsContactsTable)
      .values(input)
      .returning();

    if (!contact) {
      throw new Error("Échec de la création du contact.");
    }

    return contact;
  },

  async get(uuid: ContactUuid) {
    const [contact] = await db
      .select()
      .from(hsContactsTable)
      .where(eq(hsContactsTable.uuid, uuid));

    return contact ?? null;
  },

  async getByUser(userUuid: UserUuid) {
    const [contact] = await db
      .select()
      .from(hsContactsTable)
      .where(eq(hsContactsTable.userUuid, userUuid));

    return contact ?? null;
  },

  async getByEmail(email: string, options?: { tx?: DbTransaction }) {
    const executor: DbExecutor = options?.tx ?? db;
    const [contact] = await executor
      .select()
      .from(hsContactsTable)
      .where(eq(hsContactsTable.email, email));

    return contact ? { ...contact, email } : null;
  },

  async searchForAdmin({ term, limit }: { term: string; limit: number }) {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) {
      return [];
    }

    const filterPattern = `%${trimmedTerm}%`;

    return db
      .select({
        uuid: hsContactsTable.uuid,
        firstName: hsContactsTable.firstName,
        lastName: hsContactsTable.lastName,
        email: hsContactsTable.email,
      })
      .from(hsContactsTable)
      .where(
        or(
          ilike(hsContactsTable.email, filterPattern),
          ilike(hsContactsTable.firstName, filterPattern),
          ilike(hsContactsTable.lastName, filterPattern),
        ),
      )
      .orderBy(hsContactsTable.uuid)
      .limit(limit);
  },

  getAllWithClient({
    term,
    duplicatedAssociations,
    limit,
  }: {
    term?: string | null;
    duplicatedAssociations?: boolean | null;
    limit: number;
  }) {
    const filterPattern = `%${term}%`;
    const conditions = [
      ilike(hsContactsTable.email, filterPattern),
      ilike(hsContactsTable.firstName, filterPattern),
      ilike(hsContactsTable.lastName, filterPattern),
      ilike(hsClientsTable.name, filterPattern),
    ].filter(isNotNullish);

    const request = db
      .selectDistinctOn([authUsersTable.createdAt, hsContactsTable.uuid])
      .from(hsContactsTable)
      .innerJoin(
        hsAssociationsContactsClientsTable,
        eq(
          hsContactsTable.uuid,
          hsAssociationsContactsClientsTable.contactUuid,
        ),
      )
      .leftJoin(
        hsClientsTable,
        eq(hsAssociationsContactsClientsTable.clientUuid, hsClientsTable.uuid),
      )
      .leftJoin(
        authUsersTable,
        eq(hsContactsTable.userUuid, authUsersTable.uuid),
      )
      .where(or(...conditions))
      .orderBy(
        sql`${authUsersTable.createdAt} DESC NULLS LAST`,
        hsContactsTable.uuid,
      );

    if (!duplicatedAssociations) {
      return request.limit(limit);
    }

    return request;
  },

  getAllWithPro(input: { term?: string | null; limit: number }) {
    const { term, limit } = input;
    const filterPattern = `%${term}%`;
    const conditions = [
      ilike(hsContactsTable.email, filterPattern),
      ilike(hsProsTable.name, filterPattern),
    ].filter(isNotNullish);

    return db
      .selectDistinctOn([authUsersTable.createdAt, hsContactsTable.uuid])
      .from(hsContactsTable)
      .innerJoin(
        hsAssociationsContactsProsTable,
        eq(hsContactsTable.uuid, hsAssociationsContactsProsTable.contactUuid),
      )
      .leftJoin(
        hsProsTable,
        eq(hsAssociationsContactsProsTable.proUuid, hsProsTable.uuid),
      )
      .leftJoin(
        authUsersTable,
        eq(hsContactsTable.userUuid, authUsersTable.uuid),
      )
      .where(or(...conditions))
      .orderBy(
        sql`${authUsersTable.createdAt} DESC NULLS LAST`,
        hsContactsTable.uuid,
      )
      .limit(limit);
  },

  getAllByClientWithLocationAndRoles(
    clientUuid: ClientUuid,
    locationUuids?: LocationUuid[],
  ) {
    return db
      .select({
        contactUuid: hsContactsTable.uuid,
        userUuid: hsContactsTable.userUuid,
        firstName: hsContactsTable.firstName,
        lastName: hsContactsTable.lastName,
        email: hsContactsTable.email,
        locationUuid: hsLocationsTable.uuid,
        locationName: hsLocationsTable.name,
        clientAssociationTypeId:
          hsAssociationsContactsClientsTable.associationTypeId,
        locationAssociationTypeId:
          hsAssociationsContactsLocationsTable.associationTypeId,
      })
      .from(hsAssociationsContactsClientsTable)
      .leftJoin(
        hsContactsTable,
        eq(
          hsAssociationsContactsClientsTable.contactUuid,
          hsContactsTable.uuid,
        ),
      )
      .leftJoin(
        hsAssociationsContactsLocationsTable,
        eq(
          hsContactsTable.uuid,
          hsAssociationsContactsLocationsTable.contactUuid,
        ),
      )
      .leftJoin(
        hsLocationsTable,
        eq(
          hsAssociationsContactsLocationsTable.locationUuid,
          hsLocationsTable.uuid,
        ),
      )
      .where(
        and(
          eq(hsAssociationsContactsClientsTable.clientUuid, clientUuid),
          locationUuids
            ? inArray(hsLocationsTable.uuid, locationUuids)
            : undefined,
        ),
      );
  },

  async getAllByPro(proUuid: ProUuid, options?: { tx?: DbTransaction }) {
    const executor: DbExecutor = options?.tx ?? db;
    const rows = await executor
      .selectDistinctOn([hsContactsTable.uuid], {
        contact: hsContactsTable,
        role: hsAssociationsContactsProsTable.associationTypeId,
      })
      .from(hsContactsTable)
      .innerJoin(
        hsAssociationsContactsProsTable,
        eq(hsContactsTable.uuid, hsAssociationsContactsProsTable.contactUuid),
      )
      .where(and(eq(hsAssociationsContactsProsTable.proUuid, proUuid)));

    return rows;
  },

  async update(
    contactUuid: ContactUuid,
    contactData: Partial<
      Pick<
        HubspotContact,
        | "firstName"
        | "lastName"
        | "phone"
        | "jobTitle"
        | "lastSignInAt"
        | "invitedAt"
      >
    >,
  ) {
    const [updatedContactData] = await db
      .update(hsContactsTable)
      .set(contactData)
      .where(eq(hsContactsTable.uuid, contactUuid))
      .returning({ uuid: hsContactsTable.uuid });

    if (!updatedContactData) {
      console.error(
        `🚩 Mise à jour d'un contact: le contact avec l'UUID "${contactUuid}" n'a pas été trouvé.`,
      );
      throw new Error(`Ce contact n'existe pas. ${contactSupport}`);
    }

    return updatedContactData;
  },

  updateOTP(contactUuid: ContactUuid, otp: string | null) {
    return db
      .update(hsContactsTable)
      .set({ otp })
      .where(eq(hsContactsTable.uuid, contactUuid))
      .returning({ uuid: hsContactsTable.uuid });
  },

  async setUserRelation(contactUuid: ContactUuid, userUuid: UserUuid) {
    await db
      .update(hsContactsTable)
      .set({ userUuid })
      .where(eq(hsContactsTable.uuid, contactUuid));
  },

  async setUserRelationFromHubspot(
    contactHsId: ContactHsId,
    userUuid: UserUuid,
  ) {
    await db
      .update(hsContactsTable)
      .set({ userUuid })
      .where(eq(hsContactsTable.id, contactHsId));
  },

  async associateToPro({
    contactUuid,
    proUuid,
    role = CONTACT_PRO_ASSOCIATIONS.NULL,
    tx,
  }: {
    contactUuid: ContactUuid;
    proUuid: ProUuid;
    role?: (typeof CONTACT_PRO_ASSOCIATIONS)[keyof typeof CONTACT_PRO_ASSOCIATIONS];
    tx?: DbTransaction;
  }) {
    const executor: DbExecutor = tx ?? db;
    await executor.insert(hsAssociationsContactsProsTable).values({
      proUuid,
      contactUuid,
      associationTypeId: role.id,
    });
  },
};
