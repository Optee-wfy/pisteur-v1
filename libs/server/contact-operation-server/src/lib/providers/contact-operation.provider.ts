import { HubspotProvider } from "@optee/hubspot-server";
import type {
  ContactHsId,
  ContactUuid,
  OperationHsId,
  OperationUuid,
} from "@optee/models";
import { isNotNullish } from "@optee/utils";
import { ContactOperationRepository } from "../repositories/contact-operation.repository";

export const ContactOperationProvider = {
  async delete(
    data:
      | {
          contactUuid: ContactUuid;
          contactHsId: null;
          operationUuid: OperationUuid;
        }
      | {
          contactHsId: ContactHsId;
          operationHsId: OperationHsId;
        },
  ) {
    // Depending on the sync state (and the fact that our schedule jobs has properly or not updated ids) we can't know if we have to delete by uuid or hsId

    if ("operationUuid" in data) {
      const { contactUuid, operationUuid } = data;

      const res = await ContactOperationRepository.delete({
        contactUuid,
        operationUuid,
      });

      await Promise.all(
        res
          .map((r) =>
            r.contactId && r.operationId
              ? { contactId: r.contactId, operationId: r.operationId }
              : null,
          )
          .filter(isNotNullish)
          .map((r) =>
            HubspotProvider.deleteContactAssociationWithOperation(
              r.contactId,
              r.operationId,
            ),
          ),
      );
    }

    if ("contactHsId" in data && data.contactHsId) {
      const { contactHsId, operationHsId } = data;

      await Promise.all([
        ContactOperationRepository.delete({
          contactHsId,
          operationHsId,
        }),
        HubspotProvider.deleteContactAssociationWithOperation(
          contactHsId,
          operationHsId,
        ),
      ]);
    }
  },
};
