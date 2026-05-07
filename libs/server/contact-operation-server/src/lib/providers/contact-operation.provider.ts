import type {
  ContactHsId,
  ContactUuid,
  OperationHsId,
  OperationUuid,
} from "@optee/models";
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
    if ("operationUuid" in data) {
      const { contactUuid, operationUuid } = data;

      await ContactOperationRepository.delete({
        contactUuid,
        operationUuid,
      });
    }

    if ("contactHsId" in data && data.contactHsId) {
      const { contactHsId, operationHsId } = data;

      await ContactOperationRepository.delete({
        contactHsId,
        operationHsId,
      });
    }
  },
};
