import { AssociationProExternalContactType } from "@optee/constants";
import { getPaidFlags } from "@optee/legal-entity-server";

export const getChargeableCounts = ({
  type,
  hasEmail,
  hasPhone,
  previousAssociationType,
}: {
  type: AssociationProExternalContactType;
  hasEmail: boolean;
  hasPhone: boolean;
  previousAssociationType: AssociationProExternalContactType;
}) => {
  const { hasPaidEmail, hasPaidPhone } = getPaidFlags(previousAssociationType);

  const emailCount =
    (type === AssociationProExternalContactType.MAIL ||
      type === AssociationProExternalContactType.BOTH) &&
    hasEmail &&
    !hasPaidEmail
      ? 1
      : 0;
  const phoneCount =
    (type === AssociationProExternalContactType.PHONE ||
      type === AssociationProExternalContactType.BOTH) &&
    hasPhone &&
    !hasPaidPhone
      ? 1
      : 0;

  return { emailCount, phoneCount };
};
