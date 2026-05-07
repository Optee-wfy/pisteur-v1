import type { LegalEntityUuid } from "@optee/models";
import { legalEntityTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { inArray } from "drizzle-orm";

/**
 * Fetch legal entity details for the current page.
 */
export const fetchLegalEntitiesByUuids = (
  legalEntityUuids: LegalEntityUuid[],
) => {
  if (legalEntityUuids.length === 0) {
    return Promise.resolve([]);
  }
  return db
    .select({
      legalEntityUuid: legalEntityTable.uuid,
      name: legalEntityTable.name,
      noContactCanBeFound: legalEntityTable.noContactCanBeFound,
      nbEmployeesRange: legalEntityTable.nbEmployeesRange,
      nbPremises: legalEntityTable.nbPremises,
      streetNumber: legalEntityTable.streetNumber,
      streetName: legalEntityTable.streetName,
      city: legalEntityTable.city,
      zipCode: legalEntityTable.zipCode,
      mainBusinessActivity: legalEntityTable.mainBusinessActivity,
      type: legalEntityTable.type,
    })
    .from(legalEntityTable)
    .where(inArray(legalEntityTable.uuid, legalEntityUuids));
};

export type LegalEntityRow = Awaited<
  ReturnType<typeof fetchLegalEntitiesByUuids>
>[number];
