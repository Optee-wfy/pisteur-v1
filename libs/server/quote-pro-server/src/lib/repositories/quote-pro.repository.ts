import { QUOTE_PRO_ASSOCIATIONS } from "@optee/constants";
import {
  hsAssociationsQuotesProsTable,
  type ProUuid,
  type QuoteUuid,
} from "@optee/models";
import { db } from "@optee/supabase-server";

export const QuoteProRepository = {
  async create(quoteUuid: QuoteUuid, proUuid: ProUuid) {
    const associationType = QUOTE_PRO_ASSOCIATIONS.NULL;
    await db.insert(hsAssociationsQuotesProsTable).values({
      quoteUuid,
      proUuid,
      associationTypeId: associationType.id,
      associationLabel: associationType.label,
    });
  },

  getAll() {
    return db
      .selectDistinctOn([hsAssociationsQuotesProsTable.quoteUuid], {
        proUuid: hsAssociationsQuotesProsTable.proUuid,
        quoteUuid: hsAssociationsQuotesProsTable.quoteUuid,
      })
      .from(hsAssociationsQuotesProsTable);
  },
};
