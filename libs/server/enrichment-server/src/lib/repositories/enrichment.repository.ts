import {
  FullEnrichEnrichmentStatus,
  type FullEnrichEnrichmentId,
} from "@optee/constants";
import type {
  ExternalContactUuid,
  LegalEntityUuid,
  NewEnrichment,
} from "@optee/models";
import { enrichmentsTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, arrayContains, eq } from "drizzle-orm";

export const EnrichmentRepository = {
  async create(input: NewEnrichment) {
    const [data] = await db.insert(enrichmentsTable).values(input).returning();
    return data ?? null;
  },

  async update(id: FullEnrichEnrichmentId, updates: Partial<NewEnrichment>) {
    const [data] = await db
      .update(enrichmentsTable)
      .set(updates)
      .where(eq(enrichmentsTable.enrichmentId, id))
      .returning();
    return data ?? null;
  },

  async get(id: FullEnrichEnrichmentId) {
    return db
      .select({
        uuid: enrichmentsTable.uuid,
        legalEntityUuid: enrichmentsTable.legalEntityUuid,
        enrichmentId: enrichmentsTable.enrichmentId,
        status: enrichmentsTable.status,
        contacts: enrichmentsTable.contacts,
        dependsOn: enrichmentsTable.dependsOn,
        contactUuid: enrichmentsTable.contactUuid,
      })
      .from(enrichmentsTable)
      .where(eq(enrichmentsTable.enrichmentId, id))
      .limit(1)
      .then((results) => results[0] || null);
  },

  async getActiveByLegalEntity(legalEntityUuid: LegalEntityUuid) {
    return db
      .select()
      .from(enrichmentsTable)
      .where(
        and(
          eq(enrichmentsTable.legalEntityUuid, legalEntityUuid),
          eq(enrichmentsTable.status, FullEnrichEnrichmentStatus.CREATED),
        ),
      )
      .limit(1)
      .then((results) => results[0] || null);
  },

  /**
   * Which enrichments currently in progress contain the given contact uuid
   * @param uuid
   * @returns
   */
  async whichEnrichmentsContain(uuid: ExternalContactUuid) {
    return db
      .select({
        enrichmentId: enrichmentsTable.enrichmentId,
      })
      .from(enrichmentsTable)
      .where(
        and(
          eq(enrichmentsTable.status, FullEnrichEnrichmentStatus.IN_PROGRESS),
          arrayContains(enrichmentsTable.contacts, [uuid]),
        ),
      );
  },
};
