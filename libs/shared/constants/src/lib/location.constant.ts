import type { Prettify } from "@optee/utils";
import { paginationRequestSchema } from "@optee/utils";
import { z } from "zod";
import { PRO_LOCATION_ASSOCIATIONS_LABEL_DATA } from "./associations.constant";
import type { ClimateZone } from "./france.constant";
import { CLIMATE_ZONES, frenchDepartmentsSchema } from "./france.constant";
import { numberRangeSchema } from "./generic.constant";
import type { LegalEntityType } from "./legal-entity.constant";
import { LEGAL_ENTITY_TYPES } from "./legal-entity.constant";

// SECTORS
export const SECTOR = {
  RESIDENTIAL: "resi",
  TERTIARY: "ter",
  INDUSTRIAL: "indu",
  RESIDENTIAL_COLLECTIVE: "Résidentiel collectif",
  OTHER: "Autre",
} as const;

export const SECTOR_DATA = [
  SECTOR.RESIDENTIAL,
  SECTOR.TERTIARY,
  SECTOR.INDUSTRIAL,
  SECTOR.RESIDENTIAL_COLLECTIVE,
  SECTOR.OTHER,
] as const;

export type Sector = (typeof SECTOR_DATA)[number];

export const MAIN_SECTORS = [
  SECTOR.RESIDENTIAL,
  SECTOR.TERTIARY,
] as const satisfies Sector[];
export type MainSector = (typeof MAIN_SECTORS)[number];

export const BUILDING_USAGE = [
  "residential",
  "tertiary",
  "industrial",
  "other",
] as const;

export type BuildingUsage = (typeof BUILDING_USAGE)[number];

export const BUILDING_USAGE_LABELS = {
  residential: "Résidentiel",
  tertiary: "Tertiaire",
  industrial: "Industrie",
  other: "Autre",
} as const satisfies Record<BuildingUsage, string>;

export const BUILDING_OCCUPANCY_STATUS = [
  "OWNER",
  "OWNER_OCCUPANT",
  "SYNDIC",
  "MIXED",
] as const;

export type BuildingOccupancyStatus =
  (typeof BUILDING_OCCUPANCY_STATUS)[number];

export type BuildingOccupancyCounts = {
  siretCount: number;
  sirenOnlyCount: number;
};

export const BUILDING_OCCUPANCY_STATUS_LABELS = {
  OWNER: "Propriétaire",
  OWNER_OCCUPANT: "Exploitant",
  SYNDIC: "Gestionnaire",
  MIXED: "Multi-Acteurs",
} as const satisfies Record<BuildingOccupancyStatus, string>;

export function getLegalEntityOccupancyStatus(entity: {
  type: LegalEntityType | null;
  siret: string | null;
}) {
  if (entity.type === "copro") {
    return "SYNDIC" as const;
  }
  // if (entity.siret) {
  //   return "OWNER_OCCUPANT" as const;
  // }
  return "OWNER" as const;
}

const BUILDING_OCCUPANCY_STATUS_KNOWN = [
  "OWNER",
  "OWNER_OCCUPANT",
  "SYNDIC",
  "MIXED",
] as const;
export type BuildingOccupancyStatusKnown =
  (typeof BUILDING_OCCUPANCY_STATUS_KNOWN)[number];

type BuildingOccupancyStatusRule = {
  status: BuildingOccupancyStatusKnown;
  syndic?: boolean;
  siret: { eq?: number; min?: number };
  sirenOnly?: { eq?: number };
};

/**
 * Rules
 * - Si copro, alors SYNDIC
 * - Sinon, si plusieurs siret, alors MIXED
 * - Sinon, si 1 siret, alors OWNER_OCCUPANT
 * - Sinon, si 0 siret et 1 siren, alors OWNER
 * - Sinon, inconnu
 */
export const BUILDING_OCCUPANCY_STATUS_RULES: ReadonlyArray<BuildingOccupancyStatusRule> =
  [
    {
      status: "SYNDIC",
      syndic: true,
      siret: {},
    },
    {
      status: "MIXED",
      syndic: false,
      siret: { min: 2 },
    },
    {
      status: "OWNER_OCCUPANT",
      syndic: false,
      siret: { eq: 1 },
    },
    {
      status: "OWNER",
      syndic: false,
      siret: { eq: 0 },
      sirenOnly: { eq: 1 },
    },
  ];

export const getBuildingOccupancyStatus = (
  siretCount: number,
  sirenOnlyCount: number,
  hasSyndic = false,
) => {
  for (const rule of BUILDING_OCCUPANCY_STATUS_RULES) {
    const matchesSyndic =
      rule.syndic === undefined || rule.syndic === hasSyndic;
    const matchesSiretEq =
      rule.siret.eq === undefined || siretCount === rule.siret.eq;
    const matchesSiretMin =
      rule.siret.min === undefined || siretCount >= rule.siret.min;
    const matchesSirenOnlyEq =
      rule.sirenOnly?.eq === undefined || sirenOnlyCount === rule.sirenOnly.eq;

    if (
      matchesSyndic &&
      matchesSiretEq &&
      matchesSiretMin &&
      matchesSirenOnlyEq
    ) {
      return rule.status;
    }
  }
  return;
};

export const LOCATION_SECTORS = {
  [SECTOR.RESIDENTIAL]: "Résidentiel",
  [SECTOR.TERTIARY]: "Tertiaire",
  [SECTOR.INDUSTRIAL]: "Industriel",
  [SECTOR.RESIDENTIAL_COLLECTIVE]: "Résidentiel collectif",
  [SECTOR.OTHER]: "Autre",
} as const satisfies Record<Sector, string>;

export type SectorLabel =
  (typeof LOCATION_SECTORS)[keyof typeof LOCATION_SECTORS];

export const SectorStringSchema = z.union([
  z.string(),
  z.record(z.enum(MAIN_SECTORS), z.string()).optional(),
]);

export const SectorZoneNumberSchema = z.union([
  z.number(),
  z.record(z.enum(MAIN_SECTORS), z.number()),
  z.record(z.enum(MAIN_SECTORS), z.record(z.enum(CLIMATE_ZONES), z.number())),
]);
export type SectorZoneNumber = z.infer<typeof SectorZoneNumberSchema>;

// @todo Typiquement le genre de truc qui devrait avoir ses tests
export const extractSectorZoneNumber = ({
  data,
  mainSector,
  climateZone,
}: {
  data: SectorZoneNumber;
  mainSector: MainSector;
  climateZone: ClimateZone;
}) => {
  if (!data) {
    return null;
  }

  if (typeof data === "number") {
    return data;
  }

  const sectorData = data[mainSector];
  if (!sectorData) {
    return null;
  }

  if (typeof sectorData === "number") {
    return sectorData;
  }

  const sectorZoneData = sectorData[climateZone];
  if (!sectorZoneData) {
    return null;
  }

  return sectorZoneData;
};

// ENERGY TYPES

export const ENERGY_TYPES = [
  "Gaz",
  "Electrique",
  "Fioul",
  "Géothermie",
  "Biomasse",
  "Autres",
  "reseau de chaleur",
] as const;

export type EnergyType = (typeof ENERGY_TYPES)[number];

export const FILTERED_ENERGY_TYPES = ENERGY_TYPES.filter(
  (energy) => energy !== "reseau de chaleur",
);

// HEATING TYPES

export const HEATING_SYSTEMS = [
  "Non connu",
  "Individuel",
  "Collectif chaufferie",
  "Collectif urbain",
  "collectif",
  "Autre",
] as const;

export type HeatingSystem = (typeof HEATING_SYSTEMS)[number];

export const COLLECTIVE_AND_INDIVIDUAL_HEATING_SYSTEMS = [
  "collectif",
  "Individuel",
] as const;

// LOCATION ADDRESS

export const LOCATION_ADDRESS_DETAILS = z.object({
  streetNumber: z.string().nullish(),
  streetName: z.string().nullish(),
  zipcode: z.string(),
  city: z.string(),
});

export type LocationAddressDetails = z.infer<typeof LOCATION_ADDRESS_DETAILS>;

export const LOCATION_PLACE_DETAILS = z.object({
  name: z.string().nullish(),
  formattedAddress: z.string().nullish(),
  googlePlaceId: z.string().nullish(),
  longitude: z.number().nullish(),
  latitude: z.number().nullish(),
});

export type LocationPlaceDetails = z.infer<typeof LOCATION_PLACE_DETAILS>;

export const EstimatedCostParamsSchema = z.object({
  surfaceArea: z.number(),
  mainSector: z.enum(MAIN_SECTORS),
});

export enum XFactorsKey {
  SURFACE_AREA = "surfaceArea",
  FACADE_AREA = "facadeArea",
  GLAZING_AREA = "glazingArea",
  NB_STOREYS = "nbStoreys",
  NB_UNITS = "nbUnits",
  NB_BUILDINGS = "nbBuildings",
  MAIN_SECTOR = "mainSector",
  CLIMATE_ZONE = "climateZone",
  ELECTRICITY_CONSUMPTION_PER_SQUARE_METER = "electricityConsumptionPerSquareMeter",
}

// X FACTOR PARAMS
export const XFactorParamsSchema = z.object({
  surfaceArea: z.number().nullish(),
  facadeArea: z.number().nullish(),
  glazingArea: z.number().nullish(),
  nbStoreys: z.number().nullish(),
  nbUnits: z.number().nullish(),
  nbBuildings: z.number().nullish(),
  mainSector: z.enum(MAIN_SECTORS).nullish(),
  climateZone: z.enum(CLIMATE_ZONES).nullish(),
  electricityConsumptionPerSquareMeter: z.number().nullish(),
});

export type XFactorParams = z.infer<typeof XFactorParamsSchema>;

export const X_FACTOR_LABELS = {
  surfaceArea: "Emprise au sol",
  facadeArea: "Surface de la façade",
  glazingArea: "Surface vitrée",
  nbStoreys: "Nombre de niveaux",
  nbUnits: "Nombre de lots",
  nbBuildings: "Nombre de sites",
  mainSector: "Secteur",
  climateZone: "Zone climatique",
  electricityConsumptionPerSquareMeter: "Conso/m²",
} as const satisfies Record<XFactorsKey, string>;

export const DPE_LABELS = ["A", "B", "C", "D", "E", "F", "G"] as const;
export type DpeLabel = (typeof DPE_LABELS)[number];

export const AT_RISK_DPE_LABELS: DpeLabel[] = ["E", "F", "G"];

export const DPE_BY_KWH: Record<DpeLabel, number> = {
  A: 70,
  B: 110,
  C: 180,
  D: 250,
  E: 330,
  F: 420,
  G: 421,
};

export function getDpeLabel(kwh: number | null): DpeLabel | "NC" {
  if (kwh === null) {
    return "NC";
  }
  if (kwh <= DPE_BY_KWH.A) {
    return "A";
  } else if (kwh <= DPE_BY_KWH.B) {
    return "B";
  } else if (kwh <= DPE_BY_KWH.C) {
    return "C";
  } else if (kwh <= DPE_BY_KWH.D) {
    return "D";
  } else if (kwh <= DPE_BY_KWH.E) {
    return "E";
  } else if (kwh <= DPE_BY_KWH.F) {
    return "F";
  }
  // At or above the G threshold.
  return "G";
}

export function getDpeLabelColor(label: DpeLabel | "NC" | "?"): string {
  switch (label) {
    case "A":
      return "#05AC79";
    case "B":
      return "#52B153";
    case "C":
      return "#79BD76";
    case "D":
      return "#F4E711";
    case "E":
      return "#F0B510";
    case "F":
      return "#EB8235";
    case "G":
      return "#D8221F";
    default:
      return "#6c6c6a";
  }
}

export const locationFilterProSchema = z.object({
  department: z.array(frenchDepartmentsSchema).nullish(),
  sector: z.array(z.enum(MAIN_SECTORS)).nullish(),
  surfaceThatRequiresHeating: numberRangeSchema.nullish(),
  creationDate: z.tuple([z.date().nullable(), z.date().nullable()]).nullish(),
  heatingSystem: z.array(z.enum(HEATING_SYSTEMS)).nullish(),
  dpe: z.array(z.string().nullable()).nullish(),
  associationTypes: z
    .array(z.enum(PRO_LOCATION_ASSOCIATIONS_LABEL_DATA).nullable())
    .nullish(),
  glazingArea: numberRangeSchema.nullish(),
  surfaceArea: numberRangeSchema.nullish(),
  height: numberRangeSchema.nullish(),
  nbStoreys: numberRangeSchema.nullish(),
  nbUnits: numberRangeSchema.nullish(),
  nbBuildings: numberRangeSchema.nullish(),
  energyType: z.array(z.enum(ENERGY_TYPES)).nullish(),
  search: z
    .string()
    .transform((s) => s.trim())
    .transform((s) => (s.length < 2 ? null : s))
    .nullable()
    .nullish(),
  legalEntityType: z.array(z.enum(LEGAL_ENTITY_TYPES)).nullish(),
  isIndustrial: z.boolean().nullish(),
});
export type LocationFilterPro = z.infer<typeof locationFilterProSchema>;

export const locationsProListInputSchema = locationFilterProSchema.and(
  paginationRequestSchema,
);
export type LocationsProListInput = Prettify<
  z.infer<typeof locationsProListInputSchema>
>;

export const LOCATION_FILTER_RANGES: Record<
  | "SURFACE_HEATED"
  | "SURFACE_AREA"
  | "GLAZING_AREA"
  | "HEIGHT"
  | "NB_STOREYS"
  | "NB_UNITS"
  | "NB_BUILDINGS"
  | "GES_EMISSIONS"
  | "PARKING_SPACES"
  | "ELECTRICITY_CONSUMPTION"
  | "ANNUAL_ELEC_CONSUMPTION_2020"
  | "ANNUAL_GAZ_CONSUMPTION_2020"
  | "HABITABLE_SURFACE_AREA"
  | "ANNUAL_ELEC_COST"
  | "RELATED_LEGAL_ENTITIES",
  [number, number]
> = {
  SURFACE_HEATED: [0, 100_000],
  SURFACE_AREA: [1, 20_000],
  GLAZING_AREA: [1, 10_000],
  HEIGHT: [5, 70],
  NB_STOREYS: [0, 50],
  NB_UNITS: [1, 5000],
  NB_BUILDINGS: [1, 100],
  GES_EMISSIONS: [0, 200], // kgCO₂eq/m²/an
  PARKING_SPACES: [0, 300],
  ELECTRICITY_CONSUMPTION: [0, 500], // kWh/m²/an
  ANNUAL_ELEC_CONSUMPTION_2020: [0, 15_000_000], // kWh/an
  ANNUAL_GAZ_CONSUMPTION_2020: [0, 15_000_000], // kWh/an
  HABITABLE_SURFACE_AREA: [0, 10_000],
  ANNUAL_ELEC_COST: [1, 10_000_000],
  RELATED_LEGAL_ENTITIES: [1, 200],
};

export const GLOBAL_DATE_RANGE: [Date, Date] = [
  new Date(1600, 0, 1),
  new Date(),
];
