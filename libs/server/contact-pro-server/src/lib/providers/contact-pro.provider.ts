import type { ContactHsId, ContactUuid, ProHsId, ProUuid } from "@optee/models";
import { ContactProRepository } from "../repositories/contact-pro.repository";

export const ContactProProvider = {
  async delete(
    data:
      | {
          contactUuid: ContactUuid;
          proUuid: ProUuid;
        }
      | {
          contactHsId: ContactHsId;
          proHsId: ProHsId;
        },
  ) {
    // We only maintain internal associations now.
    // No HubSpot side-effect should be triggered on delete.

    if ("proUuid" in data) {
      const { contactUuid, proUuid } = data;

      await ContactProRepository.delete({
        contactUuid,
        proUuid,
      });
    } else if ("contactHsId" in data) {
      const { contactHsId, proHsId } = data;

      await ContactProRepository.delete({
        contactHsId,
        proHsId,
      });
    } else {
      throw new Error(
        `Invalid payload for ContactPro deletion: missing proUuid or contactHsId. Payload: ${JSON.stringify(data)}`,
      );
    }
  },
};
