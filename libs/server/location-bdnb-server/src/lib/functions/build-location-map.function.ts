import type { LocationBdnbUuid } from "@optee/models";
import type { LocationRow } from "./fetch-locations-by-uuids.function";

/**
 * Small map helper to rebuild page items without reordering.
 */
export const buildLocationMap = (locations: LocationRow[]) =>
  new Map<LocationBdnbUuid, LocationRow>(
    locations.map((l) => [l.uuid, l] as const),
  );
