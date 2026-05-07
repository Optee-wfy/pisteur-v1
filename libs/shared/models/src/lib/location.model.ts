import type {
  BackupHeatingEnergyType,
  BdnbApiResponse,
  BdnbCoordinate,
  BdnbGeomGroup,
  BuildingTypeDpe,
  BuildingUsage,
  Department,
  DpeConstructionPeriod,
  DpeLabel,
  ECSGeneratorTypeCode,
  EcsInstallationType,
  EnergyType,
  GlazingType,
  HeatingGeneratorAge,
  HeatingSystem,
  InsulationType,
  IpeEffectiveUsage,
  IpeUsageReason,
  LegalEntityType,
  MainSector,
  MaxConstructionPeriod,
  OperationHubspotPrestationId,
  ReferenceCompanySelectionReason,
  RoofMaterial,
  Sector,
  SectorLabel,
  ShutterTypeCode,
  VentilationTypeCode,
  WallMaterial,
  WallStructureMaterialCode,
  WindowMaterialType,
} from "@optee/constants";
import {
  BDNB_API_RESPONSE_SCHEMA,
  BDNB_GEOM_GROUP,
  BUILDING_TYPE_DPE,
  BUILDING_USAGE,
  DPE_CONSTRUCTION_PERIOD,
  DPE_LABELS,
  ECS_INSTALLATION_TYPE,
  ENERGY_TYPES,
  frenchDepartmentsSchema,
  getClimateZone,
  getLegalEntityTypeLabel,
  getTypeByHubspotPrestationId,
  GLAZING_TYPES,
  HEATING_GENERATOR_AGES,
  HEATING_SYSTEMS,
  INSULATION_TYPES,
  IPE_EFFECTIVE_USAGE,
  IPE_USAGE_REASON,
  KWH_PRICE,
  LEGAL_ENTITY_TYPES,
  LOCATION_SECTORS,
  MAX_CONSTRUCTION_PERIOD,
  REFERENCE_COMPANY_SELECTION_REASONS,
  SECTOR_DATA,
  SHUTTER_TYPES,
  VENTILATION_TYPES,
  WALL_STRUCTURE_MATERIALS,
  WINDOW_MATERIAL_TYPE,
  X_FACTOR_LABELS,
  XFactorsKey,
} from "@optee/constants";
import { isNotNullish, normalize } from "@optee/utils";
import z, { ZodError } from "zod";
import type { HubspotLocation, LocationBdnb } from "./schema";
import { LocationBdnbUuid, LocationHsId, LocationUuid } from "./schema";

export const locationBdnbSchema = z.object({
  sector: z.enum(SECTOR_DATA).nullish(),
  buildingUsage: z.enum(BUILDING_USAGE).nullish(),
  energyType: z.enum(ENERGY_TYPES).nullish(),
  heatingSystem: z.enum(HEATING_SYSTEMS).nullish(),
  nbBuildings: z.number().nullish(),
  nbUnits: z.number().nullish(),
  surfaceArea: z.number().nullish(),
  height: z.number().nullish(),
  glazingSurfacePercentage: z.number().nullish(),
  electricityConsumptionPerSquareMeter: z.number().nullish(),
  greenhouseGasEmissionsPerSquareMeter: z.number().nullish(),
  nbStoreys: z.number().nullish(),
  creationDate: z.string().nullish(),
  heatingType: z.string().nullish(),
  dpeLabel: z.enum(DPE_LABELS).nullish(),
  geomGroup: BDNB_GEOM_GROUP.nullish(),
  facadeArea: z.number().nullish(),
  glazingArea: z.number().nullish(),
  surfaceThatRequiresHeating: z.number().nullish(),
  meanHeight: z.number().nullish(),
  inertiaClass: z.string().nullish(),
  hasBalcony: z.boolean().nullish(),
  nbDwellings: z.number().nullish(),
  nbDwellingsRnc: z.number().nullish(),
  nbTertiaryLotsRnc: z.number().nullish(),
  nbResElec2020: z.number().nullish(),
  nbProElec2020: z.number().nullish(),
  nbProGaz2020: z.number().nullish(),
  nbResGaz2020: z.number().nullish(),
  arrete2021: z.boolean().nullish(),
  dpeIdentifier: z.string().nullish(),
  gesEmissions5UsesPerM2: z.number().nullish(),
  gesEmissions3UsesEpM2Arrete2012: z.number().nullish(),
  ventilationType: z.string().nullish(),
  acGeneratorType: z.string().nullish(),
  exteriorWallUValue: z.number().nullish(),
  lowerFloorFinalUValue: z.number().nullish(),
  upperFloorUValue: z.number().nullish(),
  glazingType: z.string().nullish(),
  gasLayerType: z.string().nullish(),
  virGlazing: z.boolean().nullish(),
  windowUValue: z.number().nullish(),
  windowSolarFactor: z.number().nullish(),
  ipeRawScore: z.number().nullish(),
  ipeUsage: z.enum(IPE_EFFECTIVE_USAGE).nullish(),
  ipeUsageReason: z.enum(IPE_USAGE_REASON).nullish(),
  referenceCompanyUuid: z.string().uuid().nullish(),
  referenceCompanySelectionReason: z
    .enum(REFERENCE_COMPANY_SELECTION_REASONS)
    .nullish(),
  proElecConsumption2020: z.number().nullish(),
  resElecConsumption2020: z.number().nullish(),
  proGazConsumption2020: z.number().nullish(),
  resGazConsumption2020: z.number().nullish(),
  networkId: z.string().nullish(),
  radonRisk: z.string().nullish(),
  clayRisk: z.string().nullish(),
  priorityDistrict: z.boolean().nullish(),
  districtNameQpv: z.string().nullish(),
  qpvCode: z.string().nullish(),

  // heatingBackupEnergyType: z.enum(BACKUP_HEATING_ENERGY_TYPES).nullish(),
  // wallMaterial: z.enum(WALL_MATERIALS).nullish(),
  // roofMaterial: z.enum(ROOF_MATERIALS).nullish(),
  // // heatingGeneratorAge: z.enum(HEATING_GENERATOR_AGES).nullish(),
});

const opteeLocationSchema = z.object({
  windowMaterialType: z.string().nullish(),
  shutterType: z.string().nullish(),
  dpeAssessmentClass: z.string().nullish(),
  acGeneratorAge: z.string().nullish(),
});

const insulationBdnbSchema = z.object({
  exteriorWallInsulationType: z.string().nullish(),
  lowerFloorInsulationType: z.string().nullish(),
  upperFloorInsulationType: z.string().nullish(),
});

export type HubspotLocationBdnbData = z.infer<typeof locationBdnbSchema> &
  z.infer<typeof insulationBdnbSchema> &
  z.infer<typeof opteeLocationSchema>;

export const locationSchema = locationBdnbSchema.extend({
  uuid: z.union([LocationUuid, LocationBdnbUuid]),
  streetNumber: z.string().nullish(),
  streetName: z.string().nullish(),
  zipcode: z.string(),
  department: frenchDepartmentsSchema.nullish(),
  city: z.string(),
  streetViewUrl: z.string().nullish(),
  bdnbFailure: z.boolean().nullish(),
  googlePlaceId: z.string().nullish(),
  longitude: z.number().nullish(),
  latitude: z.number().nullish(),
  name: z.string().nullish(),
  id: LocationHsId.nullish(), // Might not be synced with HubSpot yet
  nameContactOnSite: z.string().nullish(),
  phoneContactOnSite: z.string().nullish(),
  rawBdnb: BDNB_API_RESPONSE_SCHEMA.nullish(),
});

export type LocationContactOnSite = {
  firstName: string;
  lastName: string;
  phone: string | null;
};

export type LocationAddressData = {
  streetNumber?: string | null;
  streetName?: string | null;
  zipcode?: string | null;
  city?: string | null;
};

export abstract class BaseLocation {
  abstract type: "optee" | "external";
  streetNumber?: string | null;
  streetName?: string | null;
  streetViewUrl: string;
  city: string;
  zipcode: string;
  department: Department | null;
  bdnbFailure: boolean;
  bdnbFailureEmoji: string;
  googlePlaceId: string | null;
  longitude: number | null;
  latitude: number | null;
  buildingUsage: BuildingUsage | null;
  energyType: EnergyType | null;
  heatingSystem: HeatingSystem | null;
  heatingType: string | null;
  name: string | null;
  creationDate: Date | null;
  sector: MainSector | null;
  initialSector: Sector | null;
  nbBuildings: number | null;
  nbUnits: number | null;
  surfaceArea: number | null;
  height: number | null;
  glazingType: string | null;
  glazingSurfacePercentage: number | null;
  electricityConsumptionPerSquareMeter: number | null;
  greenhouseGasEmissionsPerSquareMeter: number | null;
  nbStoreys: number | null;
  dpeLabel: DpeLabel | null;
  rawBdnb: BdnbApiResponse | null;
  geomGroup: BdnbGeomGroup | null;
  facadeArea: number | null;
  glazingArea: number | null;
  perimeters: number[] | null;
  perimeter: number | null;
  surfaceThatRequiresHeating: number | null;
  annualElectricityCost?: number;
  annualElectricityCostPerUnit?: number;
  monthlyElectricityCostPerUnit?: number;
  annualGhg?: number;
  annualElectricityConsumption?: number;
  ipeRawScore?: number | null;
  ipeUsage?: IpeEffectiveUsage | null;
  ipeUsageReason?: IpeUsageReason | null;
  referenceCompanyUuid?: string | null;
  referenceCompanySelectionReason?: ReferenceCompanySelectionReason | null;
  uncertainData: Array<keyof Location>;
  needsBdnbCheck: boolean;
  missingXFactorsForEnergyImpact: XFactorsKey[];
  missingXFactorsForEnergyImpactLabel: string;
  meanHeight: number | null;
  inertiaClass: string | null;
  hasBalcony: boolean | null;
  nbDwellings: number | null;
  nbDwellingsRnc: number | null;
  nbTertiaryLotsRnc: number | null;
  nbResElec2020: number | null;
  nbProElec2020: number | null;
  nbProGaz2020: number | null;
  nbResGaz2020: number | null;

  arrete2021: boolean | null;
  dpeIdentifier: string | null;
  gesEmissions5UsesPerM2: number | null;
  gesEmissions3UsesEpM2Arrete2012: number | null;
  ventilationType: string | null;
  acGeneratorType: string | null;

  exteriorWallUValue: number | null;
  lowerFloorFinalUValue: number | null;
  upperFloorUValue: number | null;
  gasLayerType: string | null;
  virGlazing: boolean | null;
  windowUValue: number | null;
  windowSolarFactor: number | null;
  proElecConsumption2020: number | null;
  resElecConsumption2020: number | null;
  proGazConsumption2020: number | null;
  resGazConsumption2020: number | null;
  networkId: string | null;
  radonRisk: string | null;
  clayRisk: string | null;
  priorityDistrict: boolean | null;
  districtNameQpv: string | null;
  qpvCode: string | null;

  protected constructor(hsInput: Partial<HubspotLocation | LocationBdnb>) {
    const hsLocation = locationSchema.parse(hsInput);

    this.uncertainData = [];

    this.name = hsLocation.name ?? null;
    this.city = hsLocation.city;
    this.zipcode = hsLocation.zipcode;
    this.department = hsLocation.department ?? null;
    this.streetName = hsLocation.streetName;
    this.streetNumber = hsLocation.streetNumber;
    this.streetViewUrl =
      hsLocation.streetViewUrl ??
      "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQvBQ4NByDGOt9Yv95r8G-oV4efc6rL0u5VifhAxHB7TyO0fda_";
    this.bdnbFailure = !!hsLocation.bdnbFailure;
    this.bdnbFailureEmoji = isNotNullish(hsLocation.bdnbFailure)
      ? hsLocation.bdnbFailure
        ? "❌"
        : "✅"
      : "❓";
    this.nbBuildings = hsLocation.nbBuildings ?? null;
    this.surfaceArea = hsLocation.surfaceArea ?? null;
    this.greenhouseGasEmissionsPerSquareMeter =
      hsLocation.greenhouseGasEmissionsPerSquareMeter ?? null;
    this.energyType = hsLocation.energyType ?? null;
    this.heatingSystem = hsLocation.heatingSystem ?? null;
    this.heatingType = hsLocation.heatingType ?? null;
    this.dpeLabel = hsLocation.dpeLabel ?? null;
    this.rawBdnb = hsLocation.rawBdnb ?? null;
    this.geomGroup = hsLocation.geomGroup ?? null;
    this.googlePlaceId = hsLocation.googlePlaceId ?? null;
    this.longitude = hsLocation.longitude ?? null;
    this.latitude = hsLocation.latitude ?? null;
    this.buildingUsage = hsLocation.buildingUsage ?? null;
    this.nbDwellings = hsLocation.nbDwellings ?? null;
    this.nbDwellingsRnc = hsLocation.nbDwellingsRnc ?? null;
    this.nbTertiaryLotsRnc = hsLocation.nbTertiaryLotsRnc ?? null;
    this.nbResElec2020 = hsLocation.nbResElec2020 ?? null;
    this.nbProElec2020 = hsLocation.nbProElec2020 ?? null;
    this.nbProGaz2020 = hsLocation.nbProGaz2020 ?? null;
    this.nbResGaz2020 = hsLocation.nbResGaz2020 ?? null;

    this.arrete2021 = hsLocation.arrete2021 ?? null;
    this.dpeIdentifier = hsLocation.dpeIdentifier ?? null;
    this.gesEmissions5UsesPerM2 = hsLocation.gesEmissions5UsesPerM2 ?? null;
    this.gesEmissions3UsesEpM2Arrete2012 =
      hsLocation.gesEmissions3UsesEpM2Arrete2012 ?? null;
    this.ventilationType = hsLocation.ventilationType ?? null;
    this.acGeneratorType = hsLocation.acGeneratorType ?? null;

    this.exteriorWallUValue = hsLocation.exteriorWallUValue ?? null;
    this.lowerFloorFinalUValue = hsLocation.lowerFloorFinalUValue ?? null;
    this.upperFloorUValue = hsLocation.upperFloorUValue ?? null;

    this.gasLayerType = hsLocation.gasLayerType ?? null;
    this.virGlazing = hsLocation.virGlazing ?? null;
    this.windowUValue = hsLocation.windowUValue ?? null;
    this.windowSolarFactor = hsLocation.windowSolarFactor ?? null;
    this.ipeRawScore = hsLocation.ipeRawScore ?? null;
    this.ipeUsage = hsLocation.ipeUsage ?? null;
    this.ipeUsageReason = hsLocation.ipeUsageReason ?? null;
    this.referenceCompanyUuid = hsLocation.referenceCompanyUuid ?? null;
    this.referenceCompanySelectionReason =
      hsLocation.referenceCompanySelectionReason ?? null;
    this.proElecConsumption2020 = hsLocation.proElecConsumption2020 ?? null;
    this.resElecConsumption2020 = hsLocation.resElecConsumption2020 ?? null;
    this.proGazConsumption2020 = hsLocation.proGazConsumption2020 ?? null;
    this.resGazConsumption2020 = hsLocation.resGazConsumption2020 ?? null;
    this.networkId = hsLocation.networkId ?? null;
    this.radonRisk = hsLocation.radonRisk ?? null;
    this.clayRisk = hsLocation.clayRisk ?? null;
    this.priorityDistrict = hsLocation.priorityDistrict ?? null;
    this.districtNameQpv = hsLocation.districtNameQpv ?? null;
    this.qpvCode = hsLocation.qpvCode ?? null;
    this.meanHeight = hsLocation.meanHeight ?? null;
    this.inertiaClass = hsLocation.inertiaClass ?? null;
    this.hasBalcony = hsLocation.hasBalcony ?? null;
    this.glazingType = hsLocation.glazingType ?? null;

    this.needsBdnbCheck =
      hsLocation.bdnbFailure === null ||
      typeof hsLocation.bdnbFailure === "undefined";

    this.sector = hsLocation.sector
      ? Location.getMainSector(hsLocation.sector)
      : null;

    this.initialSector = hsLocation.sector
      ? Location.getInitialSector(hsLocation.sector)
      : null;

    if (hsLocation.nbStoreys) {
      this.nbStoreys = hsLocation.nbStoreys ?? null;
    } else {
      this.nbStoreys = null;
    }

    if (hsLocation.height) {
      this.height = hsLocation.height;
    } else if (hsLocation.nbStoreys) {
      this.height = hsLocation.nbStoreys * 3;
      this.uncertainData.push("height");
    } else {
      this.height = null;
    }

    this.creationDate = hsLocation.creationDate
      ? new Date(hsLocation.creationDate)
      : null;

    // SURFACE THAT REQUIRES HEATING

    if (hsLocation.surfaceThatRequiresHeating) {
      this.surfaceThatRequiresHeating = hsLocation.surfaceThatRequiresHeating;
    } else if (this.surfaceArea && this.nbStoreys) {
      const totalSurface = this.surfaceArea * this.nbStoreys;

      this.surfaceThatRequiresHeating =
        this.mainSector === "resi" ? totalSurface * 0.7 : totalSurface * 0.5;

      this.uncertainData.push("surfaceThatRequiresHeating");
    } else {
      this.surfaceThatRequiresHeating = null;
    }
    // ELECTRICITY CONSUMPTION PER SQUARE METER

    if (hsLocation.electricityConsumptionPerSquareMeter) {
      this.electricityConsumptionPerSquareMeter =
        hsLocation.electricityConsumptionPerSquareMeter;
    } else if (this.creationDate && this.sector) {
      const creationYear = this.creationDate.getFullYear();
      this.uncertainData.push("electricityConsumptionPerSquareMeter");
      this.electricityConsumptionPerSquareMeter =
        Location.calculateEstimatedEnergyConsumption(creationYear, this.sector);
    } else {
      this.electricityConsumptionPerSquareMeter = null;
    }

    // NB UNITS

    if (hsLocation.nbUnits) {
      this.nbUnits = hsLocation.nbUnits;
    } else if (hsLocation.surfaceArea && this.nbStoreys) {
      const averageUnitSize = 60;
      this.nbUnits = Math.round(
        (hsLocation.surfaceArea / averageUnitSize) * this.nbStoreys,
      );
      this.uncertainData.push("nbUnits");
    } else {
      this.nbUnits = null;
    }

    // ANNUAL ELECTRICITY COST

    if (this.surfaceThatRequiresHeating) {
      if (this.electricityConsumptionPerSquareMeter) {
        this.annualElectricityConsumption =
          this.surfaceThatRequiresHeating *
          this.electricityConsumptionPerSquareMeter;

        this.annualElectricityCost =
          this.annualElectricityConsumption * KWH_PRICE;
        this.uncertainData.push("annualElectricityCost"); // For now this is always estimated

        this.annualElectricityCostPerUnit =
          this.annualElectricityCost / (this.nbUnits ?? 1);

        this.monthlyElectricityCostPerUnit =
          this.annualElectricityCostPerUnit / 12;
      }

      this.annualGhg =
        this.surfaceThatRequiresHeating *
        (this.greenhouseGasEmissionsPerSquareMeter ?? 1);
    }

    this.missingXFactorsForEnergyImpact = [
      this.nbStoreys ? null : XFactorsKey.NB_STOREYS,
      this.surfaceArea ? null : XFactorsKey.SURFACE_AREA,
      this.electricityConsumptionPerSquareMeter
        ? null
        : XFactorsKey.ELECTRICITY_CONSUMPTION_PER_SQUARE_METER,
    ].filter(isNotNullish);

    this.missingXFactorsForEnergyImpactLabel =
      this.missingXFactorsForEnergyImpact
        .map((xFactor) => X_FACTOR_LABELS[xFactor])
        .join(", ");

    // PERIMETER

    if (this.geomGroup) {
      this.perimeters = this.geomGroup.coordinates
        .map((coords) => coords[0])
        .filter(isNotNullish)
        .map((coord) => Location.calculatePerimeter(coord));
    } else {
      this.perimeters = null;
    }

    if (this.perimeters) {
      this.perimeter = this.perimeters.reduce(
        (sum, perimeter) => sum + perimeter,
        0,
      );
    } else {
      this.perimeter = null;
    }

    // FACADE AREA

    if (hsLocation.facadeArea) {
      this.facadeArea = hsLocation.facadeArea;
    } else if (this.perimeter && this.height) {
      this.facadeArea = this.perimeter * this.height;
    } else {
      this.facadeArea = null;
    }

    // GLAZING SURFACE PERCENTAGE

    this.glazingSurfacePercentage = hsLocation.glazingSurfacePercentage ?? null;

    // GLAZING AREA

    if (hsLocation.glazingArea) {
      this.glazingArea = hsLocation.glazingArea;
    } else if (this.facadeArea && this.glazingSurfacePercentage) {
      this.glazingArea = Location.estimateGlazingArea({
        facadeArea: this.facadeArea,
        glazingSurfacePercentage: this.glazingSurfacePercentage,
      });
      this.uncertainData.push("glazingArea");
    } else {
      this.glazingArea = null;
    }
  }

  get address(): string {
    return Location.makeAddress(this);
  }

  get shortAddress(): string {
    return Location.makeShortAddress(this);
  }

  get hasSpecificName() {
    return this.name && normalize(this.shortAddress) !== normalize(this.name);
  }

  get isCollectiveHeating() {
    return (
      this.heatingSystem === "Collectif chaufferie" ||
      this.heatingSystem === "Collectif urbain" ||
      this.heatingSystem === "collectif"
    );
  }

  get isIndividualHeating() {
    return this.heatingSystem === "Individuel";
  }

  static getInitialSector(sector?: Sector | null) {
    if (sector === "ter") {
      return "ter";
    }

    if (sector === "resi" || sector === "Résidentiel collectif") {
      return "resi";
    }

    return "Autre";
  }

  get mainSector(): MainSector {
    return Location.getMainSector(this.sector);
  }

  static getMainSector(sector?: Sector | null): MainSector {
    if (!sector || sector === "ter" || sector === "indu") {
      return "ter";
    }

    return "resi";
  }

  get mainSectorLabel(): SectorLabel | null {
    return LOCATION_SECTORS[this.mainSector];
  }

  get sectorLabel(): SectorLabel | null {
    return this.sector ? LOCATION_SECTORS[this.sector] : null;
  }

  get climateZone() {
    try {
      return getClimateZone(this.zipcode);
    } catch (e) {
      console.error(
        `Error getting climate zone for zipcode ${this.zipcode}:`,
        e,
      );
      return null;
    }
  }

  isCompatibleWithOperation(hsPrestationId: OperationHubspotPrestationId) {
    return (
      Location.getCompatibilityWithOperation(this, hsPrestationId)
        .compatible === true
    );
  }

  static getCompatibilityWithOperation(
    location: BaseLocation,
    hsPrestationId: OperationHubspotPrestationId,
  ):
    | {
        compatible: false;
        reason: "heatingSystem" | "sector";
      }
    | { compatible: true; reason: null } {
    const operationTypeInfo = getTypeByHubspotPrestationId(hsPrestationId);

    if (!operationTypeInfo) {
      throw new Error(
        `Operation type not found for hsPrestationId "${hsPrestationId}"`,
      );
    }

    if (
      location.isCollectiveHeating &&
      !operationTypeInfo.availableForCollectiveHeating
    ) {
      return {
        compatible: false,
        reason: "heatingSystem",
      };
    }

    if (
      location.isIndividualHeating &&
      !operationTypeInfo.availableForIndividualHeating
    ) {
      return {
        compatible: false,
        reason: "heatingSystem",
      };
    }

    // if (location.mainSector === "Autre") {
    //   return {
    //     compatible: false,
    //     reason: "sector",
    //   };
    // }
    if (!operationTypeInfo.availableForSectors.includes(location.mainSector)) {
      return {
        compatible: false,
        reason: "sector",
      };
    }

    return {
      compatible: true,
      reason: null,
    };
  }

  static estimateGlazingArea({
    facadeArea,
    glazingSurfacePercentage,
  }: {
    facadeArea: number;
    glazingSurfacePercentage: number;
  }) {
    return facadeArea * glazingSurfacePercentage;
  }

  static makeAddress({
    streetNumber,
    streetName,
    zipcode,
    city,
  }: LocationAddressData) {
    const ucStreetName =
      typeof streetNumber !== "string" && streetName
        ? streetName.charAt(0).toUpperCase() + streetName.slice(1)
        : streetName;

    return [
      [streetNumber, ucStreetName].filter(isNotNullish).join(" "),
      [zipcode, city].filter(isNotNullish).join(" "),
    ].join(", ");
  }

  static makeShortAddress({
    streetNumber,
    streetName,
  }: Pick<LocationAddressData, "streetNumber" | "streetName">) {
    const modifiedStreetName =
      typeof streetNumber !== "string" && streetName
        ? streetName.charAt(0).toUpperCase() + streetName.slice(1)
        : streetName;

    return [streetNumber, modifiedStreetName].filter(isNotNullish).join(" ");
  }

  static calculatePerimeter(coords: BdnbCoordinate[]): number {
    let perimeter = 0;

    for (let i = 0; i < coords.length; i++) {
      const coord = coords[i];
      const nextCoord = coords[(i + 1) % coords.length]; // Boucle vers le premier point

      if (!coord || !nextCoord) {
        continue;
      }

      const [x1, y1] = coord;
      const [x2, y2] = nextCoord;
      perimeter += Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    return perimeter;
  }

  static calculateEstimatedEnergyConsumption(
    creationYear: number,
    sector: Sector | null,
  ): number {
    if (sector === "resi") {
      if (creationYear <= 1975) {
        // Pas de norme
        return 320;
      } else if (creationYear <= 1982) {
        // 1ère RT
        return 220;
      } else if (creationYear <= 1989) {
        // RT82
        return 175;
      } else if (creationYear <= 2000) {
        // RT88/RT2000
        return 150;
      } else if (creationYear <= 2005) {
        // RT2000 renforcée
        return 125;
      } else if (creationYear <= 2012) {
        // RT2005
        return 100;
      } else if (creationYear <= 2020) {
        // RT2012
        return 70;
      }
      // RE2020
      return 45;
    }
    // Estimation pour bureaux
    if (creationYear <= 2000) {
      return 320;
    } else if (creationYear <= 2012) {
      return 200;
    }
    return 110;
  }
}

/**
 * Location model with improved properties and methods
 */
export class Location extends BaseLocation {
  uuid: LocationUuid;
  id: LocationHsId | null;
  nameContactOnSite: string | null;
  phoneContactOnSite: string | null;
  contactOnSite: LocationContactOnSite;
  type = "optee" as const;
  exteriorWallInsulationType: string | null;
  lowerFloorInsulationType: string | null;
  upperFloorInsulationType: string | null;
  windowMaterialType: string | null;
  shutterType: string | null;
  dpeAssessmentClass: string | null;
  acGeneratorAge: string | null;

  protected constructor(hsInput: Partial<HubspotLocation>) {
    super(hsInput);
    const insulations = insulationBdnbSchema.parse(hsInput);
    const opteeProps = opteeLocationSchema.parse(hsInput);

    this.windowMaterialType = opteeProps.windowMaterialType ?? null;
    this.shutterType = opteeProps.shutterType ?? null;
    this.dpeAssessmentClass = opteeProps.dpeAssessmentClass ?? null;
    this.acGeneratorAge = opteeProps.acGeneratorAge ?? null;

    this.uuid = LocationUuid.parse(hsInput.uuid);
    this.id = hsInput.id ?? null;
    this.nameContactOnSite = hsInput.nameContactOnSite ?? null;
    this.phoneContactOnSite = hsInput.phoneContactOnSite ?? null;
    const fullName = (this.nameContactOnSite ?? "").trim();
    const [firstName, ...rest] = fullName.split(/\s+/);
    this.contactOnSite = {
      firstName: firstName ?? "",
      lastName: rest.join(" "),
      phone: this.phoneContactOnSite,
    };
    this.exteriorWallInsulationType =
      insulations.exteriorWallInsulationType ?? null;
    this.lowerFloorInsulationType =
      insulations.lowerFloorInsulationType ?? null;
    this.upperFloorInsulationType =
      insulations.upperFloorInsulationType ?? null;
  }

  get bdnbData(): HubspotLocationBdnbData {
    const creationDate = this.creationDate
      ? // We add a day because of a bug setting the date to the year before
        new Date(this.creationDate.getTime() + 1000 * 60 * 60 * 24)
          .toISOString()
          .split("T")[0]
      : null;

    return {
      creationDate,
      sector: this.sector,
      energyType: this.energyType,
      heatingSystem: this.heatingSystem,
      nbBuildings: this.nbBuildings,
      nbUnits: this.nbUnits,
      surfaceArea: this.surfaceArea,
      height: this.height,
      glazingSurfacePercentage: this.glazingSurfacePercentage,
      electricityConsumptionPerSquareMeter:
        this.electricityConsumptionPerSquareMeter,
      greenhouseGasEmissionsPerSquareMeter:
        this.greenhouseGasEmissionsPerSquareMeter,
      nbStoreys: this.nbStoreys,
      heatingType: this.heatingType,
      dpeLabel: this.dpeLabel,
      geomGroup: this.geomGroup,
      facadeArea: this.facadeArea,
      glazingArea: this.glazingArea,
      surfaceThatRequiresHeating: this.surfaceThatRequiresHeating,
      meanHeight: this.meanHeight,
      inertiaClass: this.inertiaClass,
      hasBalcony: this.hasBalcony,
      nbDwellings: this.nbDwellings,
      nbDwellingsRnc: this.nbDwellingsRnc,
      nbTertiaryLotsRnc: this.nbTertiaryLotsRnc,
      nbResElec2020: this.nbResElec2020,
      nbProElec2020: this.nbProElec2020,
      nbProGaz2020: this.nbProGaz2020,
      nbResGaz2020: this.nbResGaz2020,
      dpeAssessmentClass: this.dpeAssessmentClass,
      arrete2021: this.arrete2021,
      dpeIdentifier: this.dpeIdentifier,
      gesEmissions5UsesPerM2: this.gesEmissions5UsesPerM2,
      gesEmissions3UsesEpM2Arrete2012: this.gesEmissions3UsesEpM2Arrete2012,
      ventilationType: this.ventilationType,
      acGeneratorType: this.acGeneratorType,
      acGeneratorAge: this.acGeneratorAge,
      exteriorWallUValue: this.exteriorWallUValue,
      exteriorWallInsulationType: this.exteriorWallInsulationType,
      lowerFloorInsulationType: this.lowerFloorInsulationType,
      upperFloorInsulationType: this.upperFloorInsulationType,
      lowerFloorFinalUValue: this.lowerFloorFinalUValue,
      upperFloorUValue: this.upperFloorUValue,
      glazingType: this.glazingType,
      windowMaterialType: this.windowMaterialType,
      gasLayerType: this.gasLayerType,
      shutterType: this.shutterType,
      virGlazing: this.virGlazing,
      windowUValue: this.windowUValue,
      windowSolarFactor: this.windowSolarFactor,
      proElecConsumption2020: this.proElecConsumption2020,
      resElecConsumption2020: this.resElecConsumption2020,
      proGazConsumption2020: this.proGazConsumption2020,
      resGazConsumption2020: this.resGazConsumption2020,
      networkId: this.networkId,
      radonRisk: this.radonRisk,
      clayRisk: this.clayRisk,
      priorityDistrict: this.priorityDistrict,
      districtNameQpv: this.districtNameQpv,
      qpvCode: this.qpvCode,
    } as const;
  }

  get bdnbDataWithoutNullOrUndefined() {
    return Object.fromEntries(
      Object.entries(this.bdnbData).filter(
        ([_, v]) => v != null && typeof v !== "undefined",
      ),
    );
  }

  static init(hsInput: Partial<HubspotLocation>) {
    try {
      return new Location(hsInput);
    } catch (e) {
      const message =
        e instanceof ZodError
          ? `Bâtiment invalide [uuid: ${hsInput.uuid}]: ${e.message}`
          : e;

      console.error({
        error: message,
        data: hsInput,
      });

      return null;
    }
  }
}

const externalLocationSchema = z.object({
  glazingType: z.enum(GLAZING_TYPES).nullish(),
  ventilationType: z.enum(VENTILATION_TYPES).nullish(),
  exteriorWallInsulationType: z.array(z.enum(INSULATION_TYPES)).nullish(),
  lowerFloorInsulationType: z.array(z.enum(INSULATION_TYPES)).nullish(),
  upperFloorInsulationType: z.array(z.enum(INSULATION_TYPES)).nullish(),
  windowMaterialType: z.array(z.enum(WINDOW_MATERIAL_TYPE)).nullish(),
  shutterType: z.array(z.enum(SHUTTER_TYPES)).nullish(),
  dpeAssessmentClass: z.enum(DPE_LABELS).nullish(),
  acGeneratorAge: z.enum(HEATING_GENERATOR_AGES).nullish(),
  maxConstructionPeriod: z.enum(MAX_CONSTRUCTION_PERIOD).nullish(),
  mainGesClass: z.enum(DPE_LABELS).nullish(),
  constructionType: z.array(z.string()).nullish(),
  buildingTypeDpe: z.enum(BUILDING_TYPE_DPE).nullish(),
  constructionPeriodDpe: z.enum(DPE_CONSTRUCTION_PERIOD).nullish(),
  gesEmissionClass: z.enum(DPE_LABELS).nullish(),
  energyClass2012: z.enum(DPE_LABELS).nullish(),
  gesClass2012: z.enum(DPE_LABELS).nullish(),
  ecsInstallationType: z.enum(ECS_INSTALLATION_TYPE).nullish(),
  ecsGeneratorAge: z.enum(HEATING_GENERATOR_AGES).nullish(),
  externalWallStructureMaterial: z.enum(WALL_STRUCTURE_MATERIALS).nullish(),
});

export class ExternalLocation extends BaseLocation {
  uuid: LocationBdnbUuid;
  type = "external" as const;
  legalEntityTypeLabel: "Copropriété" | "Tertiaire" | "Public" | "Mixte" | null;

  legalEntities: Array<{
    name: string | null;
    type: LegalEntityType;
    mainBusinessActivity: string | null;
  }>;

  batimentId: string | null;

  exteriorWallInsulationType: InsulationType[] | null;
  lowerFloorInsulationType: InsulationType[] | null;
  upperFloorInsulationType: InsulationType[] | null;
  heatingBackupEnergyType: BackupHeatingEnergyType | null;
  wallMaterial: WallMaterial[] | null;
  roofMaterial: RoofMaterial[] | null;
  heatingGeneratorAge: HeatingGeneratorAge | null;
  ecsGeneratorType: ECSGeneratorTypeCode | null;
  windowMaterialType: WindowMaterialType[] | null;
  shutterType: ShutterTypeCode[] | null;
  dpeAssessmentClass: DpeLabel | null;
  acGeneratorAge: HeatingGeneratorAge | null;
  maxConstructionPeriod: MaxConstructionPeriod | null;
  mainGesClass: DpeLabel | null;
  constructionType: string[] | null;
  buildingTypeDpe: BuildingTypeDpe | null;
  constructionPeriodDpe: DpeConstructionPeriod | null;
  gesEmissionClass: DpeLabel | null;
  energyClass2012: DpeLabel | null;
  gesClass2012: DpeLabel | null;
  ecsInstallationType: EcsInstallationType | null;
  ecsGeneratorAge: HeatingGeneratorAge | null;
  externalWallStructureMaterial: WallStructureMaterialCode | null;
  nbParkingSpots: number | null;

  override ventilationType: VentilationTypeCode | null;
  override glazingType: GlazingType | null;

  protected constructor(
    hsInput: Partial<LocationBdnb>,
    legalEntities: Array<{
      name: string | null;
      type: LegalEntityType;
      mainBusinessActivity: string | null;
    }>,
  ) {
    super(hsInput);
    const externalProps = externalLocationSchema.parse(hsInput);
    this.uuid = LocationBdnbUuid.parse(hsInput.uuid);
    this.glazingType = externalProps.glazingType ?? null;
    this.ventilationType = externalProps.ventilationType ?? null;
    this.exteriorWallInsulationType =
      externalProps.exteriorWallInsulationType ?? null;
    this.lowerFloorInsulationType =
      externalProps.lowerFloorInsulationType ?? null;
    this.upperFloorInsulationType =
      externalProps.upperFloorInsulationType ?? null;
    this.shutterType = externalProps.shutterType ?? null;
    this.windowMaterialType = externalProps.windowMaterialType ?? null;
    this.acGeneratorAge = externalProps.acGeneratorAge ?? null;
    this.heatingBackupEnergyType = hsInput.heatingBackupEnergyType ?? null;
    this.wallMaterial = hsInput.wallMaterial ?? null;
    this.roofMaterial = hsInput.roofMaterial ?? null;
    this.heatingGeneratorAge = hsInput.heatingGeneratorAge ?? null;
    this.ecsGeneratorType = hsInput.ecsGeneratorType ?? null;
    this.dpeAssessmentClass = externalProps.dpeAssessmentClass ?? null;
    this.maxConstructionPeriod = externalProps.maxConstructionPeriod ?? null;
    this.mainGesClass = externalProps.mainGesClass ?? null;
    this.constructionType = externalProps.constructionType ?? null;
    this.buildingTypeDpe = externalProps.buildingTypeDpe ?? null;
    this.constructionPeriodDpe = externalProps.constructionPeriodDpe ?? null;
    this.gesEmissionClass = externalProps.gesEmissionClass ?? null;
    this.energyClass2012 = externalProps.energyClass2012 ?? null;
    this.gesClass2012 = externalProps.gesClass2012 ?? null;
    this.ecsInstallationType = externalProps.ecsInstallationType ?? null;
    this.ecsGeneratorAge = externalProps.ecsGeneratorAge ?? null;
    this.externalWallStructureMaterial =
      externalProps.externalWallStructureMaterial ?? null;
    this.nbParkingSpots = hsInput.numberOfGarparkLots ?? null;
    this.batimentId = hsInput.locationGroupId ?? null;
    const legalEntityTypeSchema = z.enum(LEGAL_ENTITY_TYPES);
    this.legalEntities = legalEntities
      .filter(
        (entity, index, self) =>
          entity.name &&
          self.findIndex(
            (e) =>
              e.name?.toLowerCase().trim() ===
              entity.name?.toLowerCase().trim(),
          ) === index,
      )
      .map((entity) => ({
        name: entity.name,
        type: legalEntityTypeSchema.parse(entity.type), // Validation ici
        mainBusinessActivity:
          typeof entity.mainBusinessActivity === "string" &&
          entity.mainBusinessActivity.trim().length
            ? entity.mainBusinessActivity
            : null,
      }));
    const uniqueTypes = new Set(this.legalEntities.map((e) => e.type));
    if (uniqueTypes.size === 0) {
      this.legalEntityTypeLabel = null;
    } else if (uniqueTypes.size === 1) {
      this.legalEntityTypeLabel = getLegalEntityTypeLabel([...uniqueTypes][0]);
    } else {
      this.legalEntityTypeLabel = "Mixte";
    }
  }

  static init(
    hsInput: Partial<LocationBdnb>,
    legalEntities?: Array<{
      name: string | null;
      type: LegalEntityType;
      mainBusinessActivity: string | null;
    }>,
  ) {
    try {
      return new ExternalLocation(hsInput, legalEntities ?? []);
    } catch (e) {
      const message =
        e instanceof ZodError
          ? `Bâtiment BDNB invalide [${hsInput.uuid}]: ${e.message}`
          : e;

      console.error({
        error: message,
        data: hsInput,
      });

      return null;
    }
  }
}

export const isOpteeHsLocation = (
  location: HubspotLocation | LocationBdnb,
): location is HubspotLocation => {
  return "id" in location;
};

export const isOpteeLocation = (
  location: Location | ExternalLocation,
): location is Location => {
  return location.type === "optee";
};
