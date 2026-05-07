import { CurrencyPipe } from "@angular/common";
import {
  HEATING_TYPE_LABELS,
  SHUTTER_TYPES_LABEL,
  VENTILATION_TYPE_LABELS,
} from "@optee/constants";
import type {
  DataSource,
  PlacePropConfig,
  PlacePropertyCategory,
  PlacePropertyKey,
} from "./place-props.type";

const formatPlaceSector = (value: any): string => {
  switch (String(value)) {
    case "resi":
      return "Résidentiel";
    case "ter":
      return "Tertiaire";
    default:
      return String(value);
  }
};

const formatRoundedNumber = (value: any): string => {
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(value);

  // Remplace les espaces insécables par des espaces classiques
  return formatted.replace(/\u00A0/g, " ");
};

const formatRoundedCurrency = (value: any): string => {
  const decimalPipe = new CurrencyPipe("fr-FR");
  return decimalPipe.transform(value, "EUR", "symbol", "1.0-0") ?? "";
};

const formatToBoolean = (value: any): string => {
  return value ? "Oui" : "Non";
};

const formatDateToYear = (value: any): string => {
  const date = new Date(value);
  return isNaN(date.getTime()) ? "" : date.getFullYear().toString();
};

const formatHeatingType = (value: any): string => {
  const key = String(value) as keyof typeof HEATING_TYPE_LABELS;
  return HEATING_TYPE_LABELS[key] ?? String(value);
};

const formatVentilationType = (value: any): string => {
  const key = String(value) as keyof typeof VENTILATION_TYPE_LABELS;
  return VENTILATION_TYPE_LABELS[key] ?? String(value);
};

const formatShutterType = (value: any): string => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "Non connu";
    }
    const labels = (value as string[]).map((val) => {
      const key = val as keyof typeof SHUTTER_TYPES_LABEL;
      return SHUTTER_TYPES_LABEL[key] ?? val;
    });
    return labels.join(", ");
  }
  const key = String(value) as keyof typeof SHUTTER_TYPES_LABEL;
  return SHUTTER_TYPES_LABEL[key] ?? String(value);
};

const formatAnnualElectricityConsumption = (value: any): string => {
  return formatRoundedNumber(Math.round(value / 1000));
};

type PlacePropDefinition = Omit<PlacePropConfig, "key">;

type PlacePropDefinitionMap = {
  [K in PlacePropertyKey]?: PlacePropDefinition;
};

const PLACE_PROP_DEFS = {
  initialSector: {
    label: "Catégorie",
    format: formatPlaceSector,
  },
  surfaceArea: {
    label: "Emprise au sol",
    format: formatRoundedNumber,
    suffix: "m²",
  },
  facadeArea: {
    label: "Surface de la façade",
    format: formatRoundedNumber,
    suffix: "m²",
  },
  glazingArea: {
    label: "Surface vitrée",
    format: formatRoundedNumber,
    suffix: "m²",
  },
  surfaceThatRequiresHeating: {
    label: "Surface chauffée",
    format: formatRoundedNumber,
    suffix: "m²",
  },
  creationDate: {
    label: "Année",
    format: formatDateToYear,
  },
  nbBuildings: {
    label: "Nbr. bâtiments",
    format: formatRoundedNumber,
  },
  nbUnits: {
    label: "Nbr. lots",
    format: formatRoundedNumber,
  },
  nbStoreys: {
    label: "Niveaux",
    format: formatRoundedNumber,
  },
  climateZone: {
    label: "Zone climatique",
  },
  energyType: {
    label: "Énergie",
  },
  heatingSystem: {
    label: "Chauffage",
  },
  heatingType: {
    label: "Système",
    format: formatHeatingType,
  },
  annualGhg: {
    label: "Émission GES",
    format: formatRoundedNumber,
    suffix: "kgCO2e/an",
  },
  annualElectricityConsumption: {
    label: "Consommation totale (EP)",
    format: formatAnnualElectricityConsumption,
    suffix: "MWh/an",
  },
  ipeRawScore: {
    label: "Indice",
  },
  meanHeight: {
    label: "Hauteur moyenne du bâtiment",
    format: formatRoundedNumber,
    suffix: "m",
  },
  perimeter: {
    label: "Périmètre",
    format: formatRoundedNumber,
    suffix: "m",
  },
  inertiaClass: {
    label: "Inertie du bâtiment",
  },
  hasBalcony: {
    label: "Présence de balcons",
  },
  nbDwellings: {
    format: formatRoundedNumber,
    label: "Nombre total de logements",
  },
  nbDwellingsRnc: {
    format: formatRoundedNumber,
    label: "Nombre d’habitations",
  },
  nbTertiaryLotsRnc: {
    format: formatRoundedNumber,
    label: "Nombre de locaux à usage tertiaire",
  },
  nbParkingSpots: {
    format: formatRoundedNumber,
    label: "Nombre de places de parkings",
  },
  nbResElec2020: {
    format: formatRoundedNumber,
    label: "Nombre de PDL rés. (électricité)",
  },
  nbProElec2020: {
    format: formatRoundedNumber,
    label: "Nombre de PDL pro. (électricité)",
  },
  nbProGaz2020: {
    format: formatRoundedNumber,
    label: "Nombre de PDL pro. (gaz)",
  },
  nbResGaz2020: {
    format: formatRoundedNumber,
    label: "Nombre de PDL rés. (gaz)",
  },
  dpeAssessmentClass: {
    label: "DPE le plus récent",
  },
  arrete2021: {
    label: "DPE post arrêté 2021",
    format: formatToBoolean,
  },
  dpeIdentifier: {
    label: "Présence d’un DPE fiabilisé / certifié",
    format: formatToBoolean,
  },
  gesEmissions5UsesPerM2: {
    label: "Émissions de GES 5 usages",
    format: formatRoundedNumber,
    suffix: "kgCO₂/m²",
  },
  gesEmissions3UsesEpM2Arrete2012: {
    label: "Émissions de GES 3 usages",
    format: formatRoundedNumber,
    suffix: "kgCO₂/m²",
  },
  ventilationType: {
    label: "Ventilation (type)",
    format: formatVentilationType,
  },
  acGeneratorType: {
    label: "Climatisation – type de générateur",
  },
  acGeneratorAge: {
    label: "Climatisation – ancienneté",
  },
  exteriorWallInsulationType: {
    label: "Isolation des murs extérieurs (type)",
  },
  exteriorWallUValue: {
    label: "Isolation des murs extérieurs (U)",
    format: formatRoundedNumber,
    suffix: "W/m².K",
  },
  lowerFloorInsulationType: {
    label: "Isolation du plancher bas (type)",
  },
  upperFloorInsulationType: {
    label: "Isolation du plancher haut (type)",
  },
  lowerFloorFinalUValue: {
    label: "Isolation du plancher bas (U)",
    format: formatRoundedNumber,
    suffix: "W/m².K",
  },
  upperFloorUValue: {
    label: "Isolation du plancher haut (U)",
    format: formatRoundedNumber,
    suffix: "W/m².K",
  },
  glazingType: {
    label: "Type de vitrage",
  },
  windowMaterialType: {
    label: "Matériau de menuiserie",
  },
  gasLayerType: {
    label: "Type de gaz (lame)",
  },
  shutterType: {
    label: "Type de fermeture",
    format: formatShutterType,
  },
  virGlazing: {
    label: "Vitrage VIR",
  },
  windowUValue: {
    label: "Isolation baie vitrée (U)",
    format: formatRoundedNumber,
    suffix: "W/m².K",
  },
  windowSolarFactor: {
    label: "Facteur solaire baie vitrée",
    format: formatRoundedNumber,
  },
  networkId: {
    label: "ID Réseau",
  },
  radonRisk: {
    label: "Aléa radon",
  },
  clayRisk: {
    label: "Aléa argiles",
  },
  priorityDistrict: {
    label: "Quartier prioritaire",
  },
  districtNameQpv: {
    label: "Nom quartier QPV",
  },
  qpvCode: {
    label: "Code QP",
  },
} as const satisfies PlacePropDefinitionMap;

type PlacePropKey = keyof typeof PLACE_PROP_DEFS;

const prop = <K extends PlacePropKey>(
  key: K,
  override: Partial<PlacePropDefinition> = {},
): PlacePropConfig => ({
  key,
  ...PLACE_PROP_DEFS[key],
  ...override,
});

const CHARACTERISTICS_CONFIG = [
  prop("initialSector"),
  prop("surfaceArea"),
  prop("facadeArea"),
  prop("glazingArea"),
  prop("surfaceThatRequiresHeating"),
  prop("creationDate"),
  prop("nbBuildings"),
  prop("nbUnits"),
  prop("nbStoreys"),
  prop("climateZone"),
] as const satisfies PlacePropConfig[];

export const ENERGY_CONFIG = [
  prop("energyType"),
  prop("heatingSystem"),
  prop("heatingType"),
  prop("annualGhg"),
] as const satisfies PlacePropConfig[];

const ESTIMATED_CONSUMPTION_CONFIG = [
  prop("annualElectricityConsumption"),
] as const satisfies PlacePropConfig[];

const ESTIMATED_ENERGY_PROFILE_CONFIG = [
  prop("ipeRawScore"),
] as const satisfies PlacePropConfig[];

const STRUCTURE_CONFIG = [
  prop("meanHeight"),
  prop("perimeter"),
  prop("inertiaClass"),
  prop("hasBalcony"),
] as const satisfies PlacePropConfig[];

const USAGE_CONFIG = [
  prop("nbDwellings"),
  prop("nbDwellingsRnc"),
  prop("nbTertiaryLotsRnc"),
  prop("nbParkingSpots"),
] as const satisfies PlacePropConfig[];

const PDL_CONFIG = [
  prop("nbResElec2020"),
  prop("nbProElec2020"),
  prop("nbProGaz2020"),
  prop("nbResGaz2020"),
] as const satisfies PlacePropConfig[];

const DPE_DETAIL_CONFIG = [
  prop("dpeAssessmentClass"),
  prop("arrete2021"),
  prop("dpeIdentifier"),
  prop("gesEmissions5UsesPerM2"),
  prop("gesEmissions3UsesEpM2Arrete2012"),
] as const satisfies PlacePropConfig[];

const HVAC_CONFIG = [
  prop("ventilationType"),
  prop("acGeneratorType"),
  prop("acGeneratorAge"),
  prop("exteriorWallInsulationType"),
  prop("exteriorWallUValue"),
  prop("lowerFloorInsulationType"),
  prop("upperFloorInsulationType"),
  prop("lowerFloorFinalUValue"),
  prop("upperFloorUValue"),
] as const satisfies PlacePropConfig[];

const ENVELOPE_CONFIG = [
  prop("glazingType"),
  prop("windowMaterialType"),
  prop("gasLayerType"),
  prop("shutterType"),
  prop("virGlazing"),
  prop("windowUValue"),
  prop("windowSolarFactor"),
] as const satisfies PlacePropConfig[];

const NETWORK_CONFIG: PlacePropConfig[] = [prop("networkId")];

const RISKS_CONFIG: PlacePropConfig[] = [
  prop("radonRisk"),
  prop("clayRisk"),
  prop("priorityDistrict"),
  prop("districtNameQpv"),
  prop("qpvCode"),
];

export const LAND_FILE_CONFIG: DataSource = {
  label: "Fichiers fonciers",
  bgColor: "bg-[#4D3300]",
};

export const LAND_REGISTRY_CONFIG: DataSource = {
  label: "Cadastre",
  bgColor: "bg-[#004D1A]",
};

export const DPE_CONFIG: DataSource = {
  label: "DPE (Ademe)",
  bgColor: "bg-[#001166]",
};

export const ENEDIS_CONFIG: DataSource = {
  label: "Enedis",
  bgColor: "bg-[#0022CC]",
};

export const GRDF_CONFIG: DataSource = {
  label: "GRDF",
  bgColor: "bg-[#440066]",
};

export const IGN_CONFIG: DataSource = {
  label: "IGN",
  bgColor: "bg-[#AA00FF]",
};

export const DVF_CONFIG: DataSource = {
  label: "DVF (Etalab)",
  bgColor: "bg-[#FF6666]",
};

export const GEO_RISQUES_CONFIG: DataSource = {
  label: "GéoRisques",
  bgColor: "bg-[#660000]",
};

export const PLACE_SUMMARY_PROP_CONFIG: PlacePropConfig[] = [
  prop("surfaceThatRequiresHeating"),
  prop("nbUnits"),
  prop("nbStoreys"),
  prop("creationDate"),
];

export const PLACE_SUMMARY_PART_2_PROP_CONFIG: PlacePropConfig[] = [
  prop("dpeAssessmentClass"),
  prop("annualElectricityConsumption"),
  prop("annualGhg"),
  prop("ipeRawScore"),
];

export const PLACE_SUMMARY_PART_3_PROP_CONFIG: PlacePropConfig[] = [
  prop("energyType"),
  prop("heatingType"),
  prop("heatingSystem"),
  prop("inertiaClass"),
];

export const EXTERNAL_BDNB_PROP_CONFIG: PlacePropertyCategory[] = [
  {
    key: "characteristics",
    label: "Caractéristiques",
    properties: CHARACTERISTICS_CONFIG,
    dataSources: [LAND_FILE_CONFIG, LAND_REGISTRY_CONFIG],
    isOpen: true,
  },
  {
    key: "energy",
    label: "Énergie",
    properties: ENERGY_CONFIG,
    dataSources: [DPE_CONFIG, ENEDIS_CONFIG, GRDF_CONFIG],
  },
  {
    key: "estimatedConsumption",
    label: "Consommation estimée",
    properties: ESTIMATED_CONSUMPTION_CONFIG,
    dataSources: [DPE_CONFIG, ENEDIS_CONFIG, GRDF_CONFIG],
  },
  {
    key: "estimatedEnergyProfile",
    label: "Profil énergétique estimé",
    properties: ESTIMATED_ENERGY_PROFILE_CONFIG,
    dataSources: [],
    customRender: true,
  },
  {
    key: "structure",
    label: "Structure & enveloppe",
    properties: STRUCTURE_CONFIG,
    dataSources: [LAND_FILE_CONFIG, IGN_CONFIG, DPE_CONFIG],
  },
  {
    key: "usage",
    label: "Logements & usage",
    properties: USAGE_CONFIG,
    dataSources: [LAND_FILE_CONFIG, DVF_CONFIG],
  },
  {
    key: "pdl",
    label: "Point de livraison",
    properties: PDL_CONFIG,
    dataSources: [ENEDIS_CONFIG, GRDF_CONFIG],
  },
  {
    key: "dpeDetail",
    label: "DPE détaillé",
    properties: DPE_DETAIL_CONFIG,
    dataSources: [DPE_CONFIG, LAND_FILE_CONFIG],
  },
  {
    key: "hvac",
    label: "Chauffage, ventilation & clim.",
    properties: HVAC_CONFIG,
    dataSources: [DPE_CONFIG, LAND_FILE_CONFIG],
  },
  {
    key: "envelope",
    label: "Isolation & matériaux",
    properties: ENVELOPE_CONFIG,
    dataSources: [DPE_CONFIG, LAND_FILE_CONFIG],
  },
  {
    key: "network",
    label: "Réseaux & conso.",
    properties: NETWORK_CONFIG,
    dataSources: [ENEDIS_CONFIG, GRDF_CONFIG],
  },
  {
    key: "risks",
    label: "Risques & aléas",
    properties: RISKS_CONFIG,
    dataSources: [GEO_RISQUES_CONFIG],
  },
];
