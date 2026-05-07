import type {
  AssociationProExternalContactStatus,
  AssociationProExternalContactType,
} from "@optee/constants";
import type { ContactUuid, ExternalContact, LegalEntity } from "@optee/models";

export interface ExternalContactRow {
  contact: ExternalContact & { status: AssociationProExternalContactStatus };
  legalEntities: Array<Pick<LegalEntity, "uuid" | "name" | "type">>;
  associationUuid: string;
  associationType: AssociationProExternalContactType | null;
  owner: {
    uuid: ContactUuid;
    firstName: string;
    lastName: string;
  } | null;
}
