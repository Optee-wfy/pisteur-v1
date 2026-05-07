import type { LocationsBdnbLegalEntityProListInput } from "@optee/constants";
import type { SQL } from "drizzle-orm";

/**
 * Determines whether location-related filters are active.
 * When false, we can query directly from legal entities + stats.
 */
export const buildHasLocationFilters = (
  filters: LocationsBdnbLegalEntityProListInput,
  locationFilters: SQL<unknown>[],
  locationShowFilter: LocationsBdnbLegalEntityProListInput["show"],
) =>
  locationFilters.length > 0 ||
  (locationShowFilter ?? "all") !== "all" ||
  (Array.isArray(filters.buildingUsage) && filters.buildingUsage.length > 0) ||
  (Array.isArray(filters.buildingOccupancyStatus) &&
    filters.buildingOccupancyStatus.length > 0);
