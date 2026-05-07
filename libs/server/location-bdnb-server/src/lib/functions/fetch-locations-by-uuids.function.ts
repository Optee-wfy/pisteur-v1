import type { LocationBdnbUuid } from "@optee/models";
import { locationBdnbStatsTable, locationsBdnbTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { eq, inArray, sql } from "drizzle-orm";

/**
 * Fetch base location rows for the current page.
 */
export const fetchLocationsByUuids = (locationUuids: LocationBdnbUuid[]) => {
  if (locationUuids.length === 0) {
    return Promise.resolve([]);
  }
  return db
    .selectDistinctOn([locationsBdnbTable.uuid], {
      uuid: locationsBdnbTable.uuid,
      name: locationsBdnbTable.name,
      streetNumber: locationsBdnbTable.streetNumber,
      streetName: locationsBdnbTable.streetName,
      city: locationsBdnbTable.city,
      zipcode: locationsBdnbTable.zipcode,
      dpeLabel: locationsBdnbTable.dpeLabel,
      surfaceThatRequiresHeating: locationsBdnbTable.surfaceThatRequiresHeating,
      nbUnits: locationsBdnbTable.nbUnits,
      creationDate: locationsBdnbTable.creationDate,
      sector: locationsBdnbTable.sector,
      buildingUsage: locationsBdnbTable.buildingUsage,
      ipeUsage: locationsBdnbTable.ipeUsage,
      ipeUsageReason: locationsBdnbTable.ipeUsageReason,
      ipeRawScore: locationsBdnbTable.ipeRawScore,
      referenceCompanyUuid: locationsBdnbTable.referenceCompanyUuid,
      referenceCompanySelectionReason:
        locationsBdnbTable.referenceCompanySelectionReason,
      annualElectricityConsumption:
        locationsBdnbTable.annualElectricityConsumption,
      heatingSystem: locationsBdnbTable.heatingSystem,
      nbRelatedPros:
        sql<number>`coalesce(${locationBdnbStatsTable.nbRelatedPros}, 0)`.as(
          "nbRelatedPros",
        ),
    })
    .from(locationsBdnbTable)
    .leftJoin(
      locationBdnbStatsTable,
      eq(locationsBdnbTable.uuid, locationBdnbStatsTable.locationBdnbUuid),
    )
    .where(inArray(locationsBdnbTable.uuid, locationUuids));
};

export type LocationRow = Awaited<
  ReturnType<typeof fetchLocationsByUuids>
>[number];
