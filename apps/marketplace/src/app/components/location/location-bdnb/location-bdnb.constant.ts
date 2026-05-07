import { X_FACTOR_LABELS, XFactorsKey } from "@optee/constants";
import type {
  BdnbPropConfig,
  BdnbPropertyCategory,
} from "./location-bdnb.type";

const CHARACTERISTICS_CONFIG = [
  {
    key: "initialSector",
    editable: true,
    label: "Catégorie",
    inputType: "dropdown",
    pipe: "placeSector",
  },
  {
    key: "surfaceArea",
    editable: true,
    label: X_FACTOR_LABELS.surfaceArea,
    inputType: "inputnumber",
    pipe: "roundedNumber",
    suffix: "m²",
    highlight: XFactorsKey.SURFACE_AREA,
  },

  {
    key: "facadeArea",
    editable: true,
    label: X_FACTOR_LABELS.facadeArea,
    inputType: "inputnumber",
    pipe: "roundedNumber",
    suffix: "m²",
    highlight: XFactorsKey.FACADE_AREA,
  },
  {
    key: "glazingArea",
    editable: true,
    label: X_FACTOR_LABELS.glazingArea,
    inputType: "inputnumber",
    pipe: "roundedNumber",
    suffix: "m²",
    highlight: XFactorsKey.GLAZING_AREA,
  },
  {
    key: "surfaceThatRequiresHeating",
    editable: true,
    label: "Surface chauffée",
    inputType: "inputnumber",
    pipe: "roundedNumber",
    suffix: "m²",
  },
  {
    key: "creationDate",
    editable: true,
    label: "Année",
    inputType: "datepicker",
  },
  {
    key: "nbBuildings",
    editable: true,
    label: "Nbr. bâtiments",
    inputType: "inputnumber",
    highlight: XFactorsKey.NB_BUILDINGS,
  },
  {
    key: "nbUnits",
    editable: true,
    label: "Nbr. lots",
    inputType: "inputnumber",
    highlight: XFactorsKey.NB_UNITS,
  },
  {
    key: "nbStoreys",
    editable: true,
    label: "Niveaux",
    inputType: "inputnumber",
    highlight: XFactorsKey.NB_STOREYS,
  },
  {
    key: "climateZone",
    editable: true,
    label: "Zone climatique",
    inputType: "dropdown",
    highlight: XFactorsKey.CLIMATE_ZONE,
  },
] as const satisfies BdnbPropConfig[];

const ENERGY_CONFIG = [
  {
    key: "energyType",
    editable: true,
    label: "Énergie",
    inputType: "dropdown",
  },
  {
    key: "heatingSystem",
    editable: true,
    label: "Chauffage",
    inputType: "dropdown",
  },
  {
    key: "electricityConsumptionPerSquareMeter",
    editable: true,
    label: "Consommation",
    inputType: "inputnumber",
    pipe: "roundedNumber",
    suffix: "Kwh/m²/an",
    highlight: XFactorsKey.ELECTRICITY_CONSUMPTION_PER_SQUARE_METER,
  },
  {
    key: "heatingType",
    editable: false,
    label: "Système",
    pipe: "heatingType",
  },
  {
    key: "annualGhg",
    editable: false,
    label: "Émission GES",
    pipe: "roundedNumber",
    suffix: "kgCO2e/an",
  },
  {
    key: "annualElectricityConsumption",
    editable: false,
    label: "Consommation annuelle",
    pipe: "roundedNumber",
    suffix: "Kwh",
  },
  {
    key: "annualElectricityCost",
    editable: false,
    onlyWhenReadonly: true,
    label: "Coût annuel",
    pipe: "roundedCurrency",
    suffix: "/an",
  },
  {
    key: "annualElectricityCostPerUnit",
    editable: false,
    onlyWhenReadonly: true,
    label: "Coût annuel/lot",
    pipe: "roundedCurrency",
    suffix: "/an",
  },
  {
    key: "monthlyElectricityCostPerUnit",
    editable: false,
    label: "Coût mensuel/lot",
    pipe: "roundedCurrency",
    suffix: "/mo",
  },
  {
    key: "proElecConsumption2020",
    editable: false,
    label: "Conso. pro élec. 2020",
    pipe: "roundedNumber",
    suffix: "kWh",
  },
  {
    key: "resElecConsumption2020",
    editable: false,
    label: "Conso. rés. élec. 2020",
    pipe: "roundedNumber",
    suffix: "kWh",
  },
  {
    key: "proGazConsumption2020",
    editable: false,
    label: "Conso. pro gaz 2020",
    pipe: "roundedNumber",
    suffix: "kWh",
  },
  {
    key: "resGazConsumption2020",
    editable: false,
    label: "Conso. rés. gaz 2020",
    pipe: "roundedNumber",
    suffix: "kWh",
  },
] as const satisfies BdnbPropConfig[];

const STRUCTURE_CONFIG = [
  {
    key: "meanHeight",
    editable: false,
    label: "Hauteur moyenne du bâtiment",
    suffix: "m",
  },
  {
    key: "perimeter",
    editable: false,
    label: "Périmètre",
    pipe: "roundedNumber",
    suffix: "m",
  },
  {
    key: "inertiaClass",
    editable: false,
    label: "Inertie du bâtiment",
  },
  {
    key: "hasBalcony",
    editable: false,
    label: "Présence de balcons",
  },
] as const satisfies BdnbPropConfig[];

const USAGE_CONFIG = [
  {
    key: "nbDwellings",
    editable: false,
    label: "Nombre total de logements",
  },
  {
    key: "nbDwellingsRnc",
    editable: false,
    label: "Nombre d’habitations",
  },
  {
    key: "nbTertiaryLotsRnc",
    editable: false,
    label: "Nombre de locaux à usage tertiaire",
  },
] as const satisfies BdnbPropConfig[];

const PDL_CONFIG = [
  {
    key: "nbResElec2020",
    editable: false,
    label: "Nombre de PDL rés. (électricité)",
  },
  {
    key: "nbProElec2020",
    editable: false,
    label: "Nombre de PDL pro. (électricité)",
  },
  {
    key: "nbProGaz2020",
    editable: false,
    label: "Nombre de PDL pro. (gaz)",
  },
  {
    key: "nbResGaz2020",
    editable: false,
    label: "Nombre de PDL rés. (gaz)",
  },
] as const satisfies BdnbPropConfig[];

const DPE_DETAIL_CONFIG = [
  {
    key: "dpeAssessmentClass",
    editable: false,
    label: "DPE le plus récent",
  },
  {
    key: "arrete2021",
    editable: false,
    label: "DPE post arrêté 2021",
    pipe: "toBoolean",
  },
  {
    key: "dpeIdentifier",
    editable: false,
    label: "Présence d’un DPE fiabilisé / certifié",
    pipe: "toBoolean",
  },
  {
    key: "gesEmissions5UsesPerM2",
    editable: false,
    label: "Émissions de GES 5 usages",
    suffix: "kgCO₂/m²",
  },
  {
    key: "gesEmissions3UsesEpM2Arrete2012",
    editable: false,
    label: "Émissions de GES 3 usages",
    suffix: "kgCO₂/m²",
  },
] as const satisfies BdnbPropConfig[];

const HVAC_CONFIG = [
  {
    key: "ventilationType",
    editable: false,
    label: "Ventilation (type)",
    pipe: "ventilationType",
  },
  {
    key: "acGeneratorType",
    editable: false,
    label: "Climatisation – type de générateur",
  },
  {
    key: "acGeneratorAge",
    editable: false,
    label: "Climatisation – ancienneté",
  },
  {
    key: "exteriorWallInsulationType",
    editable: false,
    label: "Isolation des murs extérieurs (type)",
  },
  {
    key: "exteriorWallUValue",
    editable: false,
    label: "Isolation des murs extérieurs (U)",
    pipe: "roundedNumber",
    suffix: "W/m².K",
  },
  {
    key: "lowerFloorInsulationType",
    editable: false,
    label: "Isolation du plancher bas (type)",
  },
  {
    key: "upperFloorInsulationType",
    editable: false,
    label: "Isolation du plancher haut (type)",
  },
  {
    key: "lowerFloorFinalUValue",
    editable: false,
    label: "Isolation du plancher bas (U)",
    pipe: "roundedNumber",
    suffix: "W/m².K",
  },
  {
    key: "upperFloorUValue",
    editable: false,
    label: "Isolation du plancher haut (U)",
    pipe: "roundedNumber",
    suffix: "W/m².K",
  },
] as const satisfies BdnbPropConfig[];

const ENVELOPE_CONFIG = [
  {
    key: "glazingType",
    editable: false,
    label: "Type de vitrage",
  },
  {
    key: "windowMaterialType",
    editable: false,
    label: "Matériau de menuiserie",
  },
  {
    key: "gasLayerType",
    editable: false,
    label: "Type de gaz (lame)",
  },
  {
    key: "shutterType",
    editable: false,
    label: "Type de fermeture",
    pipe: "shutterType",
  },
  {
    key: "virGlazing",
    editable: false,
    label: "Vitrage VIR",
  },
  {
    key: "windowUValue",
    editable: false,
    label: "Isolation baie vitrée (U)",
    pipe: "roundedNumber",
    suffix: "W/m².K",
  },
  {
    key: "windowSolarFactor",
    editable: false,
    label: "Facteur solaire baie vitrée",
    pipe: "roundedNumber",
  },
] as const satisfies BdnbPropConfig[];

const NETWORK_CONFIG: BdnbPropConfig[] = [
  {
    key: "networkId",
    editable: false,
    label: "ID Réseau",
  },
];

const RISKS_CONFIG: BdnbPropConfig[] = [
  {
    key: "radonRisk",
    editable: false,
    label: "Aléa radon",
  },
  {
    key: "clayRisk",
    editable: false,
    label: "Aléa argiles",
  },
  {
    key: "priorityDistrict",
    editable: false,
    label: "Quartier prioritaire",
  },
  {
    key: "districtNameQpv",
    editable: false,
    label: "Nom quartier QPV",
  },
  {
    key: "qpvCode",
    editable: false,
    label: "Code QP",
  },
];

export const OPTEE_BDNB_PROP_CONFIG: BdnbPropertyCategory[] = [
  {
    key: "characteristics",
    label: "Caractéristiques",
    properties: CHARACTERISTICS_CONFIG,
  },
  {
    key: "energy",
    label: "Énergie",
    properties: ENERGY_CONFIG,
  },
  {
    key: "structure",
    label: "Structure & enveloppe",
    properties: STRUCTURE_CONFIG,
  },
  {
    key: "usage",
    label: "Logements & usage",
    properties: USAGE_CONFIG,
  },
  {
    key: "pdl",
    label: "Point de livraison",
    properties: PDL_CONFIG,
  },
  {
    key: "dpeDetail",
    label: "DPE détaillé",
    properties: DPE_DETAIL_CONFIG,
  },
  {
    key: "hvac",
    label: "Chauffage, ventilation & clim.",
    properties: HVAC_CONFIG,
  },
  {
    key: "envelope",
    label: "Isolation & matériaux",
    properties: ENVELOPE_CONFIG,
  },
  {
    key: "network",
    label: "Réseaux & conso.",
    properties: NETWORK_CONFIG,
  },
  {
    key: "risks",
    label: "Risques & aléas",
    properties: RISKS_CONFIG,
  },
];
