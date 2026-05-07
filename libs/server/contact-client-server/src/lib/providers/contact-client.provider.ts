import {
  CONTACT_CLIENT_ASSOCIATIONS,
  type ContactClientLabel,
} from "@optee/constants";
import {
  type ClientHsId,
  type ClientUuid,
  type ContactHsId,
  type ContactUuid,
} from "@optee/models";
import { isNotNullish } from "@optee/utils";
import { ContactClientRepository } from "../repositories/contact-client.repository";

export const ContactClientProvider = {
  //@todo should be extracted to shared utils (useful for UI as well)
  getLabelPriority(label: ContactClientLabel) {
    switch (label) {
      case CONTACT_CLIENT_ASSOCIATIONS.ADMINISTRATOR.label:
        return 2;
      default:
        return 0;
    }
  },

  async delete(
    data:
      | {
          contactUuid: ContactUuid;
          clientUuid: ClientUuid;
        }
      | {
          contactHsId: ContactHsId;
          clientHsId: ClientHsId;
        },
  ) {
    if ("contactUuid" in data) {
      const { contactUuid, clientUuid } = data;

      await ContactClientRepository.delete({
        contactUuid,
        clientUuid,
      });
    }

    if ("contactHsId" in data) {
      const { contactHsId, clientHsId } = data;

      await ContactClientRepository.delete({
        contactHsId,
        clientHsId,
      });
    }
  },

  async deleteAllForContact(contactUuid: ContactUuid) {
    // You might think we could just call ContactClientRepository.deleteAllForContact here, but we need to delete the associations in Hubspot as well
    const rows = await ContactClientRepository.getByContact(contactUuid);

    const uniquePairs = Array.from(
      new Map(
        rows.map((r) => [
          `${r.contactUuid}::${r.clientUuid}`,
          r.contactUuid && r.clientUuid
            ? { contactUuid: r.contactUuid, clientUuid: r.clientUuid }
            : null,
        ]),
      ).values(),
    ).filter(isNotNullish);

    await Promise.all(
      uniquePairs.map(({ contactUuid, clientUuid }) =>
        ContactClientProvider.delete({ contactUuid, clientUuid }),
      ),
    );
  },

  async cleanupDuplicatedAssociations() {
    const duplicates =
      await ContactClientRepository.getAllWithDuplicatedAssociations();

    if (!duplicates.length) {
      return;
    }

    console.log(
      `🧼 Cleaning client associations: ${duplicates.length} duplicate pairs found`,
    );

    for (const dup of duplicates) {
      if (!dup.contactUuid) {
        continue;
      }
      const rows = await ContactClientRepository.getByContact(dup.contactUuid);

      if (!rows.length) {
        continue;
      }

      rows.sort(
        (a, b) =>
          ContactClientProvider.getLabelPriority(b.associationLabel) -
          ContactClientProvider.getLabelPriority(a.associationLabel),
      );
      const toKeep = rows[0];
      const toDelete = rows.slice(1);

      console.log(
        `\n → ${rows.length} for contact ${dup.contactUuid} + client ${dup.clientUuid}`,
      );
      console.log(
        "Roles: " +
          rows.map((r) => r.associationLabel ?? "Sans rôle").join(", "),
      );
      console.log(`✔  Keep: ${toKeep?.associationLabel ?? "sans rôle"}`);
      console.log(`🗑  Deleting: ${toDelete.length} associations`);

      await ContactClientRepository.deleteBatch(toDelete.map((d) => d.uuid));
    }
  },
};
