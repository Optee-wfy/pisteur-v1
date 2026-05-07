import z from "zod";
import { DPE_LABELS } from "./location.constant";

// GLAZING TYPES
export const GLAZING_TYPES = [
  "double vitrage",
  "simple vitrage",
  "triple vitrage",
  "survitrage",
  "brique de verre ou polycarbonate",
] as const;

export type GlazingType = (typeof GLAZING_TYPES)[number];

// Backup heating energy type
export const BACKUP_HEATING_ENERGY_TYPES = [
  "electricite",
  "bois",
  "gaz",
  "fioul",
  "charbon",
  "gpl/butane/propane",
  "reseau de chaleur",
] as const;

export type BackupHeatingEnergyType =
  (typeof BACKUP_HEATING_ENERGY_TYPES)[number];

export const INSULATION_TYPES = [
  "non isole",
  "isole",
  "ITI",
  "ITE",
  "ITR",
  "inconnu",
] as const;

export type InsulationType = (typeof INSULATION_TYPES)[number];

export const WALL_MATERIALS = [
  "AGGLOMERE",
  "AUTRES",
  "BETON",
  "BOIS",
  "BRIQUES",
  "MEULIERE",
  "PIERRE",
  "INDETERMINE",
] as const;

export type WallMaterial = (typeof WALL_MATERIALS)[number];

export const ROOF_MATERIALS = [
  "ARDOISES",
  "AUTRES",
  "TUILES",
  "INDETERMINE",
  "BETON",
  "ZINC ALUMINIUM",
] as const;

export type RoofMaterial = (typeof ROOF_MATERIALS)[number];

export const HEATING_GENERATOR_AGES = [
  "ancien",
  "neuf",
  "récent(<15ans)",
  "très ancien",
] as const;

export type HeatingGeneratorAge = (typeof HEATING_GENERATOR_AGES)[number];

export const WINDOW_MATERIAL_TYPE = [
  "autres",
  "bois",
  "pvc",
  "métal",
  "métal avec rupture de pont thermique",
  "métal sans rupture de pont thermique",
  "brique de verre",
  "polycarbonate",
] as const;
export type WindowMaterialType = (typeof WINDOW_MATERIAL_TYPE)[number];

export const DPE_CONSTRUCTION_PERIOD = [
  "avant 1948",
  "1948-1974",
  "1975-1977",
  "1978-1982",
  "1983-1988",
  "1989-2000",
  "2001-2005",
  "2006-2012",
  "2013-2021",
  "après 2021",
] as const;

export type DpeConstructionPeriod = (typeof DPE_CONSTRUCTION_PERIOD)[number];

export const INERTIA_CLASS = [
  "Légère",
  "Moyenne",
  "Lourde",
  "Très lourde",
] as const;

export type InertiaClass = (typeof INERTIA_CLASS)[number];

export const BUILDING_TYPE_DPE = ["appartement", "immeuble", "maison"] as const;
export type BuildingTypeDpe = (typeof BUILDING_TYPE_DPE)[number];

export const ECS_INSTALLATION_TYPE = ["individuel", "collectif"] as const;
export type EcsInstallationType = (typeof ECS_INSTALLATION_TYPE)[number];

export const ALEA_LEVELS = ["Faible", "Moyen", "Fort"] as const;
export type AleaLevel = (typeof ALEA_LEVELS)[number];

export const ECS_GENERATOR_TYPE_LABELS = {
  ballon_accumulation_electrique: "ballon accumulation electrique",
  chaudiere_bois: "chaudiere bois",
  chaudiere_charbon_standard: "chaudiere charbon standard",
  chaudiere_electrique: "chaudiere electrique",
  chaudiere_indetermine_bt: "chaudiere energie indetermine basse temperature",
  chaudiere_indetermine_cond: "chaudiere energie indetermine condensation",
  chaudiere_indetermine_indetermine:
    "chaudiere energie indetermine indetermine",
  chaudiere_indetermine_std: "chaudiere energie indetermine standard",
  chaudiere_fioul_bt: "chaudiere fioul basse temperature",
  chaudiere_fioul_cond: "chaudiere fioul condensation",
  chaudiere_fioul_std: "chaudiere fioul standard",
  chaudiere_gaz_bt: "chaudiere gaz basse temperature",
  chaudiere_gaz_cond: "chaudiere gaz condensation",
  chaudiere_gaz_std: "chaudiere gaz standard",
  chaudiere_gpl_bt: "chaudiere gpl/butane/propane basse temperature",
  chaudiere_gpl_cond: "chaudiere gpl/butane/propane condensation",
  chaudiere_gpl_std: "chaudiere gpl/butane/propane standard",
  chauffe_eau_electrique_instantane: "chauffe eau electrique instantane",
  chauffe_eau_fioul_independant: "chauffe-eau fioul independant",
  chauffe_eau_gaz_independant: "chauffe-eau gaz independant",
  chauffe_eau_gpl_independant: "chauffe-eau gpl/butane/propane independant",
  chauffe_eau_indetermine: "chauffe-eau independant indetermine",
  ecs_autre_indetermine: "ecs autre indetermine",
  ecs_bois_indetermine: "ecs bois indetermine",
  ecs_solaire: "ecs solaire",
  ecs_thermodynamique_electrique:
    "ecs thermodynamique electrique(pac ou ballon)",
  production_mixte_indetermine: "production mixte indetermine",
  reseau_chaleur: "reseau de chaleur",
} as const;

export type ECSGeneratorTypeCode = keyof typeof ECS_GENERATOR_TYPE_LABELS;
export const ECS_GENERATOR_TYPES = Object.keys(ECS_GENERATOR_TYPE_LABELS) as [
  ECSGeneratorTypeCode,
  ...ECSGeneratorTypeCode[],
];

const ecsGeneratorTypeOption = (value: ECSGeneratorTypeCode) => ({
  value,
  label: ECS_GENERATOR_TYPE_LABELS[value],
});

export const ECS_GENERATOR_TYPE_GROUPS = [
  {
    label: "Chaudières gaz / fioul / GPL",
    value: "chaudieres_gaz_fioul_gpl",
    options: [
      ecsGeneratorTypeOption("chaudiere_fioul_bt"),
      ecsGeneratorTypeOption("chaudiere_fioul_cond"),
      ecsGeneratorTypeOption("chaudiere_fioul_std"),
      ecsGeneratorTypeOption("chaudiere_gaz_bt"),
      ecsGeneratorTypeOption("chaudiere_gaz_cond"),
      ecsGeneratorTypeOption("chaudiere_gaz_std"),
      ecsGeneratorTypeOption("chaudiere_gpl_bt"),
      ecsGeneratorTypeOption("chaudiere_gpl_cond"),
      ecsGeneratorTypeOption("chaudiere_gpl_std"),
    ],
  },
  {
    label: "Chaudières bois / charbon / biomasse",
    value: "chaudieres_bois_charbon_biomasse",
    options: [
      ecsGeneratorTypeOption("chaudiere_bois"),
      ecsGeneratorTypeOption("chaudiere_charbon_standard"),
    ],
  },
  {
    label: "Chaudières électriques",
    value: "chaudieres_electriques",
    options: [ecsGeneratorTypeOption("chaudiere_electrique")],
  },
  {
    label: "Ballons et chauffe-eau électriques",
    value: "ballons_chauffe_eau_electriques",
    options: [
      ecsGeneratorTypeOption("ballon_accumulation_electrique"),
      ecsGeneratorTypeOption("chauffe_eau_electrique_instantane"),
    ],
  },
  {
    label: "Chauffe-eau indépendants gaz / fioul / GPL",
    value: "chauffe_eau_independants_gaz_fioul_gpl",
    options: [
      ecsGeneratorTypeOption("chauffe_eau_fioul_independant"),
      ecsGeneratorTypeOption("chauffe_eau_gaz_independant"),
      ecsGeneratorTypeOption("chauffe_eau_gpl_independant"),
    ],
  },
  {
    label: "Energies renouvelables & systèmes hybrides",
    value: "energies_renouvelables_systemes_hybrides",
    options: [
      ecsGeneratorTypeOption("ecs_solaire"),
      ecsGeneratorTypeOption("ecs_thermodynamique_electrique"),
      ecsGeneratorTypeOption("reseau_chaleur"),
    ],
  },
  {
    label: "Autres/indéterminés",
    value: "autres_indetermines",
    options: [
      ecsGeneratorTypeOption("chauffe_eau_indetermine"),
      ecsGeneratorTypeOption("chaudiere_indetermine_bt"),
      ecsGeneratorTypeOption("chaudiere_indetermine_cond"),
      ecsGeneratorTypeOption("chaudiere_indetermine_indetermine"),
      ecsGeneratorTypeOption("chaudiere_indetermine_std"),
      ecsGeneratorTypeOption("production_mixte_indetermine"),
      ecsGeneratorTypeOption("ecs_autre_indetermine"),
      ecsGeneratorTypeOption("ecs_bois_indetermine"),
    ],
  },
];

export const VENTILATION_TYPE_LABELS = {
  extracteur_conduit_non_modifie:
    "Extracteur mécanique sur conduit non modifié de ventilation naturelle existante",
  puits_canadien: "Puits canadien",
  entrees_air_hautes_basses:
    "Système de ventilation par entrées d’air hautes et basses",
  ventilation_hybride: "Ventilation hybride",
  hybride_entrees_hygro:
    "Ventilation hybride avec entrées d’air hygroréglables",
  vm_auto: "Ventilation mécanique auto réglable",
  vm_auto_post82: "Ventilation mécanique auto réglable « après 1982 »",
  vm_auto_pre82: "Ventilation mécanique auto réglable « avant 1982 »",
  vm_double_flux_echangeur: "Ventilation mécanique double flux avec échangeur",
  vm_double_flux_sans_echangeur:
    "Ventilation mécanique double flux sans échangeur",
  vm_gaz_hygro: "Ventilation mécanique gaz hygroréglable",
  vm_extraction_entrees_hygro:
    "Ventilation mécanique à extraction et entrées d’air hygroréglables",
  vm_extraction_hygro: "Ventilation mécanique à extraction hygroréglable",
  ventilation_conduit: "Ventilation naturelle par conduit",
  ventilation_conduit_entrees_hygro:
    "Ventilation naturelle par conduit avec entrées d’air hygroréglables",
  ouverture_fenetres: "Ventilation par ouverture des fenêtres",
} as const;

export type VentilationTypeCode = keyof typeof VENTILATION_TYPE_LABELS;
export const VENTILATION_TYPES = Object.keys(VENTILATION_TYPE_LABELS) as [
  VentilationTypeCode,
  ...VentilationTypeCode[],
];

const ventilationTypeOption = (value: VentilationTypeCode) => ({
  value,
  label: VENTILATION_TYPE_LABELS[value],
});

export const VENTILATION_TYPE_GROUPS = [
  {
    label: "Ventilation naturelle",
    value: "ventilation_naturelle",
    options: [
      ventilationTypeOption("ventilation_conduit"),
      ventilationTypeOption("ventilation_conduit_entrees_hygro"),
      ventilationTypeOption("entrees_air_hautes_basses"),
      ventilationTypeOption("ouverture_fenetres"),
      ventilationTypeOption("puits_canadien"),
    ],
  },
  {
    label: "Ventilation mécanique simple flux auto réglable",
    value: "vm_auto_reglable",
    options: [
      ventilationTypeOption("vm_auto"),
      ventilationTypeOption("vm_auto_post82"),
      ventilationTypeOption("vm_auto_pre82"),
      ventilationTypeOption("extracteur_conduit_non_modifie"),
    ],
  },
  {
    label: "Ventilation mécanique simple flux hygroréglable",
    value: "vm_hygroreglable",
    options: [
      ventilationTypeOption("vm_extraction_hygro"),
      ventilationTypeOption("vm_extraction_entrees_hygro"),
      ventilationTypeOption("vm_gaz_hygro"),
    ],
  },
  {
    label: "Ventilation mécanique double flux",
    value: "vm_double_flux",
    options: [
      ventilationTypeOption("vm_double_flux_echangeur"),
      ventilationTypeOption("vm_double_flux_sans_echangeur"),
    ],
  },
  {
    label: "Ventilation hybride",
    value: "ventilation_hybride",
    options: [
      ventilationTypeOption("ventilation_hybride"),
      ventilationTypeOption("hybride_entrees_hygro"),
    ],
  },
];

export const HEATING_TYPE_LABELS = {
  chaudiere_bois: "chaudiere bois",
  chaudiere_charbon_condensation: "chaudiere charbon condensation",
  chaudiere_charbon_standard: "chaudiere charbon standard",
  chaudiere_electrique: "chaudiere electrique",
  chaudiere_indetermine_bt: "chaudiere energie indetermine basse temperature",
  chaudiere_indetermine_cond: "chaudiere energie indetermine condensation",
  chaudiere_indetermine_indetermine:
    "chaudiere energie indetermine indetermine",
  chaudiere_indetermine_std: "chaudiere energie indetermine standard",
  chaudiere_fioul_bt: "chaudiere fioul basse temperature",
  chaudiere_fioul_cond: "chaudiere fioul condensation",
  chaudiere_fioul_std: "chaudiere fioul standard",
  chaudiere_gaz_bt: "chaudiere gaz basse temperature",
  chaudiere_gaz_cond: "chaudiere gaz condensation",
  chaudiere_gaz_std: "chaudiere gaz standard",
  chaudiere_gpl_bt: "chaudiere gpl/butane/propane basse temperature",
  chaudiere_gpl_cond: "chaudiere gpl/butane/propane condensation",
  chaudiere_gpl_std: "chaudiere gpl/butane/propane standard",
  chauffage_autre_indetermine: "chauffage autre indetermine",
  chauffage_bois_indetermine: "chauffage bois indetermine",
  chauffage_solaire: "chauffage solaire",
  generateur_air_chaud_combustion: "generateur air chaud combustion",
  generateurs_effet_joule: "generateurs a effet joule",
  pac_air_air: "pac air/air",
  pac_air_eau: "pac air/eau",
  pac_eau_eau: "pac eau/eau",
  pac_geothermique: "pac geothermique",
  pac_indetermine: "pac indetermine",
  poele_insert_bois: "poele ou insert bois",
  poele_insert_charbon: "poele ou insert charbon",
  poele_insert_fioul: "poele ou insert fioul",
  poele_insert_gpl: "poele ou insert gpl/butane/propane",
  poele_insert_indetermine: "poele ou insert indetermine",
  radiateurs_gaz: "radiateurs gaz",
  reseau_chaleur: "reseau de chaleur",
} as const;

export type HeatingTypeCode = keyof typeof HEATING_TYPE_LABELS;
export const HEATING_TYPES = Object.keys(HEATING_TYPE_LABELS) as [
  HeatingTypeCode,
  ...HeatingTypeCode[],
];

const heatingTypeOption = (value: HeatingTypeCode) => ({
  value,
  label: HEATING_TYPE_LABELS[value],
});

export const HEATING_TYPE_GROUPS = [
  {
    label: "Chaudière/Radiateur Gaz",
    value: "chaudiere_gaz",
    options: [
      heatingTypeOption("chaudiere_gaz_bt"),
      heatingTypeOption("chaudiere_gaz_cond"),
      heatingTypeOption("chaudiere_gaz_std"),
      heatingTypeOption("radiateurs_gaz"),
    ],
  },
  {
    label: "Chaudière/Poêle Fioul/GPL/Butane",
    value: "chaudiere_fioul_gpl_butane",
    options: [
      heatingTypeOption("chaudiere_fioul_bt"),
      heatingTypeOption("chaudiere_fioul_cond"),
      heatingTypeOption("chaudiere_fioul_std"),
      heatingTypeOption("chaudiere_gpl_bt"),
      heatingTypeOption("chaudiere_gpl_cond"),
      heatingTypeOption("chaudiere_gpl_std"),
      heatingTypeOption("poele_insert_fioul"),
      heatingTypeOption("poele_insert_gpl"),
    ],
  },
  {
    label: "Bois / Biomasse",
    value: "bois_biomasse",
    options: [
      heatingTypeOption("chaudiere_bois"),
      heatingTypeOption("chaudiere_charbon_condensation"),
      heatingTypeOption("chaudiere_charbon_standard"),
      heatingTypeOption("poele_insert_bois"),
    ],
  },
  {
    label: "Charbon",
    value: "charbon",
    options: [heatingTypeOption("poele_insert_charbon")],
  },
  {
    label: "Electrique Direct",
    value: "electrique_direct",
    options: [heatingTypeOption("chaudiere_electrique")],
  },
  {
    label: "Pompes à Chaleur air/ air & géothermique",
    value: "pac_air_air_geothermique",
    options: [
      heatingTypeOption("pac_air_air"),
      heatingTypeOption("pac_geothermique"),
    ],
  },
  {
    label: "Pompes à Chaleur air/ eau & eau/ eau",
    value: "pac_air_eau_eau_eau",
    options: [
      heatingTypeOption("pac_air_eau"),
      heatingTypeOption("pac_eau_eau"),
    ],
  },
  {
    label: "Pompes à Chaleur indéterminée",
    value: "pac_indetermine",
    options: [heatingTypeOption("pac_indetermine")],
  },
  {
    label: "Chauffage solaire",
    value: "chauffage_solaire",
    options: [heatingTypeOption("chauffage_solaire")],
  },
  {
    label: "Réseau de chaleur",
    value: "reseau_chaleur",
    options: [heatingTypeOption("reseau_chaleur")],
  },
  {
    label: "Générateurs",
    value: "generateurs",
    options: [
      heatingTypeOption("generateur_air_chaud_combustion"),
      heatingTypeOption("generateurs_effet_joule"),
    ],
  },
  {
    label: "Chauffage autre indeterminé",
    value: "chauffage_autre_indetermine",
    options: [
      heatingTypeOption("chaudiere_indetermine_std"),
      heatingTypeOption("chaudiere_indetermine_bt"),
      heatingTypeOption("chaudiere_indetermine_cond"),
      heatingTypeOption("chaudiere_indetermine_indetermine"),
      heatingTypeOption("chauffage_autre_indetermine"),
      heatingTypeOption("chauffage_bois_indetermine"),
      heatingTypeOption("poele_insert_indetermine"),
    ],
  },
];

export const SHUTTER_TYPES_LABEL = {
  fermeture_isolee_sans_ajours:
    "Fermeture isolée sans ajours en position déployée",
  fermeture_sans_ajours: "Fermeture sans ajours en position déployée",
  jalousie_accordeon: "Jalousie accordéon",
  lames_orientables_metal:
    "fermeture à lames orientables y compris les vénitiens extérieurs tout métal",
  volets_ou_persiennes_ajours_fixes:
    "volets battants ou persiennes avec ajours fixes",
  persienne_ou_volet_pvc: "Persienne coulissante ou volet battant PVC",
  volet_bois_epais: "volet battant bois (e > 22 mm)",
  volet_bois_fin: "volet battant bois (e ≤ 22 mm)",
  volet_roulant_pvc_epais: "Volet roulant PVC ( e > 12 mm)",
  volet_roulant_pvc_fin: "Volet roulant PVC ( e ≤ 12 mm)",
  absence_fermeture_baie: "abscence de fermeture pour la baie vitrée",
} as const;

export type ShutterTypeCode = keyof typeof SHUTTER_TYPES_LABEL;
export const SHUTTER_TYPES = Object.keys(SHUTTER_TYPES_LABEL) as [
  ShutterTypeCode,
  ...ShutterTypeCode[],
];

export const WALL_STRUCTURE_MATERIAL_LABELS = {
  autre_materiau_innovant_recent: "autre matériau innovant récent",
  autre_materiau_non_repertorie: "autre matériau non répertorié",
  autre_materiau_traditionnel_ancien: "autre matériau traditionel ancien",
  brique_terre_cuite_alveolaire: "brique terre cuite alvéolaire",
  beton_cellulaire: "béton cellulaire",
  cloison_platre: "cloison de plâtre",
  inconnu: "inconnu",
  monomur_terre_cuite: "monomur terre cuite",
  murs_bois_rondin: "murs bois (rondin)",
  murs_blocs_beton_creux: "murs en blocs de béton creux",
  murs_blocs_beton_pleins: "murs en blocs de béton pleins",
  murs_briques: "murs en briques",
  murs_briques_creuses: "murs en briques creuses",
  murs_briques_doubles_lame_air:
    "murs en briques pleines doubles avec lame d'air",
  murs_briques_simples: "murs en briques pleines simples",
  murs_beton: "murs en béton",
  murs_beton_banche: "murs en béton banché",
  murs_beton_machefer: "murs en béton de mâchefer",
  murs_ossature_bois_remplissage_2001_2005:
    "murs en ossature bois avec isolant en remplissage 2001-2005",
  murs_ossature_bois_remplissage_lt_2001:
    "murs en ossature bois avec isolant en remplissage <2001",
  murs_ossature_bois_remplissage_ge_2006:
    "murs en ossature bois avec isolant en remplissage ≥ 2006",
  murs_ossature_bois_tout_venant:
    "murs en ossature bois avec remplissage tout venant",
  murs_ossature_bois_sans_remplissage: "murs en ossature bois sans remplissage",
  murs_pan_bois_tout_venant: "murs en pan de bois avec remplissage tout venant",
  murs_pan_bois_sans_remplissage:
    "murs en pan de bois sans remplissage tout venant",
  murs_pierre: "murs en pierre",
  murs_pierre_taille_moellons_tout_venant:
    "murs en pierre de taille et moellons avec remplissage tout venant",
  murs_pierre_taille_moellons_constitue:
    "murs en pierre de taille et moellons constitué d'un seul matériaux",
  murs_pise_beton_terre:
    "murs en pisé ou béton de terre stabilisé (à partir d'argile crue)",
  murs_sandwich_beton_isolant:
    "murs sandwich béton/isolant/béton (sans isolation rapportée)",
} as const;

export type WallStructureMaterialCode =
  keyof typeof WALL_STRUCTURE_MATERIAL_LABELS;
export const WALL_STRUCTURE_MATERIALS = Object.keys(
  WALL_STRUCTURE_MATERIAL_LABELS,
) as [WallStructureMaterialCode, ...WallStructureMaterialCode[]];

export const dpeListFilterSchema = z.array(
  z.union([z.enum(DPE_LABELS), z.literal("NC")]),
);
