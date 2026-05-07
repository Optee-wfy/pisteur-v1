import type { LegalEntityUuid } from "@optee/models";
import { isNotNullish } from "@optee/utils";
import type { LegalEntityRow } from "./fetch-legal-entities-by-uuids.function";

export type LegalEntityPageRow = {
  legalEntityUuid: LegalEntityUuid | null;
  nbRelatedLocations: number | null;
  nbRelatedPros: number | null;
};

/**
 * Assemble final legal entity items in page order.
 */
export const buildLegalEntityItems = ({
  pageRows,
  legalEntityByUuid,
}: {
  pageRows: LegalEntityPageRow[];
  legalEntityByUuid: Map<LegalEntityUuid, LegalEntityRow>;
}) =>
  pageRows
    .map((row) => {
      if (!row.legalEntityUuid) {
        return null;
      }
      const entity = legalEntityByUuid.get(row.legalEntityUuid);
      if (!entity) {
        return null;
      }
      return {
        legalEntity: {
          ...entity,
          nbRelatedLocations: row.nbRelatedLocations ?? 0,
          nbRelatedPros: row.nbRelatedPros ?? 0,
        },
      };
    })
    .filter(isNotNullish);
