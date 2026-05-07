import type { OperationHubspotPrestationId } from "@optee/constants";
import {
  ClientType,
  CONTACT_OPERATION_ASSOCIATIONS,
  NOTE_OPERATION_ASSOCIATIONS,
  OPERATION_CLIENT_ASSOCIATIONS,
  OPERATION_HUBSPOT_CATEGORIES,
  OPERATION_HUBSPOT_PRESTATION_IDS,
  OPERATION_LOCATION_ASSOCIATIONS,
  OPERATION_PHASES_ALLOWED_IN_APP,
  OPERATION_PHASES_CLIENT_IN_PROGRESS_OR_UPCOMING,
  OPERATION_PRO_ASSOCIATIONS,
  OPERATION_TYPES_ARR,
  OperationPhaseEnum,
  PRO_MARKETPLACE_PHASES,
} from "@optee/constants";
import type {
  ClientUuid,
  HubspotNewOperation,
  LocationUuid,
  NoteUuid,
  OperationHsId,
  OperationUuid,
  ProUuid,
  QuoteUuid,
  UserUuid,
} from "@optee/models";
import {
  hsAssociationOperationsFinanciersTable,
  hsAssociationOperationsNotesTable,
  hsAssociationsContactsClientsTable,
  hsAssociationsContactsLocationsTable,
  hsAssociationsContactsOperationsTable,
  hsAssociationsLocationsClientsTable,
  hsAssociationsOperationsClientsTable,
  hsAssociationsOperationsLocationsTable,
  hsAssociationsOperationsProsTable,
  hsAssociationsOperationsQuotesTable,
  hsAssociationsQuotesProsTable,
  hsAttachmentsTable,
  hsClientsTable,
  hsContactsTable,
  hsFinancierTable,
  hsLocationsTable,
  hsNotesTable,
  hsOperationsTable,
  hsProsTable,
  hsQuotesTable,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { isNotNullish } from "@optee/utils";
import {
  and,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  ne,
  not,
  notExists,
  or,
  sql,
} from "drizzle-orm";

/**
 * Repository for CRUD request on operations table.
 */
export const OperationRepository = {
  async create(input: HubspotNewOperation) {
    return db
      .insert(hsOperationsTable)
      .values(input)
      .returning({ uuid: hsOperationsTable.uuid });
  },

  async get(uuid: OperationUuid) {
    const [operation] = await db
      .select({
        hsOperation: hsOperationsTable,
        hsLocation: hsLocationsTable,
        signatoryContactUuid: hsAssociationsContactsOperationsTable.contactUuid,
        hsPro: hsProsTable,
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
        hsAssociationsOperationsProsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsProsTable.operationUuid,
        ),
      )
      .leftJoin(
        hsProsTable,
        eq(hsAssociationsOperationsProsTable.proUuid, hsProsTable.uuid),
      )
      .leftJoin(
        hsAssociationsContactsOperationsTable,
        and(
          eq(
            hsOperationsTable.uuid,
            hsAssociationsContactsOperationsTable.operationUuid,
          ),
          eq(
            hsAssociationsContactsOperationsTable.associationTypeId,
            CONTACT_OPERATION_ASSOCIATIONS.SIGNATORY.id,
          ),
        ),
      )
      .where(
        and(
          eq(hsOperationsTable.uuid, uuid),
          isNotNull(hsOperationsTable.prestationId),
          inArray(hsOperationsTable.prestationId, [
            ...OPERATION_HUBSPOT_PRESTATION_IDS,
          ]),
          inArray(hsOperationsTable.category, [
            ...OPERATION_HUBSPOT_CATEGORIES,
          ]),
        ),
      );

    return operation ?? null;
  },

  async getByActivePrestationAndLocation({
    hsPrestationId,
    locationUuid,
    operationUuid,
  }: {
    hsPrestationId: OperationHubspotPrestationId;
    locationUuid: LocationUuid;
    operationUuid?: OperationUuid | null;
  }) {
    const operations = await db
      .select({ hsOperation: hsOperationsTable })
      .from(hsAssociationsOperationsLocationsTable)
      .where(
        eq(hsAssociationsOperationsLocationsTable.locationUuid, locationUuid),
      )
      .leftJoin(
        hsOperationsTable,
        and(
          eq(
            hsAssociationsOperationsLocationsTable.operationUuid,
            hsOperationsTable.uuid,
          ),
          operationUuid ? ne(hsOperationsTable.uuid, operationUuid) : sql`TRUE`,
          isNotNull(hsOperationsTable.prestationId),
          inArray(hsOperationsTable.prestationId, [
            ...OPERATION_HUBSPOT_PRESTATION_IDS,
          ]),
          inArray(hsOperationsTable.category, [
            ...OPERATION_HUBSPOT_CATEGORIES,
          ]),
          inArray(
            hsOperationsTable.phase,
            OPERATION_PHASES_CLIENT_IN_PROGRESS_OR_UPCOMING,
          ),
        ),
      );

    return (
      operations
        .map((o) => o.hsOperation)
        .filter(isNotNullish)
        .filter((o) => o.prestationId === hsPrestationId)
        .at(0) ?? null
    );
  },

  async getSignatoryUuid(operationUuid: OperationUuid) {
    const [signatory] = await db
      .select({
        contactUuid: hsAssociationsContactsOperationsTable.contactUuid,
      })
      .from(hsAssociationsContactsOperationsTable)
      .where(
        and(
          eq(
            hsAssociationsContactsOperationsTable.associationTypeId,
            CONTACT_OPERATION_ASSOCIATIONS.SIGNATORY.id,
          ),
          eq(
            hsAssociationsContactsOperationsTable.operationUuid,
            operationUuid,
          ),
        ),
      );

    return signatory?.contactUuid ?? null;
  },

  async getUuidByHsId(operationHsId: OperationHsId) {
    const [row] = await db
      .select({ uuid: hsOperationsTable.uuid })
      .from(hsOperationsTable)
      .where(eq(hsOperationsTable.id, operationHsId));

    return row?.uuid ?? null;
  },

  async getDocuments(operationUuid: OperationUuid) {
    const rows = await db
      .select()
      .from(hsAssociationOperationsNotesTable)
      .where(eq(hsAssociationOperationsNotesTable.operationUuid, operationUuid))
      .innerJoin(
        hsNotesTable,
        eq(hsAssociationOperationsNotesTable.noteUuid, hsNotesTable.uuid),
      )
      .innerJoin(
        hsAttachmentsTable,
        and(
          eq(hsNotesTable.attachmentIds, hsAttachmentsTable.id),
          eq(hsAttachmentsTable.parentFolderId, "188407094498"), // Folder ID for hubspot 'operations-documents'
        ),
      );

    return rows.map((row) => row.hs_attachments);
  },

  getAllForUserByClient(userUuid: UserUuid) {
    return db
      .selectDistinctOn([hsOperationsTable.uuid], {
        hsOperation: hsOperationsTable,
        hsLocation: hsLocationsTable,
        hsClient: hsClientsTable,
        signatoryContactUuid: hsAssociationsContactsOperationsTable.contactUuid,
        proUuid: hsAssociationsOperationsProsTable.proUuid,
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
        hsAssociationsLocationsClientsTable,
        eq(
          hsLocationsTable.uuid,
          hsAssociationsLocationsClientsTable.locationUuid,
        ),
      )
      .leftJoin(
        hsClientsTable,
        eq(hsAssociationsLocationsClientsTable.clientUuid, hsClientsTable.uuid),
      )
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
      .leftJoin(
        hsAssociationsOperationsProsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsProsTable.operationUuid,
        ),
      )
      .leftJoin(
        hsProsTable,
        eq(hsAssociationsOperationsProsTable.proUuid, hsProsTable.uuid),
      )
      .leftJoin(
        hsAssociationsContactsOperationsTable,
        and(
          eq(
            hsOperationsTable.uuid,
            hsAssociationsContactsOperationsTable.operationUuid,
          ),
          eq(
            hsAssociationsContactsOperationsTable.associationTypeId,
            CONTACT_OPERATION_ASSOCIATIONS.SIGNATORY.id,
          ),
        ),
      )
      .where(
        and(
          eq(hsContactsTable.userUuid, userUuid),
          isNotNull(hsOperationsTable.prestationId),
          inArray(hsOperationsTable.prestationId, [
            ...OPERATION_HUBSPOT_PRESTATION_IDS,
          ]),
          inArray(hsOperationsTable.category, [
            ...OPERATION_HUBSPOT_CATEGORIES,
          ]),
          inArray(hsOperationsTable.phase, [
            ...OPERATION_PHASES_ALLOWED_IN_APP,
          ]),
        ),
      );
  },

  getAllForUserByLocation(userUuid: UserUuid) {
    return db
      .selectDistinct({
        hsOperation: hsOperationsTable,
        hsLocation: hsLocationsTable,
        hsClient: hsClientsTable,
        signatoryContactUuid: hsAssociationsContactsOperationsTable.contactUuid,
        proUuid: hsAssociationsOperationsProsTable.proUuid,
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
        hsAssociationsContactsLocationsTable,
        eq(
          hsLocationsTable.uuid,
          hsAssociationsContactsLocationsTable.locationUuid,
        ),
      )
      .leftJoin(
        hsContactsTable,
        eq(
          hsAssociationsContactsLocationsTable.contactUuid,
          hsContactsTable.uuid,
        ),
      )
      .leftJoin(
        hsAssociationsOperationsProsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsProsTable.operationUuid,
        ),
      )
      .leftJoin(
        hsProsTable,
        eq(hsAssociationsOperationsProsTable.proUuid, hsProsTable.uuid),
      )
      .leftJoin(
        hsAssociationsContactsOperationsTable,
        and(
          eq(
            hsOperationsTable.uuid,
            hsAssociationsContactsOperationsTable.operationUuid,
          ),
          eq(
            hsAssociationsContactsOperationsTable.associationTypeId,
            CONTACT_OPERATION_ASSOCIATIONS.SIGNATORY.id,
          ),
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
          hsAssociationsOperationsClientsTable.clientUuid,
          hsClientsTable.uuid,
        ),
      )
      .where(
        and(
          eq(hsContactsTable.userUuid, userUuid),
          isNotNull(hsOperationsTable.prestationId),
          inArray(hsOperationsTable.prestationId, [
            ...OPERATION_HUBSPOT_PRESTATION_IDS,
          ]),
          inArray(hsOperationsTable.category, [
            ...OPERATION_HUBSPOT_CATEGORIES,
          ]),
          inArray(hsOperationsTable.phase, [
            ...OPERATION_PHASES_ALLOWED_IN_APP,
          ]),
        ),
      );
  },

  async getAllByAdmin(filter: string) {
    const filterPattern = `%${filter}%`;

    const data = await db
      .selectDistinctOn([hsOperationsTable.uuid])
      .from(hsOperationsTable)
      .leftJoin(
        hsAssociationsOperationsProsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsProsTable.operationUuid,
        ),
      )
      .leftJoin(
        hsProsTable,
        eq(hsAssociationsOperationsProsTable.proUuid, hsProsTable.uuid),
      )
      .leftJoin(
        hsAssociationsOperationsQuotesTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsQuotesTable.operationUuid,
        ),
      )
      .leftJoin(
        hsQuotesTable,
        eq(hsAssociationsOperationsQuotesTable.quoteUuid, hsQuotesTable.uuid),
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
          hsAssociationsOperationsClientsTable.clientUuid,
          hsClientsTable.uuid,
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
        hsLocationsTable,
        eq(
          hsLocationsTable.uuid,
          hsAssociationsOperationsLocationsTable.locationUuid,
        ),
      )
      .leftJoin(
        hsAssociationOperationsFinanciersTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationOperationsFinanciersTable.operationUuid,
        ),
      )
      .leftJoin(
        hsFinancierTable,
        eq(
          hsAssociationOperationsFinanciersTable.financierUuid,
          hsFinancierTable.uuid,
        ),
      )
      .where(
        or(
          ilike(hsOperationsTable.name, filterPattern),
          ilike(hsOperationsTable.id, filterPattern),
        ),
      )
      .limit(25);

    return data.map((d) => ({
      pro: d.pros,
      quote: d.devis,
      account: d.clients,
      location: d.batiments,
      financier: d.financeurs,
      ...d.deals,
    }));
  },

  async getAllHydratedByQuoteUuids(quoteUuids: QuoteUuid[]) {
    if (quoteUuids.length === 0) {
      return [];
    }

    const rows = await db
      .select({
        hsOperation: hsOperationsTable,
        hsLocation: hsLocationsTable,
        hsClient: hsClientsTable,
        proUuid: hsAssociationsOperationsProsTable.proUuid,
      })
      .from(hsAssociationsOperationsQuotesTable)
      .where(inArray(hsAssociationsOperationsQuotesTable.quoteUuid, quoteUuids))
      .innerJoin(
        hsOperationsTable,
        and(
          eq(
            hsOperationsTable.uuid,
            hsAssociationsOperationsQuotesTable.operationUuid,
          ),
          isNotNull(hsOperationsTable.prestationId),
          inArray(hsOperationsTable.prestationId, [
            ...OPERATION_HUBSPOT_PRESTATION_IDS,
          ]),
          inArray(hsOperationsTable.category, [
            ...OPERATION_HUBSPOT_CATEGORIES,
          ]),
          inArray(hsOperationsTable.phase, [
            ...OPERATION_PHASES_ALLOWED_IN_APP,
          ]),
        ),
      )
      .leftJoin(
        hsAssociationsOperationsLocationsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsLocationsTable.operationUuid,
        ),
      )
      .innerJoin(
        hsLocationsTable,
        eq(
          hsAssociationsOperationsLocationsTable.locationUuid,
          hsLocationsTable.uuid,
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
          hsAssociationsOperationsClientsTable.clientUuid,
          hsClientsTable.uuid,
        ),
      )
      .leftJoin(
        hsAssociationsOperationsProsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsProsTable.operationUuid,
        ),
      );

    return rows ?? null;
  },

  async getAllByQuoteUuids(quoteUuids: QuoteUuid[]) {
    if (quoteUuids.length === 0) {
      return [];
    }

    const rows = await db
      .select({
        hsOperation: hsOperationsTable,
        hsLocation: hsLocationsTable,
        proUuid: hsAssociationsOperationsProsTable.proUuid,
      })
      .from(hsAssociationsOperationsQuotesTable)
      .where(inArray(hsAssociationsOperationsQuotesTable.quoteUuid, quoteUuids))
      .innerJoin(
        hsOperationsTable,
        and(
          eq(
            hsOperationsTable.uuid,
            hsAssociationsOperationsQuotesTable.operationUuid,
          ),
          isNotNull(hsOperationsTable.prestationId),
          inArray(hsOperationsTable.prestationId, [
            ...OPERATION_HUBSPOT_PRESTATION_IDS,
          ]),
          inArray(hsOperationsTable.category, [
            ...OPERATION_HUBSPOT_CATEGORIES,
          ]),
          inArray(hsOperationsTable.phase, [
            ...OPERATION_PHASES_ALLOWED_IN_APP,
          ]),
        ),
      )
      .innerJoin(
        hsAssociationsOperationsLocationsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsLocationsTable.operationUuid,
        ),
      )
      .innerJoin(
        hsLocationsTable,
        eq(
          hsLocationsTable.uuid,
          hsAssociationsOperationsLocationsTable.locationUuid,
        ),
      )
      .leftJoin(
        hsAssociationsOperationsProsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsProsTable.operationUuid,
        ),
      );

    return rows ?? null;
  },

  getAllUnsynced() {
    return db
      .selectDistinct({
        hsOperation: hsOperationsTable,
        hsLocation: hsLocationsTable,
        hsClient: hsClientsTable,
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
        hsAssociationsOperationsClientsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsClientsTable.operationUuid,
        ),
      )
      .leftJoin(
        hsClientsTable,
        eq(
          hsAssociationsOperationsClientsTable.clientUuid,
          hsClientsTable.uuid,
        ),
      )
      .where(isNull(hsOperationsTable.id));
  },

  getAllByOperationTypes({
    operationTypes,
  }: {
    operationTypes: OperationHubspotPrestationId[];
  }) {
    return db
      .select({
        hsOperation: hsOperationsTable,
        hsLocation: hsLocationsTable,
        hsClient: hsClientsTable,
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
        hsAssociationsOperationsClientsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsClientsTable.operationUuid,
        ),
      )
      .leftJoin(
        hsClientsTable,
        eq(
          hsAssociationsOperationsClientsTable.clientUuid,
          hsClientsTable.uuid,
        ),
      )
      .where(inArray(hsOperationsTable.prestationId, [...operationTypes]));
  },

  getAllToSimulate() {
    return db
      .select({
        hsOperation: hsOperationsTable,
        hsLocation: hsLocationsTable,
        hsClient: hsClientsTable,
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
        hsAssociationsOperationsClientsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsClientsTable.operationUuid,
        ),
      )
      .leftJoin(
        hsClientsTable,
        eq(
          hsAssociationsOperationsClientsTable.clientUuid,
          hsClientsTable.uuid,
        ),
      )
      .where(
        and(
          inArray(hsOperationsTable.phase, [
            ...OPERATION_PHASES_ALLOWED_IN_APP,
          ]),
          isNotNull(hsOperationsTable.prestationId),
          inArray(hsOperationsTable.prestationId, [
            ...OPERATION_HUBSPOT_PRESTATION_IDS,
          ]),
          inArray(hsOperationsTable.category, [
            ...OPERATION_HUBSPOT_CATEGORIES,
          ]),
          or(
            and(
              isNull(hsOperationsTable.funding),
              isNull(hsOperationsTable.estimatedFunding),
            ),
            and(
              isNull(hsOperationsTable.costTTC),
              isNull(hsOperationsTable.estimatedCost),
            ),
          ),
        ),
      );
  },

  getAllWithoutPrestationAndNotUpsell() {
    return db
      .selectDistinct({
        hsOperation: hsOperationsTable,
        hsLocation: hsLocationsTable,
        hsClient: hsClientsTable,
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
        hsAssociationsOperationsClientsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsClientsTable.operationUuid,
        ),
      )
      .leftJoin(
        hsClientsTable,
        eq(
          hsAssociationsOperationsClientsTable.clientUuid,
          hsClientsTable.uuid,
        ),
      )
      .where(
        and(
          isNull(hsOperationsTable.prestationId),
          ne(hsOperationsTable.phase, OperationPhaseEnum.UPSELL),
        ),
      );
  },

  getAllWithoutSignatories() {
    return db
      .select({ id: hsOperationsTable.id, uuid: hsOperationsTable.uuid })
      .from(hsOperationsTable)
      .where(
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
                  hsAssociationsContactsOperationsTable.associationTypeId,
                  CONTACT_OPERATION_ASSOCIATIONS.SIGNATORY.id,
                ),
              ),
            ),
        ),
      );
  },

  // @todo Pour la perf, un index sur associations_deal_batiments.operation_uuid_pg (ou (operationUuid)) aidera le NOT EXISTS.
  getAllWithoutLocation() {
    return db
      .select({ uuid: hsOperationsTable.uuid, id: hsOperationsTable.id })
      .from(hsOperationsTable)
      .where(
        notExists(
          db
            .select()
            .from(hsAssociationsOperationsLocationsTable)
            .where(
              eq(
                hsAssociationsOperationsLocationsTable.operationUuid,
                hsOperationsTable.uuid,
              ),
            ),
        ),
      );
  },

  async getAllUuidsByLocation(locationUuid: LocationUuid) {
    const rows = await db
      .selectDistinctOn(
        [hsAssociationsOperationsLocationsTable.operationUuid],
        { uuid: hsAssociationsOperationsLocationsTable.operationUuid },
      )
      .from(hsAssociationsOperationsLocationsTable)
      .where(
        eq(hsAssociationsOperationsLocationsTable.locationUuid, locationUuid),
      );

    return rows.map((row) => row.uuid);
  },

  /**
   * Returns a list of operations for a professional,
   * limited to the statuses CSM_PASSATION, PRO_SEARCH, TO_BE_TAKEN_IN_CHARGE and PROJECT_PHASE
   *
   * @returns Array of operations that matches the criteria
   */
  getAllDiscoverableForPro({
    proUuid,
    showDemoClients,
  }: {
    proUuid: ProUuid;
    showDemoClients: boolean;
  }) {
    const displayedClientsConditions = [
      eq(hsAssociationsOperationsClientsTable.clientUuid, hsClientsTable.uuid),
      showDemoClients
        ? null
        : not(eq(hsClientsTable.accountType, ClientType.DEMO)),
    ].filter(isNotNullish);

    return db
      .selectDistinctOn([hsOperationsTable.uuid], {
        hsOperation: hsOperationsTable,
        hsLocation: hsLocationsTable,
        clientUuid: hsClientsTable.uuid,
      })
      .from(hsOperationsTable)
      .where(
        and(
          inArray(hsOperationsTable.phase, PRO_MARKETPLACE_PHASES),
          isNotNull(hsOperationsTable.prestationId),
          inArray(hsOperationsTable.prestationId, [
            ...OPERATION_HUBSPOT_PRESTATION_IDS,
          ]),
          inArray(hsOperationsTable.category, [
            ...OPERATION_HUBSPOT_CATEGORIES,
          ]),
          notExists(
            db
              .select({ id: hsAssociationsOperationsQuotesTable.uuid })
              .from(hsAssociationsOperationsQuotesTable)
              .innerJoin(
                hsAssociationsQuotesProsTable,
                and(
                  eq(
                    hsAssociationsOperationsQuotesTable.quoteUuid,
                    hsAssociationsQuotesProsTable.quoteUuid,
                  ),
                  eq(hsAssociationsQuotesProsTable.proUuid, proUuid),
                ),
              )
              .where(
                eq(
                  hsAssociationsOperationsQuotesTable.operationUuid,
                  hsOperationsTable.uuid,
                ),
              ),
          ),
        ),
      )
      .innerJoin(
        hsAssociationsOperationsLocationsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsLocationsTable.operationUuid,
        ),
      )
      .innerJoin(
        hsLocationsTable,
        eq(
          hsAssociationsOperationsLocationsTable.locationUuid,
          hsLocationsTable.uuid,
        ),
      )
      .innerJoin(
        hsAssociationsOperationsClientsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsClientsTable.operationUuid,
        ),
      )
      .innerJoin(hsClientsTable, and(...displayedClientsConditions));
  },

  /**
   * Returns the count of operations discoverable for a professional,
   * limited to the statuses in PRO_MARKETPLACE_PHASES and excluding operations
   * where the pro already has a quote
   *
   * @returns Count of operations that match the criteria
   */
  async countAllDiscoverableForPro({
    proUuid,
    showDemoClients,
  }: {
    proUuid: ProUuid;
    showDemoClients: boolean;
  }) {
    const displayedClientsConditions = [
      eq(hsAssociationsOperationsClientsTable.clientUuid, hsClientsTable.uuid),
      showDemoClients
        ? null
        : not(eq(hsClientsTable.accountType, ClientType.DEMO)),
    ].filter(isNotNullish);

    const KNOWN_HS_PRESTATION_IDS = Array.from(
      new Set(
        OPERATION_TYPES_ARR.flatMap((t) =>
          t.subTypes.map((s) => s.hsPrestationId),
        ),
      ),
    );

    const result = await db
      .select({ count: sql<number>`count(distinct ${hsOperationsTable.uuid})` })
      .from(hsOperationsTable)
      .where(
        and(
          inArray(hsOperationsTable.phase, PRO_MARKETPLACE_PHASES),
          inArray(hsOperationsTable.prestationId, KNOWN_HS_PRESTATION_IDS),
          notExists(
            db
              .select({ id: hsAssociationsOperationsQuotesTable.uuid })
              .from(hsAssociationsOperationsQuotesTable)
              .innerJoin(
                hsAssociationsQuotesProsTable,
                and(
                  eq(
                    hsAssociationsOperationsQuotesTable.quoteUuid,
                    hsAssociationsQuotesProsTable.quoteUuid,
                  ),
                  eq(hsAssociationsQuotesProsTable.proUuid, proUuid),
                ),
              )
              .where(
                eq(
                  hsAssociationsOperationsQuotesTable.operationUuid,
                  hsOperationsTable.uuid,
                ),
              ),
          ),
        ),
      )
      .innerJoin(
        hsAssociationsOperationsLocationsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsLocationsTable.operationUuid,
        ),
      )
      .innerJoin(
        hsLocationsTable,
        eq(
          hsAssociationsOperationsLocationsTable.locationUuid,
          hsLocationsTable.uuid,
        ),
      )
      .innerJoin(
        hsAssociationsOperationsClientsTable,
        eq(
          hsOperationsTable.uuid,
          hsAssociationsOperationsClientsTable.operationUuid,
        ),
      )
      .innerJoin(hsClientsTable, and(...displayedClientsConditions));

    return Number(result[0]?.count ?? 0);
  },

  update(uuid: OperationUuid, updateInput: Partial<HubspotNewOperation>) {
    return db
      .update(hsOperationsTable)
      .set(updateInput)
      .where(eq(hsOperationsTable.uuid, uuid))
      .returning();
  },

  async associateToNote({
    operationUuid,
    noteUuid,
  }: {
    operationUuid: OperationUuid;
    noteUuid: NoteUuid;
  }) {
    await db.insert(hsAssociationOperationsNotesTable).values({
      operationUuid,
      noteUuid,
      associationTypeId: NOTE_OPERATION_ASSOCIATIONS.NULL.id,
    });
  },

  async associateToClientAndLocation({
    locationUuid,
    clientUuid,
    operationUuid,
  }: {
    locationUuid: LocationUuid;
    clientUuid: ClientUuid;
    operationUuid: OperationUuid;
  }) {
    await db.transaction(async (tx) => {
      await tx.insert(hsAssociationsOperationsLocationsTable).values({
        locationUuid,
        operationUuid,
        associationTypeId: OPERATION_LOCATION_ASSOCIATIONS.NULL.id,
      });
      await tx.insert(hsAssociationsOperationsClientsTable).values({
        clientUuid,
        operationUuid,
        associationTypeId: OPERATION_CLIENT_ASSOCIATIONS.NULL.id,
      });
    });
  },

  async associateToPro(operationUuid: OperationUuid, proUuid: ProUuid) {
    const association = OPERATION_PRO_ASSOCIATIONS.RETAINED;
    await db.insert(hsAssociationsOperationsProsTable).values({
      operationUuid,
      proUuid,
      associationTypeId: association.id,
      associationLabel: association.label,
    });
  },

  /**
   * Checks if operation has some quotes related that are already started (with yousign). If so, operation signatory can no longer be updated.
   * @param operationUuid identifier of the operation to check
   * @returns true if operation signatory can be updated, false otherwise
   */
  async canSignatoryBeUpdated(operationUuid: OperationUuid) {
    const counter = await db
      .select({})
      .from(hsAssociationsOperationsQuotesTable)
      .where(
        eq(hsAssociationsOperationsQuotesTable.operationUuid, operationUuid),
      )
      .innerJoin(
        hsQuotesTable,
        and(
          eq(hsQuotesTable.uuid, hsAssociationsOperationsQuotesTable.quoteUuid),
          isNotNull(hsQuotesTable.signRequestYousignId),
        ),
      );

    return counter.length === 0;
  },

  async canClientAccessOperation({
    operationUuid,
    clientUuid,
  }: {
    clientUuid: ClientUuid;
    operationUuid: OperationUuid;
  }) {
    const rows = await db
      .select()
      .from(hsAssociationsOperationsClientsTable)
      .where(
        and(
          eq(hsAssociationsOperationsClientsTable.operationUuid, operationUuid),
          eq(hsAssociationsOperationsClientsTable.clientUuid, clientUuid),
        ),
      );

    return rows.length > 0;
  },
};
