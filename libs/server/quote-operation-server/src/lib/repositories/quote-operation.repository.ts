import { OPERATION_QUOTE_ASSOCIATIONS } from "@optee/constants";
import type { OperationUuid, QuoteUuid } from "@optee/models";
import { hsAssociationsOperationsQuotesTable } from "@optee/models";
import { db } from "@optee/supabase-server";

export const QuoteOperationRepository = {
  async create(quoteUuid: QuoteUuid, operationUuid: OperationUuid) {
    const associationType = OPERATION_QUOTE_ASSOCIATIONS.NULL;
    await db.insert(hsAssociationsOperationsQuotesTable).values({
      quoteUuid,
      operationUuid,
      associationTypeId: associationType.id,
      associationLabel: associationType.label,
    });
  },
};
