import type { Prettify } from "@optee/utils";
import { paginationRequestSchema } from "@optee/utils";
import z from "zod";
import { CONTACT_LEVELS, WORK_DOMAINS } from "./external-contact.constant";
import { frenchDepartmentsSchema } from "./france.constant";
import { dateRangeSchema, numberRangeSchema } from "./generic.constant";
import { IPE_USAGE_REASON } from "./ipe.constant";
import {
  EMPLOYEE_RANGES,
  LEGAL_ENTITY_FILTER_TYPES,
  LEGAL_ENTITY_TYPES,
  LEGAL_FORM,
  MAX_CONSTRUCTION_PERIOD,
} from "./legal-entity.constant";
import {
  BACKUP_HEATING_ENERGY_TYPES,
  dpeListFilterSchema,
  ECS_GENERATOR_TYPES,
  GLAZING_TYPES,
  HEATING_TYPES,
  INERTIA_CLASS,
  INSULATION_TYPES,
  ROOF_MATERIALS,
  VENTILATION_TYPES,
  WALL_MATERIALS,
} from "./location-bdnb.constant";
import {
  BUILDING_OCCUPANCY_STATUS,
  BUILDING_USAGE,
  BUILDING_USAGE_LABELS,
  type BuildingUsage,
  ENERGY_TYPES,
  HEATING_SYSTEMS,
  SECTOR_DATA,
} from "./location.constant";
import { LocationTypeNafCategoryEnum, NAF_CODES } from "./naf-code.constant";

export const formatBuildingUsageValue = (values: BuildingUsage[] | null) => {
  if (!values || values.length === 0) {
    return "";
  }

  if (values.length === BUILDING_USAGE.length) {
    return "";
  }

  return (
    values
      .slice(0, 2)
      .map((value) => BUILDING_USAGE_LABELS[value])
      .join(", ") + (values.length > 2 ? "..." : "")
  );
};

export const locationLegalEntitySortFields = [
  // location fields,
  "name",
  "surfaceThatRequiresHeating",
  "dpeLabel",
  "creationDate",
  "nbUnits",
  "annualElectricityConsumption",
  "nbRelatedPros",
  // legal entity fields
  "nbEmployeesRange",
  "type",
  "nbRelatedLocations",
  "mainBusinessActivity",
  "random",
] as const;

export const locationBdnbLegalEntityFilterProSchema = z.object({
  show: z.enum(["unlocked", "new", "all"]).nullish(),
  leadStatus: z.enum(["new", "archived", "all"]).nullish(),
  // Localisation
  locationDepartment: z.array(frenchDepartmentsSchema).nullish(),
  locationBuildingType: z.array(z.enum(NAF_CODES)).nullish(),
  sector: z.array(z.enum(SECTOR_DATA)).nullish(),
  address: z
    .string()
    .transform((s) => s.trim())
    .transform((s) => (s.length < 2 ? null : s))
    .nullish(),
  isInQpv: z.boolean().nullish(),

  // Typologie

  nbUnits: numberRangeSchema.nullish(),
  nbBuildings: numberRangeSchema.nullish(),
  nbLegalEntitiesPerLocation: numberRangeSchema.nullish(),
  buildingOccupancyStatus: z.array(z.enum(BUILDING_OCCUPANCY_STATUS)).nullish(),

  // Charactéristiques générales
  creationDate: dateRangeSchema.nullish(),
  maxConstructionPeriod: z.array(z.enum(MAX_CONSTRUCTION_PERIOD)).nullish(),
  nbParkingSpots: numberRangeSchema.nullish(),
  habitableSurfaceDwelling: numberRangeSchema.nullish(),
  pmrAccessible: z.boolean().nullish(),
  glazingType: z.array(z.enum(GLAZING_TYPES)).nullish(),
  exteriorWallInsulationType: z.array(z.enum(INSULATION_TYPES)).nullish(),
  lowerFloorInsulationType: z.array(z.enum(INSULATION_TYPES)).nullish(),
  upperFloorInsulationType: z.array(z.enum(INSULATION_TYPES)).nullish(),
  surfaceArea: numberRangeSchema.nullish(),
  habitableSurfaceArea: numberRangeSchema.nullish(),
  nbStoreys: numberRangeSchema.nullish(),
  glazingArea: numberRangeSchema.nullish(),
  dpeCertified: z.boolean().nullish(),
  inertiaClass: z.array(z.enum(INERTIA_CLASS)).nullish(),
  nbDwellings: numberRangeSchema.nullish(),

  // Énergie et performance énergétique
  heatingSystem: z.array(z.enum(HEATING_SYSTEMS)).nullish(),
  heatingType: z.array(z.enum(HEATING_TYPES)).nullish(),
  dpe: dpeListFilterSchema.nullish(),
  hasAirConditioning: z.boolean().nullish(),
  ventilationType: z.array(z.enum(VENTILATION_TYPES)).nullish(),
  ecsGeneratorType: z.array(z.enum(ECS_GENERATOR_TYPES)).nullish(),
  mainGesClass: dpeListFilterSchema.nullish(),
  dpeEstablishedDate: dateRangeSchema.nullish(),
  surfaceThatRequiresHeating: numberRangeSchema.nullish(),
  electricityConsumptionPerSquareMeter: numberRangeSchema.nullish(),
  greenhouseGasEmissionsPerSquareMeter: numberRangeSchema.nullish(),
  annualElectricityConsumption: numberRangeSchema.nullish(),

  //legal entity
  nbEmployeesRange: z.array(z.enum(EMPLOYEE_RANGES)).nullish(),
  legalEntityTypes: z.array(z.enum(LEGAL_ENTITY_FILTER_TYPES)).nullish(),
  tertiaryActivityType: z.array(z.enum(NAF_CODES)).nullish(),
  nbPremises: numberRangeSchema.nullish(),
  type: z.array(z.enum(LEGAL_ENTITY_TYPES)).nullish(),
  buildingUsage: z.array(z.enum(BUILDING_USAGE)).nullish(),
  ipeUsageReason: z.array(z.enum(IPE_USAGE_REASON)).nullish(),
  ipeNormalizedScore: numberRangeSchema.nullish(),
  legalForm: z.array(z.enum(LEGAL_FORM)).nullish(),
  mainBusinessActivity: z.array(z.string()).nullish(),
  domains: z.array(z.enum(WORK_DOMAINS)).nullish(),
  levels: z.array(z.enum(CONTACT_LEVELS)).nullish(),
  nbRelatedLocations: numberRangeSchema.nullish(),
  name: z.string().nullish(),
  zipCode: z.string().nullish(),
  legalEntityDepartment: z.array(frenchDepartmentsSchema).nullish(),

  // ? Passé à la trappe ?
  height: numberRangeSchema.nullish(),
  energyType: z.array(z.enum(ENERGY_TYPES)).nullish(),
  hasBalcony: z.boolean().nullish(),

  multipleExposedFacades: z.boolean().nullish(),

  heatingBackupEnergyType: z
    .array(z.enum(BACKUP_HEATING_ENERGY_TYPES))
    .nullish(),
  solarHeating: z.boolean().nullish(),
  solarEcs: z.boolean().nullish(),

  wallMaterial: z.array(z.enum(WALL_MATERIALS)).nullish(),
  roofMaterial: z.array(z.enum(ROOF_MATERIALS)).nullish(),

  legalEntityUuid: z.string().brand("LegalEntityUuid").nullish(), // must stay as string because schema is not accessible for UI

  sort: z
    .object({
      sortBy: z.enum(locationLegalEntitySortFields),
      sortOrder: z.enum(["asc", "desc"]),
    })
    .nullish(),
  maxResults: z.number().min(1).max(1000).nullish(),
});

export type LocationBdnbLegalEntityFilterPro = z.infer<
  typeof locationBdnbLegalEntityFilterProSchema
>;

export type LocationBdnbLegalEntityFilterProSort = z.infer<
  typeof locationBdnbLegalEntityFilterProSchema
>["sort"];

export const locationsBdnbLegalEntityProListInputSchema =
  locationBdnbLegalEntityFilterProSchema.and(paginationRequestSchema);
export type LocationsBdnbLegalEntityProListInput = Prettify<
  z.infer<typeof locationsBdnbLegalEntityProListInputSchema>
>;

export const leadGeneratorSchema = z.object({
  placeForm: z.object({
    buildingUsage: z.array(z.enum(BUILDING_USAGE)),
    ownershipStructure: z.enum(["single", "multiple"]).nullable(),
    locationDepartment: z.array(frenchDepartmentsSchema),
  }),
  advancedForm: z.object({
    creationDate: dateRangeSchema.nullable(),
    habitableSurfaceArea: numberRangeSchema.nullable(),
    nbStoreys: numberRangeSchema.nullable(),
    nbUnits: numberRangeSchema.nullable(),
    nbParkingSpots: numberRangeSchema.nullable(),
    glazingType: z.array(z.enum(GLAZING_TYPES)),
    exteriorWallInsulationType: z.array(z.enum(INSULATION_TYPES)),
    hasAirConditioning: z.boolean().nullable(),
    dpe: dpeListFilterSchema.nullable(),
    energyType: z.array(z.enum(ENERGY_TYPES)),
    annualElectricityConsumption: numberRangeSchema.nullable(),
    greenhouseGasEmissionsPerSquareMeter: numberRangeSchema.nullable(),
  }),
  legalEntityForm: z.object({
    types: z.array(z.nativeEnum(LocationTypeNafCategoryEnum)),
    nbLocations: numberRangeSchema.nullable(),
    nbEmployees: numberRangeSchema.nullable(),
  }),
  technicalConstraintsForm: z.object({
    energyType: z.array(z.enum(ENERGY_TYPES)),
    annualElectricityConsumption: numberRangeSchema.nullable(),
    heatingSystem: z.array(z.enum(HEATING_SYSTEMS)).nullable(),
    dpe: dpeListFilterSchema.nullable(),
    nbUnits: numberRangeSchema.nullable(),
    nbParkingSpots: numberRangeSchema.nullable(),
    surfaceThatRequiresHeating: numberRangeSchema.nullable(),
    nbStoreys: numberRangeSchema.nullable(),
  }),
});
export type LeadGeneratorForm = z.infer<typeof leadGeneratorSchema>;
