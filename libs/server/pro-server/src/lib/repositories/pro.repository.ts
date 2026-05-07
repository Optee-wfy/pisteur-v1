import type {
  OperationHubspotPrestationId,
  ProStatus,
  YouSignDocumentId,
  YouSignRequestId,
  YouSignSignerId,
} from "@optee/constants";
import {
  CONTACT_PRO_ASSOCIATIONS,
  NOTE_PRO_ASSOCIATIONS,
  OPERATION_HUBSPOT_PRESTATION_IDS,
  PRO_LOCATION_ASSOCIATIONS,
} from "@optee/constants";
import { ContactRepository } from "@optee/contact-server";
import type {
  HubspotPro,
  NoteUuid,
  OperationUuid,
  ProUuid,
  UserUuid,
} from "@optee/models";
import {
  hsAssociationProsClientsTable,
  hsAssociationProsLocationsTable,
  hsAssociationProsNotesTable,
  hsAssociationsContactsProsTable,
  hsAssociationsLocationsClientsTable,
  hsAssociationsOperationsQuotesTable,
  hsAssociationsQuotesProsTable,
  hsAttachmentsTable,
  hsClientsTable,
  hsContactsTable,
  hsLocationsTable,
  hsNotesTable,
  hsProsTable,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { isNotNullish } from "@optee/utils";
import { and, asc, eq, ilike, sql } from "drizzle-orm";

type ProEditableDto = Partial<
  Omit<
    HubspotPro,
    | "id"
    | "uuid"
    | "mailContactDeprecated"
    | "interventionZonesDeprecated"
    | "websiteDeprecated"
  >
>;
export const ProRepository = {
  async create(input: ProEditableDto) {
    const data = await db
      .insert(hsProsTable)
      .values(input)
      .returning({ uuid: hsProsTable.uuid });

    const createRow = data[0];

    if (!createRow) {
      throw new Error("Impossible de créer ce professionnel");
    }

    return createRow.uuid;
  },

  async get(uuid: ProUuid) {
    const [row] = await db
      .select()
      .from(hsProsTable)
      .where(eq(hsProsTable.uuid, uuid));

    return row ?? null;
  },

  /**
   * Returns clients and their associated locations for a given pro,
   * filtering only locations with the association type "UNBLOCKED".
   *
   * @param proUuid - UUID of the pro to retrieve associations for
   * @returns Array of objects containing client and location information
   *          where the location's association type is "UNBLOCKED"
   */
  getClientsAndLocations(proUuid: ProUuid) {
    return db
      .select({
        client: hsClientsTable,
        location: hsLocationsTable,
      })
      .from(hsAssociationProsClientsTable)
      .innerJoin(
        hsAssociationProsLocationsTable,
        eq(
          hsAssociationProsClientsTable.proUuid,
          hsAssociationProsLocationsTable.proUuid,
        ),
      )
      .innerJoin(
        hsAssociationsLocationsClientsTable,
        and(
          eq(
            hsAssociationProsClientsTable.clientUuid,
            hsAssociationsLocationsClientsTable.clientUuid,
          ),
          eq(
            hsAssociationProsLocationsTable.locationUuid,
            hsAssociationsLocationsClientsTable.locationUuid,
          ),
        ),
      )
      .innerJoin(
        hsClientsTable,
        eq(hsAssociationProsClientsTable.clientUuid, hsClientsTable.uuid),
      )
      .innerJoin(
        hsLocationsTable,
        eq(hsAssociationProsLocationsTable.locationUuid, hsLocationsTable.uuid),
      )
      .where(
        and(
          eq(hsAssociationProsClientsTable.proUuid, proUuid),
          eq(
            hsAssociationProsLocationsTable.associationTypeId,
            PRO_LOCATION_ASSOCIATIONS.UNBLOCKED.id,
          ),
        ),
      );
  },

  async getByUser(userUuid: UserUuid) {
    const [row] = await db
      .select()
      .from(hsProsTable)
      .leftJoin(
        hsAssociationsContactsProsTable,
        eq(hsProsTable.uuid, hsAssociationsContactsProsTable.proUuid),
      )
      .leftJoin(
        hsContactsTable,
        eq(hsAssociationsContactsProsTable.contactUuid, hsContactsTable.uuid),
      )
      .where(eq(hsContactsTable.userUuid, userUuid));

    return row ? row.pros : null;
  },

  /**
   * Returns pro that holds a document that match given id. (could be cee or partnership contract). Check return for more information.
   * @param signatureRequestId Yousign identifier
   * @returns Pro matching partnershipContractId or partnershipContractId
   */
  async getBySignatureRequestId(signatureRequestId: YouSignRequestId): Promise<{
    uuid: ProUuid;
    stage: ProStatus | null;
    contract: "partnership" | "cee";
  } | null> {
    const baseQuery = db
      .select({ uuid: hsProsTable.uuid, stage: hsProsTable.status })
      .from(hsProsTable);

    const [proCee] = await baseQuery.where(
      eq(hsProsTable.ceeContractId, signatureRequestId),
    );
    if (proCee) {
      return { ...proCee, contract: "cee" as const };
    }

    const [proPartnership] = await baseQuery.where(
      eq(hsProsTable.partnershipContractId, signatureRequestId),
    );
    if (proPartnership) {
      return { ...proPartnership, contract: "partnership" as const };
    }

    return null;
  },

  async getByStripeCustomerId(stripeCustomerId: string) {
    const [row] = await db
      .select()
      .from(hsProsTable)
      .where(eq(hsProsTable.stripeCustomerId, stripeCustomerId));

    return row ?? null;
  },

  async getRelatedDocuments(proUuid: ProUuid) {
    const rows = await db
      .select()
      .from(hsAssociationProsNotesTable)
      .where(eq(hsAssociationProsNotesTable.proUuid, proUuid))
      .leftJoin(
        hsNotesTable,
        eq(hsAssociationProsNotesTable.noteUuid, hsNotesTable.uuid),
      )
      .innerJoin(
        hsAttachmentsTable,
        eq(hsNotesTable.attachmentIds, hsAttachmentsTable.id),
      );
    return rows.map((row) => row.hs_attachments);
  },

  async getMainContacts(proUuid: ProUuid) {
    const rows = await db
      .select()
      .from(hsAssociationsContactsProsTable)
      .where(
        and(
          eq(hsAssociationsContactsProsTable.proUuid, proUuid),
          eq(
            hsAssociationsContactsProsTable.associationTypeId,
            CONTACT_PRO_ASSOCIATIONS.MAIN_CONTACT.id,
          ),
        ),
      )
      .innerJoin(
        hsContactsTable,
        eq(hsAssociationsContactsProsTable.contactUuid, hsContactsTable.uuid),
      );

    return rows.map((row) => row.contacts);
  },

  async getPrestations(proUuid: ProUuid) {
    const [pro] = await db
      .select({ prestations: hsProsTable.prestations })
      .from(hsProsTable)
      .where(eq(hsProsTable.uuid, proUuid));

    if (!pro?.prestations) {
      return [];
    }

    const prestations = pro.prestations
      .split(";")
      .map((p) => p.trim())
      .filter(isNotNullish);

    return prestations.filter(
      (p): p is OperationHubspotPrestationId =>
        OPERATION_HUBSPOT_PRESTATION_IDS.find((id) => id === p) !== undefined,
    );
  },

  async getSignerId(proUuid: ProUuid) {
    const [pro] = await db
      .select({ signerId: hsProsTable.signerId })
      .from(hsProsTable)
      .where(eq(hsProsTable.uuid, proUuid));

    return pro?.signerId ?? null;
  },

  async getAll(filter: string) {
    return db
      .select({ uuid: hsProsTable.uuid, name: hsProsTable.name })
      .from(hsProsTable)
      .where(ilike(hsProsTable.name, `%${filter}%`))
      .orderBy(asc(hsProsTable.name))
      .limit(5);
  },

  // Returns all pros UUIDs for the script to use in the admin dashboard
  async getAllUuids() {
    return db.select({ uuid: hsProsTable.uuid }).from(hsProsTable);
  },

  async update(proUuid: ProUuid, updateFields: ProEditableDto) {
    const [updatedPro] = await db
      .update(hsProsTable)
      .set(updateFields)
      .where(eq(hsProsTable.uuid, proUuid))
      .returning({ uuid: hsProsTable.uuid });

    return updatedPro ?? null;
  },

  async decrementCredits({
    proUuid,
    creditsToDecrement,
  }: {
    proUuid: ProUuid;
    creditsToDecrement: number;
  }) {
    const [updatedPro] = await db
      .update(hsProsTable)
      .set({
        remainingCredits: sql<number>`
          ${hsProsTable.remainingCredits} - ${creditsToDecrement}
        `,
      })
      .where(
        and(
          eq(hsProsTable.uuid, proUuid),
          sql<boolean>`${hsProsTable.remainingCredits} >= ${creditsToDecrement}`,
        ),
      )
      .returning({
        remainingCredits: hsProsTable.remainingCredits,
        name: hsProsTable.name,
      });

    return updatedPro ?? null;
  },

  async incrementCredits({
    creditsToIncrement,
    proUuid,
  }: {
    creditsToIncrement: number;
    proUuid: ProUuid;
  }) {
    if (!Number.isFinite(creditsToIncrement) || creditsToIncrement <= 0) {
      throw new Error("creditsToIncrement must be a positive number");
    }

    const [updatedPro] = await db
      .update(hsProsTable)
      .set({
        remainingCredits: sql<number>`
          coalesce(${hsProsTable.remainingCredits}, 0) + ${creditsToIncrement}
        `,
      })
      .where(eq(hsProsTable.uuid, proUuid))
      .returning({
        remainingCredits: hsProsTable.remainingCredits,
        name: hsProsTable.name,
      });

    return updatedPro ?? null;
  },

  async updateStatus(proUuid: ProUuid, status: ProStatus) {
    await db
      .update(hsProsTable)
      .set({ status })
      .where(eq(hsProsTable.uuid, proUuid));
  },

  async setUserAsProAdmin({
    proUuid,
    userUuid,
  }: {
    proUuid: ProUuid;
    userUuid: UserUuid;
  }) {
    const contact = await ContactRepository.getByUser(userUuid);

    if (!contact) {
      throw new Error(
        "Impossible de mettre à jour le contact, aucun contact trouvé pour l'utilisateur connecté.",
      );
    }

    await db
      .delete(hsAssociationsContactsProsTable)
      .where(eq(hsAssociationsContactsProsTable.contactUuid, contact.uuid));

    await db.insert(hsAssociationsContactsProsTable).values({
      contactUuid: contact.uuid,
      proUuid,
      associationTypeId: CONTACT_PRO_ASSOCIATIONS.NULL.id,
      associationLabel: CONTACT_PRO_ASSOCIATIONS.NULL.label,
    });
  },

  async associateToNote({
    proUuid,
    noteUuid,
  }: {
    proUuid: ProUuid;
    noteUuid: NoteUuid;
  }) {
    await db.insert(hsAssociationProsNotesTable).values({
      proUuid,
      noteUuid,
      associationTypeId: NOTE_PRO_ASSOCIATIONS.NULL.id,
      associationLabel: NOTE_PRO_ASSOCIATIONS.NULL.label,
    });
  },

  async setSignerId({
    proUuid,
    signerId,
  }: {
    proUuid: ProUuid;
    signerId: YouSignSignerId;
  }) {
    await db
      .update(hsProsTable)
      .set({ signerId })
      .where(eq(hsProsTable.uuid, proUuid));
  },

  async attachPartnershipContract({
    proUuid,
    contractId,
    documentId,
  }: {
    proUuid: ProUuid;
    contractId: YouSignRequestId;
    documentId: YouSignDocumentId;
  }) {
    await db
      .update(hsProsTable)
      .set({
        partnershipContractId: contractId,
        partnershipContractDocumentId: documentId,
      })
      .where(eq(hsProsTable.uuid, proUuid));
  },

  async attachCeeContract({
    proUuid,
    contractId,
    documentId,
  }: {
    proUuid: ProUuid;
    contractId: YouSignRequestId;
    documentId: YouSignDocumentId;
  }) {
    await db
      .update(hsProsTable)
      .set({ ceeContractId: contractId, ceeContractDocumentId: documentId })
      .where(eq(hsProsTable.uuid, proUuid));
  },

  async isProLinkedToOperation({
    proUuid,
    operationUuid,
  }: {
    proUuid: ProUuid;
    operationUuid: OperationUuid;
  }) {
    const associations = await db
      .select({})
      .from(hsAssociationsQuotesProsTable)
      .innerJoin(
        hsAssociationsOperationsQuotesTable,
        eq(
          hsAssociationsQuotesProsTable.quoteUuid,
          hsAssociationsOperationsQuotesTable.quoteUuid,
        ),
      )
      .where(
        and(
          eq(hsAssociationsQuotesProsTable.proUuid, proUuid),
          eq(hsAssociationsOperationsQuotesTable.operationUuid, operationUuid),
        ),
      );

    return associations.length !== 0;
  },
};
