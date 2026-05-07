import type { ContactLocationLabel } from "@optee/constants";
import {
  type ContactHsId,
  type ContactUuid,
  type LocationHsId,
  type LocationUuid,
} from "@optee/models";
import { isNotNullish } from "@optee/utils";
import { ContactLocationRepository } from "../repositories/contact-location.repository";

export const ContactLocationProvider = {
  //@todo should be extracted to shared utils (useful for UI as well)
  getLabelPriority(label: ContactLocationLabel) {
    switch (label) {
      case "Administrateur bâtiment":
        return 4;
      case "Observateur bâtiment":
        return 2;
      case "sur site":
        return 1;
      default:
        return 0;
    }
  },

  async delete(
    data:
      | {
          contactUuid: ContactUuid;
          locationUuid: LocationUuid;
        }
      | {
          contactHsId: ContactHsId;
          locationHsId: LocationHsId;
        },
  ) {
    if ("contactUuid" in data) {
      const { contactUuid, locationUuid } = data;

      await ContactLocationRepository.delete({
        contactUuid,
        locationUuid,
      });
    }

    if ("contactHsId" in data) {
      const { contactHsId, locationHsId } = data;

      await ContactLocationRepository.delete({
        contactHsId,
        locationHsId,
      });
    }
  },

  async deleteAllForContact(contactUuid: ContactUuid) {
    // You might think we could just call ContactLocationRepository.deleteAllForContact here, but we need to delete the associations in Hubspot as well
    const rows = await ContactLocationRepository.getByContact(contactUuid);

    await Promise.all(
      rows
        .map((r) =>
          r.contactUuid && r.locationUuid
            ? { contactUuid: r.contactUuid, locationUuid: r.locationUuid }
            : null,
        )
        .filter(isNotNullish)
        .map(({ contactUuid, locationUuid }) =>
          ContactLocationProvider.delete({
            contactUuid,
            locationUuid,
          }),
        ),
    );
  },

  async cleanupDuplicatedAssociations() {
    const duplicates =
      await ContactLocationRepository.getAllWithDuplicatedAssociations();
    console.log(
      `🧼 Cleaning locations associations: ${duplicates.length} duplicate pairs found`,
    );

    for (const dup of duplicates) {
      if (!dup.contactUuid || !dup.locationUuid) {
        continue;
      }
      const rows = await ContactLocationRepository.getByContactAndLocation(
        dup.contactUuid,
        dup.locationUuid,
      );

      if (!rows.length) {
        continue;
      }

      rows.sort(
        (a, b) =>
          ContactLocationProvider.getLabelPriority(b.associationLabel) -
          ContactLocationProvider.getLabelPriority(a.associationLabel),
      );
      const toKeep = rows[0];
      const toDelete = rows.slice(1);

      console.log(
        `\n → ${rows.length} for contact ${dup.contactUuid} + location ${dup.locationUuid}`,
      );
      console.log(
        "Roles: " +
          rows.map((r) => r.associationLabel ?? "Sans rôle").join(", "),
      );
      console.log(`✔  Keep: ${toKeep?.associationLabel ?? "sans rôle"}`);
      console.log(`🗑  Deleting: ${toDelete.length} associations`);

      await ContactLocationRepository.deleteBatch(toDelete.map((d) => d.uuid));
    }
  },
};
