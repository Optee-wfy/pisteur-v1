import type { ProLocationAssociationLabel } from "@optee/constants";
import type { LocationBdnbUuid } from "@optee/models";

export const buildProAssocMap = (
  proAssocRows: Array<{
    locationUuid: LocationBdnbUuid | null;
    associationLabel: ProLocationAssociationLabel | null;
  }>,
) =>
  new Map<LocationBdnbUuid, ProLocationAssociationLabel | null>(
    proAssocRows
      .filter(
        (
          r,
        ): r is {
          locationUuid: LocationBdnbUuid;
          associationLabel: ProLocationAssociationLabel | null;
        } => r.locationUuid !== null,
      )
      .map((r) => [r.locationUuid, r.associationLabel] as const),
  );
