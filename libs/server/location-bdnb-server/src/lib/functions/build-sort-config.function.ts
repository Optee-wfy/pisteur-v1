import type { LocationsBdnbLegalEntityProListInput } from "@optee/constants";
import { SORTABLE_COLUMN_MAP } from "./sortable-column-map.constant";

/**
 * Resolve the requested sort key + order with defaults.
 */
export const buildSortConfig = (
  sort: LocationsBdnbLegalEntityProListInput["sort"] | undefined,
) => {
  let sortBy: NonNullable<
    LocationsBdnbLegalEntityProListInput["sort"]
  >["sortBy"] = "dpeLabel";
  let sortOrder: "asc" | "desc" = "desc";

  if (sort) {
    if (
      sort.sortBy === "nbRelatedPros" ||
      sort.sortBy === "random" ||
      sort.sortBy in SORTABLE_COLUMN_MAP
    ) {
      sortBy = sort.sortBy;
    }
    if (sort.sortOrder === "asc" || sort.sortOrder === "desc") {
      sortOrder = sort.sortOrder;
    }
  }

  return { sortBy, sortOrder };
};
