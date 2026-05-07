import { legalEntityStatsTable } from "@optee/models";
import { sql } from "drizzle-orm";

/**
 * Stats-backed expression for number of related locations per legal entity.
 */
export const buildNbRelatedLocationsExpr = () =>
  sql<number>`coalesce(${legalEntityStatsTable.nbRelatedLocations}, 0)`;
