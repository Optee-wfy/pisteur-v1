import { QUOTE_CLIENT_ASSOCIATIONS } from "@optee/constants";
import {
  hsAssociationsQuotesClientsTable,
  type ClientUuid,
  type QuoteUuid,
} from "@optee/models";
import { db } from "@optee/supabase-server";

export const QuoteClientRepository = {
  async create(quoteUuid: QuoteUuid, clientUuid: ClientUuid) {
    const associationType = QUOTE_CLIENT_ASSOCIATIONS.NULL;
    await db.insert(hsAssociationsQuotesClientsTable).values({
      quoteUuid,
      clientUuid,
      associationTypeId: associationType.id,
      associationLabel: associationType.label,
    });
  },
};
