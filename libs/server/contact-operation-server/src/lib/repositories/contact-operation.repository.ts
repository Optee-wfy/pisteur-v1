import type { ContactOperationAssociation } from "@optee/constants";
import type {
  ContactHsId,
  ContactUuid,
  OperationHsId,
  OperationUuid,
} from "@optee/models";
import { hsAssociationsContactsOperationsTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq } from "drizzle-orm";

export const ContactOperationRepository = {
  async create(
    contactUuid: ContactUuid,
    operationUuid: OperationUuid,
    associationType: ContactOperationAssociation,
  ) {
    await db.insert(hsAssociationsContactsOperationsTable).values({
      contactUuid,
      operationUuid,
      associationTypeId: associationType.id,
      associationLabel: associationType.label,
    });
  },

  delete(
    data:
      | { contactHsId: ContactHsId; operationHsId: OperationHsId }
      | { contactUuid: ContactUuid; operationUuid: OperationUuid },
  ) {
    return db
      .delete(hsAssociationsContactsOperationsTable)
      .where(
        "contactHsId" in data
          ? and(
              eq(
                hsAssociationsContactsOperationsTable.contactId,
                data.contactHsId,
              ),
              eq(
                hsAssociationsContactsOperationsTable.operationId,
                data.operationHsId,
              ),
            )
          : and(
              eq(
                hsAssociationsContactsOperationsTable.contactUuid,
                data.contactUuid,
              ),
              eq(
                hsAssociationsContactsOperationsTable.operationUuid,
                data.operationUuid,
              ),
            ),
      )
      .returning();
  },
};
