import type {
  HubspotLocationBdnbData,
  LocationBdnb,
  LocationBdnbUuid,
} from "@optee/models";
import { z } from "zod";
import type {
  ECSGeneratorTypeCode,
  HeatingTypeCode,
  ShutterTypeCode,
  VentilationTypeCode,
  WallStructureMaterialCode,
} from "./location-bdnb.constant";
import {
  ALEA_LEVELS,
  ECS_GENERATOR_TYPE_LABELS,
  GLAZING_TYPES,
  HEATING_GENERATOR_AGES,
  HEATING_TYPE_LABELS,
  INSULATION_TYPES,
  SHUTTER_TYPES,
  SHUTTER_TYPES_LABEL,
  VENTILATION_TYPE_LABELS,
  WALL_STRUCTURE_MATERIAL_LABELS,
  WINDOW_MATERIAL_TYPE,
} from "./location-bdnb.constant";
import type {
  DpeLabel,
  EnergyType,
  HeatingSystem,
  Sector,
} from "./location.constant";
import {
  DPE_LABELS,
  ENERGY_TYPES,
  HEATING_SYSTEMS,
  SECTOR_DATA,
} from "./location.constant";

export const BDNB_COORDINATE = z.tuple([z.number(), z.number()]);

export type BdnbCoordinate = z.infer<typeof BDNB_COORDINATE>;

export const BDNB_GEOM_GROUP = z.object({
  type: z.string(),
  coordinates: z.array(z.array(z.array(BDNB_COORDINATE))),
});

export type BdnbGeomGroup = z.infer<typeof BDNB_GEOM_GROUP>;

export const apiBdnbUrl =
  "https://api.bdnb.io/v1/bdnb/donnees/batiment_groupe_complet?batiment_groupe_id=eq.";

export const apiBdnbDPEUrl =
  "https://api.bdnb.io/v1/bdnb/donnees/batiment_groupe_dpe_representatif_logement?batiment_groupe_id=eq.";

export const BDNB_API_RESPONSE_SCHEMA = z.object({
  cle_interop_adr: z.string().nullish(),
  batiment_groupe_id: z.string().nullish(),
  lien_valide: z.boolean().nullish(),
  code_departement_insee: z.string().nullish(),
  code_commune_insee: z.string().nullish(),
  commune_parente: z.string().nullish(),
  code_epci_insee: z.string().nullish(),
  code_iris: z.string().nullish(),
  libelle_commune_insee: z.string().nullish(),
  code_region_insee: z.string().nullish(),
  s_geom_groupe: z.number().nullish(),
  l_parcelle_id: z.array(z.string()).nullish(),
  l_cle_interop_adr: z.array(z.string()).nullish(),
  l_libelle_adr: z.array(z.string()).nullish(),
  l_siren: z.array(z.string()).nullish(),
  l_denomination_proprietaire: z.array(z.string()).nullish(),
  code_qp: z.string().nullish(),
  nom_qp: z.string().nullish(),
  quartier_prioritaire: z.boolean().nullish(),
  libelle_adr_principale_ban: z.string().nullish(),
  nb_adresse_valid_ban: z.number().nullish(),
  cle_interop_adr_principale_ban: z.string().nullish(),
  conso_pro_dle_elec_2020: z.number().nullish(),
  conso_res_dle_elec_2020: z.number().nullish(),
  conso_pro_dle_gaz_2020: z.number().nullish(),
  conso_res_dle_gaz_2020: z.number().nullish(),
  nb_pdl_pro_dle_gaz_2020: z.number().nullish(),
  nb_pdl_res_dle_gaz_2020: z.number().nullish(),
  nb_pdl_pro_dle_elec_2020: z.number().nullish(),
  nb_pdl_res_dle_elec_2020: z.number().nullish(),
  nb_classe_bilan_dpe_a: z.number().nullish(),
  nb_classe_bilan_dpe_b: z.number().nullish(),
  nb_classe_bilan_dpe_c: z.number().nullish(),
  nb_classe_bilan_dpe_d: z.number().nullish(),
  nb_classe_bilan_dpe_e: z.number().nullish(),
  nb_classe_bilan_dpe_f: z.number().nullish(),
  nb_classe_bilan_dpe_g: z.number().nullish(),
  nb_classe_conso_energie_arrete_2012_a: z.number().nullish(),
  nb_classe_conso_energie_arrete_2012_b: z.number().nullish(),
  nb_classe_conso_energie_arrete_2012_c: z.number().nullish(),
  nb_classe_conso_energie_arrete_2012_d: z.number().nullish(),
  nb_classe_conso_energie_arrete_2012_e: z.number().nullish(),
  nb_classe_conso_energie_arrete_2012_f: z.number().nullish(),
  nb_classe_conso_energie_arrete_2012_g: z.number().nullish(),
  nb_classe_conso_energie_arrete_2012_nc: z.number().nullish(),
  identifiant_dpe: z.string().nullish(),
  arrete_2021: z.boolean().nullish(),
  date_reception_dpe: z.string().nullish(),
  type_dpe: z.string().nullish(),
  classe_bilan_dpe: z.string().nullish(),
  classe_conso_energie_arrete_2012: z.string().nullish(),
  conso_5_usages_ep_m2: z.number().nullish(),
  emission_ges_5_usages_m2: z.number().nullish(),
  conso_3_usages_ep_m2_arrete_2012: z.number().nullish(),
  emission_ges_3_usages_ep_m2_arrete_2012: z.number().nullish(),
  type_vitrage: z.string().nullish(),
  type_materiaux_menuiserie: z.string().nullish(),
  type_gaz_lame: z.string().nullish(),
  type_fermeture: z.string().nullish(),
  vitrage_vir: z.boolean().nullish(),
  epaisseur_lame: z.number().nullish(),
  u_baie_vitree: z.number().nullish(),
  facteur_solaire_baie_vitree: z.number().nullish(),
  l_orientation_baie_vitree: z.array(z.string()).nullish(),
  pourcentage_surface_baie_vitree_exterieur: z.number().nullish(),
  traversant: z.string().nullish(),
  presence_balcon: z.boolean().nullish(),
  u_mur_exterieur: z.number().nullish(),
  type_isolation_mur_exterieur: z.string().nullish(),
  materiaux_structure_mur_exterieur: z.string().nullish(),
  type_isolation_plancher_bas: z.string().nullish(),
  type_plancher_bas_deperditif: z.string().nullish(),
  u_plancher_bas_final_deperditif: z.number().nullish(),
  type_isolation_plancher_haut: z.string().nullish(),
  type_plancher_haut_deperditif: z.string().nullish(),
  u_plancher_haut_deperditif: z.number().nullish(),
  classe_inertie: z.string().nullish(),
  type_installation_chauffage: z.string().nullish(),
  type_energie_chauffage: z.string().nullish(),
  type_generateur_chauffage: z.string().nullish(),
  type_generateur_chauffage_anciennete: z.string().nullish(),
  type_energie_chauffage_appoint: z.string().nullish(),
  type_generateur_chauffage_appoint: z.string().nullish(),
  type_generateur_chauffage_anciennete_appoint: z.string().nullish(),
  chauffage_solaire: z.boolean().nullish(),
  type_generateur_climatisation: z.string().nullish(),
  type_generateur_climatisation_anciennete: z.string().nullish(),
  type_installation_ecs: z.string().nullish(),
  type_generateur_ecs: z.string().nullish(),
  type_generateur_ecs_anciennete: z.string().nullish(),
  ecs_solaire: z.boolean().nullish(),
  type_ventilation: z.string().nullish(),
  type_production_energie_renouvelable: z.string().nullish(),
  annee_construction: z.number().nullish(),
  nb_log: z.number().nullish(),
  nb_niveau: z.number().nullish(),
  surface_emprise_sol: z.number().nullish(),
  usage_niveau_1_txt: z.string().nullish(),
  mat_mur_txt: z.string().nullish(),
  mat_toit_txt: z.string().nullish(),
  contient_fictive_geom_groupe: z.boolean().nullish(),
  geom_groupe: BDNB_GEOM_GROUP.nullish(),
  hauteur_mean: z.number().nullish(),
  altitude_sol_mean: z.number().nullish(),
  alea_argiles: z.string().nullish(),
  alea_radon: z.string().nullish(),
  nb_log_rnc: z.number().nullish(),
  nb_lot_garpark_rnc: z.number().nullish(),
  nb_lot_tertiaire_rnc: z.number().nullish(),
  numero_immat_principal: z.string().nullish(),
  distance_batiment_historique_plus_proche: z.number().nullish(),
  nom_batiment_historique_plus_proche: z.string().nullish(),
  perimetre_bat_historique: z.boolean().nullish(),
  nom_quartier_qpv: z.string().nullish(),
  fiabilite_cr_adr_niv_2: z.string().nullish(),
  fiabilite_cr_adr_niv_1: z.string().nullish(),
  fiabilite_emprise_sol: z.string().nullish(),
  fiabilite_hauteur: z.string().nullish(),
  croisement_geospx_reussi: z.union([z.boolean(), z.string()]).nullish(),
  uw: z.number().nullish(),
  nb_installation_chauffage: z.number().nullish(),
  nb_installation_ecs: z.number().nullish(),
  type_generateur_ecs_appoint: z.string().nullish(),
  type_generateur_ecs_anciennete_appoint: z.string().nullish(),
  annee_construction_dpe: z.number().nullish(),
  type_batiment_dpe: z.string().nullish(),
  id_reseau: z.string().nullish(),
  indicateur_distance_au_reseau: z.string().nullish(),
});

export type BdnbApiResponse = z.infer<typeof BDNB_API_RESPONSE_SCHEMA>;

function stringToEnum({
  sector,
  energyType,
  heatingSystem,
  dpeLabel,
}: {
  sector?: string | null;
  energyType?: string | null;
  heatingSystem?: string | null;
  dpeLabel?: string | null;
}): {
  sector?: Sector;
  energyType?: EnergyType;
  heatingSystem?: HeatingSystem;
  dpeLabel?: DpeLabel;
} {
  const safeSector = z.enum(SECTOR_DATA).optional().safeParse(sector);

  // Exception: Normalisation des valeurs connues avant capitalisation
  const normalizedEnergyType =
    energyType === "gaz"
      ? "Gaz"
      : energyType === "electricite"
        ? "Electrique"
        : energyType;

  const formatEnergyType = normalizedEnergyType
    ? normalizedEnergyType.charAt(0).toUpperCase() +
      normalizedEnergyType.slice(1)
    : normalizedEnergyType;

  const safeEnergyType = z
    .enum(ENERGY_TYPES)
    .optional()
    .safeParse(formatEnergyType);

  const formatHeatingSystem = heatingSystem
    ? heatingSystem?.charAt(0).toUpperCase() + heatingSystem?.slice(1)
    : null;

  const safeHeatingSystem = z
    .enum(HEATING_SYSTEMS)
    .optional()
    .safeParse(formatHeatingSystem);

  const safeDpeLabel = z.enum(DPE_LABELS).optional().safeParse(dpeLabel);

  return {
    sector: safeSector.data,
    energyType: safeEnergyType.data,
    heatingSystem: safeHeatingSystem.data,
    dpeLabel: safeDpeLabel.data,
  };
}

export function formatAPIResponse(
  bdnbResponse: BdnbApiResponse,
): HubspotLocationBdnbData {
  // annee_construction_dpe is not the right value so let's never use it
  const constructionYear = bdnbResponse.annee_construction || null;

  const { sector, energyType, heatingSystem, dpeLabel } = stringToEnum({
    sector: bdnbResponse.usage_niveau_1_txt,
    energyType: bdnbResponse.type_energie_chauffage,
    heatingSystem: bdnbResponse.type_installation_chauffage,
    dpeLabel: bdnbResponse.classe_bilan_dpe,
  });

  return {
    sector,
    nbUnits: bdnbResponse.nb_log ?? null,
    nbBuildings: bdnbResponse.l_parcelle_id?.length ?? 1,
    surfaceArea: bdnbResponse.surface_emprise_sol ?? null,
    height: bdnbResponse.hauteur_mean ?? null,
    electricityConsumptionPerSquareMeter:
      bdnbResponse.conso_5_usages_ep_m2 ?? null,
    greenhouseGasEmissionsPerSquareMeter:
      bdnbResponse.emission_ges_5_usages_m2 ?? null,
    glazingSurfacePercentage:
      bdnbResponse.pourcentage_surface_baie_vitree_exterieur ?? null,
    nbStoreys: bdnbResponse.nb_niveau ?? null,
    geomGroup: bdnbResponse.geom_groupe ?? null,
    energyType,
    heatingSystem,
    creationDate:
      typeof constructionYear === "number"
        ? new Date(constructionYear, 0, 1).toISOString().split("T")[0]
        : null,
    heatingType: bdnbResponse.type_generateur_chauffage ?? null,
    dpeLabel,
    meanHeight: bdnbResponse.hauteur_mean ?? null,
    inertiaClass: bdnbResponse.classe_inertie ?? null,
    hasBalcony: bdnbResponse.presence_balcon ?? null,
    nbDwellings: bdnbResponse.nb_log ?? null,
    nbDwellingsRnc: bdnbResponse.nb_log_rnc ?? null,
    nbTertiaryLotsRnc: bdnbResponse.nb_lot_tertiaire_rnc ?? null,
    nbResElec2020: bdnbResponse.nb_pdl_res_dle_elec_2020 ?? null,
    nbProElec2020: bdnbResponse.nb_pdl_pro_dle_elec_2020 ?? null,
    nbProGaz2020: bdnbResponse.nb_pdl_pro_dle_gaz_2020 ?? null,
    nbResGaz2020: bdnbResponse.nb_pdl_res_dle_gaz_2020 ?? null,
    dpeAssessmentClass: bdnbResponse.classe_bilan_dpe ?? null,
    arrete2021: bdnbResponse.arrete_2021 ?? null,
    dpeIdentifier: bdnbResponse.identifiant_dpe ?? null,
    gesEmissions5UsesPerM2: bdnbResponse.emission_ges_5_usages_m2 ?? null,
    gesEmissions3UsesEpM2Arrete2012:
      bdnbResponse.emission_ges_3_usages_ep_m2_arrete_2012 ?? null,
    ventilationType: bdnbResponse.type_ventilation ?? null,
    acGeneratorType: bdnbResponse.type_generateur_climatisation ?? null,
    acGeneratorAge:
      bdnbResponse.type_generateur_climatisation_anciennete ?? null,
    exteriorWallInsulationType:
      bdnbResponse.type_isolation_mur_exterieur ?? null,
    exteriorWallUValue: bdnbResponse.u_mur_exterieur ?? null,
    lowerFloorInsulationType: bdnbResponse.type_isolation_plancher_bas ?? null,
    upperFloorInsulationType: bdnbResponse.type_isolation_plancher_haut ?? null,
    lowerFloorFinalUValue: bdnbResponse.u_plancher_bas_final_deperditif ?? null,
    upperFloorUValue: bdnbResponse.u_plancher_haut_deperditif ?? null,
    glazingType: bdnbResponse.type_vitrage ?? null,
    windowMaterialType: bdnbResponse.type_materiaux_menuiserie ?? null,
    gasLayerType: bdnbResponse.type_gaz_lame ?? null,
    shutterType: bdnbResponse.type_fermeture ?? null,
    virGlazing: bdnbResponse.vitrage_vir ?? null,
    windowUValue: bdnbResponse.u_baie_vitree ?? null,
    windowSolarFactor: bdnbResponse.facteur_solaire_baie_vitree ?? null,
    proElecConsumption2020: bdnbResponse.conso_pro_dle_elec_2020 ?? null,
    resElecConsumption2020: bdnbResponse.conso_res_dle_elec_2020 ?? null,
    proGazConsumption2020: bdnbResponse.conso_pro_dle_gaz_2020 ?? null,
    resGazConsumption2020: bdnbResponse.conso_res_dle_gaz_2020 ?? null,
    networkId: bdnbResponse.id_reseau ?? null,
    radonRisk: bdnbResponse.alea_radon ?? null,
    clayRisk: bdnbResponse.alea_argiles ?? null,
    priorityDistrict: bdnbResponse.quartier_prioritaire ?? null,
    districtNameQpv: bdnbResponse.nom_quartier_qpv ?? null,
    qpvCode: bdnbResponse.code_qp ?? null,
  };
}

export function splitAndClean(value: string, separator = "+") {
  return value
    .split(separator)
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

const parseEnumValue = <T extends readonly string[]>(
  values: T,
  raw?: string | null,
): T[number] | null => {
  if (!raw) {
    return null;
  }
  return (values as readonly string[]).includes(raw)
    ? (raw as T[number])
    : null;
};

export function getLabelCode<T extends string>(
  label: string,
  labelMap: Record<T, string>,
): T | null {
  const entry = Object.entries(labelMap).find(
    ([, value]) =>
      typeof value === "string" &&
      value.toLowerCase().trim() === label.toLowerCase().trim(),
  );
  return entry ? (entry[0] as T) : null;
}

export function getVentilationCode(label: string): VentilationTypeCode | null {
  return getLabelCode(label, VENTILATION_TYPE_LABELS);
}

export function getHeatingTypeCode(label: string): HeatingTypeCode | null {
  return getLabelCode(label, HEATING_TYPE_LABELS);
}

export function getECSGeneratorCode(
  label: string,
): ECSGeneratorTypeCode | null {
  return getLabelCode(label, ECS_GENERATOR_TYPE_LABELS);
}

export function getShutterTypeCode(label: string): ShutterTypeCode | null {
  return getLabelCode(label, SHUTTER_TYPES_LABEL);
}

export function getWallStructureMaterialCode(
  label: string,
): WallStructureMaterialCode | null {
  return getLabelCode(label, WALL_STRUCTURE_MATERIAL_LABELS);
}

const parseEnumArray = <T extends readonly string[]>(
  values: T,
  raw: string,
  separator = "+",
  labelMap?: Record<T[number], string>,
): T[number][] | null => {
  const parts = splitAndClean(raw, separator);
  const parsed = parts
    .map((part) => {
      const enumValue = parseEnumValue(values, part);
      if (enumValue) {
        return enumValue;
      }
      if (labelMap) {
        return getLabelCode(part, labelMap);
      }
      return null;
    })
    .filter((value): value is T[number] => Boolean(value));

  return parsed.length ? parsed : null;
};

export function normalizeBdnbApiResponse(
  bdnbResponse: BdnbApiResponse,
): Partial<LocationBdnb> {
  const formatted = formatAPIResponse(bdnbResponse);

  const fakeUuid = "temp-uuid" as LocationBdnbUuid;

  return {
    ...formatted,
    uuid: fakeUuid,
    dpeLabel: parseEnumValue(DPE_LABELS, formatted.dpeLabel),
    dpeAssessmentClass: parseEnumValue(
      DPE_LABELS,
      formatted.dpeAssessmentClass,
    ),
    ventilationType: formatted.ventilationType
      ? getVentilationCode(formatted.ventilationType)
      : null,
    glazingType: parseEnumValue(GLAZING_TYPES, formatted.glazingType),
    acGeneratorAge: parseEnumValue(
      HEATING_GENERATOR_AGES,
      formatted.acGeneratorAge,
    ),
    heatingType: formatted.heatingType
      ? getHeatingTypeCode(formatted.heatingType)
      : null,
    exteriorWallInsulationType: formatted.exteriorWallInsulationType
      ? parseEnumArray(INSULATION_TYPES, formatted.exteriorWallInsulationType)
      : null,
    lowerFloorInsulationType: formatted.lowerFloorInsulationType
      ? parseEnumArray(INSULATION_TYPES, formatted.lowerFloorInsulationType)
      : null,
    upperFloorInsulationType: formatted.upperFloorInsulationType
      ? parseEnumArray(INSULATION_TYPES, formatted.upperFloorInsulationType)
      : null,
    windowMaterialType: formatted.windowMaterialType
      ? parseEnumArray(WINDOW_MATERIAL_TYPE, formatted.windowMaterialType, "/")
      : null,
    shutterType: formatted.shutterType
      ? parseEnumArray(
          SHUTTER_TYPES,
          formatted.shutterType,
          "+",
          SHUTTER_TYPES_LABEL,
        )
      : null,
    radonRisk: parseEnumValue(ALEA_LEVELS, formatted.radonRisk),
    clayRisk: parseEnumValue(ALEA_LEVELS, formatted.clayRisk),
    zipcode: bdnbResponse.code_commune_insee ?? null,
    city: bdnbResponse.libelle_commune_insee ?? null,
  };
}

// Date columns
export const DateColumnMap = {
  creationDate: "jsonYear",
  constructionYearRpls: "jsonYear",
  constructionYearDpe: "floatYear",
  dpeEstablishedDate: "datetime",
  dpeReceivedDate: "datetime",
  groupBuildingDleElecYear: "floatYear",
  unitWorkforceYear: "floatYear",
} as const;

export type DateColumnKeys = keyof typeof DateColumnMap;

// Boolean columns
export const BooleanColumns = [
  "pmrAccessible",
  "isInQpv",
  "containsFictiveGeometry",
  "arrete2021",
  "solarHeating",
  "solarEcs",
  "multipleExposedFacades",
  "virGlazing",
  "hasBalcony",
  "networkUnderConstruction",
  "geospXSuccess",
] as const;

export const MappedLocationsColumns = [
  // "city",
  "nbUnits",
  "nbTertiaryLotsRnc",
  // "zipcode",
  "longitude",
  "latitude",
  "locationGroupId",
  "nbBuildings",
  "nbStoreys",
  "dpeLabel",
  "surfaceArea",
  "electricityConsumptionPerSquareMeter",
  "heatingSystem",
  "energyType",
  "greenhouseGasEmissionsPerSquareMeter",
  "nbProElec2020",
  "nbResElec2020",
  "nbProGaz2020",
  "nbResGaz2020",
  "networkId",
  "glazingSurfacePercentage",
  "districtNameQpv",
  "height",
  "proElecConsumption2020",
  "resElecConsumption2020",
  "proGazConsumption2020",
  "resGazConsumption2020",
  "meanHeight",
  "radonRisk",
  "clayRisk",
  "inertiaClass",
  "upperFloorUValue",
  "lowerFloorFinalUValue",
  "exteriorWallUValue",
  "windowSolarFactor",
  "dpeAssessmentClass",
  "windowUValue",
  "gasLayerType",
  "glazingType",
  "acGeneratorAge",
  "acGeneratorType",
  "gesEmissions3UsesEpM2Arrete2012",
  "gesEmissions5UsesPerM2",
  "dpeIdentifier",

  "immatriculationNumber",
  "maxConstructionPeriod",
  "totalNumberOfLots",
  "numberOfOpenGroupPremises",
  "numberOfTotalOpenPremises",
  "numberOfGroupBuildingsOutsideDept",
  "nbDwellingsFfoBat",
  "totalPdlCount",
  "mainGesClass",
  "nbDwellingsRpls",
  "habitableSurface",
  "equipmentType",
  "irisCode",
  "inseeCommuneCode",
  "natureLabel",
  "detailedNatureLabel",
  "toponymLabel",
  "groupBuildingDleYear",
  "residentialPdlCount",
  "professionalPdlCount",
  "totalPdlCountDle",
  "residentialConsumption",
  "professionalConsumption",
  "totalConsumptionMulti",
  "networkType",
  "buildingTypeDpe",
  "constructionPeriodDpe",
  "dpeVersion",
  "nbDwellingLevels",
  "nbBuildingLevels",
  "habitableSurfaceBuilding",
  "habitableSurfaceDwelling",
  "consumption5Usages",
  "gesEmissionClass",
  "consumption3Usages2012",
  "heatingGeneratorAge",
  "heatingBackupEnergyType",
  "heatingBackupGeneratorType",
  "heatingBackupGeneratorAge",
  "nbHeatingGenerators",
  "nbHeatingInstallations",
  "acEnergyType",
  "ecsInstallationType",
  "ecsEnergyType",
  "ecsGeneratorAge",
  "ecsBackupEnergyType",
  "ecsBackupGeneratorType",
  "ecsBackupGeneratorAge",
  "nbEcsGenerators",
  "nbEcsInstallations",
  "renewableEnergyProductionType",
  "lameThickness",
  "northGlazedSurface",
  "southGlazedSurface",
  "westGlazedSurface",
  "eastGlazedSurface",
  "glazedSurfaceHorizontal",
  "crossVentilated",
  "uwValue",
  "windowOrientationLabel",
  "externalWallInsulationThickness",
  "externalWallStructureThickness",
  "totalWallSurface",
  "externalWallSurface",
  "wallSurfaceDeperditive",
  "unheatedWallLabel",
  "unheatedWallMain",
  "wallOrientationLabel",
  "floorDeperditiveType",
  "totalLowerFloorSurface",
  "floorSurfaceDeperditive",
  "floorUValueRaw",
  "unheatedFloorLabel",
  "unheatedFloorMain",
  "adjacencyMainFloorType",
  "upperFloorDeperditiveType",
  "upperFloorSurfaceTotal",
  "upperFloorSurfaceDeperditive",
  "unheatedFloorLabelTop",
  "unheatedFloorMainTop",
  "adjacencyMainFloorTop",
  "doorType",
  "doorSurface",
  "doorUValue",
  "lossWall",
  "thermalLossWindow",
  "thermalLossLowerFloor",
  "thermalLossUpperFloor",
  "lossThermalBridge",
  "thermalLossDoor",
  "nbPdlsTotalElecMulti",
  "totalConsumptionElecMulti",
  "mainAddressInteropKey",
  "nbValidAddressesBan",
  "addressReliabilityLevel1",
  "addressReliabilityLevel2",
  "bdnbNetworkId",
  "distanceToNetworkIndicator",
  "buildingNatureLabelBdtopo",
  "detailedNatureLabelBdtopo",
  "toponymLabelBdtopo",
  "soilFootprintReliability",
  "heightReliability",
  "addressReliability",
  "maxHeight",
  "averageGroundAltitude",
  "legalUnitWorkforceRange",
] as const;
