import { QUOTE_LOCATION_ASSOCIATIONS } from "@optee/constants";
import {
  hsAssociationsQuotesLocationsTable,
  type LocationUuid,
  type QuoteUuid,
} from "@optee/models";
import { db } from "@optee/supabase-server";

export const QuoteLocationRepository = {
  async create(quoteUuid: QuoteUuid, locationUuid: LocationUuid) {
    const associationType = QUOTE_LOCATION_ASSOCIATIONS.NULL;
    await db.insert(hsAssociationsQuotesLocationsTable).values({
      quoteUuid,
      locationUuid,
      associationTypeId: associationType.id,
      associationLabel: associationType.label,
    });
  },
};
