import { locationBdnbStatsTable } from "@optee/models";
import { sql } from "drizzle-orm";

/**
 * Stats-backed expression for number of legal entities per location.
 * Keeps the heavy aggregation out of the query path.
 */
export const buildNbLegalEntitiesExpr = () =>
  sql<number>`coalesce(${locationBdnbStatsTable.nbLegalEntities}, 0)`;
