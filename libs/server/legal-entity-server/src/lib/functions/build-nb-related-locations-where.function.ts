import { buildSqlRangeWhere } from "@optee/bdd-server";
import type { SQL } from "drizzle-orm";
import type { buildNbRelatedLocationsExpr } from "./build-nb-related-locations-expr.function";

/**
 * Range filter on the stats expression.
 */
export const buildNbRelatedLocationsWhere = (
  nbRelatedLocationsExpr: ReturnType<typeof buildNbRelatedLocationsExpr>,
  minRelated: number | null,
  maxRelated: number | null,
): SQL<unknown> | undefined =>
  buildSqlRangeWhere(nbRelatedLocationsExpr, minRelated, maxRelated);
