import type {
  ProLocationAssociation,
  ProLocationAssociationId,
} from "@optee/constants";
import type { LocationBdnbUuid } from "@optee/models";
import {
  associationProsExternalLocationsTable,
  hsAssociationProsLocationsTable,
  hsAssociationsOperationsLocationsTable,
  hsAssociationsOperationsQuotesTable,
  hsAssociationsQuotesProsTable,
  type LocationHsId,
  type LocationUuid,
  type ProHsId,
  type ProUuid,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq, ne } from "drizzle-orm";

export const ProLocationRepository = {
  async create({
    locationUuid,
    proUuid,
    associationType,
  }: {
    locationUuid: LocationUuid;
    proUuid: ProUuid;
    associationType: ProLocationAssociation;
  }) {
    await db.insert(hsAssociationProsLocationsTable).values({
      locationUuid,
      proUuid,
      associationTypeId: associationType.id,
      associationLabel: associationType.label,
    });
  },

  get({
    locationUuid,
    proUuid,
    associationTypeId,
    excludeAssociationTypeId,
  }: {
    locationUuid: LocationUuid;
    proUuid: ProUuid;
    associationTypeId?: ProLocationAssociationId;
    excludeAssociationTypeId?: ProLocationAssociationId;
  }) {
    const conditions = [
      eq(hsAssociationProsLocationsTable.locationUuid, locationUuid),
      eq(hsAssociationProsLocationsTable.proUuid, proUuid),
    ];

    if (associationTypeId !== undefined) {
      conditions.push(
        eq(
          hsAssociationProsLocationsTable.associationTypeId,
          associationTypeId,
        ),
      );
    }

    if (excludeAssociationTypeId !== undefined) {
      conditions.push(
        ne(
          hsAssociationProsLocationsTable.associationTypeId,
          excludeAssociationTypeId,
        ),
      );
    }

    return db
      .select()
      .from(hsAssociationProsLocationsTable)
      .where(and(...conditions));
  },

  getExternal({
    locationUuid,
    proUuid,
    associationTypeId,
    excludeAssociationTypeId,
  }: {
    locationUuid: LocationBdnbUuid;
    proUuid: ProUuid;
    associationTypeId?: ProLocationAssociationId;
    excludeAssociationTypeId?: ProLocationAssociationId;
  }) {
    const conditions = [
      eq(associationProsExternalLocationsTable.locationUuid, locationUuid),
      eq(associationProsExternalLocationsTable.proUuid, proUuid),
    ];

    if (associationTypeId !== undefined) {
      conditions.push(
        eq(
          associationProsExternalLocationsTable.associationTypeId,
          associationTypeId,
        ),
      );
    }

    if (excludeAssociationTypeId !== undefined) {
      conditions.push(
        ne(
          associationProsExternalLocationsTable.associationTypeId,
          excludeAssociationTypeId,
        ),
      );
    }

    return db
      .select()
      .from(associationProsExternalLocationsTable)
      .where(and(...conditions));
  },

  getQuotesAndLocationsByPro(proUuid: ProUuid) {
    return db
      .selectDistinctOn([hsAssociationsQuotesProsTable.quoteUuid], {
        proUuid: hsAssociationsQuotesProsTable.proUuid,
        quoteUuid: hsAssociationsQuotesProsTable.quoteUuid,
        operationUuid: hsAssociationsOperationsLocationsTable.operationUuid,
        locationUuid: hsAssociationsOperationsLocationsTable.locationUuid,
      })
      .from(hsAssociationsQuotesProsTable)
      .where(eq(hsAssociationsQuotesProsTable.proUuid, proUuid))
      .innerJoin(
        hsAssociationsOperationsQuotesTable,
        eq(
          hsAssociationsQuotesProsTable.quoteUuid,
          hsAssociationsOperationsQuotesTable.quoteUuid,
        ),
      )
      .innerJoin(
        hsAssociationsOperationsLocationsTable,
        eq(
          hsAssociationsOperationsQuotesTable.operationUuid,
          hsAssociationsOperationsLocationsTable.operationUuid,
        ),
      );
  },

  async update(
    association: { locationUuid: LocationUuid; proUuid: ProUuid },
    associationType: Exclude<ProLocationAssociation, { readonly id: 409 }>,
  ) {
    // @todo we may be want to check if current associationType is upper than given ? (if he is already unlocked, why change to interested )
    await db.transaction(async (tx) => {
      await tx
        .delete(hsAssociationProsLocationsTable)
        .where(
          and(
            eq(
              hsAssociationProsLocationsTable.locationUuid,
              association.locationUuid,
            ),
            eq(hsAssociationProsLocationsTable.proUuid, association.proUuid),
          ),
        );
      await tx.insert(hsAssociationProsLocationsTable).values({
        locationUuid: association.locationUuid,
        proUuid: association.proUuid,
        associationTypeId: associationType.id,
        associationLabel: associationType.label,
      });
    });
  },

  delete(
    data:
      | { locationHsId: LocationHsId; proHsId: ProHsId }
      | { locationUuid: LocationUuid; proUuid: ProUuid },
  ) {
    return db
      .delete(hsAssociationProsLocationsTable)
      .where(
        "locationHsId" in data
          ? and(
              eq(hsAssociationProsLocationsTable.locationId, data.locationHsId),
              eq(hsAssociationProsLocationsTable.proId, data.proHsId),
            )
          : and(
              eq(
                hsAssociationProsLocationsTable.locationUuid,
                data.locationUuid,
              ),
              eq(hsAssociationProsLocationsTable.proUuid, data.proUuid),
            ),
      )
      .returning();
  },
};
