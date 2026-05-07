import type { GooglePlacesResponse } from "@optee/constants";
import {
  currentOpeningHoursSchema,
  GOOGLE_PLACES_RESPONSE_SCHEMA,
} from "@optee/constants";
import { buildOpeningHours, GOOGLE_MAPS_API_KEY } from "@optee/utils";
import z from "zod";

const LANGUAGE_CODE = "fr";
const REGION_CODE = "FR";

const placeIdSchema = z.object({
  places: z.array(z.object({ id: z.string() })),
});

const placeDetailsSchema = z.object({
  internationalPhoneNumber: z.string().optional(),
  currentOpeningHours: currentOpeningHoursSchema,
  websiteUri: z.string().url().optional(),
  rating: z.number().optional(),
  userRatingCount: z.number().optional(),
  googleMapsLinks: z
    .object({
      directionsUri: z.string().url().optional(),
    })
    .optional(),
  businessStatus: z
    .enum([
      "BUSINESS_STATUS_UNSPECIFIED",
      "OPERATIONAL",
      "CLOSED_TEMPORARILY",
      "CLOSED_PERMANENTLY",
    ])
    .optional(),
});

/**
 * Provides methods to interact with the Google Places API.
 *
 * @see https://developers.google.com/maps/documentation/streetview/request-streetview?hl=fr
 */
export const GooglePlacesProvider = {
  getStreetViewUrlFromAddress(params: {
    address: string;
    width?: number;
    height?: number;
  }) {
    const width = params.width || 600;
    const height = params.height || 300;
    return `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${encodeURIComponent(params.address)}&key=${GOOGLE_MAPS_API_KEY}`;
  },

  async getAddressInfo(address: string): Promise<GooglePlacesResponse | null> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`,
    );

    const rawData = await response.json();
    const parseResult = GOOGLE_PLACES_RESPONSE_SCHEMA.safeParse(rawData);

    if (!parseResult.success) {
      throw new Error(
        `Invalid Google Places TextSearch API response: ${parseResult.error}`,
      );
    }

    const data = parseResult.data;
    if (data.status !== "OK" || data.results.length === 0) {
      return null;
    }

    return data;
  },

  async isValidAddress(address: string): Promise<boolean> {
    const data = await GooglePlacesProvider.getAddressInfo(address);

    if (!data) {
      return false;
    }

    const firstRes = data.results[0];

    return firstRes ? firstRes.geometry.location_type !== "APPROXIMATE" : false;
  },

  async convertAddressToPlaceResult(address: string) {
    const response = await GooglePlacesProvider.getAddressInfo(address);
    const result = response?.results?.at(0);

    if (!result) {
      return null;
    }

    return {
      address_components: result.address_components,
      formatted_address: result.formatted_address,
      place_id: result.place_id,
      name: result.formatted_address,
      types: result.types,
    };
  },

  async getPlaceId(address: string) {
    const url = "https://places.googleapis.com/v1/places:searchText";
    const headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": "places.id",
    };
    const body = {
      textQuery: address,
      languageCode: LANGUAGE_CODE,
      regionCode: REGION_CODE,
    };

    try {
      const json = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!json.ok) {
        throw new Error(
          `🚩 TextSearch HTTP ${json.status} for address: ${address.slice(
            0,
            60,
          )}…`,
        );
      }
      const jsonData = await json.json();

      const parseResult = placeIdSchema.safeParse(jsonData);
      if (!parseResult.success) {
        throw new Error(
          `Invalid Google Places TextSearch API response: ${parseResult.error}`,
        );
      }

      const data = parseResult.data;
      return data.places[0]?.id ?? null;
    } catch (err) {
      console.error(`TextSearch error (${address.slice(0, 60)}…): ${err}`);
      return null;
    }
  },

  async getPlaceDetailsByPlaceId(placeId: string) {
    const fields = [
      "internationalPhoneNumber",
      "currentOpeningHours",
      "websiteUri",
      "rating",
      "userRatingCount",
      "googleMapsLinks",
      "businessStatus",
    ];
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=${LANGUAGE_CODE}&regionCode=${REGION_CODE}`;
    const headers = {
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": fields.join(","),
    };
    try {
      const json = await fetch(url, {
        method: "GET",
        headers,
      });
      if (!json.ok) {
        throw new Error(
          `🚩 Get Place Details HTTP ${json.status} for placeId: ${placeId.slice(
            0,
            60,
          )}…`,
        );
      }
      const result = await json.json();

      const parseResult = placeDetailsSchema.safeParse(result);
      if (!parseResult.success) {
        throw new Error(
          `Invalid Google Places Details API response: ${parseResult.error}`,
        );
      }

      const res = parseResult.data;

      const formattedOpeningHours = buildOpeningHours(
        res.currentOpeningHours?.periods || [],
      );

      return {
        internationalPhoneNumber: res.internationalPhoneNumber,
        openingHours: formattedOpeningHours,
        website: res.websiteUri,
        rating: res.rating,
        userRatingCount: res.userRatingCount,
        mapsItineraryUrl: res.googleMapsLinks?.directionsUri ?? null,
        businessStatus: res.businessStatus,
      };
    } catch (err) {
      throw new Error(`PlaceDetails error for placeId: ${placeId}: ${err}`);
    }
  },
};
