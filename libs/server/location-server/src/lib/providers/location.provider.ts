import { BdnbProvider } from "@optee/bdnb-server";
import { ClientRepository } from "@optee/client-server";
import type {
  LocationAddressDetails,
  LocationPlaceDetails,
} from "@optee/constants";
import {
  CONTACT_LOCATION_ASSOCIATIONS,
  getDepartmentByCode,
  LOCATION_CLIENT_ASSOCIATIONS,
} from "@optee/constants";
import { ContactClientRepository } from "@optee/contact-client-server";
import { ContactLocationRepository } from "@optee/contact-location-server";
import { FileProvider } from "@optee/file-server";
import { GooglePlacesProvider } from "@optee/google-places-server";
import { LocationClientRepository } from "@optee/location-client-server";
import type {
  ClientUuid,
  ContactUuid,
  HubspotContact,
  HubspotLocationBdnbData,
  LocationUuid,
  UserUuid,
} from "@optee/models";
import { Location } from "@optee/models";
import { StorageProvider } from "@optee/supabase-server";
import { isEmailFromOptee, isNotNullish } from "@optee/utils";
import { LocationRepository } from "../repositories/location.repository";

export const LocationProvider = {
  async create({
    clientUuid,
    contactUuid,
    addressData,
    placeData,
    customBdnbData,
    sourceAddress,
  }: {
    clientUuid: ClientUuid;
    contactUuid: ContactUuid;
    addressData: LocationAddressDetails;
    placeData: LocationPlaceDetails;
    customBdnbData: HubspotLocationBdnbData;
    sourceAddress?: string;
  }) {
    if (
      await LocationRepository.getByAddressDataAndClient(
        addressData,
        clientUuid,
      )
    ) {
      return "already_exists" as const;
    }

    const formattedAddress = Location.makeAddress(addressData);

    const bdnbRes = await BdnbProvider.getDataFromAddress({
      address: formattedAddress,
      ...placeData,
    });

    const overriddenBdnbData = {
      ...(bdnbRes ? bdnbRes.formattedData : {}),
      ...customBdnbData, // We override BDNB data with the one from the user
    };

    const { streetName, streetNumber, zipcode, city } = addressData;
    const { name, googlePlaceId, longitude, latitude } = placeData;
    const department = getDepartmentByCode(zipcode);
    if (!department) {
      console.error(
        "🚩 Department code could not be determined from: ",
        zipcode,
      );
    }

    const [hsLocation] = await LocationRepository.create({
      streetName,
      streetNumber,
      zipcode,
      city,
      googlePlaceId,
      longitude,
      latitude,
      name: name ?? Location.makeShortAddress(addressData),
      rawBdnb: bdnbRes?.rawData ?? null,
      bdnbFailure: !bdnbRes,
      ...overriddenBdnbData,
      sourceAddress: sourceAddress ?? null,
      department,
    });
    if (!hsLocation) {
      throw new Error("Erreur lors de la création du site.");
    }

    await Promise.all([
      LocationProvider.attachStreetView(
        hsLocation.uuid,
        Location.makeAddress(hsLocation),
      ),

      LocationClientRepository.create(
        clientUuid,
        hsLocation.uuid,
        LOCATION_CLIENT_ASSOCIATIONS.NULL,
      ),

      ContactLocationRepository.create(
        contactUuid,
        hsLocation.uuid,
        CONTACT_LOCATION_ASSOCIATIONS.ADMINISTRATOR,
      ),
    ]);

    return hsLocation;
  },

  /**
   * Get all administrators for a location. If no administrators are found on location level, this function will fallback to client level by default.
   *
   * @param locationUuid identifier of the location
   * @param fallbackToMembers define whether to fallback to client members if no administrators are found
   * @returns list of Location administrators
   */
  async getAdministrators(
    locationUuid: LocationUuid,
    fallbackToMembers = true,
  ) {
    try {
      const locationAdmins = LocationProvider.filterValidContact(
        (
          await ContactLocationRepository.getAllAdministrators(locationUuid)
        ).map(({ contact }) => contact),
      );

      if (locationAdmins.length) {
        return locationAdmins;
      }

      const clientUuid = await ClientRepository.getUuidByLocation(locationUuid);
      if (!clientUuid) {
        console.error(
          `🚩 Aucun client trouvé pour le bâtiment: ${locationUuid}`,
        );
        throw new Error(`Aucun client trouvé pour le bâtiment.`);
      }
      const clientAdmins = LocationProvider.filterValidContact(
        (await ContactClientRepository.getAllAdministrators(clientUuid)).map(
          ({ contact }) => contact,
        ),
      );

      if (clientAdmins.length > 0) {
        return clientAdmins;
      }

      if (fallbackToMembers) {
        const clientMembers = LocationProvider.filterValidContact(
          (await ContactClientRepository.getAllMembers(clientUuid)).map(
            ({ contact }) => contact,
          ),
        );

        return clientMembers;
      }

      return [];
    } catch (error) {
      console.error(
        `🚩 Erreur lors de la récupération des administrateurs: ${error}`,
      );
      return [];
    }
  },

  getAll({
    userUuid,
    listBy,
  }: {
    userUuid: UserUuid;
    listBy: "client" | "contact";
  }) {
    return listBy === "client"
      ? LocationRepository.getAllForUserByClient(userUuid)
      : LocationRepository.getAllForUserByContact(userUuid);
  },

  async update({
    locationUuid,
    addressData,
    placeData,
    customBdnbData,
  }: {
    locationUuid: LocationUuid;
    addressData: LocationAddressDetails;
    placeData: LocationPlaceDetails;
    customBdnbData: HubspotLocationBdnbData;
  }) {
    const { hsLocation } = await LocationRepository.get(locationUuid);

    const oldAddress = Location.makeAddress(hsLocation);
    const newAddress = Location.makeAddress(addressData);

    if (oldAddress === newAddress) {
      return LocationRepository.update(locationUuid, {
        ...customBdnbData,
      });
    }

    // If we're here then the address changed

    const bdnbRes = await BdnbProvider.getDataFromAddress({
      address: newAddress,
      ...placeData,
    });

    const overriddenBdnbData = {
      ...(bdnbRes ? bdnbRes.formattedData : {}),
      ...customBdnbData, // We override BDNB data with the one from the user
    };

    const { streetName, streetNumber, zipcode, city } = addressData;
    const { name, googlePlaceId, longitude, latitude } = placeData;
    const department = getDepartmentByCode(zipcode);
    if (!department) {
      console.error(
        "🚩 Department code could not be determined from: ",
        zipcode,
      );
    }

    await LocationRepository.update(locationUuid, {
      streetName,
      streetNumber: streetNumber ?? null,
      zipcode,
      city,
      department: department ?? hsLocation.department,
      googlePlaceId: googlePlaceId ?? null,
      longitude: longitude ?? null,
      latitude: latitude ?? null,
      name: name ?? Location.makeShortAddress(addressData),
      rawBdnb: bdnbRes?.rawData ?? null,
      bdnbFailure: !bdnbRes,
      ...overriddenBdnbData,
    });

    await LocationProvider.attachStreetView(locationUuid, newAddress);

    return;
  },

  markAsBdnbFailure(uuid: LocationUuid) {
    return LocationRepository.update(uuid, {
      bdnbFailure: true,
    });
  },

  async updateBdnbData(uuid: LocationUuid) {
    const location = await LocationRepository.get(uuid);

    const resBdnb = await BdnbProvider.getDataFromAddress({
      address: Location.makeAddress(location.hsLocation),
    });

    if (!resBdnb) {
      throw new Error(
        "Aucun site ne semble correspondre à cette adresse. Veuillez vérifier l'adresse et réessayer. Si le problème persiste, contactez le support.",
      );
    }

    const { rawData, formattedData } = resBdnb;

    const res = await LocationRepository.updateBdnbData({
      uuid,
      rawBdnb: rawData,
      formattedData,
    });

    const row = res[0];

    if (!row) {
      throw new Error("Erreur lors de la mise à jour de la localisation");
    }

    return {
      rawData,
      formattedData,
      updatedLocation: row,
    };
  },

  async throwErrorIfUserIsNotAssociatedToLocation({
    userUuid,
    locationUuid,
  }: {
    userUuid: UserUuid;
    locationUuid: LocationUuid;
  }) {
    const client = await ClientRepository.getByUser(userUuid);

    if (!client) {
      throw new Error(
        "Erreur lors de la mise à jour du site. Le client n'a pas été trouvé.",
      );
    }

    const isLocationAssociatedToClient =
      await LocationClientRepository.checkAssociation({
        clientUuid: client.uuid,
        locationUuid,
      });

    if (!isLocationAssociatedToClient) {
      throw new Error(
        `Erreur lors de la mise à jour du site. Le site n'est pas associé au client.`,
      );
    }
  },

  async updateContactOnSite({
    uuid,
    nameContactOnSite,
    phoneContactOnSite,
  }: {
    uuid: LocationUuid;
    nameContactOnSite: string;
    phoneContactOnSite: string;
  }) {
    return LocationRepository.update(uuid, {
      nameContactOnSite,
      phoneContactOnSite,
    });
  },

  async attachStreetView(locationUuid: LocationUuid, address: string) {
    const streetView = await GooglePlacesProvider.getStreetViewUrlFromAddress({
      address,
    });

    const file = await FileProvider.downloadFile(streetView);

    const filePath = await StorageProvider.uploadFile({
      file,
      bucketName: "street-views",
      fileName: `${locationUuid}.jpg`,
    });

    await LocationRepository.updateStreetViewUrl(locationUuid, filePath);

    return filePath;
  },

  filterValidContact(contacts: HubspotContact[]) {
    return contacts
      .filter(isNotNullish)
      .filter(
        (contact) =>
          !isEmailFromOptee(contact?.email) && (contact.email || contact.phone),
      );
  },
};
