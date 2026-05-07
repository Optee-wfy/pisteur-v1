import { AssociationProExternalContactType } from "@optee/constants";
import type { ExternalContactRow } from "./external-contacts-table.types";

export const emailIsUnlocked = (row: ExternalContactRow): boolean => {
  return (
    row.associationType === AssociationProExternalContactType.MAIL ||
    row.associationType === AssociationProExternalContactType.BOTH
  );
};

export const phoneIsUnlocked = (row: ExternalContactRow): boolean => {
  return (
    row.associationType === AssociationProExternalContactType.PHONE ||
    row.associationType === AssociationProExternalContactType.BOTH
  );
};

export const isFullyEnriched = (row: ExternalContactRow): boolean => {
  return emailIsUnlocked(row) && phoneIsUnlocked(row);
};
