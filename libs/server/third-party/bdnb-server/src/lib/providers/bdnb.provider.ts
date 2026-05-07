import type { BdnbGeomGroup, Sector } from "@optee/constants";
import {
  apiBdnbUrl,
  BDNB_API_RESPONSE_SCHEMA,
  formatAPIResponse,
} from "@optee/constants";
import type { LocationAddressData } from "@optee/models";
import { Location } from "@optee/models";
import { isNotNullish } from "@optee/utils";
import { z } from "zod";

const geocodingResponseSchema = z.object({
  features: z.array(
    z.object({
      properties: z.object({
        id: z.string(),
      }),
    }),
  ),
});

export const BdnbProvider = {
  // https://api-portail.bdnb.io/catalog/api/f4905edc-db58-3a3b-a8e5-c5dfc6692ee5/doc?page=95b101b8-c46a-4ddd-b101-b8c46aaddd19#les-routes-donnees-et-metadonnee
  getAddressCleInterop: async ({
    address,
    latitude,
    longitude,
  }: {
    address: string;
    latitude?: number | null;
    longitude?: number | null;
  }) => {
    try {
      const additionalParams =
        latitude && longitude ? `&lat=${latitude}&lon=${longitude}` : "";

      const geocodingUrl = `https://api.bdnb.io/v1/bdnb/geocodage?q=${address}&autocomplete=0${additionalParams}`;
      const geocodingResponse = await fetch(geocodingUrl);

      if (!geocodingResponse.ok) {
        throw new Error(
          `L'API BDNB n'a pas réussi à géocoder cette adresse. HTTP Status: ${geocodingResponse.status}, URL: ${geocodingUrl}`,
        );
      }

      const geocodingData = geocodingResponseSchema.parse(
        await geocodingResponse.json(),
      );

      const firstBuilding = geocodingData.features[0];
      if (!firstBuilding) {
        throw new Error(
          `L'API BDNB n'a trouvé aucun site à cette adresse : ${address}`,
        );
      }

      const cle_interop_adr = firstBuilding.properties?.id;
      if (!cle_interop_adr) {
        throw new Error(
          `L'API BDNB n'a trouvé aucun ID de site correspondant à cette adresse: ${address}`,
        );
      }

      return cle_interop_adr;
    } catch (error) {
      throw new Error(
        `Une erreur est survenue en essayant de géocoder cette adresse via BDNB `,
      );
    }
  },

  // Source: https://api-portail.bdnb.io/catalog/api/f4905edc-db58-3a3b-a8e5-c5dfc6692ee5/doc?page=39ca1b93-4d44-449a-8a1b-934d44e49af9#vous-cherchez-des-donn%C3%A9es-sur-des-b%C3%A2timents-avec-des-identifiants-sp%C3%A9cifiques
  // On trouve le batimentGroupId notamment dans l'URL de la page sur GoRenove
  // Ex: https://particulier.gorenove.fr/map?bnb_id=bdnb-bg-LFGU-UWL5-BLV8
  getUrlFromBatimentGroup: ({
    batimentGroupId,
  }: {
    batimentGroupId: string;
  }) => {
    return `${apiBdnbUrl}${batimentGroupId}&limit=1`;
  },

  getUrlFromCleInterop: ({ cleInterop }: { cleInterop: string }) => {
    return `https://api.bdnb.io/v1/bdnb/donnees/batiment_groupe_complet/adresse?cle_interop_adr=eq.${cleInterop}&limit=1`;
  },

  fetchBuildingData: async ({
    buildingDataUrl,
  }: {
    buildingDataUrl: string;
  }) => {
    try {
      const buildingDataResponse = await fetch(buildingDataUrl);

      if (!buildingDataResponse.ok) {
        throw new Error(
          `Une erreur est survenue dans la récupération de data auprès de BDNB. HTTP Status: ${buildingDataResponse.status}, URL: ${buildingDataUrl}`,
        );
      }

      const apiData = await buildingDataResponse.json();

      if (!Array.isArray(apiData) || apiData.length === 0) {
        throw new Error(
          `BDNB n'a pas pu récupérer d'informations pour ce site: ${buildingDataUrl}. Received: ${JSON.stringify(apiData)}`,
        );
      }

      return BDNB_API_RESPONSE_SCHEMA.parse(apiData[0]);
    } catch (error) {
      throw new Error(
        "Une erreur inconnue est survenue. BDNB n'a pas pu récupérer d'informations pour le site correspondant.",
      );
    }
  },

  getDataFromAddress: async ({
    address,
    latitude,
    longitude,
  }: {
    address: string;
    latitude?: number | null;
    longitude?: number | null;
  }) => {
    try {
      const cleInterop = await BdnbProvider.getAddressCleInterop({
        address,
        latitude,
        longitude,
      });
      const buildingDataUrl = BdnbProvider.getUrlFromCleInterop({ cleInterop });
      const rawData = await BdnbProvider.fetchBuildingData({ buildingDataUrl });
      const formattedData = formatAPIResponse(rawData);

      return {
        rawData,
        formattedData,
      };
    } catch (error) {
      return null;
    }
  },

  getDataFromBatimentGroup: async ({
    batimentGroupId,
  }: {
    batimentGroupId: string;
  }) => {
    try {
      const buildingDataUrl = BdnbProvider.getUrlFromBatimentGroup({
        batimentGroupId,
      });
      const rawData = await BdnbProvider.fetchBuildingData({ buildingDataUrl });
      const formattedData = formatAPIResponse(rawData);

      return {
        rawData,
        formattedData,
      };
    } catch (error) {
      return null;
    }
  },

  parseDate(raw: any, type: "jsonYear" | "floatYear" | "datetime") {
    if (!raw) {
      return null;
    }

    try {
      if (type === "jsonYear") {
        const parsed = JSON.parse(raw);
        const year = Array.isArray(parsed) ? parsed[0] : parsed;
        return `${year}-01-01`;
      }

      if (type === "floatYear") {
        const year = Math.floor(Number(raw));
        return `${year}-01-01`;
      }

      // Handle 'DD/MM/YYYY HH:mm' format safely
      if (type === "datetime") {
        let date: Date;
        if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(raw)) {
          const [datePart, timePart] = raw.split(" ");
          const [day, month, year] = datePart.split("/").map(Number);
          const [hour, minute] = timePart.split(":").map(Number);
          date = new Date(Date.UTC(year, month - 1, day, hour, minute));
        } else {
          date = new Date(raw);
        }
        return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
      }
    } catch (err) {
      console.error(`❌ Parse error for ${type}: `, { err, raw });
    }

    return null;
  },

  parseBoolean(value: any) {
    if (value === null || value === "") {
      return false;
    }

    const num = Number(value);
    if (isNaN(num)) {
      return false;
    }

    return num === 1;
  },

  parseSector(raw: string | null) {
    if (!raw || raw.trim() === "Indifférencié") {
      return null;
    }

    switch (raw.trim()) {
      case "Dépendance":
      case "Secondaire":
        return "Autre";
      case "Résidentiel collectif":
        return "Résidentiel collectif";
      case "Résidentiel individuel":
        return "resi";
      case "Tertiaire":
        return "ter";
      default:
        return null;
    }
  },

  parseTypeEnergie(raw: string | null) {
    if (!raw || raw.trim() === "") {
      return null;
    }

    const normalized = raw.toLowerCase().trim();

    if (normalized === "bois") {
      return "Biomasse";
    }
    if (normalized === "charbon") {
      return "Autres";
    }
    if (normalized === "electricite") {
      return "Electrique";
    }
    if (normalized === "fioul") {
      return "Fioul";
    }
    if (normalized === "gaz") {
      return "Gaz";
    }
    return "Autres";
  },

  parseHeatingSystem(raw: string | null) {
    if (!raw || raw.trim() === "") {
      return null;
    }

    const normalized = raw.toLowerCase().trim();

    if (normalized === "individuel") {
      return "Individuel";
    }
    if (normalized === "collectif") {
      return "collectif";
    }
    return "Autre";
  },

  extractAddress(address: string): LocationAddressData {
    // Regex to match French addresses: [number][optional letter][street name][zipcode][city]
    // Example: "19 RUE DU PROFESSEUR MARILLER 78690 Saint-Rémy-l'Honoré"
    const regex = /^\s*(\d+[A-Za-z]?)\s+(.+?)\s+(\d{5})\s+(.+?)\s*$/u;

    let streetNumber: string | null = null;
    let streetName: string | null = null;
    let zipcode: string | null = null;
    let city: string | null = null;

    const match = regex.exec(address.trim());

    if (match) {
      streetNumber = match[1] ?? null;
      streetName = match[2]?.trim() ?? null;
      zipcode = match[3] ?? null;
      city = match[4]?.trim() ?? null;
    } else {
      // Fallback: try to extract zipcode and city at least
      const zipCityRegex = /(\d{5})\s+(.+)$/u;
      const zipCityMatch = zipCityRegex.exec(address.trim());
      if (zipCityMatch) {
        zipcode = zipCityMatch[1] ?? null;
        city = zipCityMatch[2]?.trim() ?? null;
        // Try to get street part
        const streetPart = address.slice(0, zipCityMatch.index).trim();
        if (streetPart) {
          const streetMatch = streetPart.match(/^([\d]+[A-Za-z]?)\s+(.+)$/u);
          if (streetMatch) {
            streetNumber = streetMatch[1] ?? null;
            streetName = streetMatch[2]?.trim() ?? null;
          } else {
            streetName = streetPart;
          }
        }
      } else {
        // If nothing matches, put the whole address as streetName
        streetName = address.trim();
      }
    }

    return {
      streetNumber,
      streetName: streetName?.split(",")[0]?.trim() ?? null,
      zipcode,
      city: city?.split(",")[0]?.trim() ?? null,
    };
  },

  getFacadeArea(geomGroup: BdnbGeomGroup | null, height: number | null) {
    if (geomGroup && height) {
      const perimeter = geomGroup.coordinates
        .map((coords) => coords[0])
        .filter(isNotNullish)
        .map((coord) => Location.calculatePerimeter(coord))
        .reduce((sum: number, p: number) => sum + p, 0);

      return perimeter ? perimeter * height : null;
    }

    return null;
  },

  getGlazingArea(
    facadeArea: number | null,
    glazingSurfacePercentage: number | null,
  ) {
    if (facadeArea && glazingSurfacePercentage) {
      return Location.estimateGlazingArea({
        facadeArea: facadeArea,
        glazingSurfacePercentage: glazingSurfacePercentage,
      });
    }
    return null;
  },

  getSurfaceThatRequiresHeating(
    surfaceArea: number | null,
    nbStoreys: number | null,
    sector: string | null,
  ) {
    if (surfaceArea && nbStoreys) {
      const totalSurface = surfaceArea * nbStoreys;

      return sector === "Résidentiel individuel"
        ? totalSurface * 0.7
        : totalSurface * 0.5;
    }
    return null;
  },

  getEnergyConsumptionDetails(
    energyConsumption: number | null | undefined,
    creationYear: number | null,
    sector: Sector | null,
  ) {
    if (!energyConsumption && creationYear) {
      return Location.calculateEstimatedEnergyConsumption(creationYear, sector);
    }
    return energyConsumption;
  },
};
