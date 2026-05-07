import { legalEntityTable } from "@optee/models";
import type { SQLWrapper } from "drizzle-orm";

/**
 * Central mapping for supported sortable columns.
 */
export const buildSortableColumnMap = (enterprisesAgg: {
  nbRelatedLocations: SQLWrapper;
  nbRelatedPros: SQLWrapper;
}) =>
  ({
    nbEmployeesRange: legalEntityTable.nbEmployeesRange,
    type: legalEntityTable.type,
    mainBusinessActivity: legalEntityTable.mainBusinessActivity,
    nbRelatedLocations: enterprisesAgg.nbRelatedLocations,
    nbRelatedPros: enterprisesAgg.nbRelatedPros,
  }) as const;
