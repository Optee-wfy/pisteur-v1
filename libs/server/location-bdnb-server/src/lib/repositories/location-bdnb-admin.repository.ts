import type { LocationsProListInput } from "@optee/constants";
import { REFERENCE_COMPANY_NULL_OK_REASONS } from "@optee/constants";
import { LocationBdnbLegalEntityRepository } from "@optee/location-bdnb-legal-entity-server";
import type { LocationBdnbUuid, NewLocationBdnb } from "@optee/models";
import {
  locationsBdnbTable,
  snapshotPublicLocationsBdnbTable,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, inArray, isNull, notInArray, or, sql } from "drizzle-orm";
import { LocationBdnbRepository } from "./location-bdnb.repository";
import { SnapshotLocationBdnbRepository } from "./snapshot-location-bdnd.repository";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const MISSING_IPE_CONDITION = or(
  isNull(locationsBdnbTable.referenceCompanySelectionReason),
  isNull(locationsBdnbTable.ipeUsage),
  isNull(locationsBdnbTable.ipeUsageReason),
  isNull(locationsBdnbTable.ipeRawScore),
  and(
    isNull(locationsBdnbTable.referenceCompanyUuid),
    notInArray(
      locationsBdnbTable.referenceCompanySelectionReason,
      REFERENCE_COMPANY_NULL_OK_REASONS,
    ),
  ),
);

export const LocationBdnbAdminRepository = {
  getBatches(filters: LocationsProListInput, batchSize: number) {
    return SnapshotLocationBdnbRepository.getBatches(filters, batchSize);
  },

  setAsFailedImport(uuid: LocationBdnbUuid, reason: string) {
    return SnapshotLocationBdnbRepository.setAsFailedImport(uuid, reason);
  },

  deleteSnapshot(uuid: LocationBdnbUuid, options?: { tx?: DbTransaction }) {
    return SnapshotLocationBdnbRepository.delete(uuid, options);
  },

  countRemaining(filters: LocationsProListInput) {
    return SnapshotLocationBdnbRepository.countRemaining(filters);
  },

  getByLocationGroupId(
    locationGroupId: string,
    options?: { tx?: DbTransaction },
  ) {
    return LocationBdnbRepository.getByLocationGroupId(
      locationGroupId,
      options,
    );
  },

  create(input: NewLocationBdnb, options?: { tx?: DbTransaction }) {
    return LocationBdnbRepository.create(input, options);
  },

  update(
    uuid: LocationBdnbUuid,
    data: Partial<NewLocationBdnb>,
    options?: { tx?: DbTransaction },
  ) {
    return LocationBdnbRepository.update(uuid, data, options);
  },

  async refreshLocationLegalEntityStats(
    locationBdnbUuid: LocationBdnbUuid,
    options?: { nbLegalEntities?: number; tx?: DbTransaction },
  ) {
    await LocationBdnbLegalEntityRepository.refreshLocationLegalEntityStats(
      locationBdnbUuid,
      {
        nbLegalEntities: options?.nbLegalEntities,
        tx: options?.tx,
      },
    );
    // When called inside a transaction, cache invalidation must happen
    // after commit by the caller to avoid exposing stale/inconsistent reads.
    if (!options?.tx) {
      LocationBdnbRepository.invalidateCountsCache();
    }
  },

  async countMissingIpeData() {
    const [row] = await db
      .select({
        total: sql<number>`count(*)`,
      })
      .from(locationsBdnbTable)
      .where(MISSING_IPE_CONDITION);

    return Number(row?.total ?? 0);
  },

  invalidateCountsCache() {
    LocationBdnbRepository.invalidateCountsCache();
  },

  async getMissingIpeDataBatch(limit: number) {
    return db
      .select({
        uuid: locationsBdnbTable.uuid,
        buildingUsage: locationsBdnbTable.buildingUsage,
        surfaceThatRequiresHeating:
          locationsBdnbTable.surfaceThatRequiresHeating,
        creationDate: locationsBdnbTable.creationDate,
        height: locationsBdnbTable.height,
      })
      .from(locationsBdnbTable)
      .where(MISSING_IPE_CONDITION)
      .limit(limit);
  },

  async deleteSnapshotsByUuids(uuids: LocationBdnbUuid[]) {
    if (uuids.length === 0) {
      return;
    }

    await db
      .delete(snapshotPublicLocationsBdnbTable)
      .where(inArray(snapshotPublicLocationsBdnbTable.uuid, uuids));
  },
};
