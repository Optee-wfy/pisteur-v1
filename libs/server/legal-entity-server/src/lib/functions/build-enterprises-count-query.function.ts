import { db } from "@optee/supabase-server";
import { sql } from "drizzle-orm";
import type { buildEnterprisesAggWithLocationFilters } from "./build-enterprises-agg-with-location-filters.function";
import type { buildEnterprisesAggWithoutLocationFilters } from "./build-enterprises-agg-without-location-filters.function";

/**
 * Count query over enterprises aggregation CTE.
 */
export const buildEnterprisesCountQuery = ({
  enterprisesAgg,
  withCtes,
}: {
  enterprisesAgg:
    | ReturnType<typeof buildEnterprisesAggWithLocationFilters>
    | ReturnType<typeof buildEnterprisesAggWithoutLocationFilters>;
  withCtes: Parameters<typeof db.with>;
}) =>
  db
    .with(...withCtes)
    .select({ total: sql<number>`count(*)` })
    .from(enterprisesAgg);
