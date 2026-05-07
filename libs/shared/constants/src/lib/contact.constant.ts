import { ClientType } from "./client.constant";

export enum ContactStage {
  NEW_PROSPECT = "4431807719",
  SUBSCRIBER = "subscriber",
  LEAD = "lead",
  INTEREST_IDENTIFIED = "2055750850",
  PHONE_PROSPECTING = "2055750851",
  ONBOARDING = "2055488722",
  ACCESS_SIGNUP = "2055488723",
  ACCESS = "2055488724",
  FIRST_ORDER_SIGNUP = "2055750853",
  FIRST_ORDER = "2055488726",
  LOST = "2060167406",
  INACTIVE = "2653357243",
  CLIENT = "2124652755",
  DO_NOT_CONTACT_ANYMORE = "3326173431",
  NEW_LEAD = "3753849053",
  LEAD_NON_DECISIONAL = "3828956398",
  LEAD_NOT_INTERESTED = "3755623615",
  LEAD_TO_QUALIFY = "3831923939",
  SHORT_TERM_NEGOTIATION = "3753047281",
  LONG_TERM_NEGOTIATION = "3755650257",
  MEET_DEMO = "3753849054",
  LEAD_PROSPECT_ETHAN = "3834108126",
  LEAD_PROSPECT_ANTOINE = "3832287480",
  LEAD_IDENTIFIED = "3831923940",
  LEAD_LEMLIST_TO_CONTACT = "3679273165",
  SHORT_TERM_NEGOTIATION_FREEMIUM = "4026735816",
  SIGN_IN_SENT = "4059677933",
  PISTEUR_SUBSCRIBER = "3896721638",
}

export const CONTACT_STAGES = Object.values(ContactStage) as [
  ContactStage,
  ...ContactStage[],
];

export enum ContactOrigin {
  ONBOARDING_CLIENT = "Formulaire Onboarding Client",
  ONBOARDING_PRO = "Formulaire Onboarding Pro",
  INVITATION_BY_PRO = "Invitation par un Admin Pro",
}
export const CONTACT_ORIGINS = Object.values(ContactOrigin) as [
  ContactOrigin,
  ...ContactOrigin[],
];

export const CONTACT_JOB_TYPES = [
  {
    label: "Gestionnaire d’actifs immobilier",
    value: "gestionnaire_actifs_immobilier",
  },
  { label: "Architecte", value: "Architecte" },
  {
    label: "Directeur / Responsable Technique",
    value: "directeur_responsable_technique",
  },
  {
    label: "Directeur / Responsable de site",
    value: "directeur_responsable_site",
  },
  {
    label: "Directeur Général des Services",
    value: "directeur_general_services",
  },
  {
    label: "Assistance à Maîtrise d’Ouvrage interne",
    value: "assistance_maitrise_ouvrage_interne",
  },
  {
    label: "Directeur / Responsable Patrimoine",
    value: "directeur_responsable_patrimoine",
  },
  {
    label: "Directeur / Responsable immobilier",
    value: "directeur_responsable_immobilier",
  },
  {
    label: "Responsable Travaux",
    value: "responsable_travaux",
  },
  {
    label: "Directeur de clientèle syndic",
    value: "directeur_clientele_syndic",
  },
  {
    label: "Directeur / Responsable Maintenance",
    value: "directeur_responsable_maintenance",
  },
  {
    label: "Energy Manager",
    value: "energy_manager",
  },
  {
    label: "Responsable / Chef de projet Transition Énergétique",
    value: "responsable_transition_energetique",
  },
  {
    label: "Asset Manager",
    value: "AssetManager",
  },
  {
    label: "Responsable RSE / ESG",
    value: "responsable_RSE_ESG",
  },
  {
    label: "Analyste immobilier",
    value: "analyste_immobilier",
  },
  {
    label: "Gestionnaire de copropriété / Syndic",
    value: "gestionnaire_copropriété / Syndic",
  },
  { label: "Autre", value: "Autre" },
] as const;

export type ContactJobType = (typeof CONTACT_JOB_TYPES)[number]["value"];

export const CONTACT_JOB_TYPES_SLUGS = CONTACT_JOB_TYPES.map(
  (job) => job.value,
) as [ContactJobType, ...ContactJobType[]];

export const CONTACT_ACTIVITY_SECTORS = [
  {
    label: "Architecte",
    value: "architecte",
    matchingClientType: ClientType.ARCHITECT,
  },
  {
    label: "Bureau d’études",
    value: "bureau_etude",
    matchingClientType: ClientType.STUDY_DESK,
  },
  {
    label: "Gestion d’actifs immobiliers",
    value: "gestion_actifs_immobiliers",
    matchingClientType: ClientType.PROPERTY_MANAGER,
  },
  {
    label: "Éducation",
    value: "Education",
    matchingClientType: ClientType.TEACHING,
  },
  {
    label: "Entreprise de travaux",
    value: "entreprise_travaux",
    matchingClientType: ClientType.BUILDING_PROFESSIONAL,
  },
  {
    label: "Gestion de copropriétés",
    value: "gestion_coproprietes",
    matchingClientType: ClientType.CO_OWNERSHIP_MANAGER,
  },
  {
    label: "Hôtellerie-Restauration",
    value: "hotellerie_restauration",
    matchingClientType: ClientType.HOSTEL_RESTAURANT,
  },
  { label: "Santé", value: "sante", matchingClientType: ClientType.HEALTH },
  {
    label: "Collectivité Publique",
    value: "collectivite_publique",
    matchingClientType: ClientType.PUBLIC_COLLECTIVITY,
  },
  { label: "Autre", value: "Autre", matchingClientType: ClientType.OTHER },
] as const;
