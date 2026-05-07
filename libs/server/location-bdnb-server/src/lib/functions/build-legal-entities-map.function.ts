import type { LegalEntityType } from "@optee/constants";
import type { LegalEntityUuid, LocationBdnbUuid } from "@optee/models";

type LegalEntityInfo = {
  uuid: LegalEntityUuid;
  name: string | null;
  type: LegalEntityType;
  mainBusinessActivity: string | null;
};

export const buildLegalEntitiesMap = (
  legalEntitiesRows: Array<{
    locationUuid: LocationBdnbUuid | null;
    entities: LegalEntityInfo[] | null;
  }>,
) =>
  new Map<LocationBdnbUuid, LegalEntityInfo[] | null>(
    legalEntitiesRows
      .filter(
        (
          r,
        ): r is {
          locationUuid: LocationBdnbUuid;
          entities: LegalEntityInfo[] | null;
        } => r.locationUuid !== null,
      )
      .map((r) => [r.locationUuid, r.entities] as const),
  );
