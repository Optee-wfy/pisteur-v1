import { isNotNullish } from "../../../utils/src/lib/helpers/is/is-not-nullish/is-not-nullish.fn";
import { isNullish } from "../../../utils/src/lib/helpers/is/is-nullish/is-nullish.fn";
import { z } from "zod";
import { PUBLIC_ASSETS, type PublicAssetPath } from "./assets.constant";
import { type ClimateZone } from "./france.constant";
import { KWH_RATE } from "./generic.constant";
import {
  EstimatedCostParamsSchema,
  MAIN_SECTORS,
  SectorStringSchema,
  SectorZoneNumberSchema,
  XFactorParamsSchema,
  XFactorsKey,
  type MainSector,
  type SectorZoneNumber,
  type XFactorParams,
} from "./location.constant";

const PUBLIC_ASSETS_ENUMS = PUBLIC_ASSETS as unknown as [
  PublicAssetPath,
  ...PublicAssetPath[],
];

export enum OperationType {
  WORK = "Travaux",
  FUNDING = "Financements",
  CONTRACT = "Contrat",
  AUDIT = "Audit",
}

export enum OperationCreatedBy {
  PRO = "pro",
}

export const OPERATION_CREATED_BY = Object.values(OperationCreatedBy) as [
  OperationCreatedBy,
  ...OperationCreatedBy[],
];

export const OPERATION_HUBSPOT_PRESTATION_IDS = [
  // "Audit énergétique",
  "DPE",
  "DPE COLLECTIF + PPT",
  "AUDIT ENERGÉTIQUE",
  "DTG",
  "DTG + PPT",
  "OPERAT",
  // "Isolation enveloppe, fenêtres, menuiserie",
  "ISOLATION DES COMBLES",
  "ISOLATION TOITURES TERRASSES",
  "ISOLATION TOITURES INCLINÉES",
  "ITE",
  "ISOLATION PLANCHER",
  "FENETRES",
  "REVET RÉFLECTIF",
  // "Chauffage, ventilation, climatisation",
  "CHAUDIERE HPE",
  "Chaufferie - Système de récupération de chaleur",
  "POMPE A CHALEUR",
  "VENTILATION DOUBLE FLUX",
  "VENTILATION SIMPLE FLUX",
  "VENTILO CONVECTEUR",
  "DESTRATIFICATION DE L'AIR",
  "CALORIFUGEAGE",
  "BALLON THERMODYNAMIQUE",
  "POINTS SINGULIERS",
  "EQUILIBRAGE",
  "ROBINET THERMOSTATIQUE",
  "CHAUDIÈRE BIOMASSE",
  "OPTIMISEUR DE RELANCE EN CHAUFFAGE COLLECTIF",
  "DÉSEMBOUAGE",
  // "Systèmes de suivi",
  "GTB",
  "GTC",
  // "Eclairage éco-énergétique",
  "LED",
  "LUMIÈRE EXTÉRIEURE",
  // "Systèmes solaires et photovoltaïques",
  "PANNEAUX SOLAIRES",
  // "Récupération et gestion de l'eau",
  "RECUP CHALEUR EAUX GRISES",
  "SYSTÈMES HYDRO-ECONOMES",
  "RECUP CHALEUR TOUR AERO",
  // "Rénovation globale",
  "RÉNOVATION GLOBALE",
  "Architecte - Rénovation Globale",
  // "Optimisation des contrats",
  "CONTRAT ELECTRICITE",
  "CONTRAT GAZ",
  "Curage canalisation",
  "Installation / remplacement système de désemfumage",
  "Contractant Général - Rénovation Globale",
  "Diagnostic - installation électrique",
  "Diagnostic - sécurité incendie",
  "Diagnostic - humidité / infiltration / remontées capillaires",
  "Diagnostic - Amiante (DTA)",
  "Diagnostic - Chaufferie",
  "Diagnostic - Plomb (CREP)",
  "Diagnostic - Termites/Parasites",
  "Diagnostic - Structure",
  "Chaudière Electrique",
  "Raccordement réseau de chaleur urbain",
  "GTC",
  "Mise en conformité électrique des parties communes",
  "Réfection ou mise aux normes des installations gaz",
  "Installation de bornes de recharge électrique pour véhicules",
  "Refection de la toiture (hors isolation)",
  "Réparation ou reprise de charpente",
  "Réfection ou ravalement de façades (hors ITE)",
  "Réfection des balcons / garde-corps",
  "Traitement des fissures structurelles",
  "Traitement de l'humidité des murs",
  "Étanchéité ou réfection de toitures terrasses",
  "Réfection ou remplacement des colonnes montantes",
  "Panneaux solaires - Leasing",
  // "Autre", // Temp
] as const;

export type OperationHubspotPrestationId =
  (typeof OPERATION_HUBSPOT_PRESTATION_IDS)[number];

// CEE
const CeeFormulaParamsSchema = z.object({
  xFactor: z.number().nullish(),
  coefficient: z.number().nullish(),
  nbStoreys: z.number().nullish(),
  nbUnits: z.number().nullish(),
  mainSector: z.enum(MAIN_SECTORS).nullish(),
});
type CeeFormulaParams = z.infer<typeof CeeFormulaParamsSchema>;

export const OperationDescriptionSchema = z.object({
  definition: z.string(),
  implementation: z.string(),
  technical_criteria: z.array(z.string()),
  advantages: z.array(z.string()),
  vigilance_points: z.array(z.string()),
  note: z.string(),
});

export const OperationSubTypeInfoSchema = z.object({
  label: z.string(),
  publicAssetPath: z.enum(PUBLIC_ASSETS_ENUMS),
  hsPrestationId: z.enum(OPERATION_HUBSPOT_PRESTATION_IDS),
  hubspotTrigram: z.string(),
  formattedSentence: z.string(),
  ceeFileLabel: z.string().nullable(),
  availableForCollectiveHeating: z.boolean(),
  availableForIndividualHeating: z.boolean(),
  complexity: z.number(),
  gap: z.number().nullable(),
  availableForSectors: z.array(z.enum(MAIN_SECTORS)),
  coefficient: SectorZoneNumberSchema,
  ceeFile: SectorStringSchema.nullable(),
  getXFactor: z
    .function()
    .args(XFactorParamsSchema)
    .returns(z.number().nullish()),
  xFactorParams: z.array(z.nativeEnum(XFactorsKey)),
  estimatedCost: z
    .function()
    .args(EstimatedCostParamsSchema)
    .returns(z.number())
    .nullable(),
  kwhAmount: SectorZoneNumberSchema.nullable(),
  estimatedImpact: SectorZoneNumberSchema.nullable(),
  getFundingFormula: z
    .function()
    .args(CeeFormulaParamsSchema)
    .returns(z.number().nullish())
    .nullable(),
  description: OperationDescriptionSchema.nullish(),
});
export type OperationSubTypeInfo = z.infer<typeof OperationSubTypeInfoSchema>;

type IncompleteSubTypeInfo = Omit<
  OperationSubTypeInfo,
  "id" | "hubspotTrigram" | "hsPrestationId" | "label"
>;

export const FUNDING_CATEGORY = "Financement uniquement" as const;

export const OPERATION_TYPOLOGIES = [
  "Etudes & Conseil",
  "Opérations énergétique",
  "Opérations structure & conformité",
] as const;

export type OperationTypology = (typeof OPERATION_TYPOLOGIES)[number];

export const OPERATION_ICONS = [
  "audit",
  "solaire",
  "ventilation",
  "chauffage",
  "eclairage",
  "isolation",
  "renovation-globale",
  "gtb",
  "financement",
  "eau",
  "contrat",
  "securite",
  "structure",
] as const;

export type OperationIcon = (typeof OPERATION_ICONS)[number];

// Source: https://app-eu1.hubspot.com/property-settings/144886321/properties?type=0-3&search=Presta&action=edit&property=prestations
export const OPERATION_HUBSPOT_CATEGORIES = [
  "Rénovation globale",
  "Audit énergétique",
  "Optimisation des contrats",
  "Chauffage - Installation/Remplacement",
  "Chauffage, ventilation, climatisation",
  "Systèmes de suivi",
  "Eclairage éco-énergétique",
  "Isolation enveloppe, fenêtres, menuiserie",
  "Systèmes solaires et photovoltaïques",
  "Ventilation",
  "Récupération et gestion de l'eau",
  "Sécurité & conformité",
  "Structure du bâtiment",
  FUNDING_CATEGORY,
] as const;

export type OperationHubspotCategory =
  (typeof OPERATION_HUBSPOT_CATEGORIES)[number];

export const OperationTypeInfoSchema = z.object({
  label: z.string(),
  icon: z.enum(OPERATION_ICONS),
  type: z.nativeEnum(OperationType),
  typologie: z.enum(OPERATION_TYPOLOGIES),
  hsOperationCategory: z.enum(OPERATION_HUBSPOT_CATEGORIES), // "category" field in Deals table
  showBriefButton: z.boolean(),
  showAsMarketplaceFilter: z.boolean(),
  showAsProOption: z.boolean(),
  subTypes: z.array(OperationSubTypeInfoSchema),
  supportsAnalysis: z.boolean(),
});

export type OperationTypeInfo = z.infer<typeof OperationTypeInfoSchema>;

export const getOperationTypeCeeFile = (
  operationSubType: OperationSubTypeInfo,
  sector: MainSector,
) => {
  if (!operationSubType.ceeFile) {
    return null;
  }

  if (typeof operationSubType.ceeFile === "string") {
    return operationSubType.ceeFile;
  }

  return operationSubType.ceeFile[sector];
};

//@todo extract to location.constant ?
// @todo Typiquement le genre de truc qui devrait avoir ses tests
const extractSectorZoneNumber = ({
  data,
  mainSector,
  climateZone,
}: {
  data: SectorZoneNumber;
  mainSector: MainSector;
  climateZone: ClimateZone;
}) => {
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

export const getOperationTypeCost = (
  operationSubType: OperationSubTypeInfo,
  xFactorParams: XFactorParams,
) => {
  if (!operationSubType.estimatedCost) {
    return {
      data: null,
      error: "NO_ESTIMATED_COST_FORMULA",
    };
  }

  const xFactor = operationSubType.getXFactor(xFactorParams);

  if (isNullish(xFactor)) {
    const missingXFactorParams = operationSubType.xFactorParams.filter(
      (param) =>
        xFactorParams[param] === undefined || xFactorParams[param] === null,
    );

    return {
      data: null,
      error: "MISSING_XFACTOR_PARAMS",
      missingXFactorParams,
    };
  }

  const { mainSector, surfaceArea, climateZone } = xFactorParams;

  if (!mainSector || !surfaceArea || !climateZone) {
    return {
      data: null,
      error: "MISSING_XFACTOR_PARAMS",
      missingXFactorParams: [
        mainSector ? null : XFactorsKey.MAIN_SECTOR,
        surfaceArea ? null : XFactorsKey.SURFACE_AREA,
        climateZone ? null : XFactorsKey.CLIMATE_ZONE,
      ].filter(isNotNullish),
    };
  }

  const cost = operationSubType.estimatedCost({ mainSector, surfaceArea });

  if (cost === null) {
    return {
      data: null,
      error: "NO_COST",
    };
  }

  if (!operationSubType.coefficient) {
    return {
      data: null,
      error: "OPE_COEFF_NULL",
    };
  }

  const coefficient = extractSectorZoneNumber({
    data: operationSubType.coefficient,
    mainSector,
    climateZone,
  });

  if (coefficient === null) {
    return {
      data: null,
      error: "NO_COEFF_EXTRACTED",
    };
  }

  const amount = cost * xFactor * coefficient;

  if (amount > 999_999) {
    return { data: Math.round(amount / 100) * 100 };
  }

  if (amount > 999) {
    return { data: Math.round(amount / 10) * 10 };
  }

  return { data: Math.round(amount) };
};

export const getOperationTypeFunding = (
  operationSubType: OperationSubTypeInfo,
  xFactorParams: XFactorParams,
) => {
  const xFactor = operationSubType.getXFactor(xFactorParams);

  const { mainSector, climateZone, nbStoreys, nbUnits } = xFactorParams;

  if (!mainSector || !climateZone || !nbStoreys || !nbUnits) {
    return {
      data: null,
      error: "MISSING_XFACTOR_PARAMS",
      missingXFactorParams: [
        mainSector ? null : XFactorsKey.MAIN_SECTOR,
        climateZone ? null : XFactorsKey.CLIMATE_ZONE,
        nbStoreys ? null : XFactorsKey.NB_STOREYS,
        nbUnits ? null : XFactorsKey.NB_UNITS,
      ].filter(isNotNullish),
    };
  }

  if (operationSubType.kwhAmount === null) {
    return {
      data: null,
      error: "NULL_OPE_KWH_AMOUNT",
    };
  }

  const kwhAmount = extractSectorZoneNumber({
    data: operationSubType.kwhAmount,
    mainSector,
    climateZone,
  });

  if (kwhAmount === null) {
    return {
      data: null,
      error: "NULL_KWH_AMOUNT",
    };
  }

  if (operationSubType.coefficient === null) {
    return {
      data: null,
      error: "NULL_OPE_COEFF",
    };
  }

  const coefficient = extractSectorZoneNumber({
    data: operationSubType.coefficient,
    mainSector,
    climateZone,
  });

  if (coefficient === null) {
    return {
      data: null,
      error: "NULL_COEFF",
    };
  }

  if (!operationSubType.getFundingFormula) {
    return {
      data: null,
      error: "NO_FUNDING_FORMULA",
    };
  }

  const multiplier = operationSubType.getFundingFormula({
    coefficient,
    xFactor,
    mainSector,
    nbStoreys,
    nbUnits,
  });

  if (typeof multiplier !== "number") {
    return {
      data: null,
      error: "NO_MULTIPLIER",
    };
  }

  const amount = multiplier * kwhAmount * KWH_RATE;

  if (amount > 999_999) {
    return { data: Math.round(amount / 100) * 100 };
  }

  if (amount > 999) {
    return { data: Math.round(amount / 10) * 10 };
  }

  return { data: Math.round(amount) };
};

export const getOperationTypeImpact = (
  operationSubType: OperationSubTypeInfo,
  xFactorParams: XFactorParams,
) => {
  if (!operationSubType.estimatedImpact) {
    return {
      data: null,
      error: "NO_ESTIMATED_IMPACT_FORMULA",
    };
  }

  const { mainSector, climateZone } = xFactorParams;

  if (!mainSector || !climateZone) {
    return {
      data: null,
      error: "MISSING_XFACTOR_PARAMS",
      missingXFactorParams: [
        mainSector ? null : XFactorsKey.MAIN_SECTOR,
        climateZone ? null : XFactorsKey.CLIMATE_ZONE,
      ].filter(isNotNullish),
    };
  }

  return {
    data: extractSectorZoneNumber({
      data: operationSubType.estimatedImpact,
      mainSector,
      climateZone,
    }),
  };
};

const DTG = {
  publicAssetPath: "operation-images/audit.jpg",
  formattedSentence: "un diagnostic technique global (DTG)",
  ceeFileLabel: "Diagnotique Technique Global",
  availableForCollectiveHeating: true,
  availableForIndividualHeating: true,
  availableForSectors: ["resi", "ter"],
  ceeFile: null,
  complexity: 1,
  gap: 0.3,
  coefficient: 1,
  estimatedCost: ({ surfaceArea }) => {
    if (surfaceArea < 150) {
      return 44;
    }
    if (surfaceArea < 300) {
      return 40;
    }
    if (surfaceArea < 800) {
      return 35;
    }
    if (surfaceArea < 1500) {
      return 33.25;
    }
    return 30;
  },
  kwhAmount: 0,
  estimatedImpact: 0,
  getXFactor: ({ surfaceArea }: XFactorParams) => surfaceArea,
  xFactorParams: [XFactorsKey.SURFACE_AREA],
  getFundingFormula: ({ xFactor }: CeeFormulaParams) => xFactor,
} as const satisfies IncompleteSubTypeInfo;

const DPE = {
  publicAssetPath: "operation-images/audit.jpg",
  formattedSentence: "un audit énergétique simplifié (DPE)",
  ceeFileLabel: "Audit 3CL type DPE Collectif",
  availableForCollectiveHeating: true,
  availableForIndividualHeating: true,
  availableForSectors: ["resi", "ter"],
  ceeFile: null,
  complexity: 1,
  gap: 0.5,
  coefficient: 1,
  estimatedCost: ({ surfaceArea }) => {
    if (surfaceArea < 150) {
      return 33;
    }
    if (surfaceArea < 300) {
      return 30;
    }
    if (surfaceArea < 800) {
      return 20;
    }
    if (surfaceArea < 1500) {
      return 19;
    }
    return 15;
  },
  kwhAmount: 0,
  estimatedImpact: 0,
  getXFactor: ({ surfaceArea }: XFactorParams) => surfaceArea,
  xFactorParams: [XFactorsKey.SURFACE_AREA],
  getFundingFormula: ({ xFactor }: CeeFormulaParams) => xFactor,
} as const satisfies IncompleteSubTypeInfo;

type OperationTypeKey =
  | "ACCOMPAGNEMENT"
  | "AUDIT"
  | "CHAUFFAGE_INSTALL_REPLACE"
  | "CHAUFFAGE_OPTIMISATION"
  | "CONTRAT_ENERGIE"
  | "DOMOTIQUE"
  | "ECLAIRAGES"
  | "GESTION_EAU"
  | "ISOLATION"
  | "SECURITE_CONFIRMITE"
  | "STRUCTURE_BATIMENT"
  | "SYSTEME_SOLAIRE"
  | "VENTILATION";

export const OPERATION_TYPES: Record<OperationTypeKey, OperationTypeInfo> = {
  ACCOMPAGNEMENT: {
    label: "Accompagnement",
    icon: "renovation-globale",
    typologie: "Etudes & Conseil",
    type: OperationType.WORK,
    hsOperationCategory: "Rénovation globale",
    showBriefButton: true,
    showAsMarketplaceFilter: true,
    showAsProOption: true,
    supportsAnalysis: true,
    subTypes: [
      {
        label: "Architecte - Rénovation Globale",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId: "Architecte - Rénovation Globale",
        hubspotTrigram: "ARCH - RENO G",
        formattedSentence:
          "une opération de rénovation globale par un architecte",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi"],
        ceeFileLabel: null,
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: null,
        estimatedImpact: null,
        kwhAmount: null,
        description: {
          definition:
            "Cette opération consiste à encadrer, évaluer ou structurer un projet de rénovation globale. Elle peut impliquer l’analyse énergétique, réglementaire ou technique du bâtiment.",
          implementation:
            "Diagnostic initial, état des lieux, modélisation, simulations, coordination de projet ou planification. Travail en collaboration avec les parties prenantes (copropriété, syndic, bureau d’étude…).",
          technical_criteria: [
            "Respect des normes en vigueur (audit réglementaire, DPE, DTG)",
            "Dépendance au type de bâtiment et à son usage",
            "Obligations légales ou contextuelles selon la mission",
          ],
          advantages: [
            "Vision claire de l’état du bâtiment",
            "Aide à la décision stratégique pour les travaux",
            "Cadrage des objectifs énergétiques et économiques",
          ],
          vigilance_points: [
            "Qualité et précision du diagnostic ou de la mission",
            "Nécessité d’une coordination rigoureuse en phase projet",
          ],
          note: "Souvent en amont des travaux d’envergure, avec un rôle structurant pour la réussite du projet.",
        },
        getXFactor: ({ nbUnits }) => nbUnits,
        xFactorParams: [XFactorsKey.NB_UNITS],
        getFundingFormula: ({ xFactor, nbStoreys }) => {
          if (typeof xFactor !== "number" || typeof nbStoreys !== "number") {
            return null;
          }
          return xFactor * nbStoreys;
        },
      },
      {
        label: "AMO - Rénovation Globale",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId: "RÉNOVATION GLOBALE",
        hubspotTrigram: "AMO",
        formattedSentence: "une opération de rénovation globale",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi"],
        ceeFileLabel: null,
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: null,
        estimatedImpact: null,
        kwhAmount: null,
        description: {
          definition:
            "Cette opération consiste à encadrer, évaluer ou structurer un projet de rénovation globale. Elle peut impliquer l’analyse énergétique, réglementaire ou technique du bâtiment.",
          implementation:
            "Diagnostic initial, état des lieux, modélisation, simulations, coordination de projet ou planification. Travail en collaboration avec les parties prenantes (copropriété, syndic, bureau d’étude…).",
          technical_criteria: [
            "Respect des normes en vigueur (audit réglementaire, DPE, DTG)",
            "Dépendance au type de bâtiment et à son usage",
            "Obligations légales ou contextuelles selon la mission",
          ],
          advantages: [
            "Vision claire de l’état du bâtiment",
            "Aide à la décision stratégique pour les travaux",
            "Cadrage des objectifs énergétiques et économiques",
          ],
          vigilance_points: [
            "Qualité et précision du diagnostic ou de la mission",
            "Nécessité d’une coordination rigoureuse en phase projet",
          ],
          note: "Souvent en amont des travaux d’envergure, avec un rôle structurant pour la réussite du projet.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor, nbStoreys }) => {
          if (typeof xFactor !== "number" || typeof nbStoreys !== "number") {
            return null;
          }
          return xFactor * nbStoreys;
        },
      },
      {
        label: "Contractant Général - Rénovation Globale",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId: "Contractant Général - Rénovation Globale",
        hubspotTrigram: "CONT GEN - RENO G",
        formattedSentence: "une opération de rénovation globale",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi"],
        ceeFileLabel: "Rénovation globale d'un batiment résidentiel",
        ceeFile: "BAR-TH-177",
        complexity: 5,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 1650;
          }
          if (surfaceArea < 300) {
            return 1500;
          }
          if (surfaceArea < 800) {
            return 1000;
          }
          if (surfaceArea < 1500) {
            return 950;
          }
          return 900;
        },
        estimatedImpact: null,
        kwhAmount: null,
        description: {
          definition:
            "Cette opération consiste à encadrer, évaluer ou structurer un projet de rénovation globale. Elle peut impliquer l’analyse énergétique, réglementaire ou technique du bâtiment.",
          implementation:
            "Diagnostic initial, état des lieux, modélisation, simulations, coordination de projet ou planification. Travail en collaboration avec les parties prenantes (copropriété, syndic, bureau d’étude…).",
          technical_criteria: [
            "Respect des normes en vigueur (audit réglementaire, DPE, DTG)",
            "Dépendance au type de bâtiment et à son usage",
            "Obligations légales ou contextuelles selon la mission",
          ],
          advantages: [
            "Vision claire de l’état du bâtiment",
            "Aide à la décision stratégique pour les travaux",
            "Cadrage des objectifs énergétiques et économiques",
          ],
          vigilance_points: [
            "Qualité et précision du diagnostic ou de la mission",
            "Nécessité d’une coordination rigoureuse en phase projet",
          ],
          note: "Souvent en amont des travaux d’envergure, avec un rôle structurant pour la réussite du projet.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor, nbStoreys }) => {
          if (typeof xFactor !== "number" || typeof nbStoreys !== "number") {
            return null;
          }
          return xFactor * nbStoreys;
        },
      },
    ],
  },
  AUDIT: {
    label: "Audit & Diagnostics",
    icon: "audit",
    typologie: "Etudes & Conseil",
    type: OperationType.AUDIT,
    hsOperationCategory: "Audit énergétique",
    showBriefButton: true,
    showAsMarketplaceFilter: true,
    showAsProOption: true,
    supportsAnalysis: false,
    subTypes: [
      {
        ...DPE,
        label: "DPE : Diagnostic de Performance Énergétique",
        hsPrestationId: "DPE",
        hubspotTrigram: "DPE",
        description: {
          definition:
            "Cette opération consiste à encadrer, évaluer ou structurer un projet de rénovation globale. Elle peut impliquer l’analyse énergétique, réglementaire ou technique du bâtiment.",
          implementation:
            "Diagnostic initial, état des lieux, modélisation, simulations, coordination de projet ou planification. Travail en collaboration avec les parties prenantes (copropriété, syndic, bureau d’étude…).",
          technical_criteria: [
            "Respect des normes en vigueur (audit réglementaire, DPE, DTG)",
            "Dépendance au type de bâtiment et à son usage",
            "Obligations légales ou contextuelles selon la mission",
          ],
          advantages: [
            "Vision claire de l’état du bâtiment",
            "Aide à la décision stratégique pour les travaux",
            "Cadrage des objectifs énergétiques et économiques",
          ],
          vigilance_points: [
            "Qualité et précision du diagnostic ou de la mission",
            "Nécessité d’une coordination rigoureuse en phase projet",
          ],
          note: "Souvent en amont des travaux d’envergure, avec un rôle structurant pour la réussite du projet.",
        },
      },
      {
        ...DPE,
        label: "DPE + PPT : Diagnostic de Performance Énergétique",
        hsPrestationId: "DPE COLLECTIF + PPT",
        hubspotTrigram: "DPE COLLECTIF + PPT",
        description: {
          definition:
            "Cette opération combine l’évaluation énergétique d’un bâtiment via un DPE (Diagnostic de Performance Énergétique) et l’élaboration d’un PTT (Plan Pluriannuel de Travaux). L’objectif est d’anticiper et d’organiser les travaux à mener sur plusieurs années pour améliorer la performance énergétique et la pérennité du bâtiment.",
          implementation:
            "Réalisation d’un DPE pour établir l’état énergétique du bâtiment\n- Analyse des déperditions thermiques et des systèmes de chauffage, ventilation et isolation\n- Élaboration d’un plan pluriannuel en priorisant les interventions selon leur impact énergétique, économique et réglementaire\n- Estimation des coûts et des aides financières mobilisables",
          technical_criteria: [
            "Respect des obligations du DPE réglementaire",
            "Conformité avec la loi Climat & Résilience pour les copropriétés",
            "Prise en compte des scénarios d’évolution des performances énergétiques",
          ],
          advantages: [
            "Vision globale des besoins de rénovation",
            "Priorisation des travaux en fonction des gains énergétiques et des budgets disponibles",
            "Aide à la planification et à la décision collective en copropriété",
          ],
          vigilance_points: [
            "Cohérence entre le DPE et les préconisations du PTT",
            "Nécessité d’un suivi régulier pour actualiser le plan en fonction des évolutions réglementaires et techniques",
          ],
          note: "Le PTT devient obligatoire pour certaines copropriétés et doit être présenté en assemblée générale pour validation.",
        },
      },
      {
        label: "Audit énergétique réglementaire",
        publicAssetPath: "operation-images/audit.jpg",
        hsPrestationId: "AUDIT ENERGÉTIQUE",
        hubspotTrigram: "AUDIT EN",
        formattedSentence: "un audit énergétique réglementaire",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: 0.1,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 44;
          }
          if (surfaceArea < 300) {
            return 40;
          }
          if (surfaceArea < 800) {
            return 30;
          }
          if (surfaceArea < 1500) {
            return 28.5;
          }
          return 25;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Cette opération consiste à encadrer, évaluer ou structurer un projet de rénovation globale. Elle peut impliquer l’analyse énergétique, réglementaire ou technique du bâtiment.",
          implementation:
            "Diagnostic initial, état des lieux, modélisation, simulations, coordination de projet ou planification. Travail en collaboration avec les parties prenantes (copropriété, syndic, bureau d’étude…).",
          technical_criteria: [
            "Respect des normes en vigueur (audit réglementaire, DPE, DTG)",
            "Dépendance au type de bâtiment et à son usage",
            "Obligations légales ou contextuelles selon la mission",
          ],
          advantages: [
            "Vision claire de l’état du bâtiment",
            "Aide à la décision stratégique pour les travaux",
            "Cadrage des objectifs énergétiques et économiques",
          ],
          vigilance_points: [
            "Qualité et précision du diagnostic ou de la mission",
            "Nécessité d’une coordination rigoureuse en phase projet",
          ],
          note: "Souvent en amont des travaux d’envergure, avec un rôle structurant pour la réussite du projet.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor }) => xFactor,
      },
      {
        ...DTG,
        label: "DTG : Diagnostic Technique Global",
        hsPrestationId: "DTG",
        hubspotTrigram: "DTG",
        description: {
          definition:
            "Cette opération consiste à encadrer, évaluer ou structurer un projet de rénovation globale. Elle peut impliquer l’analyse énergétique, réglementaire ou technique du bâtiment.",
          implementation:
            "Diagnostic initial, état des lieux, modélisation, simulations, coordination de projet ou planification. Travail en collaboration avec les parties prenantes (copropriété, syndic, bureau d’étude…).",
          technical_criteria: [
            "Respect des normes en vigueur (audit réglementaire, DPE, DTG)",
            "Dépendance au type de bâtiment et à son usage",
            "Obligations légales ou contextuelles selon la mission",
          ],
          advantages: [
            "Vision claire de l’état du bâtiment",
            "Aide à la décision stratégique pour les travaux",
            "Cadrage des objectifs énergétiques et économiques",
          ],
          vigilance_points: [
            "Qualité et précision du diagnostic ou de la mission",
            "Nécessité d’une coordination rigoureuse en phase projet",
          ],
          note: "Souvent en amont des travaux d’envergure, avec un rôle structurant pour la réussite du projet.",
        },
      },
      {
        ...DTG,
        label: "DTG + PPT : Diagnostic Technique Global",
        hsPrestationId: "DTG + PPT",
        hubspotTrigram: "DTG + PPT",
        description: {
          definition:
            "Le DTG (Diagnostic Technique Global) permet d’évaluer l’état général d’un bâtiment, son niveau de performance énergétique et les éventuels risques structurels. Lorsqu’il est couplé à un PTT (Plan Pluriannuel de Travaux), il devient un outil de gestion pour anticiper, planifier et financer les travaux nécessaires sur le long terme.",
          implementation:
            "Inspection complète du bâti et de ses équipements\n- Évaluation des besoins en travaux à court, moyen et long terme\n- Élaboration d’un PTT structurant les interventions prioritaires\n- Estimation des coûts, phasage des interventions et identification des aides financières possibles",
          technical_criteria: [
            "Obligation de DTG pour certaines copropriétés en cas d’insalubrité avérée",
            "Conformité avec la loi Climat & Résilience et les obligations de rénovation énergétique",
            "Prise en compte de la vétusté et des risques techniques du bâtiment",
          ],
          advantages: [
            "Anticipation et maîtrise des dépenses liées à la rénovation",
            "Sécurisation et valorisation du patrimoine immobilier",
            "Planification claire pour les copropriétaires et le syndic",
          ],
          vigilance_points: [
            "Importance de bien prioriser les travaux selon les urgences techniques et énergétiques",
            "Mobilisation des copropriétaires autour du PTT pour faciliter son adoption",
          ],
          note: "Un DTG bien réalisé permet d’optimiser le plan pluriannuel et de sécuriser l’investissement des copropriétaires.",
        },
      },

      {
        label: "Diagnostic - Installation électrique",
        publicAssetPath: "operation-images/audit.jpg",
        hsPrestationId: "Diagnostic - installation électrique",
        hubspotTrigram: "DIAG - INSTALL ELEC",
        formattedSentence: "Diagnostic - installation électrique",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 6.6;
          }
          if (surfaceArea < 300) {
            return 6;
          }
          if (surfaceArea < 800) {
            return 4.0;
          }
          if (surfaceArea < 1500) {
            return 4;
          }
          return 4;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Analyse technique de la situation existante concernant installation électrique. Permet d’évaluer les risques, les anomalies ou la conformité aux normes en vigueur.",
          implementation:
            "Inspection visuelle, relevés sur site, mesures si nécessaire, analyse documentaire et rédaction d’un rapport.",
          technical_criteria: [
            "Normes en vigueur (NF, décret, arrêté selon le domaine)",
            "Obligation en cas de vente ou de travaux",
          ],
          advantages: [
            "Anticipation des risques techniques",
            "Sécurisation des travaux de rénovation",
            "Aide à la décision pour la MOA ou les gestionnaires",
          ],
          vigilance_points: [
            "Validité temporelle du diagnostic",
            "Méthodologie variable selon prestataires",
            "Nécessite parfois des prélèvements ou accès difficile",
          ],
          note: "Souvent à croiser avec d'autres diagnostics pour une vision complète.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Diagnostic - Sécurité incendie",
        publicAssetPath: "operation-images/audit.jpg",
        hsPrestationId: "Diagnostic - sécurité incendie",
        hubspotTrigram: "DIAG - SEC INC",
        formattedSentence: "Diagnostic - sécurité incendie",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 6.6;
          }
          if (surfaceArea < 300) {
            return 6;
          }
          if (surfaceArea < 800) {
            return 4.0;
          }
          if (surfaceArea < 1500) {
            return 4;
          }
          return 4;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Analyse technique de la situation existante concernant sécurité incendie. Permet d’évaluer les risques, les anomalies ou la conformité aux normes en vigueur.",
          implementation:
            "Inspection visuelle, relevés sur site, mesures si nécessaire, analyse documentaire et rédaction d’un rapport.",
          technical_criteria: [
            "Normes en vigueur (NF, décret, arrêté selon le domaine)",
            "Obligation en cas de vente ou de travaux",
          ],
          advantages: [
            "Anticipation des risques techniques",
            "Sécurisation des travaux de rénovation",
            "Aide à la décision pour la MOA ou les gestionnaires",
          ],
          vigilance_points: [
            "Validité temporelle du diagnostic",
            "Méthodologie variable selon prestataires",
            "Nécessite parfois des prélèvements ou accès difficile",
          ],
          note: "Souvent à croiser avec d'autres diagnostics pour une vision complète.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Diagnostic - Humidité / infiltration / remontées capillaires",
        publicAssetPath: "operation-images/audit.jpg",
        hsPrestationId:
          "Diagnostic - humidité / infiltration / remontées capillaires",
        hubspotTrigram: "DIAG - HUM",
        formattedSentence:
          "Diagnostic - humidité / infiltration / remontées capillaires",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 8.3;
          }
          if (surfaceArea < 300) {
            return 8;
          }
          if (surfaceArea < 800) {
            return 5.0;
          }
          if (surfaceArea < 1500) {
            return 5;
          }
          return 5;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Analyse technique de la situation existante concernant humidité / infiltration / remontées capillaires. Permet d’évaluer les risques, les anomalies ou la conformité aux normes en vigueur.",
          implementation:
            "Inspection visuelle, relevés sur site, mesures si nécessaire, analyse documentaire et rédaction d’un rapport.",
          technical_criteria: [
            "Normes en vigueur (NF, décret, arrêté selon le domaine)",
            "Obligation en cas de vente ou de travaux",
          ],
          advantages: [
            "Anticipation des risques techniques",
            "Sécurisation des travaux de rénovation",
            "Aide à la décision pour la MOA ou les gestionnaires",
          ],
          vigilance_points: [
            "Validité temporelle du diagnostic",
            "Méthodologie variable selon prestataires",
            "Nécessite parfois des prélèvements ou accès difficile",
          ],
          note: "Souvent à croiser avec d'autres diagnostics pour une vision complète.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Diagnostic - Amiante (DAT)",
        publicAssetPath: "operation-images/audit.jpg",
        hsPrestationId: "Diagnostic - Amiante (DTA)",
        hubspotTrigram: "DTA",
        formattedSentence: "Diagnostic - Amiante (DAT)",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 7.7;
          }
          if (surfaceArea < 300) {
            return 7;
          }
          if (surfaceArea < 800) {
            return 4.7;
          }
          if (surfaceArea < 1500) {
            return 4;
          }
          return 4;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Analyse technique de la situation existante concernant amiante (dta). Permet d’évaluer les risques, les anomalies ou la conformité aux normes en vigueur.",
          implementation:
            "Inspection visuelle, relevés sur site, mesures si nécessaire, analyse documentaire et rédaction d’un rapport.",
          technical_criteria: [
            "Normes en vigueur (NF, décret, arrêté selon le domaine)",
            "Obligation en cas de vente ou de travaux",
          ],
          advantages: [
            "Anticipation des risques techniques",
            "Sécurisation des travaux de rénovation",
            "Aide à la décision pour la MOA ou les gestionnaires",
          ],
          vigilance_points: [
            "Validité temporelle du diagnostic",
            "Méthodologie variable selon prestataires",
            "Nécessite parfois des prélèvements ou accès difficile",
          ],
          note: "Souvent à croiser avec d'autres diagnostics pour une vision complète.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Diagnostic - Dimensionnement chaufferie",
        publicAssetPath: "operation-images/audit.jpg",
        hsPrestationId: "Diagnostic - Chaufferie",
        hubspotTrigram: "DIAG - CHAUFF",
        formattedSentence: "Diagnostic - Chaufferie",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 6.6;
          }
          if (surfaceArea < 300) {
            return 6;
          }
          if (surfaceArea < 800) {
            return 4.0;
          }
          if (surfaceArea < 1500) {
            return 4;
          }
          return 4;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Analyse technique de la situation existante concernant chaufferie. Permet d’évaluer les risques, les anomalies ou la conformité aux normes en vigueur.",
          implementation:
            "Inspection visuelle, relevés sur site, mesures si nécessaire, analyse documentaire et rédaction d’un rapport.",
          technical_criteria: [
            "Normes en vigueur (NF, décret, arrêté selon le domaine)",
            "Obligation en cas de vente ou de travaux",
          ],
          advantages: [
            "Anticipation des risques techniques",
            "Sécurisation des travaux de rénovation",
            "Aide à la décision pour la MOA ou les gestionnaires",
          ],
          vigilance_points: [
            "Validité temporelle du diagnostic",
            "Méthodologie variable selon prestataires",
            "Nécessite parfois des prélèvements ou accès difficile",
          ],
          note: "Souvent à croiser avec d'autres diagnostics pour une vision complète.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Diagnostic - Plomb (DAT)",
        publicAssetPath: "operation-images/audit.jpg",
        hsPrestationId: "Diagnostic - Plomb (CREP)",
        hubspotTrigram: "DIAG - PLB",
        formattedSentence: "Diagnostic - Plomb (CREP)",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 4.4;
          }
          if (surfaceArea < 300) {
            return 4;
          }
          if (surfaceArea < 800) {
            return 2.7;
          }
          if (surfaceArea < 1500) {
            return 3;
          }
          return 2;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Analyse technique de la situation existante concernant plomb (crep). Permet d’évaluer les risques, les anomalies ou la conformité aux normes en vigueur.",
          implementation:
            "Inspection visuelle, relevés sur site, mesures si nécessaire, analyse documentaire et rédaction d’un rapport.",
          technical_criteria: [
            "Normes en vigueur (NF, décret, arrêté selon le domaine)",
            "Obligation en cas de vente ou de travaux",
          ],
          advantages: [
            "Anticipation des risques techniques",
            "Sécurisation des travaux de rénovation",
            "Aide à la décision pour la MOA ou les gestionnaires",
          ],
          vigilance_points: [
            "Validité temporelle du diagnostic",
            "Méthodologie variable selon prestataires",
            "Nécessite parfois des prélèvements ou accès difficile",
          ],
          note: "Souvent à croiser avec d'autres diagnostics pour une vision complète.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Diagnostic - Termites/Parasites",
        publicAssetPath: "operation-images/audit.jpg",
        hsPrestationId: "Diagnostic - Termites/Parasites",
        hubspotTrigram: "DIAG - PARASITE",
        formattedSentence: "Diagnostic - Termites/Parasites",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 4.4;
          }
          if (surfaceArea < 300) {
            return 4;
          }
          if (surfaceArea < 800) {
            return 2.7;
          }
          if (surfaceArea < 1500) {
            return 3;
          }
          return 2;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Ce diagnostic vise à détecter la présence de termites, insectes xylophages et autres parasites susceptibles d’endommager la structure du bâtiment. Il est souvent requis avant des travaux ou une transaction immobilière dans les zones à risque.",
          implementation:
            "Inspection visuelle des zones sensibles du bâtiment (boiseries, charpente, planchers…)\n- Utilisation de sondes et d’outils de détection (humidimètre, caméra thermique…)\n- Prélèvements et analyses pour identifier les espèces présentes\n- Rédaction d’un rapport avec recommandations et éventuels traitements à prévoir",
          technical_criteria: [
            "Obligatoire en zone infestée définie par arrêté préfectoral",
            "Norme NF P03-200 pour la méthodologie d’inspection",
            "Diagnostic valable 6 mois en cas de vente",
          ],
          advantages: [
            "Prévention des dégradations structurelles liées aux insectes et champignons",
            "Valorisation du bien immobilier en garantissant son intégrité",
            "Conformité réglementaire et anticipation des traitements nécessaires",
          ],
          vigilance_points: [
            "Traitement parfois coûteux selon l’ampleur de l’infestation",
            "Risque de propagation rapide si non traité rapidement",
          ],
          note: "Les termites peuvent fragiliser un bâtiment en quelques années, d’où l’importance d’un diagnostic préventif.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Diagnostic - Structure",
        publicAssetPath: "operation-images/audit.jpg",
        hsPrestationId: "Diagnostic - Structure",
        hubspotTrigram: "DIAG - STRUCT",
        formattedSentence: "Diagnostic - Structure",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 11.0;
          }
          if (surfaceArea < 300) {
            return 10;
          }
          if (surfaceArea < 800) {
            return 6.7;
          }
          if (surfaceArea < 1500) {
            return 6;
          }
          return 6;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Ce diagnostic permet d’évaluer la solidité et l’état général de la structure d’un bâtiment. Il est essentiel pour anticiper d’éventuelles pathologies du bâti et sécuriser les interventions à venir.",
          implementation:
            "Inspection visuelle des murs, planchers, charpente et fondations\n- Analyse des fissures, affaissements ou dégradations visibles\n- Tests complémentaires si nécessaire (sondages, analyse des matériaux, modélisation)\n- Rapport détaillé avec préconisations d’intervention",
          technical_criteria: [
            "Conformité aux normes NF P94-500 et Eurocodes de construction",
            "Nécessaire avant certaines rénovations lourdes ou en cas de sinistre",
            "Peut être exigé dans le cadre d’un permis de construire",
          ],
          advantages: [
            "Sécurisation des projets de rénovation",
            "Anticipation des risques d’effondrement ou d’affaissement",
            "Optimisation des solutions de renforcement structurel",
          ],
          vigilance_points: [
            "Peut nécessiter des investigations destructives (carottages, sondages…)",
            "Impact financier potentiel en cas de travaux structurels lourds",
          ],
          note: "Un diagnostic structure permet d’éviter des accidents et d’assurer la durabilité d’un bâtiment avant travaux.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Déclaration - OPERAT",
        publicAssetPath: "operation-images/audit.jpg",
        hsPrestationId: "OPERAT",
        hubspotTrigram: "OPERAT",
        formattedSentence: "une déclaration sur la plateforme OPERAT",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 900.0;
          }
          if (surfaceArea < 300) {
            return 900.0;
          }
          if (surfaceArea < 800) {
            return 900.0;
          }
          if (surfaceArea < 1500) {
            return 900.0;
          }
          return 900.0;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "La plateforme OPERAT (Observatoire de la Performance Énergétique, de la Rénovation et des Actions du Tertiaire) permet aux propriétaires et gestionnaires de bâtiments tertiaires de déclarer leurs consommations énergétiques et leurs actions de réduction.",
          implementation:
            "Collecte des données énergétiques du bâtiment\n- Vérification des seuils de consommation par rapport aux objectifs réglementaires\n- Déclaration sur la plateforme OPERAT et suivi des indicateurs de performance\n- Plan d’actions correctives en cas de non-conformité",
          technical_criteria: [
            "Obligation légale pour les bâtiments tertiaires > 1000 m² (Décret Tertiaire)",
            "Pénalités financières en cas de non-déclaration",
            "Actualisation annuelle des données énergétiques",
          ],
          advantages: [
            "Conformité avec la réglementation en vigueur",
            "Identification des leviers d’optimisation énergétique",
            "Possibilité d’accéder à des aides financières en fonction des performances atteintes",
          ],
          vigilance_points: [
            "Complexité administrative pour la collecte des données",
            "Nécessité d’un suivi régulier pour éviter les écarts réglementaires",
          ],
          note: "Le non-respect de l’obligation de déclaration peut entraîner des sanctions financières.",
        },
        getXFactor: () => 1,
        xFactorParams: [],
        getFundingFormula: null,
      },
    ],
  },
  CHAUFFAGE_INSTALL_REPLACE: {
    label: "Chauffage - Installation/Remplacement",
    icon: "chauffage",
    typologie: "Opérations énergétique",
    type: OperationType.WORK,
    hsOperationCategory: "Chauffage - Installation/Remplacement",
    showBriefButton: true,
    showAsMarketplaceFilter: true,
    showAsProOption: true,
    supportsAnalysis: true,
    subTypes: [
      {
        label: "Chaudière Gaz",
        publicAssetPath: "operation-images/chauffage.jpg",
        hsPrestationId: "CHAUDIERE HPE",
        hubspotTrigram: "CHAUD GAZ",
        formattedSentence:
          "Installation ou remplacement d'un système de chauffage collectif",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: false,
        availableForSectors: ["resi", "ter"],
        ceeFileLabel: "Chaufferie - Installation ou remplacement",
        ceeFile: {
          resi: "BAR-TH-107",
          ter: "BAT-TH-102",
        },
        complexity: 5,
        gap: 0.1,
        coefficient: {
          resi: 1,
          ter: 0.9,
        },
        estimatedCost: ({ surfaceArea, mainSector }) => {
          if (mainSector === "resi") {
            if (surfaceArea < 150) {
              return 6600;
            }
            if (surfaceArea < 300) {
              return 6000;
            }
            if (surfaceArea < 800) {
              return 4000;
            }
            if (surfaceArea < 1500) {
              return 3800;
            }
            return 3600;
          }

          if (surfaceArea < 150) {
            return 99;
          }
          if (surfaceArea < 300) {
            return 90;
          }
          if (surfaceArea < 800) {
            return 60;
          }
          if (surfaceArea < 1500) {
            return 57;
          }
          return 54;
        },
        estimatedImpact: {
          resi: 15.8,
          ter: 21,
        },
        kwhAmount: {
          resi: {
            H1: 0.0475,
            H2: 0.0409,
            H3: 0.0305,
          },
          ter: {
            H1: 0.00043,
            H2: 0.00036,
            H3: 0.00024,
          },
        },
        description: {
          definition:
            "Remplacement ou installation d’une chaudière gaz à haute performance énergétique, permettant un chauffage efficace avec une meilleure maîtrise des consommations.",
          implementation:
            "Dépose de l’ancienne chaudière si remplacement\n- Installation d’un nouveau générateur gaz à condensation\n- Raccordement aux réseaux de chauffage et de gaz\n- Réglages et mise en service",
          technical_criteria: [
            "Rendement supérieur à 90% pour bénéficier des aides financières",
            "Obligation d’entretien annuel",
            "Compatible avec les systèmes de régulation avancée",
          ],
          advantages: [
            "Bon rapport efficacité/coût",
            "Compatible avec des solutions hybrides (PAC, solaire)",
            "Réduction des émissions de CO₂ par rapport aux anciens modèles",
          ],
          vigilance_points: [
            "Dépendance au prix du gaz",
            "Interdiction progressive des chaudières gaz dans les constructions neuves",
          ],
          note: "Peut être combinée avec une PAC hybride pour optimiser les économies d’énergie.",
        },
        getXFactor: ({ surfaceArea, nbStoreys, mainSector, nbUnits }) => {
          if (mainSector === "resi") {
            return nbUnits;
          }

          if (
            typeof surfaceArea !== "number" ||
            typeof nbStoreys !== "number"
          ) {
            return null;
          }

          return surfaceArea * nbStoreys;
        },
        xFactorParams: [
          XFactorsKey.SURFACE_AREA,
          XFactorsKey.NB_STOREYS,
          XFactorsKey.MAIN_SECTOR,
          XFactorsKey.NB_UNITS,
        ],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "PAC : Pompe à chaleur de type air/eau ou eau/eau",
        publicAssetPath: "operation-images/pompe-a-chaleur.jpg",
        hsPrestationId: "POMPE A CHALEUR", // PAC : Pompe à chaleur de type air/eau ou eau/eau
        hubspotTrigram: "PAC",
        formattedSentence:
          "l'installation d'une pompe à chaleur (air/eau ou eau/eau)",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: false,
        availableForSectors: ["resi", "ter"],
        ceeFile: {
          resi: "BAR-TH-166",
          ter: "BAT-TH-113",
        },
        ceeFileLabel: "Pompe à chaleur de type air/eau ou eau/eau",
        complexity: 3,
        gap: 0.1,
        coefficient: {
          resi: 1,
          ter: 0.9,
        },
        estimatedCost: ({ surfaceArea, mainSector }) => {
          if (mainSector === "resi") {
            if (surfaceArea < 150) {
              return 5775;
            }
            if (surfaceArea < 300) {
              return 5250;
            }
            if (surfaceArea < 800) {
              return 3500;
            }
            if (surfaceArea < 1500) {
              return 3325;
            }
            return 3150;
          }

          if (surfaceArea < 150) {
            return 85.8;
          }
          if (surfaceArea < 300) {
            return 78;
          }
          if (surfaceArea < 800) {
            return 52;
          }
          if (surfaceArea < 1500) {
            return 49.4;
          }
          return 46.8;
        },
        estimatedImpact: {
          resi: 30,
          ter: 25,
        },
        kwhAmount: {
          resi: {
            H1: 0.043,
            H2: 0.035,
            H3: 0.0237,
          },
          ter: {
            H1: 0.00039,
            H2: 0.00032,
            H3: 0.00021,
          },
        },
        description: {
          definition:
            "Une pompe à chaleur (PAC) air/eau ou eau/eau permet de chauffer un bâtiment en récupérant l’énergie présente dans l’air ou dans l’eau (nappe phréatique, réseau de chaleur) et en la restituant via un circuit d’eau chaude.",
          implementation:
            "Étude de faisabilité et choix du type de PAC adapté\n- Installation de l’unité extérieure (air/eau) ou des capteurs hydrauliques (eau/eau)\n- Raccordement au circuit de chauffage existant (radiateurs, plancher chauffant…)\n- Mise en service, réglages et vérification des performances",
          technical_criteria: [
            "Compatibilité avec le système de chauffage en place",
            "Respect des normes environnementales (Fluide frigorigène, RT2012, RE2020)",
            "Nécessite un coefficient de performance (COP) élevé pour garantir un bon rendement",
          ],
          advantages: [
            "Économies d’énergie importantes par rapport à une chaudière classique",
            "Système écologique utilisant une énergie renouvelable",
            "Possibilité de financement via les aides CEE et MaPrimeRénov’",
          ],
          vigilance_points: [
            "Performance dépendante des températures extérieures (surtout pour air/eau)",
            "Nécessite un dimensionnement précis pour éviter la surconsommation électrique",
          ],
          note: "Idéale pour les bâtiments en rénovation cherchant une alternative aux chaudières gaz ou fioul.",
        },
        getXFactor: ({ surfaceArea, nbStoreys, mainSector, nbUnits }) => {
          if (mainSector === "resi") {
            return nbUnits;
          }

          if (
            typeof surfaceArea !== "number" ||
            typeof nbStoreys !== "number"
          ) {
            return null;
          }

          return surfaceArea * nbStoreys;
        },
        xFactorParams: [
          XFactorsKey.SURFACE_AREA,
          XFactorsKey.NB_STOREYS,
          XFactorsKey.MAIN_SECTOR,
          XFactorsKey.NB_UNITS,
        ],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "Chaudière biomasse",
        publicAssetPath: "operation-images/chauffage.jpg",
        hsPrestationId: "CHAUDIÈRE BIOMASSE",
        hubspotTrigram: "CHAUD BIO",
        formattedSentence: "l'installation d'un système de chauffage biomasse",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: false,
        availableForSectors: ["resi", "ter"],
        ceeFile: {
          resi: "BAR-TH-165",
          ter: "BAT-TH-157",
        },
        ceeFileLabel: "Chaudière biomasse",
        complexity: 5,
        gap: 0.1,
        coefficient: 1,
        estimatedCost: ({ surfaceArea, mainSector }) => {
          if (mainSector === "resi") {
            if (surfaceArea < 150) {
              return 4537.5;
            }
            if (surfaceArea < 300) {
              return 4125;
            }
            if (surfaceArea < 800) {
              return 2750;
            }
            if (surfaceArea < 1500) {
              return 2612.5;
            }
            return 2475;
          }

          if (surfaceArea < 150) {
            return 16.5;
          }
          if (surfaceArea < 300) {
            return 15;
          }
          if (surfaceArea < 800) {
            return 10;
          }
          if (surfaceArea < 1500) {
            return 9.5;
          }
          return 9;
        },
        estimatedImpact: 25,
        kwhAmount: {
          resi: 0.048,
          ter: 0.00096,
        },
        description: {
          definition:
            "Une chaudière biomasse utilise des combustibles naturels renouvelables (granulés, bois déchiqueté, bûches) pour produire de la chaleur, offrant une alternative écologique aux énergies fossiles.",
          implementation:
            "Étude de faisabilité et choix du type de biomasse adapté\n- Installation de la chaudière et du silo de stockage\n- Raccordement au réseau de chauffage et production d’eau chaude\n- Mise en service et réglages pour optimiser le rendement",
          technical_criteria: [
            "Obligation d’utiliser du bois certifié (DIN+, NF, EN+) pour optimiser le rendement",
            "Respect des normes d’émissions de particules fines (Label Flamme Verte)",
            "Existence d’aides financières selon la performance énergétique",
          ],
          advantages: [
            "Énergie renouvelable et locale, réduisant l’empreinte carbone",
            "Réduction des coûts de chauffage à long terme",
            "Eligible aux aides financières (CEE, MaPrimeRénov’, Fonds Chaleur)",
          ],
          vigilance_points: [
            "Nécessite un espace dédié pour le stockage du combustible",
            "Entretien régulier et ramonage obligatoire",
          ],
          note: "Particulièrement adaptée aux bâtiments ayant une forte consommation de chauffage.",
        },
        getXFactor: ({ nbUnits, mainSector, surfaceArea, nbStoreys }) => {
          if (mainSector === "resi") {
            return nbUnits;
          }

          if (
            typeof surfaceArea !== "number" ||
            typeof nbStoreys !== "number"
          ) {
            return null;
          }

          return surfaceArea * nbStoreys;
        },
        xFactorParams: [
          XFactorsKey.NB_UNITS,
          XFactorsKey.MAIN_SECTOR,
          XFactorsKey.SURFACE_AREA,
          XFactorsKey.NB_STOREYS,
        ],
        getFundingFormula: ({ xFactor }) => xFactor,
      },
      {
        label: "Raccordement réseau de chaleur urbain",
        publicAssetPath: "operation-images/chauffage.jpg",
        hsPrestationId: "Raccordement réseau de chaleur urbain",
        hubspotTrigram: "RESEAU URB",
        formattedSentence: "Raccordement réseau de chaleur urbain",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: false,
        availableForSectors: ["resi"],
        ceeFile: "BAR-TH-137",
        ceeFileLabel:
          "Raccordement d’un bâtiment résidentiel à un réseau de chaleur",
        complexity: 4,
        gap: 0.1,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 8250;
          }
          if (surfaceArea < 300) {
            return 7500;
          }
          if (surfaceArea < 800) {
            return 5000;
          }
          if (surfaceArea < 1500) {
            return 4750;
          }
          return 4500;
        },
        estimatedImpact: 15,
        kwhAmount: {
          resi: {
            H1: 0.0475,
            H2: 0.0395,
            H3: 0.0308,
          },
        },
        description: {
          definition:
            "Connexion d’un bâtiment à un réseau de chaleur urbain, permettant de bénéficier d’une énergie souvent issue d’énergies renouvelables ou de récupération.",
          implementation:
            "Étude de faisabilité et validation technique\n- Travaux de raccordement au réseau public\n- Installation d’un échangeur de chaleur et adaptation du réseau de chauffage interne",
          technical_criteria: [
            "Dépendance à la disponibilité d’un réseau de chaleur",
            "Obligation de souscription à un contrat d’exploitation",
            "Potentiel d’économies d’énergie selon la part ENR du réseau",
          ],
          advantages: [
            "Réduction des coûts et de l’empreinte carbone",
            "Pas d’entretien de chaudière individuel",
            "Tarification souvent plus stable que le gaz ou l’électricité",
          ],
          vigilance_points: [
            "Investissement initial important",
            "Possible engagement sur plusieurs années avec l’opérateur du réseau",
          ],
          note: "Solution particulièrement intéressante pour les bâtiments collectifs ou tertiaires.",
        },

        getXFactor: ({ nbUnits }) => nbUnits,
        xFactorParams: [XFactorsKey.NB_UNITS],
        getFundingFormula: ({ xFactor }) => xFactor,
      },
      {
        label: "Chaudière Electrique",
        publicAssetPath: "operation-images/chauffage.jpg",
        hsPrestationId: "Chaudière Electrique",
        hubspotTrigram: "CHAUD ELEC",
        formattedSentence:
          "l'installation d'un système d'une chaudière Electrique",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: false,
        availableForSectors: ["resi", "ter"],
        ceeFile: {
          resi: "BAR-TH-107",
          ter: "BAT-TH-102",
        },
        ceeFileLabel: "Chaudière collective haute performance énergétique",
        complexity: 4,
        gap: 0.1,
        coefficient: {
          resi: 1,
          ter: 0.9,
        },
        estimatedCost: ({ surfaceArea, mainSector }) => {
          if (mainSector === "resi") {
            if (surfaceArea < 150) {
              return 6600;
            }
            if (surfaceArea < 300) {
              return 6000;
            }
            if (surfaceArea < 800) {
              return 4000;
            }
            if (surfaceArea < 1500) {
              return 3800;
            }
            return 3600;
          }

          if (surfaceArea < 150) {
            return 99;
          }
          if (surfaceArea < 300) {
            return 90;
          }
          if (surfaceArea < 800) {
            return 60;
          }
          if (surfaceArea < 1500) {
            return 57;
          }
          return 54;
        },
        estimatedImpact: 21,
        kwhAmount: {
          resi: {
            H1: 0.0475,
            H2: 0.0409,
            H3: 0.0305,
          },
          ter: {
            H1: 0.00043,
            H2: 0.00036,
            H3: 0.00024,
          },
        },
        description: {
          definition:
            "Remplacement ou installation d’une chaudière électrique, alternative adaptée pour les bâtiments sans raccordement au gaz.",
          implementation:
            "Installation sur le réseau hydraulique de chauffage\n- Raccordement électrique et paramétrage\n- Vérification des protections électriques et mise en service",
          technical_criteria: [
            "Rendement proche de 100% mais impacté par le prix de l’électricité",
            "Compatible avec une alimentation en énergie renouvelable",
            "Obligation de respecter les normes électriques en vigueur",
          ],
          advantages: [
            "Facilité d’installation et d’entretien",
            "Aucune émission de CO₂ sur site",
            "Compatible avec des systèmes solaires thermiques",
          ],
          vigilance_points: [
            "Coût élevé à l’usage en fonction du tarif de l’électricité",
            "Moins adapté aux grandes surfaces chauffées",
          ],
          note: "Idéale pour des bâtiments bien isolés ou en complément d’une autre source de chauffage.",
        },
        getXFactor: ({ nbUnits, mainSector, surfaceArea, nbStoreys }) => {
          if (mainSector === "resi") {
            return nbUnits;
          }

          if (
            typeof surfaceArea !== "number" ||
            typeof nbStoreys !== "number"
          ) {
            return null;
          }

          return surfaceArea * nbStoreys;
        },
        xFactorParams: [
          XFactorsKey.NB_UNITS,
          XFactorsKey.MAIN_SECTOR,
          XFactorsKey.SURFACE_AREA,
          XFactorsKey.NB_STOREYS,
        ],
        getFundingFormula: ({ xFactor }) => xFactor,
      },
    ],
  },
  CHAUFFAGE_OPTIMISATION: {
    label: "Chauffage - Optimisation",
    icon: "chauffage",
    typologie: "Opérations énergétique",
    type: OperationType.WORK,
    hsOperationCategory: "Chauffage, ventilation, climatisation",
    showBriefButton: true,
    showAsMarketplaceFilter: true,
    showAsProOption: true,
    supportsAnalysis: true,
    subTypes: [
      {
        label: "Récupération de chaleur sur groupe de production de froid",
        publicAssetPath: "operation-images/chauffage.jpg",
        hsPrestationId: "Chaufferie - Système de récupération de chaleur",
        hubspotTrigram: "RECUP CHAL",
        formattedSentence:
          "Installation d'un système de récupération de chaleur d’un chauffage collectif",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: false,
        availableForSectors: ["resi", "ter"],
        ceeFileLabel: "Chaufferie - Système de récupération de chaleur",
        ceeFile: {
          resi: "BAR-TH-107",
          ter: "BAT-TH-102",
        },
        complexity: 3,
        gap: 0.1,
        coefficient: {
          resi: 1,
          ter: 0.9,
        },
        estimatedCost: ({ surfaceArea, mainSector }) => {
          if (mainSector === "resi") {
            if (surfaceArea < 150) {
              return 1155;
            }
            if (surfaceArea < 300) {
              return 1050;
            }
            if (surfaceArea < 800) {
              return 700;
            }
            if (surfaceArea < 1500) {
              return 665;
            }
            return 630;
          }

          if (surfaceArea < 150) {
            return 49.5;
          }
          if (surfaceArea < 300) {
            return 45;
          }
          if (surfaceArea < 800) {
            return 30;
          }
          if (surfaceArea < 1500) {
            return 28.5;
          }
          return 27;
        },
        estimatedImpact: 15.8,
        kwhAmount: {
          resi: {
            H1: 0.0475,
            H2: 0.0409,
            H3: 0.0305,
          },
          ter: {
            H1: 0.00043,
            H2: 0.00036,
            H3: 0.00024,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea, nbStoreys, mainSector, nbUnits }) => {
          if (mainSector === "resi") {
            return nbUnits;
          }

          if (
            typeof surfaceArea !== "number" ||
            typeof nbStoreys !== "number"
          ) {
            return null;
          }

          return surfaceArea * nbStoreys;
        },
        xFactorParams: [
          XFactorsKey.SURFACE_AREA,
          XFactorsKey.NB_STOREYS,
          XFactorsKey.MAIN_SECTOR,
          XFactorsKey.NB_UNITS,
        ],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "Isolation du réseau (calorifugeage)",
        publicAssetPath: "operation-images/reglage-tuyau.jpg",
        hsPrestationId: "CALORIFUGEAGE",
        hubspotTrigram: "CALO",
        formattedSentence:
          "une opération de calorifugeage (réseau de distribution)",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: false,
        availableForSectors: ["resi", "ter"],
        ceeFile: {
          resi: "BAR-TH-160",
          ter: "BAT-TH-146",
        },
        ceeFileLabel:
          "Isolation d’un réseau hydraulique de chauffage ou d’eau chaude sanitaire",
        complexity: 1,
        gap: 0.1,
        coefficient: 0.3,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 50.05;
          }
          if (surfaceArea < 300) {
            return 45.5;
          }
          if (surfaceArea < 800) {
            return 35;
          }
          if (surfaceArea < 1500) {
            return 33.25;
          }
          return 30;
        },
        estimatedImpact: 15,
        kwhAmount: {
          resi: {
            H1: 0.0051,
            H2: 0.0046,
            H3: 0.0038,
          },
          ter: {
            H1: 0.0043,
            H2: 0.004,
            H3: 0.0036,
          },
        },
        description: {
          definition:
            "Le calorifugeage consiste à isoler les canalisations de chauffage et d’eau chaude afin de limiter les déperditions thermiques et d’améliorer la performance énergétique du bâtiment.",
          implementation:
            "Identification des zones à isoler (tuyauteries, vannes, pompes…)\n- Pose d’un isolant spécifique (coquilles en laine de verre, mousse élastomère, etc.)\n- Vérification des joints et des raccords pour une étanchéité optimale",
          technical_criteria: [
            "Respect des exigences de la réglementation thermique RT2012 et RE2020",
            "Sélection des matériaux isolants certifiés (classement feu, résistance thermique)",
            "Obligatoire pour bénéficier des aides CEE",
          ],
          advantages: [
            "Réduction des pertes de chaleur jusqu’à 30%",
            "Amélioration du confort thermique et de la durabilité des installations",
            "Rentabilité rapide avec un retour sur investissement en quelques années",
          ],
          vigilance_points: [
            "Vérifier l’accessibilité des conduits avant intervention",
            "Certains isolants nécessitent une protection contre l’humidité et les chocs",
          ],
          note: "Fortement recommandé dans les chaufferies collectives et les réseaux de grande longueur.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "Chauffe-eau thermodynamique",
        publicAssetPath: "operation-images/hydraulique.jpg",
        hsPrestationId: "BALLON THERMODYNAMIQUE",
        hubspotTrigram: "CHAUFF EAU THERMO",
        formattedSentence: "l'installation d'un chauffe eau thermodynamique",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi"],
        ceeFile: "BAR-TH-148",
        ceeFileLabel: "Chauffe-eau thermodynamique à accumulation",
        complexity: 3,
        gap: 0.1,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 3712.5;
          }
          if (surfaceArea < 300) {
            return 3375;
          }
          if (surfaceArea < 800) {
            return 2250;
          }
          if (surfaceArea < 1500) {
            return 2137.5;
          }
          return 1800;
        },
        estimatedImpact: 18,
        kwhAmount: {
          resi: 0.0119,
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ nbUnits }) => nbUnits,
        xFactorParams: [XFactorsKey.NB_UNITS],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "Isolation de points singuliers en chaufferie",
        publicAssetPath: "operation-images/reglage-tuyau.jpg",
        hsPrestationId: "POINTS SINGULIERS",
        hubspotTrigram: "PT SING",
        formattedSentence: "une opération d'isolation des points singuliers",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: false,
        availableForSectors: ["resi", "ter"],
        ceeFile: {
          resi: "BAR-TH-161",
          ter: "BAT-TH-155",
        },
        ceeFileLabel: "Isolation de Point singuliers",
        complexity: 1,
        gap: 0.1,
        coefficient: 0.05,
        estimatedCost: ({ surfaceArea, mainSector }) => {
          if (mainSector === "resi") {
            if (surfaceArea < 150) {
              return 57.75;
            }
            if (surfaceArea < 300) {
              return 52.5;
            }
            if (surfaceArea < 800) {
              return 35;
            }
            if (surfaceArea < 1500) {
              return 33.25;
            }
            return 28;
          }

          if (surfaceArea < 150) {
            return 99;
          }
          if (surfaceArea < 300) {
            return 90;
          }
          if (surfaceArea < 800) {
            return 60;
          }
          if (surfaceArea < 1500) {
            return 57;
          }
          return 48;
        },
        estimatedImpact: {
          resi: 6,
          ter: 8,
        },
        kwhAmount: {
          resi: {
            H1: 0.0117,
            H2: 0.0105,
            H3: 0.0088,
          },
          ter: {
            H1: 0.0117,
            H2: 0.0105,
            H3: 0.0088,
          },
        },
        description: {
          definition:
            "L’isolation des points singuliers (vannes, pompes, brides…) permet de compléter le calorifugeage des réseaux en évitant les ponts thermiques, responsables de déperditions énergétiques importantes.",
          implementation:
            "Identification des points critiques non isolés\n- Mise en place de capots isolants ou de matelas amovibles\n- Vérification de la bonne couverture et de l’efficacité thermique",
          technical_criteria: [
            "Respect des exigences en efficacité énergétique des installations",
            "Matériaux résistants aux hautes températures et aux contraintes mécaniques",
            "Nécessaire pour optimiser les performances globales d’une chaufferie",
          ],
          advantages: [
            "Amélioration de l’efficacité énergétique sans intervention lourde",
            "Réduction des déperditions thermiques et des coûts de chauffage",
            "Sécurisation des équipements en réduisant les risques de brûlure",
          ],
          vigilance_points: [
            "Certains équipements nécessitent une isolation spécifique selon leur usage",
            "Maintenance à prévoir pour vérifier l’état des isolants dans le temps",
          ],
          note: "Une action complémentaire indispensable aux opérations de calorifugeage pour optimiser la performance des chaufferies collectives.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "Réglage des organes d'équilibrages",
        publicAssetPath: "operation-images/reglage-tuyau.jpg",
        hsPrestationId: "EQUILIBRAGE",
        hubspotTrigram: "EQUI",
        formattedSentence: "un réglage des organes d'équilibrage",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: false,
        availableForSectors: ["resi", "ter"],
        ceeFile: {
          resi: "BAR-SE-104",
          ter: "BAT-SE-103",
        },
        ceeFileLabel: "Réglage des organes d'équilibrages",
        complexity: 1,
        gap: 0.1,
        coefficient: 1,
        estimatedCost: ({ surfaceArea, mainSector }) => {
          if (mainSector === "resi") {
            if (surfaceArea < 150) {
              return 82.5;
            }
            if (surfaceArea < 300) {
              return 75;
            }
            if (surfaceArea < 800) {
              return 30;
            }
            if (surfaceArea < 1500) {
              return 28.5;
            }
            return 27;
          }

          if (surfaceArea < 150) {
            return 1.65;
          }
          if (surfaceArea < 300) {
            return 1.5;
          }
          if (surfaceArea < 800) {
            return 1;
          }
          if (surfaceArea < 1500) {
            return 0.95;
          }
          return 0.9;
        },
        estimatedImpact: {
          resi: 10,
          ter: 12,
        },
        kwhAmount: {
          resi: {
            H1: 0.0117,
            H2: 0.0105,
            H3: 0.0088,
          },
          ter: {
            H1: 0.00012,
            H2: 0.0001,
            H3: 0.000067,
          },
        },
        description: {
          definition:
            "Cette opération vise à optimiser la répartition du chauffage et du débit d’eau chaude dans un réseau collectif en ajustant les vannes et robinets d’équilibrage.",
          implementation:
            "Mesure des débits et relevé des déséquilibres hydrauliques\n- Ajustement des vannes d’équilibrage statiques ou dynamiques\n- Vérification du bon fonctionnement et amélioration des performances",
          technical_criteria: [
            "Obligatoire pour assurer une répartition homogène du chauffage",
            "Améliore le rendement des générateurs de chaleur (chaudières, PAC)",
            "Conforme aux bonnes pratiques d’exploitation des chaufferies",
          ],
          advantages: [
            "Réduction des écarts de température entre les logements",
            "Diminution des consommations énergétiques en évitant les surchauffes",
            "Confort thermique amélioré pour les occupants",
          ],
          vigilance_points: [
            "Nécessite des outils de mesure précis pour un réglage optimal",
            "Un mauvais équilibrage peut entraîner une surconsommation énergétique",
          ],
          note: "Recommandé avant toute rénovation énergétique d’un système de chauffage collectif pour assurer un fonctionnement optimal et éviter les déséquilibres thermiques.",
        },
        getXFactor: ({ surfaceArea, nbStoreys, mainSector, nbUnits }) => {
          if (mainSector === "resi") {
            return nbUnits;
          }

          if (
            typeof surfaceArea !== "number" ||
            typeof nbStoreys !== "number"
          ) {
            return null;
          }

          return surfaceArea * nbStoreys;
        },
        xFactorParams: [
          XFactorsKey.SURFACE_AREA,
          XFactorsKey.NB_STOREYS,
          XFactorsKey.MAIN_SECTOR,
          XFactorsKey.NB_UNITS,
        ],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "Installation de Robinets thermostatiques",
        publicAssetPath: "operation-images/reglage-tuyau.jpg",
        hsPrestationId: "ROBINET THERMOSTATIQUE",
        hubspotTrigram: "R THERMO",
        formattedSentence: "l'installation de robinets thermostatiques",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: {
          resi: "BAR-TH-117",
          ter: "BAT-TH-104",
        },
        ceeFileLabel: "Robinet thermostatique",
        complexity: 2,
        gap: 0.1,
        coefficient: {
          resi: 10,
          ter: 0.03,
        },
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 57.75;
          }
          if (surfaceArea < 300) {
            return 52.5;
          }
          if (surfaceArea < 800) {
            return 35;
          }
          if (surfaceArea < 1500) {
            return 33.25;
          }
          return 31.5;
        },
        estimatedImpact: {
          resi: 5,
          ter: 4,
        },
        kwhAmount: {
          resi: {
            H1: 0.0012,
            H2: 0.00098,
            H3: 0.00065,
          },
          ter: {
            H1: 0.0001,
            H2: 0.000081,
            H3: 0.000054,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea, mainSector, nbUnits }) => {
          if (mainSector === "resi") {
            return nbUnits;
          }

          return surfaceArea;
        },
        xFactorParams: [
          XFactorsKey.SURFACE_AREA,
          XFactorsKey.MAIN_SECTOR,
          XFactorsKey.NB_UNITS,
        ],
        getFundingFormula: ({
          xFactor,
          nbStoreys,
          coefficient,
          mainSector,
        }) => {
          if (mainSector === "resi") {
            if (
              typeof xFactor !== "number" ||
              typeof coefficient !== "number"
            ) {
              return null;
            }

            return xFactor * coefficient;
          }

          if (typeof xFactor !== "number" || typeof nbStoreys !== "number") {
            return null;
          }

          return xFactor * nbStoreys;
        },
      },
      {
        label: "Désembouage d'un chauffage collectif",
        publicAssetPath: "operation-images/reglage-tuyau.jpg",
        hsPrestationId: "DÉSEMBOUAGE",
        hubspotTrigram: "DESEMB",
        formattedSentence:
          "une opération de désembouage du système de chauffage",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: false,
        availableForSectors: ["resi"],
        ceeFile: "BAR-SE-109",
        ceeFileLabel: "Désembouage d'un chauffage collectif",
        complexity: 2,
        gap: 0.1,
        coefficient: 10,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 57.75;
          }
          if (surfaceArea < 300) {
            return 52.5;
          }
          if (surfaceArea < 800) {
            return 35;
          }
          if (surfaceArea < 1500) {
            return 33.25;
          }
          return 31.5;
        },
        estimatedImpact: 10,
        kwhAmount: {
          resi: {
            H1: 0.0126,
            H2: 0.0121,
            H3: 0.0089,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ nbUnits }) => nbUnits,
        xFactorParams: [XFactorsKey.NB_UNITS],
        getFundingFormula: ({ xFactor }) => {
          if (typeof xFactor !== "number") {
            return null;
          }

          return xFactor;
        },
      },
      {
        label: "Optimiseur de relance en chauffage collectif",
        publicAssetPath: "operation-images/chauffage.jpg",
        hsPrestationId: "OPTIMISEUR DE RELANCE EN CHAUFFAGE COLLECTIF",
        hubspotTrigram: "OPTI CHAUFF COLLEC",
        formattedSentence: "l'installation d'un optimiseur de relance",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: false,
        availableForSectors: ["resi"],
        ceeFile: {
          resi: "BAR-TH-123",
        },
        ceeFileLabel: "Optimiseur de relance en chauffage collectif",
        complexity: 1,
        gap: 0.1,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 4950;
          }
          if (surfaceArea < 300) {
            return 4500;
          }
          if (surfaceArea < 800) {
            return 3000;
          }
          if (surfaceArea < 1500) {
            return 2850;
          }
          return 2700;
        },
        estimatedImpact: 12,
        kwhAmount: {
          resi: {
            H1: 0.0064,
            H2: 0.0052,
            H3: 0.0035,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ nbBuildings }) => nbBuildings,
        xFactorParams: [XFactorsKey.NB_BUILDINGS],
        getFundingFormula: ({ xFactor, nbUnits }) => {
          if (typeof xFactor !== "number" || typeof nbUnits !== "number") {
            return null;
          }

          return xFactor * nbUnits;
        },
      },
    ],
  },
  CONTRAT_ENERGIE: {
    label: "Contrat d'énergie",
    icon: "contrat",
    typologie: "Etudes & Conseil",
    type: OperationType.CONTRACT,
    hsOperationCategory: "Optimisation des contrats",
    showBriefButton: false,
    showAsMarketplaceFilter: false,
    showAsProOption: true, // <--- on a changé ici pour le rendre visible
    supportsAnalysis: false,
    subTypes: [
      {
        label: "Contrat énergétique - Electricité",
        publicAssetPath: "operation-images/contrat-energie.jpg",
        hsPrestationId: "CONTRAT ELECTRICITE",
        hubspotTrigram: "CONT ENERG",
        formattedSentence: "une renégociation de votre contrat d'électricité",
        availableForSectors: ["resi", "ter"],
        availableForCollectiveHeating: true,
        availableForIndividualHeating: false,
        ceeFile: null,
        ceeFileLabel: null,
        complexity: 1,
        gap: 0.1,
        coefficient: 1,
        estimatedCost: null,
        estimatedImpact: 0,
        kwhAmount: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: () => 1,
        xFactorParams: [],
        getFundingFormula: null,
      },
      {
        label: "Contrat énergétique - Gaz",
        publicAssetPath: "operation-images/contrat-energie.jpg",
        hsPrestationId: "CONTRAT GAZ",
        hubspotTrigram: "CONT ENERG",
        formattedSentence: "une renégociation de votre contrat de gaz",
        availableForSectors: ["resi", "ter"],
        availableForCollectiveHeating: true,
        availableForIndividualHeating: false,
        ceeFile: null,
        ceeFileLabel: null,
        complexity: 1,
        gap: 0.1,
        coefficient: 1,
        estimatedCost: null,
        estimatedImpact: 0,
        kwhAmount: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: () => 1,
        xFactorParams: [],
        getFundingFormula: null,
      },
    ],
  },
  DOMOTIQUE: {
    label: "Domotique",
    icon: "gtb",
    typologie: "Opérations énergétique",
    type: OperationType.WORK,
    hsOperationCategory: "Systèmes de suivi",
    showBriefButton: true,
    showAsMarketplaceFilter: true,
    showAsProOption: true,
    supportsAnalysis: true,
    subTypes: [
      {
        label: "GTB - Système de pilotage du bâtiment",
        publicAssetPath: "operation-images/domotique.jpg",
        hsPrestationId: "GTB",
        hubspotTrigram: "GTB",
        availableForSectors: ["ter"],
        formattedSentence:
          "l'installation d'un système de gestion technique du bâtiment",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        ceeFile: "BAT-TH-116",
        ceeFileLabel:
          "Système de gestion technique du bâtiment pour le chauffage, l’eau chaude sanitaire, le refroidissement/climatisation, l’éclairage et les auxiliaires",
        complexity: 2,
        gap: 0.1,
        coefficient: 0.8,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 44;
          }
          if (surfaceArea < 300) {
            return 40;
          }
          if (surfaceArea < 800) {
            return 30;
          }
          if (surfaceArea < 1500) {
            return 28.5;
          }
          return 23;
        },
        estimatedImpact: 20,
        kwhAmount: {
          ter: {
            H1: 0.0006,
            H2: 0.0005,
            H3: 0.0003,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea, nbStoreys }: XFactorParams) => {
          if (
            typeof surfaceArea !== "number" ||
            typeof nbStoreys !== "number"
          ) {
            return null;
          }

          return surfaceArea * nbStoreys;
        },
        xFactorParams: [XFactorsKey.SURFACE_AREA, XFactorsKey.NB_STOREYS],
        getFundingFormula: ({ xFactor, coefficient }: CeeFormulaParams) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "GTC - Système de pilotage du bâtiment",
        publicAssetPath: "operation-images/domotique.jpg",
        hsPrestationId: "GTC",
        hubspotTrigram: "GTC",
        availableForSectors: ["ter"],
        formattedSentence:
          "l'installation d'un système de gestion technique du bâtiment",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        ceeFile: "BAT-TH-116",
        ceeFileLabel:
          "Système de gestion technique du bâtiment pour le chauffage, l’eau chaude sanitaire, le refroidissement/climatisation, l’éclairage et les auxiliaires",
        complexity: 2,
        gap: 0.1,
        coefficient: 0.8,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 30.8;
          }
          if (surfaceArea < 300) {
            return 28.0;
          }
          if (surfaceArea < 800) {
            return 21.0;
          }
          if (surfaceArea < 1500) {
            return 19.95;
          }
          return 16.1;
        },
        estimatedImpact: 20,
        kwhAmount: {
          ter: {
            H1: 0.0006,
            H2: 0.0005,
            H3: 0.0003,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea, nbStoreys }: XFactorParams) => {
          if (
            typeof surfaceArea !== "number" ||
            typeof nbStoreys !== "number"
          ) {
            return null;
          }

          return surfaceArea * nbStoreys;
        },
        xFactorParams: [XFactorsKey.SURFACE_AREA, XFactorsKey.NB_STOREYS],
        getFundingFormula: ({ xFactor, coefficient }: CeeFormulaParams) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
    ],
  },
  ECLAIRAGES: {
    label: "Eclairages",
    icon: "eclairage",
    typologie: "Opérations énergétique",
    type: OperationType.WORK,
    hsOperationCategory: "Eclairage éco-énergétique",
    showBriefButton: true,
    showAsMarketplaceFilter: true,
    showAsProOption: true,
    supportsAnalysis: true,
    subTypes: [
      {
        label: "Installation LED",
        publicAssetPath: "operation-images/eclairage.jpg",
        hsPrestationId: "LED",
        hubspotTrigram: "LED",
        formattedSentence:
          "l'installation de luminaires d'éclairage général à modules LED",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: {
          resi: "BAR-EQ-110",
          ter: "BAT-EQ-127",
        },
        ceeFileLabel: "Luminaires d'éclairage général à modules LED",
        complexity: 1,
        gap: 0.5,
        coefficient: 0.1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 71.5;
          }
          if (surfaceArea < 300) {
            return 65;
          }
          if (surfaceArea < 800) {
            return 32.5;
          }
          if (surfaceArea < 1500) {
            return 30.875;
          }
          return 29.25;
        },
        estimatedImpact: 10,
        kwhAmount: 0.0012,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor }) => xFactor,
      },
      {
        label: "Eclairage extérieur",
        publicAssetPath: "operation-images/eclairage.jpg",
        hsPrestationId: "LUMIÈRE EXTÉRIEURE",
        hubspotTrigram: "ECLAIR EXT",
        formattedSentence: "l'installation d'éclairages extérieurs",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi"],
        ceeFile: "RES-EC-104",
        ceeFileLabel: "Éclairage extérieur privé",
        complexity: 2,
        gap: 0.5,
        coefficient: 0.05,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 71.5;
          }
          if (surfaceArea < 300) {
            return 65;
          }
          if (surfaceArea < 800) {
            return 32.5;
          }
          if (surfaceArea < 1500) {
            return 30.875;
          }
          return 29.25;
        },
        estimatedImpact: 5,
        kwhAmount: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor }) => xFactor,
      },
    ],
  },
  GESTION_EAU: {
    label: "Gestion de l'eau",
    icon: "eau",
    typologie: "Opérations structure & conformité",
    type: OperationType.WORK,
    hsOperationCategory: "Récupération et gestion de l'eau",
    showBriefButton: true,
    showAsMarketplaceFilter: true,
    showAsProOption: true,
    supportsAnalysis: true,
    subTypes: [
      {
        label: "Récupération instantanée de chaleur sur eaux grises",
        publicAssetPath: "operation-images/hydraulique.jpg",
        hsPrestationId: "RECUP CHALEUR EAUX GRISES",
        hubspotTrigram: "RECUP EAUX GR",
        formattedSentence:
          "l'installation d'un système de récupération instantanée de chaleur sur eaux grises",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["ter"],
        ceeFile: "BAT-TH-154",
        ceeFileLabel: "Récupération instantanée de chaleur sur eaux grises",
        gap: 0.3,
        complexity: 4,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 247.5;
          }
          if (surfaceArea < 300) {
            return 225;
          }
          if (surfaceArea < 800) {
            return 150;
          }
          if (surfaceArea < 1500) {
            return 142.5;
          }
          return 135;
        },
        estimatedImpact: 15,
        kwhAmount: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "Systèmes économes du débit d’eau",
        publicAssetPath: "operation-images/hydraulique.jpg",
        hsPrestationId: "SYSTÈMES HYDRO-ECONOMES",
        hubspotTrigram: "SYST ECO EAU",
        formattedSentence: "l'installation d'un système hydro-économes",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["ter"],
        ceeFile: "BAT-EQ-133",
        ceeFileLabel: "Systèmes hydro-économes",
        complexity: 1,
        gap: 0.6,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 16.5;
          }
          if (surfaceArea < 300) {
            return 15;
          }
          if (surfaceArea < 800) {
            return 10;
          }
          if (surfaceArea < 1500) {
            return 9.5;
          }
          return 9;
        },
        estimatedImpact: 5,
        kwhAmount: 0.002,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor }) => xFactor,
      },

      {
        label: "Curage canalisation (avec visite caméra)",
        publicAssetPath: "operation-images/hydraulique.jpg",
        hsPrestationId: "Curage canalisation",
        hubspotTrigram: "CURAGE CANAL",
        formattedSentence: "curage canalisation",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["ter", "resi"],
        ceeFile: null,
        ceeFileLabel: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 12;
          }
          if (surfaceArea < 300) {
            return 11.3;
          }
          if (surfaceArea < 800) {
            return 9;
          }
          if (surfaceArea < 1500) {
            return 7.2;
          }
          return 5.4;
        },
        estimatedImpact: 0,
        kwhAmount: 0,
        description: {
          definition:
            "Cette opération consiste à nettoyer en profondeur les canalisations d’évacuation afin d’éliminer les dépôts et obstructions. L’intervention inclut une inspection caméra pour identifier les anomalies et anticiper d’éventuels travaux de réparation.",
          implementation:
            "• Diagnostic initial avec inspection vidéo des conduits\n• Curage mécanique ou hydrocurage sous haute pression\n• Vérification de l’état des canalisations après nettoyage\n• Remise d’un rapport détaillé avec préconisations si nécessaire",
          technical_criteria: [
            "Conforme aux normes d’entretien des réseaux d’assainissement",
            "Recommandé tous les 3 à 5 ans en copropriété et bâtiments tertiaires",
            "Intervention obligatoire en cas de colmatage sévère ou de conformité à la règlementation sanitaire",
          ],
          advantages: [
            "Prévention des bouchons et des mauvaises odeurs",
            "Allongement de la durée de vie des installations",
            "Diagnostic précis des éventuels défauts structurels",
          ],
          vigilance_points: [
            "Peut révéler des dysfonctionnements nécessitant des réparations coûteuses",
            "Travaux parfois bruyants et nécessitant une interruption temporaire des réseaux",
          ],
          note: "Idéal en préventif pour éviter les engorgements et les interventions d’urgence coûteuses.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor }) => xFactor,
      },
    ],
  },
  ISOLATION: {
    label: "Isolation",
    icon: "isolation",
    typologie: "Opérations énergétique",
    type: OperationType.WORK,
    hsOperationCategory: "Isolation enveloppe, fenêtres, menuiserie",
    showBriefButton: true,
    showAsMarketplaceFilter: true,
    showAsProOption: true,
    supportsAnalysis: true,
    subTypes: [
      {
        label: "Isolation de combles",
        publicAssetPath: "operation-images/isolation-combles.jpg",
        formattedSentence: "une opération d'isolation de combles",
        hsPrestationId: "ISOLATION DES COMBLES",
        hubspotTrigram: "ISO COMB",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFileLabel: "Isolation de combles",
        ceeFile: {
          resi: "BAR-EN-101",
          ter: "BAT-EN-101",
        },
        complexity: 1,
        gap: 0.1,
        coefficient: 0.9,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 71.5;
          }
          if (surfaceArea < 300) {
            return 65;
          }
          if (surfaceArea < 800) {
            return 40;
          }
          if (surfaceArea < 1500) {
            return 38;
          }
          return 36;
        },
        kwhAmount: {
          resi: {
            H1: 0.0017,
            H2: 0.0014,
            H3: 0.00092,
          },
          ter: {
            H1: 0.0026,
            H2: 0.0021,
            H3: 0.0014,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
        estimatedImpact: {
          resi: {
            H1: 17.5,
            H2: 15.3,
            H3: 10.4,
          },
          ter: {
            H1: 17.5,
            H2: 15.3,
            H3: 10.4,
          },
        },
      },
      {
        label: "Isolation de toitures inclinées",
        publicAssetPath: "operation-images/isolation-toiture.jpg",
        formattedSentence: "une opération d'isolation de toitures inclinées",
        hsPrestationId: "ISOLATION TOITURES INCLINÉES",
        hubspotTrigram: "ISO TOI INCLIN",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFileLabel: "Isolation de toitures",
        ceeFile: {
          resi: "BAR-EN-101",
          ter: "BAT-EN-101",
        },
        complexity: 1,
        gap: 0.1,
        coefficient: 1.15,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 99;
          }
          if (surfaceArea < 300) {
            return 90;
          }
          if (surfaceArea < 800) {
            return 60;
          }
          if (surfaceArea < 1500) {
            return 57;
          }
          return 54;
        },
        kwhAmount: {
          resi: {
            H1: 0.0017,
            H2: 0.0014,
            H3: 0.00092,
          },
          ter: {
            H1: 0.0026,
            H2: 0.0021,
            H3: 0.0014,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
        estimatedImpact: {
          resi: {
            H1: 16.5,
            H2: 13,
            H3: 13,
          },
          ter: {
            H1: 16.5,
            H2: 13,
            H3: 13,
          },
        },
      },
      {
        label: "Isolation des murs",
        publicAssetPath: "operation-images/isolation.jpg",
        hsPrestationId: "ITE",
        hubspotTrigram: "ITE",
        formattedSentence: "une opération d'isolation des murs",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: {
          resi: "BAR-EN-102",
          ter: "BAT-EN-102",
        },
        ceeFileLabel: "Isolation des murs",
        complexity: 3,
        gap: 0.1,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 297;
          }
          if (surfaceArea < 300) {
            return 270;
          }
          if (surfaceArea < 800) {
            return 180;
          }
          if (surfaceArea < 1500) {
            return 171;
          }
          return 162;
        },
        kwhAmount: {
          resi: {
            H1: 0.0016,
            H2: 0.0013,
            H3: 0.00088,
          },
          ter: {
            H1: 0.003,
            H2: 0.0025,
            H3: 0.0016,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        estimatedImpact: 22,
        getXFactor: ({ facadeArea, glazingArea }) => {
          if (
            typeof facadeArea !== "number" ||
            typeof glazingArea !== "number"
          ) {
            return null;
          }

          return facadeArea - glazingArea;
        },
        xFactorParams: [XFactorsKey.FACADE_AREA, XFactorsKey.GLAZING_AREA],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "Isolation d'un plancher",
        publicAssetPath: "operation-images/isolation-plancher.jpg",
        hsPrestationId: "ISOLATION PLANCHER",
        hubspotTrigram: "ISO PLANCHER",
        formattedSentence: "une opération d'isolation du plancher",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: {
          resi: "BAR-EN-103",
          ter: "BAT-EN-103",
        },
        ceeFileLabel: "Isolation d'un plancher",
        complexity: 1,
        gap: 0.1,
        coefficient: 0.8,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 88;
          }
          if (surfaceArea < 300) {
            return 80;
          }
          if (surfaceArea < 800) {
            return 40;
          }
          if (surfaceArea < 1500) {
            return 38;
          }
          return 36;
        },
        kwhAmount: {
          resi: {
            H1: 0.0011,
            H2: 0.00089,
            H3: 0.00059,
          },
          ter: {
            H1: 0.0052,
            H2: 0.0042,
            H3: 0.0013,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        estimatedImpact: {
          resi: 8.8,
          ter: 9.5,
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "Remplacement de fenêtres",
        publicAssetPath: "operation-images/fenetre.jpg",
        hsPrestationId: "FENETRES",
        hubspotTrigram: "REMPLAC FEN",
        formattedSentence: "une opération d'isolation des fenêtres et vitrages",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: {
          resi: "BAR-EN-104",
          ter: "BAT-EN-104",
        },
        ceeFileLabel: "Fenêtre ou porte-fenêtre complète avec vitrage isolant",
        complexity: 3,
        gap: 0.1,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 220;
          }
          if (surfaceArea < 300) {
            return 200;
          }
          if (surfaceArea < 800) {
            return 200;
          }
          if (surfaceArea < 1500) {
            return 190;
          }
          return 180;
        },
        kwhAmount: {
          resi: {
            H1: 0.0038,
            H2: 0.0031,
            H3: 0.0021,
          },
          ter: {
            H1: 0.0053,
            H2: 0.0043,
            H3: 0.0029,
          },
        },
        estimatedImpact: {
          resi: {
            H1: 16.8,
            H2: 16.9,
            H3: 13.2,
          },
          ter: {
            H1: 16.5,
            H2: 16.6,
            H3: 16.7,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ glazingArea }) => glazingArea,
        xFactorParams: [XFactorsKey.GLAZING_AREA],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "Isolation de toitures plates",
        publicAssetPath: "operation-images/isolation-toiture.jpg",
        hsPrestationId: "ISOLATION TOITURES TERRASSES",
        hubspotTrigram: "ISO TOI PLATES",
        formattedSentence:
          "une opération d'isolation des toitures ou terrasses",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: {
          resi: "BAR-EN-105",
          ter: "BAT-EN-107",
        },
        ceeFileLabel: "Isolation de toitures-terrasses",
        complexity: 3,
        gap: 0.1,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 330;
          }
          if (surfaceArea < 300) {
            return 300;
          }
          if (surfaceArea < 800) {
            return 200;
          }
          if (surfaceArea < 1500) {
            return 190;
          }
          return 180;
        },
        estimatedImpact: 12.6,
        kwhAmount: {
          resi: {
            H1: 0.0012,
            H2: 0.001,
            H3: 0.00067,
          },
          ter: {
            H1: 0.0018,
            H2: 0.0015,
            H3: 0.001,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "Revêtements réflectifs en toiture",
        publicAssetPath: "operation-images/isolation-toiture.jpg",
        hsPrestationId: "REVET RÉFLECTIF",
        hubspotTrigram: "REVET REFLECT TOIT",
        formattedSentence: "une pose de revêtement réflectif sur toiture",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["ter"],
        ceeFile: "BAT-EN-112",
        ceeFileLabel: "Revêtements réflectifs en toiture",
        complexity: 2,
        gap: 0.1,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 44;
          }
          if (surfaceArea < 300) {
            return 40;
          }
          if (surfaceArea < 800) {
            return 20;
          }
          if (surfaceArea < 1500) {
            return 19;
          }
          return 18;
        },
        estimatedImpact: 8.4,
        kwhAmount: {
          ter: {
            H1: 0.00016,
            H2: 0.00017,
            H3: 0.00027,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
    ],
  },
  SECURITE_CONFIRMITE: {
    label: "Sécurité & conformité",
    icon: "isolation",
    typologie: "Opérations structure & conformité",
    type: OperationType.WORK,
    hsOperationCategory: "Sécurité & conformité",
    showBriefButton: true,
    showAsMarketplaceFilter: true,
    showAsProOption: true,
    supportsAnalysis: true,
    subTypes: [
      {
        label: "Installation de bornes de recharge électrique pour véhicules",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId:
          "Installation de bornes de recharge électrique pour véhicules",
        hubspotTrigram: "INSTALL - BORNE ELEC",
        formattedSentence:
          "Installation de bornes de recharge électrique pour véhicules",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 44.3;
          }
          if (surfaceArea < 300) {
            return 41.7;
          }
          if (surfaceArea < 800) {
            return 33.3;
          }
          if (surfaceArea < 1500) {
            return 28.3;
          }
          return 23.3;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Mise en conformité électrique des parties communes",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId: "Mise en conformité électrique des parties communes",
        hubspotTrigram: "CONFO PARTIE COMM",
        formattedSentence: "Mise en conformité électrique des parties communes",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 44.3;
          }
          if (surfaceArea < 300) {
            return 41.7;
          }
          if (surfaceArea < 800) {
            return 33.3;
          }
          if (surfaceArea < 1500) {
            return 28.3;
          }
          return 23.3;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Réfection ou mise aux normes des installations gaz",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId: "Réfection ou mise aux normes des installations gaz",
        hubspotTrigram: "REFLECT - INSTALL GAZ",
        formattedSentence: "Réfection ou mise aux normes des installations gaz",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 39.9;
          }
          if (surfaceArea < 300) {
            return 37.5;
          }
          if (surfaceArea < 800) {
            return 30.0;
          }
          if (surfaceArea < 1500) {
            return 25.5;
          }
          return 21.0;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Installation ou remplacement du système de désemfumage",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId: "Installation / remplacement système de désemfumage",
        hubspotTrigram: "DESEMFUMAGE",
        formattedSentence:
          "Installation ou remplacement du système de désemfumage",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 2,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 119.7;
          }
          if (surfaceArea < 300) {
            return 112.5;
          }
          if (surfaceArea < 800) {
            return 90;
          }
          if (surfaceArea < 1500) {
            return 76.5;
          }
          return 63;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "L’installation ou le remplacement d’un système de désemfumage vise à évacuer les fumées en cas d’incendie, garantissant une meilleure visibilité et facilitant l’évacuation des occupants.",
          implementation:
            "Étude réglementaire et dimensionnement du système. Installation ou remplacement des exutoires de fumée (trappes, volets, ouvrants). Mise en place d’un système de commande automatique ou manuel. Tests de fonctionnement et mise en conformité.",
          technical_criteria: [
            "Conformité aux normes NF S 61-931 et Règlement de sécurité incendie ERP",
            "Obligatoire pour les bâtiments de plus de 2000 m² en secteur tertiaire",
            "Nécessite une vérification annuelle et un entretien périodique",
          ],
          advantages: [
            "Amélioration de la sécurité incendie et facilitation de l’évacuation",
            "Réduction des dégâts causés par les fumées et gaz toxiques",
            "Valorisation du bâtiment en conformité avec la réglementation",
          ],
          vigilance_points: [
            "Nécessite une intégration adaptée aux spécificités architecturales du bâtiment",
            "Coût potentiellement élevé en fonction du niveau d’automatisation et des contraintes d’installation",
          ],
          note: "Obligatoire dans les parkings, cages d’escalier et grands bâtiments tertiaires, avec un contrôle périodique pour garantir son efficacité.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
    ],
  },
  STRUCTURE_BATIMENT: {
    label: "Structure du bâtiment",
    icon: "isolation",
    typologie: "Opérations structure & conformité",
    type: OperationType.WORK,
    hsOperationCategory: "Structure du bâtiment",
    showBriefButton: true,
    showAsMarketplaceFilter: true,
    showAsProOption: true,
    supportsAnalysis: true,
    subTypes: [
      {
        label: "Refection de la toiture (hors isolation)",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId: "Refection de la toiture (hors isolation)",
        hubspotTrigram: "REFLECT - TOIT",
        formattedSentence: "Refection de la toiture (hors isolation)",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 133.0;
          }
          if (surfaceArea < 300) {
            return 125.0;
          }
          if (surfaceArea < 800) {
            return 100.0;
          }
          if (surfaceArea < 1500) {
            return 85.0;
          }
          return 70.0;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Réparation ou reprise de charpente",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId: "Réparation ou reprise de charpente",
        hubspotTrigram: "RÉPAR CHARP",
        formattedSentence: "Réparation ou reprise de charpente",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 88.7;
          }
          if (surfaceArea < 300) {
            return 83.3;
          }
          if (surfaceArea < 800) {
            return 66.7;
          }
          if (surfaceArea < 1500) {
            return 56.7;
          }
          return 46.7;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Réfection ou ravalement de façades (hors ITE)",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId: "Réfection ou ravalement de façades (hors ITE)",
        hubspotTrigram: "REFLECT - FAÇADE",
        formattedSentence: "Réfection ou ravalement de façades (hors ITE)",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 155.2;
          }
          if (surfaceArea < 300) {
            return 145.8;
          }
          if (surfaceArea < 800) {
            return 116.7;
          }
          if (surfaceArea < 1500) {
            return 99.2;
          }
          return 81.7;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Réfection des balcons / garde-corps",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId: "Réfection des balcons / garde-corps",
        hubspotTrigram: "REFLECT - BALCONS",
        formattedSentence: "Réfection des balcons / garde-corps",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 66.5;
          }
          if (surfaceArea < 300) {
            return 62.5;
          }
          if (surfaceArea < 800) {
            return 50.0;
          }
          if (surfaceArea < 1500) {
            return 42.5;
          }
          return 35.0;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Traitement des fissures structurelles",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId: "Traitement des fissures structurelles",
        hubspotTrigram: "TRAIT - FISS",
        formattedSentence: "Traitement des fissures structurelles",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 44.3;
          }
          if (surfaceArea < 300) {
            return 41.7;
          }
          if (surfaceArea < 800) {
            return 33.3;
          }
          if (surfaceArea < 1500) {
            return 28.3;
          }
          return 23.3;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Traitement de l'humidité des murs",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId: "Traitement de l'humidité des murs",
        hubspotTrigram: "TRAIT - HUMID MUR",
        formattedSentence: "Traitement de l'humidité des murs",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 53.2;
          }
          if (surfaceArea < 300) {
            return 50.0;
          }
          if (surfaceArea < 800) {
            return 40.0;
          }
          if (surfaceArea < 1500) {
            return 34.0;
          }
          return 28.0;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Étanchéité ou réfection de toitures terrasses",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId: "Étanchéité ou réfection de toitures terrasses",
        hubspotTrigram: "ETANCH TT",
        formattedSentence: "Étanchéité ou réfection de toitures terrasses",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 110.8;
          }
          if (surfaceArea < 300) {
            return 104.2;
          }
          if (surfaceArea < 800) {
            return 83.3;
          }
          if (surfaceArea < 1500) {
            return 70.8;
          }
          return 58.3;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label:
          "Réfection ou remplacement des colonnes montantes (eau, chauffage, EU/EP)",
        publicAssetPath: "operation-images/renovation-globale.jpg",
        hsPrestationId: "Réfection ou remplacement des colonnes montantes",
        hubspotTrigram: "REFECT - COLONNES MONT",
        formattedSentence:
          "Réfection ou remplacement des colonnes montantes (eau, chauffage, EU/EP)",
        ceeFileLabel: null,
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        complexity: 1,
        gap: null,
        coefficient: 1,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 79.8;
          }
          if (surfaceArea < 300) {
            return 75.0;
          }
          if (surfaceArea < 800) {
            return 60.0;
          }
          if (surfaceArea < 1500) {
            return 51.0;
          }
          return 42.0;
        },
        kwhAmount: 0,
        estimatedImpact: 0,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
    ],
  },
  SYSTEME_SOLAIRE: {
    label: "Systèmes solaires",
    icon: "solaire",
    typologie: "Opérations énergétique",
    type: OperationType.WORK,
    hsOperationCategory: "Systèmes solaires et photovoltaïques",
    showBriefButton: true,
    showAsMarketplaceFilter: true,
    showAsProOption: true,
    supportsAnalysis: true,
    subTypes: [
      {
        label: "Panneaux solaires - Achat",
        publicAssetPath: "operation-images/solaire.jpg",
        hsPrestationId: "PANNEAUX SOLAIRES",
        hubspotTrigram: "PNNX SOL - ACHAT",
        formattedSentence: "l'installation de panneaux solaires",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        ceeFileLabel: null,
        complexity: 3,
        gap: 0.3,
        coefficient: 0.4,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 907.5;
          }
          if (surfaceArea < 300) {
            return 825;
          }
          if (surfaceArea < 800) {
            return 550;
          }
          if (surfaceArea < 1500) {
            return 522.5;
          }
          return 495;
        },
        kwhAmount: null,
        estimatedImpact: null,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
      {
        label: "Panneaux solaires - Leasing",
        publicAssetPath: "operation-images/solaire.jpg",
        hsPrestationId: "Panneaux solaires - Leasing",
        hubspotTrigram: "PNNX SOL - LEASING",
        formattedSentence: "l'installation de panneaux solaires (leasing)",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: null,
        ceeFileLabel: null,
        complexity: 3,
        gap: 0.3,
        coefficient: 0.4,
        estimatedImpact: {
          resi: 50,
          ter: 40,
        },
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 132;
          }
          if (surfaceArea < 300) {
            return 120;
          }
          if (surfaceArea < 800) {
            return 80;
          }
          if (surfaceArea < 1500) {
            return 76;
          }
          return 72;
        },
        kwhAmount: null,
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea }) => surfaceArea,
        xFactorParams: [XFactorsKey.SURFACE_AREA],
        getFundingFormula: null,
      },
    ],
  },
  VENTILATION: {
    label: "Ventilation",
    icon: "ventilation",
    typologie: "Opérations énergétique",
    type: OperationType.WORK,
    hsOperationCategory: "Ventilation",
    showBriefButton: true,
    showAsMarketplaceFilter: true,
    showAsProOption: true,
    supportsAnalysis: true,
    subTypes: [
      {
        label: "VMC - Simple flux",
        publicAssetPath: "operation-images/ventilation.jpg",
        hsPrestationId: "VENTILATION SIMPLE FLUX",
        hubspotTrigram: "VMC SMPLE FL",
        formattedSentence:
          "l'installation d'une ventilation mécanique simple flux",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: {
          resi: "BAR-TH-127",
          ter: "BAT-TH-125",
        },
        ceeFileLabel:
          "Ventilation mécanique simple flux à débit d'air constant ou modulé",
        complexity: 4,
        gap: 0.1,
        coefficient: {
          resi: 1,
          ter: 0.9,
        },
        estimatedCost: ({ surfaceArea, mainSector }) => {
          if (mainSector === "resi") {
            if (surfaceArea < 150) {
              return 990;
            }
            if (surfaceArea < 300) {
              return 900;
            }
            if (surfaceArea < 800) {
              return 600;
            }
            if (surfaceArea < 1500) {
              return 570;
            }
            return 400;
          }

          if (surfaceArea < 150) {
            return 47.3;
          }
          if (surfaceArea < 300) {
            return 43;
          }
          if (surfaceArea < 800) {
            return 22;
          }
          if (surfaceArea < 1500) {
            return 20.9;
          }
          return 20;
        },
        estimatedImpact: {
          resi: 8,
          ter: 10,
        },
        kwhAmount: {
          resi: {
            H1: 0.0218,
            H2: 0.0178,
            H3: 0.0119,
          },
          ter: {
            H1: 0.00069,
            H2: 0.00056,
            H3: 0.00038,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea, nbStoreys, mainSector, nbUnits }) => {
          if (mainSector === "resi") {
            return nbUnits;
          }

          if (
            typeof surfaceArea !== "number" ||
            typeof nbStoreys !== "number"
          ) {
            return null;
          }

          return surfaceArea * nbStoreys;
        },
        xFactorParams: [
          XFactorsKey.SURFACE_AREA,
          XFactorsKey.NB_STOREYS,
          XFactorsKey.MAIN_SECTOR,
          XFactorsKey.NB_UNITS,
        ],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "VMC - Double flux",
        publicAssetPath: "operation-images/ventilation.jpg",
        hsPrestationId: "VENTILATION DOUBLE FLUX",
        hubspotTrigram: "VMC DOUBLE FL",
        formattedSentence:
          "l'installation d'une ventilation mécanique double flux",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["resi", "ter"],
        ceeFile: {
          resi: "BAR-TH-125",
          ter: "BAT-TH-126",
        },
        ceeFileLabel:
          "Ventilation mécanique double flux avec échangeur à débit d'air constant ou modulé",
        complexity: 4,
        gap: 0.1,
        coefficient: {
          resi: 1,
          ter: 0.9,
        },
        estimatedCost: ({ surfaceArea, mainSector }) => {
          if (mainSector === "resi") {
            if (surfaceArea < 150) {
              return 3850;
            }
            if (surfaceArea < 300) {
              return 3500;
            }
            if (surfaceArea < 800) {
              return 750;
            }
            if (surfaceArea < 1500) {
              return 712.5;
            }
            return 400;
          }

          if (surfaceArea < 150) {
            return 49.5;
          }
          if (surfaceArea < 300) {
            return 45;
          }
          if (surfaceArea < 800) {
            return 30;
          }
          if (surfaceArea < 1500) {
            return 28.5;
          }
          return 25;
        },
        estimatedImpact: {
          resi: 15,
          ter: 12,
        },
        kwhAmount: {
          resi: {
            H1: 0.023,
            H2: 0.0188,
            H3: 0.0125,
          },
          ter: {
            H1: 0.001,
            H2: 0.00083,
            H3: 0.00056,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea, nbStoreys, mainSector, nbUnits }) => {
          if (mainSector === "resi") {
            return nbUnits;
          }

          if (
            typeof surfaceArea !== "number" ||
            typeof nbStoreys !== "number"
          ) {
            return null;
          }

          return surfaceArea * nbStoreys;
        },
        xFactorParams: [
          XFactorsKey.SURFACE_AREA,
          XFactorsKey.NB_STOREYS,
          XFactorsKey.MAIN_SECTOR,
          XFactorsKey.NB_UNITS,
        ],
        getFundingFormula: ({ xFactor, coefficient }) => {
          if (typeof xFactor !== "number" || typeof coefficient !== "number") {
            return null;
          }

          return xFactor * coefficient;
        },
      },
      {
        label: "Ventilo convecteurs",
        publicAssetPath: "operation-images/ventilation.jpg",
        hsPrestationId: "VENTILO CONVECTEUR",
        hubspotTrigram: "VENT CONV",
        formattedSentence: "l'installation de ventilo-convecteurs",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["ter"],
        ceeFile: "BAT-TH-143",
        ceeFileLabel: "Ventilo convecteurs haute performance",
        complexity: 4,
        gap: 0.1,
        coefficient: 0.026667,
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 1980;
          }
          if (surfaceArea < 300) {
            return 1800;
          }
          if (surfaceArea < 800) {
            return 1200;
          }
          if (surfaceArea < 1500) {
            return 1140;
          }
          return 1000;
        },
        estimatedImpact: 10,
        kwhAmount: {
          ter: {
            H1: 0.000065,
            H2: 0.000057,
            H3: 0.000048,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea, nbStoreys }) => {
          if (
            typeof surfaceArea !== "number" ||
            typeof nbStoreys !== "number"
          ) {
            return null;
          }

          return surfaceArea * nbStoreys;
        },
        xFactorParams: [XFactorsKey.SURFACE_AREA, XFactorsKey.NB_STOREYS],
        getFundingFormula: ({ xFactor }) => xFactor,
      },
      {
        label: "Destratificateur d'air",
        publicAssetPath: "operation-images/ventilation.jpg",
        hsPrestationId: "DESTRATIFICATION DE L'AIR",
        hubspotTrigram: "DESTR AIR",
        formattedSentence:
          "l'installation d'un système de déstratificateur d'air",
        availableForCollectiveHeating: true,
        availableForIndividualHeating: true,
        availableForSectors: ["ter", "resi"],
        ceeFile: {
          ter: "BAT-TH-142",
        },
        ceeFileLabel: "Système de déstratificateur d'air",
        complexity: 3,
        gap: 0.4,
        coefficient: {
          resi: 0.3,
          ter: 0.5,
        },
        estimatedCost: ({ surfaceArea }) => {
          if (surfaceArea < 150) {
            return 57.75;
          }
          if (surfaceArea < 300) {
            return 52.5;
          }
          if (surfaceArea < 800) {
            return 35;
          }
          if (surfaceArea < 1500) {
            return 33.25;
          }
          return 31.5;
        },
        estimatedImpact: {
          resi: 6,
          ter: 15,
        },
        kwhAmount: {
          ter: {
            H1: 0.0018,
            H2: 0.002,
            H3: 0.0025,
          },
        },
        description: {
          definition:
            "Opération visant à améliorer les performances énergétiques ou le confort du bâtiment. Elle est mise en œuvre selon la nature de l’équipement ou du système visé.",
          implementation:
            "Installation, remplacement ou réglage d’équipements, selon normes en vigueur. Intervention par un professionnel qualifié. Peut nécessiter un diagnostic préalable ou une étude d’impact.",
          technical_criteria: [
            "Respect des normes électriques, thermiques ou de sécurité",
            "Compatibilité avec les installations existantes",
            "Éligibilité à des aides financières (CEE, MaPrimeRénov’…)",
          ],
          advantages: [
            "Réduction des consommations énergétiques",
            "Amélioration du confort des usagers",
            "Valorisation du patrimoine immobilier",
          ],
          vigilance_points: [
            "Nécessité d’un entretien ou d’un réglage régulier",
            "Travaux parfois intrusifs",
            "Incompatibilités possibles avec certains systèmes anciens",
          ],
          note: "Peut être combinée avec d’autres opérations pour maximiser les économies d’énergie ou bénéficier de financements croisés.",
        },
        getXFactor: ({ surfaceArea, nbStoreys }) => {
          if (
            typeof surfaceArea !== "number" ||
            typeof nbStoreys !== "number"
          ) {
            return null;
          }

          return surfaceArea * nbStoreys;
        },
        xFactorParams: [XFactorsKey.SURFACE_AREA, XFactorsKey.NB_STOREYS],
        getFundingFormula: ({ xFactor }) => {
          if (typeof xFactor !== "number") {
            return null;
          }

          return xFactor * 30;
        },
      },
    ],
  },
};

export const OPERATION_TYPES_ARR = Object.values(OPERATION_TYPES);

export type OperationParent = (typeof OPERATION_TYPES_ARR)[number];

export const OPERATION_SUBTYPES = OPERATION_TYPES_ARR.map(
  (t) => t.subTypes,
).flat();

export const getTypeByHubspotPrestationId = (
  hsPrestationId: OperationHubspotPrestationId | null,
) => {
  if (hsPrestationId === null) {
    return null;
  }
  const operationTypeInfo = OPERATION_TYPES_ARR.map((t) => t.subTypes)
    .flat()
    .find((type) => type.hsPrestationId === hsPrestationId);

  if (!operationTypeInfo) {
    console.error(
      `Operation type not found hsPrestationId "${hsPrestationId}"`,
    );
    return null;
  }

  return operationTypeInfo;
};

export type OperationSubCategory = (typeof OPERATION_SUBTYPES)[number];

export const getTypeByLabel = (label: string) => {
  const operationTypeInfo = Object.values(OPERATION_TYPES)
    .map((t) => t.subTypes)
    .flat()
    .find((type) => type.label === label);

  if (!operationTypeInfo) {
    throw new Error(`Operation type not found "${label}"`);
  }

  return operationTypeInfo;
};

export const getPrestationParentCategory = (
  hsPrestationId: OperationHubspotPrestationId,
) => {
  const parentOperationTypeInfo = Object.values(OPERATION_TYPES).find((type) =>
    type.subTypes.some((sub) => sub.hsPrestationId === hsPrestationId),
  );

  if (!parentOperationTypeInfo) {
    throw new Error("Operation type not found for: " + hsPrestationId);
  }

  return parentOperationTypeInfo;
};

export const getPrestationsParentCategories = (
  hsPrestationIds: OperationHubspotPrestationId[],
) =>
  Array.from(
    new Set(hsPrestationIds.map((p) => getPrestationParentCategory(p).label)),
  );

// @todo Très tentant de merger ça dans OPERATION_TYPES mais le fait que Chauffage réunisse 2 catégories en un fout vraiment la merde dans l'état. Si on pouvait fusionner les 2 alors on pourrait grandement simplifier tout ça
export const OPERATION_OPTIONS: Array<{
  label: string;
  labelLong: string;
  description: string;
  operations: string[];
  publicAssetPath: PublicAssetPath;
  hsCategories: OperationHubspotCategory[];
  icon: OperationIcon;
}> = [
  {
    label: "Accompagnement",
    labelLong: "Accompagnement",
    hsCategories: ["Rénovation globale", "Optimisation des contrats"],
    icon: "renovation-globale",
    description:
      "Cette catégorie regroupe tous les acteurs essentiels à la réussite d’un projet de rénovation : architectes, bureaux d’études, maîtres d’œuvre ou assistants à maîtrise d’ouvrage (AMO). Leur rôle est de structurer, sécuriser et coordonner les opérations, de la conception à la réception des travaux. Ils interviennent en complément des diagnostics techniques et garantissent le bon déroulement du projet.",
    operations: [
      "Mission de maîtrise d’œuvre (MOE) tous corps d’état",
      "Assistance à maîtrise d’ouvrage (AMO) pour dossier CEE ou rénovation globale",
      "Étude structurelle ou thermique par bureau d’études certifié",
    ],
    publicAssetPath: "operation-vector/operation-accompagnement.png",
  },
  {
    label: "Audit & Diag.",
    labelLong: "Audit & Diagnostic",
    hsCategories: ["Audit énergétique"],
    icon: "audit",
    description:
      "Cette catégorie regroupe les études préalables indispensables pour identifier les gisements d’économies et définir un plan de travaux adapté. Elle permet de prioriser les interventions, de sécuriser les aides financières et de justifier les investissements.",
    operations: [
      "Audit énergétique réglementaire (tertiaire ou copropriété)",
      "Diagnostic de performance énergétique (DPE)",
      "Étude de faisabilité pour pompe à chaleur ou solaire",
    ],
    publicAssetPath: "operation-vector/operation-audit.png",
  },
  {
    label: "Chauffage",
    labelLong: "Chauffage",
    hsCategories: [
      "Chauffage - Installation/Remplacement",
      "Chauffage, ventilation, climatisation",
    ],
    icon: "chauffage",
    description:
      "L’objectif est d’optimiser ou remplacer les systèmes de production de chaleur pour améliorer le confort, réduire les consommations et sortir des énergies fossiles.",
    operations: [
      "Remplacement de chaudière gaz par pompe à chaleur",
      "Installation de chaudière à condensation",
      "Régulation automatique par zone",
    ],
    publicAssetPath: "operation-vector/operation-cvc.png",
  },
  {
    label: "Domotique",
    labelLong: "Domotique / Gestion technique",
    hsCategories: ["Systèmes de suivi"],
    icon: "gtb",
    description:
      "Cette catégorie vise à piloter intelligemment les consommations (électricité, chauffage, eau), afin de détecter les dérives, réduire les usages superflus et automatiser les réglages.",
    operations: [
      "Mise en place de capteurs multi-énergies",
      "Installation de GTB/monitoring",
      "Programmation des équipements techniques",
    ],
    publicAssetPath: "operation-vector/operation-domotique.png",
  },
  {
    label: "Éclairage",
    labelLong: "Éclairage",
    hsCategories: ["Eclairage éco-énergétique"],
    icon: "eclairage",
    description:
      "Agir sur l’éclairage permet une baisse rapide des consommations électriques, surtout dans les bâtiments tertiaires ou à fort usage.",
    operations: [
      "Relamping LED",
      "Installation de détecteurs de présence",
      "Pilotage horaire ou par zone",
    ],
    publicAssetPath: "operation-vector/operation-eclairage.png",
  },
  {
    label: "Ventilation",
    labelLong: "Ventilation",
    hsCategories: ["Ventilation"],
    icon: "ventilation",
    description:
      "L’objectif est d’assurer un renouvellement d’air performant sans gaspillage énergétique, tout en améliorant la qualité de l’air intérieur.",
    operations: [
      "Remplacement par VMC double flux",
      "Ventilation intelligente selon taux de CO₂",
      "Ventilation hybride avec régulation automatique",
    ],
    publicAssetPath: "operation-vector/operation-ventilation.png",
  },
  {
    label: "Isolation",
    labelLong: "Isolation",
    hsCategories: ["Isolation enveloppe, fenêtres, menuiserie"],
    icon: "isolation",
    description:
      "L’isolation réduit durablement les déperditions thermiques et améliore la performance globale du bâtiment, été comme hiver.",
    operations: [
      "Isolation thermique par l’extérieur (ITE)",
      "Isolation des combles/toiture",
      "Calorifugeage des réseaux",
    ],
    publicAssetPath: "operation-vector/operation-isolation.png",
  },
  {
    label: "Syst. solaire",
    labelLong: "Système solaire",
    hsCategories: ["Systèmes solaires et photovoltaïques"],
    icon: "solaire",
    description:
      "Ces opérations permettent de produire localement de l’énergie (électricité ou eau chaude), réduire la facture et améliorer le bilan carbone.",
    operations: [
      "Installation de panneaux photovoltaïques",
      "Mise en place de solaire thermique",
      "Couplage solaire + PAC",
    ],
    publicAssetPath: "operation-vector/operation-solaire.png",
  },
  {
    label: "Gestion eau",
    labelLong: "Gestion de l’eau",
    hsCategories: ["Récupération et gestion de l'eau"],
    icon: "eau",
    description:
      "Optimiser la gestion de l’eau permet de réduire les charges, d’améliorer le suivi des usages et de répondre aux enjeux de sobriété hydrique.",
    operations: [
      "Installation de compteurs d’eau intelligents",
      "Réducteurs de débit",
      "Récupération d’eau de pluie",
    ],
    publicAssetPath: "operation-vector/operation-eau.png",
  },
  {
    label: "Sécurité",
    labelLong: "Sécurité",
    hsCategories: ["Sécurité & conformité"],
    icon: "securite",
    description:
      "Sécuriser les bâtiments, c’est protéger les occupants et prévenir les risques d’intrusion ou d’incident (incendie, fuite).",
    operations: [
      "Mise en conformité SSI",
      "Contrôle d’accès sécurisé",
      "Installation de vidéosurveillance",
    ],
    publicAssetPath: "operation-vector/operation-securite.png",
  },
  {
    label: "Structure",
    labelLong: "Structure",
    hsCategories: ["Structure du bâtiment"],
    icon: "structure",
    description:
      "Cette catégorie regroupe les travaux non énergétiques, mais essentiels à la pérennité du bâtiment. Il peut s’agir de réparations, de confortements ou de remises aux normes structurelles. Ces interventions sont souvent préalables ou complémentaires aux travaux de performance énergétique.",
    operations: [
      "Réfection de toiture ou d’étanchéité",
      "Ravalement de façade avec ou sans ITE",
      "Renforcement ou reprise de structure (poutres, planchers, fondations)",
    ],
    publicAssetPath: "operation-vector/operation-structure.png",
  },
];
