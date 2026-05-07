import type {
  QuoteRejectReason,
  YouSignLocation,
  YouSignRequestId,
  YouSignSignerId,
} from "@optee/constants";
import {
  CONTACT_OPERATION_ASSOCIATIONS,
  QUOTE_NOTE_ASSOCIATIONS,
  QUOTE_STAGES_ALLOWED,
  QuoteStage,
  tryAgainOrContactUs,
} from "@optee/constants";
import type {
  HubspotLocation,
  HubspotNewQuote,
  NoteUuid,
  OperationUuid,
  ProUuid,
  QuoteHsId,
  QuoteUuid,
  UserUuid,
} from "@optee/models";
import {
  authUsersTable,
  hsAssociationsContactsClientsTable,
  hsAssociationsContactsLocationsTable,
  hsAssociationsContactsOperationsTable,
  hsAssociationsLocationsClientsTable,
  hsAssociationsOperationsClientsTable,
  hsAssociationsOperationsLocationsTable,
  hsAssociationsOperationsQuotesTable,
  hsAssociationsQuotesNotesTable,
  hsAssociationsQuotesProsTable,
  hsAttachmentsTable,
  hsClientsTable,
  hsContactsTable,
  hsLocationsTable,
  hsNotesTable,
  hsOperationsTable,
  hsProsTable,
  hsQuotesTable,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import type { SQL } from "drizzle-orm";
import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  not,
  notExists,
  or,
  sql,
} from "drizzle-orm";

export type QuotesFromSQL = Awaited<
  ReturnType<typeof QuoteRepository.getAllForUserByClient>
>;

export const QuoteRepository = {
  create(dto: HubspotNewQuote) {
    return db.insert(hsQuotesTable).values(dto).returning();
  },

  async get(quoteUuid: QuoteUuid) {
    const [data] = await db
      .select({
        hsQuote: hsQuotesTable,
        signatoryUuid: hsAssociationsContactsOperationsTable.contactUuid,
      })
      .from(hsQuotesTable)
      .innerJoin(
        hsAssociationsOperationsQuotesTable,
        eq(hsAssociationsOperationsQuotesTable.quoteUuid, hsQuotesTable.uuid),
      )
      .innerJoin(
        hsOperationsTable,
        eq(
          hsAssociationsOperationsQuotesTable.operationUuid,
          hsOperationsTable.uuid,
        ),
      )
      .leftJoin(
        hsAssociationsContactsOperationsTable,
        and(
          eq(
            hsAssociationsContactsOperationsTable.associationTypeId,
            CONTACT_OPERATION_ASSOCIATIONS.SIGNATORY.id,
          ),
          eq(
            hsOperationsTable.uuid,
            hsAssociationsContactsOperationsTable.operationUuid,
          ),
        ),
      )
      .where(eq(hsQuotesTable.uuid, quoteUuid))
      .limit(1);

    return data ?? null;
  },

  async getByHsIdWithNullableAttachment(quoteHsId: QuoteHsId) {
    const [quote] = await db
      .select({
        quote: hsQuotesTable,
        url: hsAttachmentsTable.url,
        operationUuid: hsOperationsTable.uuid,
      })
      .from(hsQuotesTable)
      .where(eq(hsQuotesTable.id, quoteHsId))
      .leftJoin(
        hsAssociationsOperationsQuotesTable,
        eq(hsQuotesTable.uuid, hsAssociationsOperationsQuotesTable.quoteUuid),
      )
      .leftJoin(
        hsOperationsTable,
        eq(
          hsAssociationsOperationsQuotesTable.operationUuid,
          hsOperationsTable.uuid,
        ),
      )
      .leftJoin(
        hsAssociationsQuotesNotesTable,
        eq(hsQuotesTable.uuid, hsAssociationsQuotesNotesTable.quoteUuid),
      )
      .leftJoin(
        hsNotesTable,
        eq(hsAssociationsQuotesNotesTable.noteUuid, hsNotesTable.uuid),
      )
      .leftJoin(
        hsAttachmentsTable,
        eq(hsNotesTable.attachmentIds, hsAttachmentsTable.id),
      )
      .orderBy(desc(hsNotesTable.createdAt))
      .limit(1);

    return quote ?? null;
  },

  async getForAdmin(quoteUuid: QuoteUuid) {
    const [result] = await db
      .select({
        quote: hsQuotesTable,
        fileId: hsAttachmentsTable.id,
        operationUuid: hsOperationsTable.uuid,
      })
      .from(hsQuotesTable)
      .where(eq(hsQuotesTable.uuid, quoteUuid))
      .leftJoin(
        hsAssociationsOperationsQuotesTable,
        eq(hsQuotesTable.uuid, hsAssociationsOperationsQuotesTable.quoteUuid),
      )
      .leftJoin(
        hsOperationsTable,
        eq(
          hsAssociationsOperationsQuotesTable.operationUuid,
          hsOperationsTable.uuid,
        ),
      )
      .leftJoin(
        hsAssociationsQuotesNotesTable,
        eq(hsQuotesTable.uuid, hsAssociationsQuotesNotesTable.quoteUuid),
      )
      .leftJoin(
        hsNotesTable,
        eq(hsAssociationsQuotesNotesTable.noteUuid, hsNotesTable.uuid),
      )
      .innerJoin(
        hsAttachmentsTable,
        eq(hsNotesTable.attachmentIds, hsAttachmentsTable.id),
      )
      .limit(1);

    if (!result) {
      throw new Error(
        "Récupération impossible des information du devis avec l'uuid: " +
          quoteUuid,
      );
    }

    return { ...result, url: null as string | null };
  },

  async getRelatedAttachmentId(quoteUuid: QuoteUuid) {
    const [note] = await db
      .select({ fileId: hsAttachmentsTable.id })
      .from(hsQuotesTable)
      .where(eq(hsQuotesTable.uuid, quoteUuid))
      .innerJoin(
        hsAssociationsQuotesNotesTable,
        eq(hsQuotesTable.uuid, hsAssociationsQuotesNotesTable.quoteUuid),
      )
      .innerJoin(
        hsNotesTable,
        eq(hsAssociationsQuotesNotesTable.noteUuid, hsNotesTable.uuid),
      )
      .innerJoin(
        hsAttachmentsTable,
        eq(hsNotesTable.attachmentIds, hsAttachmentsTable.id),
      )
      .orderBy(desc(hsNotesTable.createdAt))
      .limit(1);

    return note?.fileId ?? null;
  },

  async getRelatedPro(quoteUuid: QuoteUuid) {
    const [pro] = await db
      .select({
        uuid: hsProsTable.uuid,
        name: hsProsTable.name,
        email: hsProsTable.mailContact,
      })
      .from(hsAssociationsQuotesProsTable)
      .where(eq(hsAssociationsQuotesProsTable.quoteUuid, quoteUuid))
      .leftJoin(
        hsProsTable,
        eq(hsProsTable.uuid, hsAssociationsQuotesProsTable.proUuid),
      )
      .limit(1);

    return pro ?? null;
  },

  async getRelatedProAndOperationUuid(quoteUuid: QuoteUuid) {
    const [association] = await db
      .select({
        proUuid: hsProsTable.uuid,
        operationUuid: hsOperationsTable.uuid,
      })
      .from(hsQuotesTable)
      .leftJoin(
        hsAssociationsQuotesProsTable,
        eq(hsQuotesTable.uuid, hsAssociationsQuotesProsTable.quoteUuid),
      )
      .leftJoin(
        hsProsTable,
        eq(hsAssociationsQuotesProsTable.proUuid, hsProsTable.uuid),
      )
      .leftJoin(
        hsAssociationsOperationsQuotesTable,
        eq(hsQuotesTable.uuid, hsAssociationsOperationsQuotesTable.quoteUuid),
      )
      .leftJoin(
        hsOperationsTable,
        eq(
          hsAssociationsOperationsQuotesTable.operationUuid,
          hsOperationsTable.uuid,
        ),
      )
      .where(eq(hsQuotesTable.uuid, quoteUuid))
      .limit(1);

    return association ?? null;
  },

  async getBySignatureRequestId(signatureRequestId: YouSignRequestId) {
    const [result] = await db
      .select({ uuid: hsQuotesTable.uuid, stage: hsQuotesTable.stage })
      .from(hsQuotesTable)
      .where(eq(hsQuotesTable.signRequestYousignId, signatureRequestId))
      .limit(1);
    return result ?? null;
  },

  async getUuidByHsId(quoteHsId: QuoteHsId) {
    const [row] = await db
      .select({ uuid: hsQuotesTable.uuid })
      .from(hsQuotesTable)
      .where(eq(hsQuotesTable.id, quoteHsId))
      .limit(1);

    return row?.uuid ?? null;
  },

  async getThirdPartyIdentifiers(uuid: QuoteUuid) {
    const [quote] = await db
      .select({
        id: hsQuotesTable.id,
        signRequestYousignId: hsQuotesTable.signRequestYousignId,
      })
      .from(hsQuotesTable)
      .where(eq(hsQuotesTable.uuid, uuid))
      .limit(1);

    return quote ?? null;
  },

  getAllForUserByClient(userUuid: UserUuid, wheres: (SQL | undefined)[] = []) {
    return db
      .selectDistinctOn([hsQuotesTable.uuid], {
        hsQuote: hsQuotesTable,
        hsPro: hsProsTable,
        hsOperation: {
          uuid: hsOperationsTable.uuid,
          name: hsOperationsTable.name,
          prestationId: hsOperationsTable.prestationId,
          costTTC: hsOperationsTable.costTTC,
          location: sql<HubspotLocation>`json_build_object('uuid', ${hsLocationsTable.uuid}, 'streetName', ${hsLocationsTable.streetName}, 'city', ${hsLocationsTable.city}, 'zipcode', ${hsLocationsTable.zipcode}, 'name', ${hsLocationsTable.name})`,
          createdBy: hsOperationsTable.createdBy,
        },
        signatoryUuid: hsAssociationsContactsOperationsTable.contactUuid,
        fileId: hsAttachmentsTable.id,
      })
      .from(authUsersTable)
      .innerJoin(
        hsContactsTable,
        eq(authUsersTable.uuid, hsContactsTable.userUuid),
      )
      .innerJoin(
        hsAssociationsContactsClientsTable,
        eq(
          hsContactsTable.uuid,
          hsAssociationsContactsClientsTable.contactUuid,
        ),
      )
      .innerJoin(
        hsClientsTable,
        eq(hsAssociationsContactsClientsTable.clientUuid, hsClientsTable.uuid),
      )
      .innerJoin(
        hsAssociationsLocationsClientsTable,
        eq(hsClientsTable.uuid, hsAssociationsLocationsClientsTable.clientUuid),
      )
      .innerJoin(
        hsLocationsTable,
        eq(
          hsAssociationsLocationsClientsTable.locationUuid,
          hsLocationsTable.uuid,
        ),
      )
      .innerJoin(
        hsAssociationsOperationsLocationsTable,
        eq(
          hsLocationsTable.uuid,
          hsAssociationsOperationsLocationsTable.locationUuid,
        ),
      )
      .innerJoin(
        hsOperationsTable,
        eq(
          hsAssociationsOperationsLocationsTable.operationUuid,
          hsOperationsTable.uuid,
        ),
      )
      .leftJoin(
        hsAssociationsContactsOperationsTable,
        and(
          eq(
            hsAssociationsContactsOperationsTable.associationTypeId,
            CONTACT_OPERATION_ASSOCIATIONS.SIGNATORY.id,
          ),
          eq(
            hsOperationsTable.uuid,
            hsAssociationsContactsOperationsTable.operationUuid,
          ),
        ),
      )
      .innerJoin(
        hsAssociationsOperationsQuotesTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsQuotesTable.operationUuid,
        ),
      )
      .innerJoin(
        hsQuotesTable,
        eq(hsAssociationsOperationsQuotesTable.quoteUuid, hsQuotesTable.uuid),
      )
      .innerJoin(
        hsAssociationsQuotesProsTable,
        eq(hsQuotesTable.uuid, hsAssociationsQuotesProsTable.quoteUuid),
      )
      .innerJoin(
        hsProsTable,
        eq(hsAssociationsQuotesProsTable.proUuid, hsProsTable.uuid),
      )
      .leftJoin(
        hsAssociationsQuotesNotesTable,
        eq(hsQuotesTable.uuid, hsAssociationsQuotesNotesTable.quoteUuid),
      )
      .leftJoin(
        hsNotesTable,
        eq(hsAssociationsQuotesNotesTable.noteUuid, hsNotesTable.uuid),
      )
      .innerJoin(
        hsAttachmentsTable,
        eq(hsNotesTable.attachmentIds, hsAttachmentsTable.id),
      )
      .orderBy(hsQuotesTable.uuid, desc(hsNotesTable.createdAt))
      .where(
        and(
          eq(authUsersTable.uuid, userUuid),
          inArray(hsQuotesTable.stage, [...QUOTE_STAGES_ALLOWED]),
          ...wheres.filter((w) => w !== undefined),
        ),
      );
  },

  getAllForUserByLocation(
    userUuid: UserUuid,
    wheres: (SQL | undefined)[] = [],
  ) {
    return db
      .selectDistinctOn([hsQuotesTable.uuid], {
        hsQuote: hsQuotesTable,
        hsPro: hsProsTable,
        hsOperation: {
          uuid: hsOperationsTable.uuid,
          name: hsOperationsTable.name,
          prestationId: hsOperationsTable.prestationId,
          costTTC: hsOperationsTable.costTTC,
          location: sql<HubspotLocation>`json_build_object('uuid', ${hsLocationsTable.uuid}, 'streetName', ${hsLocationsTable.streetName}, 'city', ${hsLocationsTable.city}, 'zipcode', ${hsLocationsTable.zipcode}, 'name', ${hsLocationsTable.name})`,
        },
        signatoryUuid: hsAssociationsContactsOperationsTable.contactUuid,
        fileId: hsAttachmentsTable.id,
      })
      .from(authUsersTable)
      .innerJoin(
        hsContactsTable,
        eq(authUsersTable.uuid, hsContactsTable.userUuid),
      )
      .innerJoin(
        hsAssociationsContactsLocationsTable,
        eq(
          hsContactsTable.uuid,
          hsAssociationsContactsLocationsTable.contactUuid,
        ),
      )
      .innerJoin(
        hsLocationsTable,
        eq(
          hsAssociationsContactsLocationsTable.locationUuid,
          hsLocationsTable.uuid,
        ),
      )
      .innerJoin(
        hsAssociationsOperationsLocationsTable,
        eq(
          hsLocationsTable.uuid,
          hsAssociationsOperationsLocationsTable.locationUuid,
        ),
      )
      .innerJoin(
        hsOperationsTable,
        eq(
          hsAssociationsOperationsLocationsTable.operationUuid,
          hsOperationsTable.uuid,
        ),
      )
      .leftJoin(
        hsAssociationsContactsOperationsTable,
        and(
          eq(
            hsAssociationsContactsOperationsTable.associationTypeId,
            CONTACT_OPERATION_ASSOCIATIONS.SIGNATORY.id,
          ),
          eq(
            hsOperationsTable.uuid,
            hsAssociationsContactsOperationsTable.operationUuid,
          ),
        ),
      )
      .innerJoin(
        hsAssociationsOperationsQuotesTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsQuotesTable.operationUuid,
        ),
      )
      .innerJoin(
        hsQuotesTable,
        eq(hsAssociationsOperationsQuotesTable.quoteUuid, hsQuotesTable.uuid),
      )
      .innerJoin(
        hsAssociationsQuotesProsTable,
        eq(hsQuotesTable.uuid, hsAssociationsQuotesProsTable.quoteUuid),
      )
      .innerJoin(
        hsProsTable,
        eq(hsAssociationsQuotesProsTable.proUuid, hsProsTable.uuid),
      )
      .leftJoin(
        hsAssociationsQuotesNotesTable,
        eq(hsQuotesTable.uuid, hsAssociationsQuotesNotesTable.quoteUuid),
      )
      .leftJoin(
        hsNotesTable,
        eq(hsAssociationsQuotesNotesTable.noteUuid, hsNotesTable.uuid),
      )
      .innerJoin(
        hsAttachmentsTable,
        eq(hsNotesTable.attachmentIds, hsAttachmentsTable.id),
      )
      .where(
        and(
          eq(authUsersTable.uuid, userUuid),
          inArray(hsQuotesTable.stage, [...QUOTE_STAGES_ALLOWED]),
          ...wheres.filter((w) => w !== undefined),
        ),
      );
  },

  getAllForProByOperation({
    proUuid,
    operationUuid,
  }: {
    proUuid: ProUuid;
    operationUuid: OperationUuid;
  }) {
    return db
      .selectDistinctOn([hsQuotesTable.uuid], {
        hsQuote: hsQuotesTable,
        hsPro: hsProsTable,
        hsOperation: {
          uuid: hsOperationsTable.uuid,
          name: hsOperationsTable.name,
          prestationId: hsOperationsTable.prestationId,
          costTTC: hsOperationsTable.costTTC,
          location: sql<HubspotLocation>`json_build_object('uuid', ${hsLocationsTable.uuid}, 'streetName', ${hsLocationsTable.streetName}, 'city', ${hsLocationsTable.city}, 'zipcode', ${hsLocationsTable.zipcode}, 'name', ${hsLocationsTable.name})`,
        },
        signatoryUuid: hsAssociationsContactsOperationsTable.contactUuid,
        fileId: hsAttachmentsTable.id,
      })
      .from(hsOperationsTable)
      .leftJoin(
        hsAssociationsOperationsLocationsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsLocationsTable.operationUuid,
        ),
      )
      .leftJoin(
        hsLocationsTable,
        eq(
          hsAssociationsOperationsLocationsTable.locationUuid,
          hsLocationsTable.uuid,
        ),
      )
      .leftJoin(
        hsAssociationsContactsOperationsTable,
        and(
          eq(
            hsAssociationsContactsOperationsTable.associationTypeId,
            CONTACT_OPERATION_ASSOCIATIONS.SIGNATORY.id,
          ),
          eq(
            hsOperationsTable.uuid,
            hsAssociationsContactsOperationsTable.operationUuid,
          ),
        ),
      )
      .innerJoin(
        hsAssociationsOperationsQuotesTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsQuotesTable.operationUuid,
        ),
      )
      .innerJoin(
        hsQuotesTable,
        eq(hsAssociationsOperationsQuotesTable.quoteUuid, hsQuotesTable.uuid),
      )
      .innerJoin(
        hsAssociationsQuotesProsTable,
        eq(hsQuotesTable.uuid, hsAssociationsQuotesProsTable.quoteUuid),
      )
      .innerJoin(
        hsProsTable,
        eq(hsAssociationsQuotesProsTable.proUuid, hsProsTable.uuid),
      )
      .leftJoin(
        hsAssociationsQuotesNotesTable,
        eq(hsQuotesTable.uuid, hsAssociationsQuotesNotesTable.quoteUuid),
      )
      .leftJoin(
        hsNotesTable,
        eq(hsAssociationsQuotesNotesTable.noteUuid, hsNotesTable.uuid),
      )
      .leftJoin(
        hsAttachmentsTable,
        eq(hsNotesTable.attachmentIds, hsAttachmentsTable.id),
      )
      .orderBy(hsQuotesTable.uuid, desc(hsNotesTable.createdAt))
      .where(
        and(
          eq(hsOperationsTable.uuid, operationUuid),
          eq(hsProsTable.uuid, proUuid),
          inArray(hsQuotesTable.stage, [...QUOTE_STAGES_ALLOWED]),
        ),
      );
  },

  async getAllPending(filter?: string | null) {
    const wheres = [];
    if (filter) {
      const filterPattern = `%${filter}%`;
      wheres.push(
        or(
          ilike(hsOperationsTable.name, filterPattern),
          ilike(hsQuotesTable.name, filterPattern),
          ilike(hsProsTable.name, filterPattern),
          ilike(hsLocationsTable.streetName, filterPattern),
          ilike(hsLocationsTable.city, filterPattern),
          ilike(hsLocationsTable.name, filterPattern),
          ilike(hsClientsTable.name, filterPattern),
        ),
      );
    }
    const data = await db
      .selectDistinctOn([hsQuotesTable.uuid], {
        quote: hsQuotesTable,
        account: hsClientsTable,
        pro: hsProsTable,
        location: hsLocationsTable,
        signatoryUuid: hsAssociationsContactsOperationsTable.contactUuid,
      })
      .from(hsQuotesTable)
      .innerJoin(
        hsAssociationsOperationsQuotesTable,
        eq(hsQuotesTable.uuid, hsAssociationsOperationsQuotesTable.quoteUuid),
      )
      .innerJoin(
        hsOperationsTable,
        eq(
          hsAssociationsOperationsQuotesTable.operationUuid,
          hsOperationsTable.uuid,
        ),
      )
      .leftJoin(
        hsAssociationsOperationsLocationsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsLocationsTable.operationUuid,
        ),
      )
      .leftJoin(
        hsAssociationsOperationsClientsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsClientsTable.operationUuid,
        ),
      )
      .leftJoin(
        hsClientsTable,
        eq(
          hsClientsTable.uuid,
          hsAssociationsOperationsClientsTable.clientUuid,
        ),
      )
      .leftJoin(
        hsLocationsTable,
        eq(
          hsLocationsTable.uuid,
          hsAssociationsOperationsLocationsTable.locationUuid,
        ),
      )
      .leftJoin(
        hsAssociationsContactsOperationsTable,
        and(
          eq(
            hsAssociationsContactsOperationsTable.associationTypeId,
            CONTACT_OPERATION_ASSOCIATIONS.SIGNATORY.id,
          ),
          eq(
            hsOperationsTable.uuid,
            hsAssociationsContactsOperationsTable.operationUuid,
          ),
        ),
      )
      .leftJoin(
        hsAssociationsQuotesProsTable,
        eq(hsQuotesTable.uuid, hsAssociationsQuotesProsTable.quoteUuid),
      )
      .leftJoin(
        hsProsTable,
        eq(hsProsTable.uuid, hsAssociationsQuotesProsTable.proUuid),
      )
      .where(
        and(
          eq(hsQuotesTable.stage, QuoteStage.EN_ATTENTE_DE_SIGNATURE),
          ...wheres,
        ),
      )
      .limit(50);

    return Promise.all(
      data.map(async (row) => {
        const fileId = await QuoteRepository.getRelatedAttachmentId(
          row.quote.uuid,
        );

        return {
          ...row.quote,
          hasSignatory: !!row.signatoryUuid,
          pro: row.pro,
          account: row.account,
          location: row.location,
          fileId,
        };
      }),
    );
  },

  getAllByOperation(operationUuid: OperationUuid) {
    return db
      .selectDistinctOn([hsQuotesTable.uuid], {
        uuid: hsQuotesTable.uuid,
        stage: hsQuotesTable.stage,
        fundingAmount: hsQuotesTable.fundingAmount,
        proUuid: hsAssociationsQuotesProsTable.proUuid,
      })
      .from(hsAssociationsOperationsQuotesTable)
      .where(
        eq(hsAssociationsOperationsQuotesTable.operationUuid, operationUuid),
      )
      .innerJoin(
        hsQuotesTable,
        eq(hsQuotesTable.uuid, hsAssociationsOperationsQuotesTable.quoteUuid),
      )
      .leftJoin(
        hsAssociationsQuotesProsTable,
        eq(hsQuotesTable.uuid, hsAssociationsQuotesProsTable.quoteUuid),
      );
  },

  getAllByPro(proUuid: ProUuid) {
    return db
      .selectDistinctOn([hsQuotesTable.uuid], {
        uuid: hsQuotesTable.uuid,
        id: hsQuotesTable.id,
        postTaxAmount: hsQuotesTable.postTaxAmount,
        stage: hsQuotesTable.stage,
        operationUuid: hsOperationsTable.uuid,
        noteUuid: hsAssociationsQuotesNotesTable.noteUuid,
      })
      .from(hsAssociationsQuotesProsTable)
      .innerJoin(
        hsQuotesTable,
        and(
          eq(hsAssociationsQuotesProsTable.quoteUuid, hsQuotesTable.uuid),
          eq(hsAssociationsQuotesProsTable.proUuid, proUuid),
        ),
      )
      .innerJoin(
        hsAssociationsOperationsQuotesTable,
        eq(hsQuotesTable.uuid, hsAssociationsOperationsQuotesTable.quoteUuid),
      )
      .innerJoin(
        hsOperationsTable,
        eq(
          hsAssociationsOperationsQuotesTable.operationUuid,
          hsOperationsTable.uuid,
        ),
      )
      .leftJoin(
        hsAssociationsQuotesNotesTable,
        eq(hsQuotesTable.uuid, hsAssociationsQuotesNotesTable.quoteUuid),
      )
      .orderBy(hsQuotesTable.uuid);
  },

  getAllUnsynced() {
    return db.select().from(hsQuotesTable).where(isNull(hsQuotesTable.id));
  },

  /**
   * Retrieves all quotes that have Signature Request activated but not signatory is available (no association between related operation and any contact with signatory label).
   * Those quotes should not exists anymore, should be cleaned manually.
   */
  getAllCorrupted() {
    return db
      .select({
        uuid: hsQuotesTable.uuid,
        quoteId: hsQuotesTable.id,
        name: hsQuotesTable.name,
        operationName: hsOperationsTable.name,
        operationUuid: hsOperationsTable.uuid,
        signRequestYousignId: hsQuotesTable.signRequestYousignId,
        signatureLocation: hsQuotesTable.signatureLocation,
      })
      .from(hsQuotesTable)
      .innerJoin(
        hsAssociationsOperationsQuotesTable,
        eq(hsQuotesTable.uuid, hsAssociationsOperationsQuotesTable.quoteUuid),
      )
      .innerJoin(
        hsOperationsTable,
        eq(
          hsAssociationsOperationsQuotesTable.operationUuid,
          hsOperationsTable.uuid,
        ),
      )
      .where(
        and(
          isNotNull(hsQuotesTable.signRequestYousignId),
          eq(hsQuotesTable.stage, QuoteStage.EN_ATTENTE_DE_SIGNATURE),
          notExists(
            db
              .select()
              .from(hsAssociationsContactsOperationsTable)
              .where(
                and(
                  eq(
                    hsAssociationsContactsOperationsTable.operationUuid,
                    hsOperationsTable.uuid,
                  ),
                  eq(
                    hsAssociationsContactsOperationsTable.associationLabel,
                    CONTACT_OPERATION_ASSOCIATIONS.SIGNATORY.label,
                  ),
                ),
              ),
          ),
        ),
      );
  },

  getAllWithoutOperation() {
    return db
      .select()
      .from(hsQuotesTable)
      .where(
        notExists(
          db
            .select()
            .from(hsAssociationsOperationsQuotesTable)
            .where(
              eq(
                hsAssociationsOperationsQuotesTable.quoteUuid,
                hsQuotesTable.uuid,
              ),
            ),
        ),
      );
  },

  /**
   * Retrieves all quotes for a given operation and pro for quotes which arent in QuoteStage.EN_ATTENTE_DE_SIGNATURE, including those without associated notes
   * This is used for checking if a quote has been uploaded by the pro.
   * We don't include quotes in QuoteStage.EN_ATTENTE_DE_SIGNATURE because we don't want to consider them as "missing" even if they don't have a note attached.
   */
  getAllByOperationAndProWithNullableNotes(
    operationUuid: OperationUuid,
    proUuid: ProUuid,
  ) {
    return db
      .select({
        quoteUuid: hsAssociationsOperationsQuotesTable.quoteUuid,
        noteUuid: hsAssociationsQuotesNotesTable.noteUuid,
      })
      .from(hsAssociationsOperationsQuotesTable)
      .where(
        eq(hsAssociationsOperationsQuotesTable.operationUuid, operationUuid),
      )
      .innerJoin(
        hsQuotesTable,
        and(
          eq(hsQuotesTable.uuid, hsAssociationsOperationsQuotesTable.quoteUuid),
          not(eq(hsQuotesTable.stage, QuoteStage.EN_ATTENTE_DE_SIGNATURE)),
        ),
      )
      .innerJoin(
        hsAssociationsQuotesProsTable,
        and(
          eq(hsAssociationsQuotesProsTable.quoteUuid, hsQuotesTable.uuid),
          eq(hsAssociationsQuotesProsTable.proUuid, proUuid),
        ),
      )
      .leftJoin(
        hsAssociationsQuotesNotesTable,
        eq(
          hsAssociationsQuotesNotesTable.quoteUuid,
          hsAssociationsOperationsQuotesTable.quoteUuid,
        ),
      );
  },

  async updateQuoteInformation(input: {
    quoteUuid: QuoteUuid;
    vatRate: number;
    fundingAmount: number;
    preTaxAmount: number;
    validityEndDate: Date;
  }) {
    const { quoteUuid, validityEndDate, ...dto } = input;
    return db
      .update(hsQuotesTable)
      .set({
        ...dto,
        validityEndDate: validityEndDate.toISOString(),
      })
      .where(eq(hsQuotesTable.uuid, quoteUuid))
      .returning();
  },

  async updateStage(
    quoteUuid: QuoteUuid,
    stage: QuoteStage,
    reason?: QuoteRejectReason,
  ) {
    await db
      .update(hsQuotesTable)
      .set({
        stage: stage,
        rejectReason: stage === QuoteStage.FERME_PERDU ? reason : null,
        // lastModifiedAt: new Date().toISOString().split("T")[0],
      })
      .where(eq(hsQuotesTable.uuid, quoteUuid));
  },

  async updateSignatureLocation(
    quoteUuid: QuoteUuid,
    signatureLocation: YouSignLocation,
  ) {
    await db
      .update(hsQuotesTable)
      .set({
        signatureLocation: signatureLocation,
      })
      .where(eq(hsQuotesTable.uuid, quoteUuid));
  },

  async updateYousignIdentifiers({
    quoteUuid,
    signRequestYousignId,
    signerYousignId,
  }: {
    quoteUuid: QuoteUuid;
    signerYousignId: YouSignSignerId;
    signRequestYousignId: YouSignRequestId;
  }) {
    await db
      .update(hsQuotesTable)
      .set({
        signerYousignId,
        signRequestYousignId,
      })
      .where(eq(hsQuotesTable.uuid, quoteUuid));
  },

  async associateToNote({
    noteUuid,
    quoteUuid,
  }: {
    noteUuid: NoteUuid;
    quoteUuid: QuoteUuid;
  }) {
    await db.insert(hsAssociationsQuotesNotesTable).values({
      quoteUuid: quoteUuid,
      noteUuid,
      associationTypeId: QUOTE_NOTE_ASSOCIATIONS.NULL.id,
    });
  },

  async isQuoteLinkedToPro(quoteUuid: QuoteUuid, proUuid: ProUuid) {
    const rows = await db
      .select()
      .from(hsAssociationsQuotesProsTable)
      .where(
        and(
          eq(hsAssociationsQuotesProsTable.quoteUuid, quoteUuid),
          eq(hsAssociationsQuotesProsTable.proUuid, proUuid),
        ),
      );
    return rows.length > 0;
  },
};
