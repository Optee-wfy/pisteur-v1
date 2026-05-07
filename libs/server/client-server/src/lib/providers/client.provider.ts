import type {
  LocationAddressDetails,
  LocationPlaceDetails,
  Role,
} from "@optee/constants";
import {
  CLIENT_ROLES,
  ClientOrigin,
  ClientStage,
  ClientType,
  CONTACT_ACTIVITY_SECTORS,
  CONTACT_CLIENT_ASSOCIATIONS,
  contactSupport,
} from "@optee/constants";
import {
  ContactClientProvider,
  ContactClientRepository,
} from "@optee/contact-client-server";
import {
  ContactLocationProvider,
  ContactLocationRepository,
} from "@optee/contact-location-server";
import { ContactRepository, type GroupedContact } from "@optee/contact-server";
import { HubspotProvider } from "@optee/hubspot-server";
import { LocationProvider } from "@optee/location-server";
import type {
  ClientUuid,
  ContactUuid,
  HubspotContact,
  HubspotLocationBdnbData,
  LocationUuid,
  UserUuid,
} from "@optee/models";
import { isNotNullish } from "@optee/utils";
import { ClientRepository } from "../repositories/client.repository";

export const ClientProvider = {
  async getRole(contactUuid: ContactUuid): Promise<Role | null> {
    const [locationAssociationResult, clientAssociationResult] =
      await Promise.all([
        ContactLocationRepository.getByContact(contactUuid),
        ContactClientRepository.getByContact(contactUuid),
      ]);

    const [contactClientAssociationTypeId] = clientAssociationResult
      .filter((r) => !!r.associationLabel) // Don't want the NULL rows
      .map((r) => r.associationTypeId)
      .filter(isNotNullish);

    const [contactLocationAssociationTypeId] = locationAssociationResult
      .filter((r) => !!r.associationLabel) // Don't want the NULL rows
      .map((r) => r.associationTypeId)
      .filter(isNotNullish);

    let role = null;
    if (contactClientAssociationTypeId !== undefined) {
      role = CLIENT_ROLES.find(
        (r) => r.clientAssociation?.id === contactClientAssociationTypeId,
      );
    } else if (contactLocationAssociationTypeId !== undefined) {
      role = CLIENT_ROLES.find(
        (r) => r.locationAssociation?.id === contactLocationAssociationTypeId,
      );
    }

    return role?.slug ?? null;
  },

  async getContactsWithLocationAndRoles(clientUuid: ClientUuid) {
    const rows =
      await ContactRepository.getAllByClientWithLocationAndRoles(clientUuid);

    const byContact = new Map<ContactUuid, GroupedContact>();
    // Pré-calcul des poids par slug
    const roleWeight = new Map<Role, number>(
      CLIENT_ROLES.map((r) => [
        r.slug as Role,
        r.clientAssociation ? 2 : r.locationAssociation ? 1 : 0,
      ]),
    );
    const weight = (slug?: Role | null) =>
      slug ? (roleWeight.get(slug) ?? 0) : 0;

    for (const row of rows) {
      if (!row.contactUuid) {
        continue;
      }

      const existing = byContact.get(row.contactUuid);

      // Compute role with same precedence as getRole: client > location
      const candidateRoleFromClient = row.clientAssociationTypeId
        ? CLIENT_ROLES.find(
            (r) => r.clientAssociation?.id === row.clientAssociationTypeId,
          )?.slug
        : undefined;
      const candidateRoleFromLocation = row.locationAssociationTypeId
        ? CLIENT_ROLES.find(
            (r) => r.locationAssociation?.id === row.locationAssociationTypeId,
          )?.slug
        : undefined;
      const computedRole =
        candidateRoleFromClient ?? candidateRoleFromLocation ?? null;

      const locs = new Map<LocationUuid, { uuid: LocationUuid; name: string }>(
        existing?.locations.map((l) => [l.uuid, l]) ?? [],
      );
      if (row.locationUuid && row.locationName) {
        locs.set(row.locationUuid, {
          uuid: row.locationUuid,
          name: row.locationName,
        });
      }

      const existingRole = existing?.role ?? null;
      const nextRole =
        weight(existingRole) >= weight(computedRole)
          ? existingRole
          : (computedRole ?? null);

      byContact.set(row.contactUuid, {
        uuid: row.contactUuid,
        userUuid: row.userUuid ?? existing?.userUuid ?? null,
        firstName: row.firstName ?? existing?.firstName ?? null,
        lastName: row.lastName ?? existing?.lastName ?? null,
        email: row.email ?? existing?.email ?? null,
        locations: Array.from(locs.values()),
        role: nextRole,
      });
    }

    return Array.from(byContact.values());
  },

  async getSummaryCardFromLocation(locationUuid: LocationUuid) {
    const clientUuid = await ClientRepository.getUuidByLocation(locationUuid);
    if (!clientUuid) {
      console.error(
        "🚩 [Mise en relation] Aucun client trouvé pour le bâtiment avec l'uuid: " +
          locationUuid,
      );
      throw new Error(
        `Aucun client trouvé pour ce bâtiment. ${contactSupport}`,
      );
    }

    const contacts = await LocationProvider.getAdministrators(locationUuid);
    if (contacts.length === 0) {
      console.error(
        `🚩 [Mise en relation] Aucun administrateur trouvé pour le bâtiment [${locationUuid}]`,
      );
      throw new Error(
        `Aucun administrateur trouvé pour ce bâtiment. ${contactSupport}`,
      );
    }

    const client = await ClientRepository.get(clientUuid);
    if (!client) {
      console.error(
        "🚩 [Mise en relation] Aucun client trouvé pour l'uuid: " + clientUuid,
      );
      throw new Error(
        `Aucun client trouvé pour ce bâtiment. ${contactSupport}`,
      );
    }

    const addressParts = [
      client.billingAddress,
      client.billingZipCode,
      client.billingCity,
    ].filter(isNotNullish);
    const address = addressParts.length ? addressParts.join(" ").trim() : null;

    return {
      client: {
        uuid: client.uuid,
        name: client.name,
        accountType: client.accountType,
        siret: client.siret,
        address,
        phone: client.phone,
      },
      contacts,
    };
  },

  async grantRole({
    contactUuid,
    clientUuid,
    grantedRole,
    locationUuids,
  }: {
    contactUuid: ContactUuid;
    clientUuid: ClientUuid;
    grantedRole: Role;
    locationUuids?: LocationUuid[] | null;
  }) {
    const roleData = CLIENT_ROLES.find((r) => r.slug === grantedRole);

    if (!roleData) {
      throw new Error(
        `Erreur lors de la création du contact. Le rôle "${grantedRole}" n'existe pas.`,
      );
    }

    const { clientAssociation, locationAssociation } = roleData;

    // CONTACT CLIENTS
    await ContactClientProvider.delete({ contactUuid, clientUuid });
    await ContactClientRepository.create(
      contactUuid,
      clientUuid,
      clientAssociation ?? CONTACT_CLIENT_ASSOCIATIONS.NULL,
    );

    // CONTACT LOCATIONS
    await ContactLocationProvider.deleteAllForContact(contactUuid);
    if (locationAssociation) {
      if (!locationUuids || locationUuids.length === 0) {
        throw new Error(
          "Erreur lors de la création du contact. Aucun site associé au rôle.",
        );
      }

      await Promise.all(
        locationUuids.map((locationUuid) =>
          ContactLocationRepository.create(
            contactUuid,
            locationUuid,
            locationAssociation,
          ),
        ),
      );
    }
  },

  async onboard({
    dto,
    userUuid,
    contact,
  }: {
    userUuid: UserUuid;
    dto: {
      client: { companyName: string };
      location: {
        addressData: LocationAddressDetails;
        placeData: LocationPlaceDetails;
        customBdnbData: HubspotLocationBdnbData;
      };
    };
    contact: HubspotContact;
  }) {
    const client = await ClientRepository.getByUser(userUuid);

    if (client) {
      await LocationProvider.create({
        clientUuid: client.uuid,
        contactUuid: contact.uuid,
        ...dto.location,
      });
    } else {
      const activitySector = CONTACT_ACTIVITY_SECTORS.find(
        (s) =>
          s.value.toLowerCase().trim() ===
          (contact.activitySector ?? "").toLowerCase().trim(),
      );

      //@todo Should be grouped in single transaction to ensure atomicity
      const { uuid: clientUuid } = await ClientRepository.create({
        name: `${dto.client.companyName}${contact.lastName ? ` [${contact.lastName.trim()}]` : ""}`,
        accountType: activitySector?.matchingClientType ?? ClientType.OTHER,
        stage: ClientStage.INITIATION,
        origin: ClientOrigin.ONBOARDING,
        utmTerm: contact.utmTerm,
        utmMedium: contact.utmMedium,
        utmSource: contact.utmSource,
        utmContent: contact.utmContent,
        utmCampaign: contact.utmCampaign,
      });

      await ClientProvider.grantRole({
        contactUuid: contact.uuid,
        clientUuid,
        locationUuids: [],
        grantedRole: "CLIENT_ADMINISTRATOR",
      });

      await LocationProvider.create({
        clientUuid,
        contactUuid: contact.uuid,
        ...dto.location,
      });
    }

    if (contact.email) {
      try {
        await HubspotProvider.trackEvent({
          email: contact.email,
          eventId: "location_add",
          properties: {
            source: "Onboarding",
          },
        });
      } catch (error) {
        console.error("🚩 Error tracking Hubspot onboard event: ", {
          input: contact.email,
          error,
        });
      }
    }

    return "success" as const;
  },
};
