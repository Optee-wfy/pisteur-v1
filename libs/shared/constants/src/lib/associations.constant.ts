export const LOCATION_NOTES_ASSOCIATIONS = {
  NULL: { label: null, id: 77 },
} as const;

export const LOCATION_CLIENT_ASSOCIATIONS = {
  NULL: { label: null, id: 86 },
} as const;

export const LOCATION_NOTE_ASSOCIATIONS = {
  NULL: { label: null, id: 77 },
} as const;

export type LocationClientAssociation =
  (typeof LOCATION_CLIENT_ASSOCIATIONS)[keyof typeof LOCATION_CLIENT_ASSOCIATIONS];

export type ContactLocationLabel =
  | "Administrateur bâtiment"
  | "Observateur bâtiment"
  | "sur site"
  | null;
export const CONTACT_LOCATION_ASSOCIATIONS = {
  NULL: { label: null, id: 202 },
  ADMINISTRATOR: {
    label: "Administrateur bâtiment",
    id: 275,
  },
  ON_SITE: { label: "sur site", id: 204 },
  VIEWER: { label: "Observateur bâtiment", id: 280 },
} as const satisfies Record<
  string,
  { label: ContactLocationLabel | null; id: number }
>;

export type ContactLocationAssociation =
  (typeof CONTACT_LOCATION_ASSOCIATIONS)[keyof typeof CONTACT_LOCATION_ASSOCIATIONS];

export type ContactClientLabel = "Administrateur compte" | null;
export const CONTACT_CLIENT_ASSOCIATIONS = {
  NULL: { label: null, id: 18 },
  ADMINISTRATOR: {
    label: "Administrateur compte",
    id: 194,
  },
} as const satisfies Record<
  string,
  { label: ContactClientLabel | null; id: number }
>;

export type ContactClientAssociation =
  (typeof CONTACT_CLIENT_ASSOCIATIONS)[keyof typeof CONTACT_CLIENT_ASSOCIATIONS];

export const CONTACT_PRO_ASSOCIATIONS = {
  NULL: { label: null, id: 68 },
  MAIN_CONTACT: { label: "Contact principal", id: 230 },
} as const;

export type ContactProAssociation =
  (typeof CONTACT_PRO_ASSOCIATIONS)[keyof typeof CONTACT_PRO_ASSOCIATIONS];

export const CONTACT_OPERATION_ASSOCIATIONS = {
  NULL: { label: null, id: 4 },
  SIGNATORY: { label: "Administrateur", id: 200 },
  ACCOUNT: { label: "Compte", id: 238 },
  PRO: { label: "Pro", id: 243 },
  VIEW_ONLY: { label: "Observateur transaction", id: 284 },
  MANAGER: { label: "Utilisateur transaction", id: 282 },
  LOCATION: { label: "Bâtiments", id: 236 },
  ON_SITE: { label: "sur site", id: 220 },
} as const;

export type ContactOperationAssociation =
  (typeof CONTACT_OPERATION_ASSOCIATIONS)[keyof typeof CONTACT_OPERATION_ASSOCIATIONS];

export const OPERATION_LOCATION_ASSOCIATIONS = {
  NULL: { label: null, id: 133 },
} as const;

export const OPERATION_QUOTE_ASSOCIATIONS = {
  NULL: { label: null, id: 155 },
  RETAINED: { label: "Retenu", id: 205 },
} as const;

export const OPERATION_PRO_ASSOCIATIONS = {
  NULL: { label: null, id: 135 },
  RETAINED: { label: "Pro Retenu", id: 249 },
} as const;

export const OPERATION_CLIENT_ASSOCIATIONS = {
  NULL: { label: null, id: 217 },
} as const;

export const OPERATION_FINANCIER_ASSOCIATIONS = {
  NULL: { label: null, id: 137 },
} as const;

export const OPERATION_FACTURE_ASSOCIATIONS = {
  NULL: { label: null, id: 176 },
} as const;

export const QUOTE_PRO_ASSOCIATIONS = {
  NULL: { label: null, id: 157 },
} as const;

export const QUOTE_CLIENT_ASSOCIATIONS = {
  NULL: { label: null, id: 224 },
} as const;

export const QUOTE_LOCATION_ASSOCIATIONS = {
  NULL: { label: null, id: 216 },
} as const;

export const QUOTE_NOTE_ASSOCIATIONS = {
  NULL: { label: null, id: 151 },
} as const;

export const NOTE_OPERATION_ASSOCIATIONS = {
  NULL: { label: null, id: 214 },
} as const;

export const NOTE_PRO_ASSOCIATIONS = {
  NULL: { label: null, id: 63 },
} as const;

export const PRO_CLIENT_ASSOCIATIONS = {
  NULL: { label: null, id: 355 },
  CONNECTED: { label: "Mise en relation", id: 357 },
} as const;
export type ProClientAssociation =
  (typeof PRO_CLIENT_ASSOCIATIONS)[keyof typeof PRO_CLIENT_ASSOCIATIONS];

export const PRO_LOCATION_ASSOCIATIONS_LABEL_DATA = [
  "Intéressé",
  "Enregistré",
  "Débloqué",
] as const;
export type ProLocationAssociationLabel =
  (typeof PRO_LOCATION_ASSOCIATIONS_LABEL_DATA)[number];

export const PRO_LOCATION_ASSOCIATIONS = {
  NULL: { label: null, id: 358 },
  INTERESTED: { label: "Intéressé", id: 407 },
  SAVED: { label: "Enregistré", id: 409 },
  UNBLOCKED: { label: "Débloqué", id: 405 },
} as const satisfies Record<
  string,
  { label: ProLocationAssociationLabel | null; id: number }
>;
export type ProLocationAssociationId =
  (typeof PRO_LOCATION_ASSOCIATIONS)[keyof typeof PRO_LOCATION_ASSOCIATIONS]["id"];

export type ProLocationAssociation =
  (typeof PRO_LOCATION_ASSOCIATIONS)[keyof typeof PRO_LOCATION_ASSOCIATIONS];

export const PRO_LEGAL_ENTITY_ASSOCIATIONS = {
  GLOBAL: { label: "Global", id: 1 },
  CONTACT: { label: "Contact", id: 2 },
} as const;

export type ProLegalEntityAssociationId =
  (typeof PRO_LEGAL_ENTITY_ASSOCIATIONS)[keyof typeof PRO_LEGAL_ENTITY_ASSOCIATIONS]["id"];

export type ProLegalEntityAssociation =
  (typeof PRO_LEGAL_ENTITY_ASSOCIATIONS)[keyof typeof PRO_LEGAL_ENTITY_ASSOCIATIONS];
