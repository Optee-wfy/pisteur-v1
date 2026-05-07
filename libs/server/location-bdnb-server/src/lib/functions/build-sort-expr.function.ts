import type { LocationsBdnbLegalEntityProListInput } from "@optee/constants";
import { locationsBdnbTable } from "@optee/models";
import { sql } from "drizzle-orm";
import type { LocationsAggCte } from "./build-base-ctes.function";
import { buildSortConfig } from "./build-sort-config.function";
import { SORTABLE_COLUMN_MAP } from "./sortable-column-map.constant";

/**
 * Sorting expression builder.
 * Special-case for nbUnits to keep NULLs and 0s sorted after non-zero values.
 */
export const buildSortExpr = (
  sort: LocationsBdnbLegalEntityProListInput["sort"] | undefined,
  locationsAgg: LocationsAggCte,
) => {
  const { sortBy, sortOrder } = buildSortConfig(sort);
  if (sortBy === "random") {
    return sql`random()`;
  }

  return sort
    ? sortBy === "nbUnits"
      ? sql`case
            when ${locationsBdnbTable.nbUnits} is null then 2
            when ${locationsBdnbTable.nbUnits} < 1 then 1
            else 0
          end, ${locationsBdnbTable.nbUnits} ${sql.raw(sortOrder)} NULLS LAST`
      : sortBy === "nbRelatedPros"
        ? sql`${locationsAgg.nbRelatedPros} ${sql.raw(sortOrder)} NULLS LAST`
        : sql`${SORTABLE_COLUMN_MAP[sortBy as keyof typeof SORTABLE_COLUMN_MAP]} ${sql.raw(sortOrder)} NULLS LAST`
    : sql`${SORTABLE_COLUMN_MAP[sortBy as keyof typeof SORTABLE_COLUMN_MAP]} ${sql.raw(sortOrder)} NULLS LAST`;
};
