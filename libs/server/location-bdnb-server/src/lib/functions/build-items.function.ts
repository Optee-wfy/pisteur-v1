import {
  PRO_LOCATION_ASSOCIATIONS,
  type LegalEntityType,
  type ProLocationAssociationLabel,
} from "@optee/constants";
import type { BuildingOccupancyCounts } from "@optee/constants";
import type { LegalEntityUuid, LocationBdnbUuid } from "@optee/models";
import { isNotNullish } from "@optee/utils";
import type { LocationRow } from "./fetch-locations-by-uuids.function";

/**
 * Assemble final items in page order.
 */
export const buildItems = ({
  pageRows,
  locationByUuid,
  proAssocByLocationUuid,
  legalEntitiesByLocationUuid,
  occupancyCountsByLocationUuid,
}: {
  pageRows: Array<{ locationUuid: LocationBdnbUuid; isLocked: number }>;
  locationByUuid: Map<LocationBdnbUuid, LocationRow>;
  proAssocByLocationUuid: Map<
    LocationBdnbUuid,
    ProLocationAssociationLabel | null
  >;
  legalEntitiesByLocationUuid: Map<
    LocationBdnbUuid,
    Array<{
      uuid: LegalEntityUuid;
      name: string | null;
      type: LegalEntityType;
      mainBusinessActivity: string | null;
    }> | null
  >;
  occupancyCountsByLocationUuid: Map<
    LocationBdnbUuid,
    BuildingOccupancyCounts | null
  >;
}) =>
  pageRows
    .map((row) => {
      const batiment = locationByUuid.get(row.locationUuid);
      if (!batiment) {
        return null;
      }
      const proAssociationLabel =
        proAssocByLocationUuid.get(row.locationUuid) ?? null;
      const entities =
        legalEntitiesByLocationUuid.get(row.locationUuid) ?? null;
      const occupancyCounts =
        occupancyCountsByLocationUuid.get(row.locationUuid) ?? null;

      const hasUnlocked =
        proAssociationLabel === PRO_LOCATION_ASSOCIATIONS.UNBLOCKED.label;

      return {
        location: batiment,
        associations: [proAssociationLabel].filter(isNotNullish),
        legalEntities: hasUnlocked
          ? entities
            ? [...entities].sort(
                (a, b) =>
                  a.type.localeCompare(b.type) ||
                  (a.name ?? "").localeCompare(b.name ?? ""),
              )
            : []
          : (entities?.map((l) => ({
              uuid: l.uuid,
              type: l.type,
              mainBusinessActivity: l.mainBusinessActivity ?? null,
            })) ?? []),
        // Counts derived from associated legal entities (siret/siren-only).
        occupancyCounts,
      };
    })
    .filter(isNotNullish);
