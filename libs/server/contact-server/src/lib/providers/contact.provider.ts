import { ClientProvider } from "@optee/client-server";
import type { Role } from "@optee/constants";
import {
  ContactClientProvider,
  ContactClientRepository,
} from "@optee/contact-client-server";
import { ContactLocationRepository } from "@optee/contact-location-server";
import { ContactRepository } from "@optee/contact-server";
import type { MailTemplateId } from "@optee/mailersend-server";
import type { ContactUuid, LocationUuid, UserUuid } from "@optee/models";
import { AuthProvider } from "@optee/supabase-server";

export type GroupedContact = {
  uuid: ContactUuid;
  userUuid: UserUuid | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  locations: { uuid: LocationUuid; name: string }[];
  role?: Role | null | undefined;
};

export const ContactProvider = {
  async getRoleByUser(userUuid: UserUuid) {
    const contact = await ContactRepository.getByUser(userUuid);

    if (!contact) {
      return null;
    }

    return ClientProvider.getRole(contact.uuid);
  },

  async getAllWithClientAndAssociations(input: {
    term?: string | null;
    duplicatedAssociations?: boolean | null;
    limit: number;
  }) {
    const contactData = await ContactRepository.getAllWithClient(input);

    const rows = await Promise.all(
      contactData.map(async (el) => {
        const clientAssociations = await ContactClientRepository.getByContact(
          el.contacts.uuid,
        );

        clientAssociations.sort(
          (a, b) =>
            ContactClientProvider.getLabelPriority(b.associationLabel) -
            ContactClientProvider.getLabelPriority(a.associationLabel),
        );

        const clientAssociationsLength = clientAssociations.length;

        const locationsAssociations = (
          await ContactLocationRepository.getByContact(el.contacts.uuid)
        ).map((c) => ({
          uuid: c.uuid,
          label: c.associationLabel,
          locationUuid: c.locationUuid,
          associationLabel: c.associationLabel,
        }));

        // Check if there are duplicated associations on associated locations
        const groupedLocations = new Map<LocationUuid, (string | null)[]>();
        locationsAssociations.forEach((location) => {
          if (location.locationUuid) {
            const currentLocations = groupedLocations.get(
              location.locationUuid,
            );
            if (currentLocations) {
              currentLocations.push(location.label);
              groupedLocations.set(location.locationUuid, currentLocations);
            } else {
              groupedLocations.set(location.locationUuid, [location.label]);
            }
          }
        });

        let hasDuplicatedLocationsAssociations = false;
        groupedLocations.forEach((locations) => {
          if (locations.filter((l) => !!l).length > 1) {
            hasDuplicatedLocationsAssociations = true;
          }
        });

        const hasDuplicatedAssociations =
          clientAssociationsLength > 1 || hasDuplicatedLocationsAssociations;

        if (input.duplicatedAssociations && !hasDuplicatedAssociations) {
          return null;
        }

        return {
          contact: el.contacts,
          client: el.clients,
          user: el.users,
          hasDuplicatedAssociations,
          role:
            clientAssociations[0]?.associationLabel ??
            locationsAssociations[0]?.associationLabel ??
            "Sans rôle",
        };
      }),
    );

    return rows.filter((row) => !!row);
  },

  async getAllWithPro(input: { term?: string | null; limit: number }) {
    const contactData = await ContactRepository.getAllWithPro(input);

    return contactData.map((el) => ({
      contact: el.contacts,
      pro: el.pros,
      user: el.users,
    }));
  },

  async sendInvitationEmailToContactWithUser({
    email,
    template,
  }: {
    email: string;
    template: MailTemplateId;
  }) {
    const contact = await ContactRepository.getByEmail(email);

    if (!contact) {
      throw new Error(
        `Erreur lors de l'envoi de l'invitation. Aucun contact trouvé avec l'email ${email}.`,
      );
    }

    if (!contact.userUuid) {
      throw new Error(
        `Erreur lors de l'envoi de l'invitation. Aucun compte utilisateur trouvé pour le contact avec l'email ${email}.`,
      );
    }

    return AuthProvider.inviteUser({
      email: email,
      firstName: contact.firstName ?? "",
      emailTemplate: template,
    });
  },
};
