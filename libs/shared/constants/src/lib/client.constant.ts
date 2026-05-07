export enum ClientType {
  CO_OWNERSHIP_MANAGER = "Gestionnaire de copropriété ou syndic",
  PROPERTY_MANAGER = "Gestionnaire Immobilier",
  HEALTH = "Santé",
  HOSTEL_RESTAURANT = "Hôtellerie_restauration",
  TEACHING = "Propriétaire/Gestionnaire d'un établissement d'enseignement",
  ARCHITECT = "Architecte/BET",
  STUDY_DESK = "Bureau d'étude",
  BUILDING_PROFESSIONAL = "Professionnel du bâtiment",
  OTHER = "Autre",
  PRESCRIPTOR = "Prescripteur",
  OWNER = "Propriétaire exploitant",
  PUBLIC_COLLECTIVITY = "collectivité_publique",
  DEMO = "Compte démo 👀",
}

export const CLIENT_TYPES = Object.values(ClientType) as [
  ClientType,
  ...ClientType[],
];
export enum ClientOrigin {
  ONBOARDING = "Formulaire Onboarding Client",
}
export const CLIENT_ORIGINS = Object.values(ClientOrigin) as [
  ClientOrigin,
  ...ClientOrigin[],
];

// Synced with: https://app-eu1.hubspot.com/property-settings/144886321/properties?type=2-130916146&search=stage&action=edit&property=hs_pipeline_stage
export enum ClientStage {
  PROSPECT = "2060166390",
  URGENT_PROSPECT = "3205209275",
  INITIATION = "2060166391",
  DEVELOPMENT = "2060167357",
  FARMING = "2060167358",
  ACTIVE_BRONZE = "2151154926",
  ACTIVE_SILVER = "2151154927",
  ACTIVE_GOLD = "2151154928",
  LOST = "2060167359",
}
export const CLIENT_STAGES = Object.values(ClientStage) as [
  ClientStage,
  ...ClientStage[],
];
