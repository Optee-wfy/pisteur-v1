import type { LocationsBdnbLegalEntityProListInput } from "@optee/constants";

/**
 * Normalize filters for the base CTE: show is handled later.
 */
export const buildBaseFilters = (
  filters: LocationsBdnbLegalEntityProListInput,
): LocationsBdnbLegalEntityProListInput => ({
  ...filters,
  show: "all",
});
