import type {
  BdnbApiResponse,
  BuildingOccupancyStatus,
  ContactLevel,
  ContactClientLabel,
  ContactLocationLabel,
  FullEnrichEnrichmentId,
  InertiaClass,
  IpeUsageReason,
  LegalEntityFilterType,
  LegalForm,
  NafCode,
  OperationBrief,
  ProLocationAssociationLabel,
  WorkDomain,
  YouSignDocumentId,
  YouSignLocation,
  YouSignRequestId,
  YouSignSignerId,
} from "@optee/constants";
import {
  ALEA_LEVELS,
  AssociationProExternalContactStatus,
  AssociationProExternalContactType,
  BACKUP_HEATING_ENERGY_TYPES,
  BUILDING_TYPE_DPE,
  BUILDING_USAGE,
  CLIENT_ORIGINS,
  CLIENT_STAGES,
  CLIENT_TYPES,
  CONTACT_JOB_TYPES,
  CONTACT_ORIGINS,
  CONTACT_STAGES,
  DEAL_STAGES,
  DPE_CONSTRUCTION_PERIOD,
  DPE_LABELS,
  ECS_GENERATOR_TYPES,
  ECS_INSTALLATION_TYPE,
  EMPLOYEE_RANGES,
  ENERGY_TYPES,
  ExternalContactSeniority,
  ExternalContactSource,
  ExternalContactType,
  FRENCH_DEPARTMENTS,
  FullEnrichEnrichmentStatus,
  GLAZING_TYPES,
  HEATING_GENERATOR_AGES,
  HEATING_SYSTEMS,
  HEATING_TYPES,
  INSULATION_TYPES,
  INVOICE_STAGES,
  IPE_EFFECTIVE_USAGE,
  LEGAL_ENTITY_TYPES,
  MAX_CONSTRUCTION_PERIOD,
  OPERATION_CREATED_BY,
  OPERATION_HUBSPOT_PRESTATION_IDS,
  PRO_STATUSES,
  PRO_SUBSCRIPTIONS,
  QUOTE_STAGES,
  ROOF_MATERIALS,
  SECTOR_DATA,
  SHUTTER_TYPES,
  VENTILATION_TYPES,
  WALL_MATERIALS,
  WALL_STRUCTURE_MATERIALS,
  WINDOW_MATERIAL_TYPE,
} from "@optee/constants";
import { sql, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import {
  MAIL_PROVIDERS,
  MailProvider as SharedMailProvider,
} from "./mail-provider.model";

// Naming convention:
// uuid => our (id_pg)
// id => hubspot id

export const sectorEnum = pgEnum("secteur_enum", SECTOR_DATA);
export const prestationEnum = pgEnum(
  "prestation_enum",
  OPERATION_HUBSPOT_PRESTATION_IDS,
);
export const energyTypeEnum = pgEnum("type_d_energie_enum", ENERGY_TYPES);
export const heatingSystemEnum = pgEnum(
  "type_de_chauffage_enum",
  HEATING_SYSTEMS,
);
export const quoteStageEnum = pgEnum("hs_pipeline_stage_enum", QUOTE_STAGES);

export const frenchDepartmentEnum = pgEnum(
  "departements_de_france_enum",
  FRENCH_DEPARTMENTS,
);

export const dealStageEnum = pgEnum("operation_phase_enum", DEAL_STAGES);

export const legalEntityEnum = pgEnum(
  "type_personne_morale_enum",
  LEGAL_ENTITY_TYPES,
);

// AUTH.USERS

const authSchema = pgSchema("auth");

// Source: https://supabase.com/docs/guides/auth/users#the-user-object

export const UserUuid = z.string().brand("UserUuid");
export type UserUuid = z.infer<typeof UserUuid>;

export const authUsersTable = authSchema.table("users", {
  uuid: uuid("id").primaryKey().$type<UserUuid>(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at"),
  lastSignInAt: timestamp("last_sign_in_at"),
});

// OWNERS

export const OwnerUuid = z.string().brand("OwnerUuid");
export type OwnerUuid = z.infer<typeof OwnerUuid>;

export const OwnerHsId = z.string().brand("OwnerHsId");
export type OwnerHsId = z.infer<typeof OwnerHsId>;

export const hsOwnersTable = pgTable("owners", {
  uuid: uuid("stacksync_record_id_f3zges")
    .primaryKey()
    .defaultRandom()
    .$type<OwnerUuid>(),
  id: varchar("id").unique().notNull().$type<OwnerHsId>(),
  email: text("email").notNull(),
  firstName: text("firstname"),
  lastName: text("lastname"),
  userId: varchar("userid"),
  createdAt: timestamp("createdat"),
  updatedAt: timestamp("updatedat"),
  archived: boolean("archived").default(false),
  teams: varchar("teams").array(),
});

export type HubspotOwner = InferSelectModel<typeof hsOwnersTable>;
export type HubspotNewOwner = never;

// TOKENS — à redéfinir lors de la refonte du schéma DB
export const TOKEN_IDS_LOCAL = [] as const;
export type TokenHsId = string;
export const tokenEnum = pgEnum("token_enum", ["placeholder"] as [string, ...string[]]);

export const hsTokensTable = pgTable("tokens", {
  id: tokenEnum("id").unique().notNull(),
  accessToken: text("access_token").notNull(),
  expiresAt: text("expires_at").notNull(),
});

// MAIL CONNECTIONS

export const mailProviderEnum = pgEnum("mail_provider_enum", MAIL_PROVIDERS);

export const MailProvider = SharedMailProvider;
export type MailProvider = z.infer<typeof MailProvider>;

export const MailConnectionUuid = z.string().brand("MailConnectionUuid");
export type MailConnectionUuid = z.infer<typeof MailConnectionUuid>;

export const mailConnectionsTable = pgTable(
  "mail_connections",
  {
    uuid: uuid("id_pg")
      .primaryKey()
      .defaultRandom()
      .$type<MailConnectionUuid>(),
    userUuid: uuid("user_id")
      .$type<UserUuid>()
      .notNull()
      .references(() => authUsersTable.uuid, {
        onDelete: "cascade",
      }),
    provider: mailProviderEnum("provider").notNull(),
    email: text("email").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    scope: text("scope").notNull(),
    accessTokenEncrypted: text("access_token_encrypted").notNull(),
    refreshTokenEncrypted: text("refresh_token_encrypted").notNull(),
    tokenExpiresAt: timestamp("token_expires_at"),
    lastValidatedAt: timestamp("last_validated_at").defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      mailConnectionsUserProviderUnique: unique(
        "uq_mail_connections_user_provider",
      ).on(table.userUuid, table.provider),
      mailConnectionsProviderEmailUnique: unique(
        "uq_mail_connections_provider_email",
      ).on(table.provider, table.email),
      mailConnectionsProviderAccountUnique: unique(
        "uq_mail_connections_provider_account_id",
      ).on(table.provider, table.providerAccountId),
    };
  },
);

export type MailConnection = InferSelectModel<typeof mailConnectionsTable>;
export type NewMailConnection = InferInsertModel<typeof mailConnectionsTable>;

export type GoogleMailConnection = MailConnection & {
  provider: "google";
};

export type MicrosoftMailConnection = MailConnection & {
  provider: "microsoft";
};

// CONTACTS

export const ContactUuid = z.string().brand("ContactUuid");
export type ContactUuid = z.infer<typeof ContactUuid>;

export const ContactHsId = z.string().brand("ContactHsId");
export type ContactHsId = z.infer<typeof ContactHsId>;

export const contactStageEnum = pgEnum(
  "hs_pipeline_contact_stage_enum",
  CONTACT_STAGES,
);

export const contactOriginEnum = pgEnum(
  "origine_inscription_plateforme_contact_enum",
  CONTACT_ORIGINS,
);

export const contactJobTypeEnum = pgEnum(
  "type_de_poste_enum",
  CONTACT_JOB_TYPES.map((type) => type.value) as [string, ...string[]],
);

export const hsContactsTable = pgTable("contacts", {
  uuid: uuid("id_pg").primaryKey().defaultRandom().$type<ContactUuid>(),
  id: varchar("id").unique().$type<ContactHsId>(),
  email: text("email"),
  firstName: text("firstname"),
  lastName: text("lastname"),
  jobTitle: text("jobtitle"),
  jobType: contactJobTypeEnum("type_de_poste"),
  activitySector: text("secteur_activite"),
  phone: text("phone"),
  photo: text("photo"),
  company: text("company"),
  otp: text("otp"),
  userUuid: uuid("user_id")
    .$type<UserUuid>()
    .unique()
    .references(() => authUsersTable.uuid, { onDelete: "set null" }),
  stage: contactStageEnum("lifecyclestage"),
  origin: contactOriginEnum("origine_inscription_plateforme"),
  utmTerm: text("utm_term"),
  utmMedium: text("utm_medium"),
  utmSource: text("utm_source"),
  utmContent: text("utm_content"),
  utmCampaign: text("utm_campaign"),
  invitedAt: timestamp("date_invitation"),
  createdAt: timestamp("date_creation").defaultNow(),
  lastSignInAt: timestamp("derniere_connexion"),
});

export type HubspotContact = InferSelectModel<typeof hsContactsTable>;
export type HubspotNewContact = InferInsertModel<typeof hsContactsTable>;

// CLIENTS
// In Hubspot, Clients == Comptes 🇫🇷

export const ClientUuid = z.string().brand("ClientUuid");
export type ClientUuid = z.infer<typeof ClientUuid>;

export const ClientHsId = z.string().brand("ClientHsId");
export type ClientHsId = z.infer<typeof ClientHsId>;

export const clientStageEnum = pgEnum(
  "hs_pipeline_client_stage_enum",
  CLIENT_STAGES,
);

export const clientTypeEnum = pgEnum("type_de_compte_enum", CLIENT_TYPES);
export const clientOriginEnum = pgEnum(
  "origine_inscription_plateforme_client_enum",
  CLIENT_ORIGINS,
);

export const hsClientsTable = pgTable("clients", {
  uuid: uuid("id_pg").primaryKey().defaultRandom().$type<ClientUuid>(),
  id: varchar("id").unique().$type<ClientHsId>(),
  name: text("nom"),
  type: varchar("type"),
  website: text("site_web"),
  ownerId: text("hubspot_owner_id").$type<OwnerHsId>(),
  ownerCsmId: text("hubspot_owner_csm_id").$type<OwnerHsId>(),
  billingAddress: text("adresse_de_facturation"),
  billingZipCode: text("code_postal_de_facturation"),
  billingCity: text("ville_de_facturation"),
  siret: text("siret"),
  accountType: clientTypeEnum("type_de_compte"),
  stage: clientStageEnum("hs_pipeline_stage"),
  origin: clientOriginEnum("origine_inscription_plateforme"),
  utmTerm: text("utm_term"),
  utmMedium: text("utm_medium"),
  utmSource: text("utm_source"),
  utmContent: text("utm_content"),
  utmCampaign: text("utm_campaign"),
  phone: text("telephone"),
});

export type HubspotClient = InferSelectModel<typeof hsClientsTable>;
export type HubspotNewClient = InferInsertModel<typeof hsClientsTable>;

// ATTACHMENTS

export const AttachmentUuid = z.string().brand("AttachmentUuid");
export type AttachmentUuid = z.infer<typeof AttachmentUuid>;

export const AttachmentHsId = z.string().brand("AttachmentHsId");
export type AttachmentHsId = z.infer<typeof AttachmentHsId>;

export const hsAttachmentsTable = pgTable("hs_attachments", {
  uuid: uuid("id_pg").primaryKey().defaultRandom().$type<AttachmentUuid>(),
  id: varchar("id").unique().$type<AttachmentHsId>(),
  name: text("name"),
  url: text("url"),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
  archived: boolean("archived").default(false),
  path: text("path"),
  parentFolderId: text("parentFolderId"),
  defaultHostingUrl: text("defaultHostingUrl"),
  type: text("type"),
  size: integer("size"),
  extension: text("extension"),
});

export type HubspotAttachment = InferSelectModel<typeof hsAttachmentsTable>;
export type HubspotNewAttachment = InferInsertModel<typeof hsAttachmentsTable>;

// BATIMENTS

export const LocationUuid = z.string().brand("LocationUuid");
export type LocationUuid = z.infer<typeof LocationUuid>;

export const LocationHsId = z.string().brand("LocationHsId");
export type LocationHsId = z.infer<typeof LocationHsId>;

export const hsLocationsTable = pgTable("batiments", {
  uuid: uuid("id_pg").primaryKey().defaultRandom().$type<LocationUuid>(),
  id: varchar("id").unique().$type<LocationHsId>(),
  name: text("nom").notNull(),
  streetNumber: text("numero_de_la_rue"),
  streetName: text("nom_de_la_rue"),
  streetViewUrl: text("url_vue_rue"),
  zipcode: text("code_postal__new_"),
  department: frenchDepartmentEnum("departement"),
  city: text("ville").notNull(),
  sourceAddress: text("source_address"),
  rawBdnb: jsonb("raw_bdnb").$type<BdnbApiResponse>(),
  sector: sectorEnum("secteur"),
  nbBuildings: real("nombre_de_batiments"),
  nbUnits: real("nombre_de_lots"),
  surfaceArea: real("m2"),
  facadeArea: real("facade_area"),
  glazingArea: real("glazing_area"),
  surfaceThatRequiresHeating: real("surface_that_requires_heating"),
  nbStoreys: real("nombre_d_etages"),
  glazingSurfacePercentage: real("pourcentage_de_surface_vitree"),
  height: real("hauteur"),
  energyType: energyTypeEnum("type_d_energie"),
  heatingSystem: heatingSystemEnum("type_de_chauffage"),
  electricityConsumptionPerSquareMeter: real("consommation_electrique_par_m2"),
  greenhouseGasEmissionsPerSquareMeter: real(
    "emission_gaz_a_effet_de_serre_par_m2",
  ),
  geomGroup: jsonb("geom_groupe").$type<BdnbApiResponse["geom_groupe"]>(),
  creationDate: date("annee_de_construction"),
  nameContactOnSite: text("nom_du_contact_sur_site"),
  phoneContactOnSite: text("telephone_du_contact_sur_site"),
  heatingType: text("generateur_de_chauffage"),
  dpeLabel: text("etiquette_dpe"),
  bdnbFailure: boolean("echec_bdnb"),
  googlePlaceId: text("google_place_id"),
  longitude: real("longitude"),
  latitude: real("latitude"),
  meanHeight: real("hauteur_mean"),
  inertiaClass: text("classe_inertie"),
  hasBalcony: boolean("presence_balcon"),
  nbDwellings: real("nb_log"),
  nbDwellingsRnc: real("nb_log_rnc"),
  nbTertiaryLotsRnc: real("nb_lot_tertiaire_rnc"),
  nbResElec2020: real("nb_pdl_res_dle_elec_2020"),
  nbProElec2020: real("nb_pdl_pro_dle_elec_2020"),
  nbProGaz2020: real("nb_pdl_pro_dle_gaz_2020"),
  nbResGaz2020: real("nb_pdl_res_dle_gaz_2020"),
  dpeAssessmentClass: text("classe_bilan_dpe"),
  arrete2021: boolean("arrete_2021"),
  dpeIdentifier: text("identifiant_dpe"),
  gesEmissions5UsesPerM2: real("emission_ges_5_usages_m2"),
  gesEmissions3UsesEpM2Arrete2012: real(
    "emission_ges_3_usages_ep_m2_arrete_2012",
  ),
  ventilationType: text("type_ventilation"),
  acGeneratorType: text("type_generateur_climatisation"),
  acGeneratorAge: text("type_generateur_climatisation_anciennete"),
  exteriorWallInsulationType: text("type_isolation_mur_exterieur"),
  exteriorWallUValue: real("u_mur_exterieur"),
  lowerFloorInsulationType: text("type_isolation_plancher_bas"),
  upperFloorInsulationType: text("type_isolation_plancher_haut"),
  lowerFloorFinalUValue: real("u_plancher_bas_final_deperditif"),
  upperFloorUValue: real("u_plancher_haut_deperditif"),
  glazingType: text("type_vitrage"),
  windowMaterialType: text("type_materiaux_menuiserie"),
  gasLayerType: text("type_gaz_lame"),
  shutterType: text("type_fermeture"),
  virGlazing: boolean("vitrage_vir"),
  windowUValue: real("u_baie_vitree"),
  windowSolarFactor: real("facteur_solaire_baie_vitree"),
  proElecConsumption2020: real("conso_pro_dle_elec_2020"),
  resElecConsumption2020: real("conso_res_dle_elec_2020"),
  proGazConsumption2020: real("conso_pro_dle_gaz_2020"),
  resGazConsumption2020: real("conso_res_dle_gaz_2020"),
  networkId: text("id_reseau"),
  radonRisk: text("alea_radon"),
  clayRisk: text("alea_argiles"),
  priorityDistrict: boolean("quartier_prioritaire"),
  districtNameQpv: text("nom_quartier_qpv"),
  qpvCode: text("code_qp"),
});

export type HubspotLocation = InferSelectModel<typeof hsLocationsTable>;
export type HubspotNewLocation = InferInsertModel<typeof hsLocationsTable>;

// OPERATIONS
// In Hubspot, Operations == Deals 🇺🇸 === Transactions 🇫🇷

export const OperationUuid = z.string().brand("OperationUuid");
export type OperationUuid = z.infer<typeof OperationUuid>;

export const OperationHsId = z.string().brand("OperationHsId");
export type OperationHsId = z.infer<typeof OperationHsId>;

export const createdByEnum = pgEnum(
  "operation_creee_par",
  OPERATION_CREATED_BY,
);

export const hsOperationsTable = pgTable("deals", {
  uuid: uuid("id_pg").primaryKey().defaultRandom().$type<OperationUuid>(),
  id: varchar("id").unique().$type<OperationHsId>(),
  createdAt: date("createdate"),
  name: text("dealname"),
  prestationId: prestationEnum("prestations"),
  phase: text("dealstage"),
  costTTC: real("amount_ttc"),
  funding: real("financements"),
  estimatedCost: real("cout_estime"),
  estimatedFunding: real("financement_estime"),
  estimatedEnergyImpact: real("impact_energetique_estime"),
  annualElectricityConsumptionBefore: real("consommation_electrique_avant"),
  greenhouseGasEmissionsBefore: real("emission_gaz_a_effet_de_serre_avant"),
  type: text("type"),
  category: text("categorie_d_operation"),
  launchingDate: date("date_de_lancement"),
  plannedLaunchDate: date("date_de_lancement_previsionnelle"),
  completionDate: date("date_de_fin_prevue"),
  additionalInfo: text("commentaires_client_plateforme"),
  plannedBudget: real("budget_disponible"),
  botBrief: jsonb("bot_brief").$type<OperationBrief>(),
  ownerId: text("hubspot_owner_id").$type<OwnerHsId>(),
  ownerCsmId: text("hubspot_owner_csm_id").$type<OwnerHsId>(),
  plannedBudgetRange: text("budget_previsionnel"),
  amountBalanceToBeInvoiced: real("montant_solde_a_facturer"),
  provisionCallSdcId: text("numero_appel_de_provision_sdc"),
  provisionCallSdcSendingDate: date("date_envoi_appel_de_provision_sdc"),
  provisionCallSdcExpirationDate: date(
    "date_expiration_appel_de_provision_sdc",
  ),
  amountDownPaymentToBeInvoiced: real("montant_d_acompte_a_facturer"),
  provisionCallId: text("numero_appel_de_provision_acompte"),
  provisionCallSendingDate: date("date_envoi_appel_de_provision_acompte"),
  provisionCallExpirationDate: date(
    "date_expiration_appel_de_provision_acompte",
  ),
  closedDate: timestamp("date_de_fermeture"),
  signatoryEmail: text("signatory_email"),
  // @todo delete theses fields
  signatoryFirstnameDeprecated: text("signatory_firstname"),
  signatoryLastnameDeprecated: text("signatory_lastname"),
  signatoryPhoneDeprecated: text("signatory_phone"),
  signatoryJobtitleDeprecated: text("signatory_jobtitle"),
  createdBy: createdByEnum("operation_creee_par"),
  isFromDtg: boolean("issue_de_dtg").notNull().default(false),
});

export type HubspotOperation = InferSelectModel<typeof hsOperationsTable>;

export type HubspotNewOperation = Omit<
  InferInsertModel<typeof hsOperationsTable>,
  // Some fields are not writable on HubSpot
  "costTTC" | "funding"
>;

// DEVIS

export const QuoteUuid = z.string().brand("QuoteUuid");
export type QuoteUuid = z.infer<typeof QuoteUuid>;

export const QuoteHsId = z.string().brand("QuoteHsId");
export type QuoteHsId = z.infer<typeof QuoteHsId>;

export const hsQuotesTable = pgTable(
  "devis",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom().$type<QuoteUuid>(),
    id: varchar("id").unique().$type<QuoteHsId>(),
    name: text("nom"),
    stage: quoteStageEnum("hs_pipeline_stage"),
    validityEndDate: date("date_fin_de_validite_du_devis"),
    preTaxAmount: real("montant"),
    postTaxAmount: real("montant_offre"),
    vatRate: real("taux_de_tva"),
    signRequestYousignId: varchar(
      "requete_signature_yousign_id",
    ).$type<YouSignRequestId>(),
    signerYousignId: varchar("signataire_yousign_id").$type<YouSignSignerId>(),
    rejectReason: text("raison_de_refus"),
    fundingAmount: real("montant_financement"),
    signatureLocation: jsonb("signature_location").$type<YouSignLocation>(),
  },
  (table) => {
    return {
      signRequestYousignIdUnique: unique("uq_devis_sign_request_yousign_id").on(
        table.signRequestYousignId,
      ),
    };
  },
);

export type HubspotQuote = InferSelectModel<typeof hsQuotesTable>;

export type HubspotNewQuote = Omit<
  InferInsertModel<typeof hsQuotesTable>,
  // Some fields are not writable on HubSpot
  "montant_offre"
>;

// INVOICES
export const InvoiceUuid = z.string().brand("InvoiceUuid");
export type InvoiceUuid = z.infer<typeof InvoiceUuid>;

export const InvoiceHsId = z.string().brand("InvoiceHsId");
export type InvoiceHsId = z.infer<typeof InvoiceHsId>;

export const invoiceStageEnum = pgEnum(
  "hs_invoice_pipeline_stage_enum",
  INVOICE_STAGES,
);

export const hsInvoicesTable = pgTable("factures", {
  uuid: uuid("id_pg").primaryKey().defaultRandom().$type<InvoiceUuid>(),
  id: varchar("id").unique().$type<InvoiceHsId>(),
  name: text("nom"),
  stage: invoiceStageEnum("stage"),
});

// PROS

export const ProUuid = z.string().brand("ProUuid");
export type ProUuid = z.infer<typeof ProUuid>;

export const ProHsId = z.string().brand("ProHsId");
export type ProHsId = z.infer<typeof ProHsId>;

export const proStatusEnum = pgEnum("pro_status_enum", PRO_STATUSES);
export const proSubscriptionEnum = pgEnum(
  "pro_subscription_enum",
  PRO_SUBSCRIPTIONS,
);

export const hsProsTable = pgTable(
  "pros",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom().$type<ProUuid>(),
    id: varchar("id").unique().$type<ProHsId>(),
    name: text("nom"),
    status: proStatusEnum("status"),
    testAccount: boolean("compte_de_test").notNull().default(false),
    siren: text("siren"),
    siret: text("siret"),
    street: text("adresse_de_facturation"),
    zipcode: text("code_postal_de_facturation"),
    city: text("ville_de_facturation"),
    mailContactDeprecated: text("mail_du_contact_principal"),
    description: text("description"),
    interventionZonesDeprecated: text("zones_intervention"),
    websiteDeprecated: text("site_internet"),
    mailContact: text("email_entreprise"),
    interventionZones: text("departements_d_intervention"),
    interventionSectors: text("domaines_d_intervention"),
    website: text("site_web"),
    prestations: text("offres"),
    phoneContact: text("telephone"),
    eligibilityCee: boolean("eligibilite_cee"),
    partnershipContractId: text(
      "contrat_partenariat_id",
    ).$type<YouSignRequestId>(),
    partnershipContractDocumentId: text(
      "contrat_partenariat_document_id",
    ).$type<YouSignDocumentId>(),
    partnershipContractSignedAt: date("date_signature_contrat_partenariat"),
    ceeContractId: text("contrat_cee_id").$type<YouSignRequestId>(),
    ceeContractDocumentId: text(
      "contrat_cee_document_id",
    ).$type<YouSignDocumentId>(),
    ceeContractSignedAt: date("date_signature_contrat_cee"),
    signerId: text("signataire_id").$type<YouSignSignerId>(),
    capital: real("capital_de_l_entreprise"),
    rcsLocation: text("lieu_d_immatriculation_rcs"),
    negotiatedMargin: real("marge_negociee"),
    negotiatedCeeRate: real("taux_cee_negociee"),
    subscription: proSubscriptionEnum("abonnement_souscrit"),
    remainingCredits: real("credits_abonnement_restants"),
    calendarSite: text("site_de_calendrier"),
    statusInterne: text("status_interne")
      .$type<AssociationProExternalContactStatus>()
      .notNull()
      .default(AssociationProExternalContactStatus.NEW),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripeSubscriptionStatus: text("stripe_subscription_status"),
    stripeCurrentPlanPriceId: text("stripe_current_plan_price_id"),
  },
  (table) => {
    return {
      partnershipRequestYousignIdUnique: unique(
        "uq_pro_partnership_request_yousign_id",
      ).on(table.partnershipContractId),
      ceeRequestYousignIdUnique: unique("uq_pro_cee_request_yousign_id").on(
        table.ceeContractId,
      ),
      stripeCustomerIdIndex: index("idx_pro_stripe_customer_id").on(
        table.stripeCustomerId,
      ),
    };
  },
);

export type HubspotPro = InferSelectModel<typeof hsProsTable>;
export type HubspotNewPro = InferInsertModel<typeof hsProsTable>;

// NOTES

export const NoteUuid = z.string().brand("NoteUuid");
export type NoteUuid = z.infer<typeof NoteUuid>;

export const NoteHsId = z.string().brand("NoteHsId");
export type NoteHsId = z.infer<typeof NoteHsId>;

export const hsNotesTable = pgTable("notes", {
  uuid: uuid("id_pg").primaryKey().defaultRandom().$type<NoteUuid>(),
  id: varchar("id").unique().$type<NoteHsId>(),
  createdByUserId: varchar("hs_created_by_user_id"),
  attachmentIds: varchar("hs_attachment_ids"),
  objectSource: varchar("hs_object_source"),
  createdAt: timestamp("hs_createdate"),
});

export type HubspotNote = InferSelectModel<typeof hsNotesTable>;
export type HubspotNewNote = InferInsertModel<typeof hsNotesTable>;

// SIMULATED LOCATIONS

export const SimulatedLocationUuid = z.string().brand("SimulatedLocationUuid");
export type SimulatedLocationUuid = z.infer<typeof SimulatedLocationUuid>;

export const simulatedLocationTable = pgTable("simulated_locations", {
  uuid: uuid("id_pg")
    .primaryKey()
    .defaultRandom()
    .$type<SimulatedLocationUuid>(),
  streetNumber: text("street_number"),
  streetName: text("street_name"),
  streetViewUrl: text("street_view_url"),
  zipcode: text("zipcode"),
  city: text("city"),
  rawBdnb: jsonb("raw_bdnb").$type<BdnbApiResponse>(),
  sector: sectorEnum("sector"),
  nbBuildings: real("building_count"),
  nbUnits: real("units_count"),
  surfaceArea: real("m2"),
  nbStoreys: real("storeys_count"),
  glazingSurfacePercentage: real("glazing_surface_percentage"),
  height: real("height"),
  energyType: energyTypeEnum("energy_type"),
  heatingSystem: heatingSystemEnum("heating_system"),
  electricityConsumptionPerSquareMeter: real("electricity_consumption_per_m2"),
  greenhouseGasEmissionsPerSquareMeter: real("greenhouse_gas_emissions_per_m2"),
  geomGroup: jsonb("geom_group").$type<BdnbApiResponse["geom_groupe"]>(),
  creationDate: date("creation_date"),
  heatingType: text("heating_type"),
  dpeLabel: text("dpe_label"),
  accountName: text("account_name"),
  buildingName: text("building_name"),
  operationSimulatedBy: text("operation_simulated_by"),
  mostProfitableOperation: text("most_profitable_operation"),
});

export type SimulatedLocation = InferSelectModel<typeof simulatedLocationTable>;
export type NewSimulatedLocation = InferInsertModel<
  typeof simulatedLocationTable
>;

// FINANCIERS

export const FinancierUuid = z.string().brand("FinancierUuid");
export type FinancierUuid = z.infer<typeof FinancierUuid>;

export const FinancierHsId = z.string().brand("FinancierHsId");
export type FinancierHsId = z.infer<typeof FinancierHsId>;

export const hsFinancierTable = pgTable("financeurs", {
  uuid: uuid("id_pg").primaryKey().defaultRandom().$type<FinancierUuid>(),
  id: varchar("id").unique().$type<FinancierHsId>(),
  name: text("nom"),
  siret: text("siret"),
});

export type HubspotFinancier = InferSelectModel<typeof hsFinancierTable>;
export type HubspotNewFinancier = InferInsertModel<typeof hsFinancierTable>;

// ASSOCIATIONS

export const ContactLocationUuid = z.string().brand("ContactLocationUuid");
export type ContactLocationUuid = z.infer<typeof ContactLocationUuid>;

export const hsAssociationsContactsLocationsTable = pgTable(
  "associations_contact_batiments",
  {
    uuid: uuid("id_pg")
      .primaryKey()
      .defaultRandom()
      .$type<ContactLocationUuid>(),
    locationId: varchar("batiments_id").$type<LocationHsId>(),
    contactId: varchar("contact_id").$type<ContactHsId>(),
    locationUuid: uuid("batiments_id_pg")
      .$type<LocationUuid>()
      .references(() => hsLocationsTable.uuid, {
        onDelete: "cascade",
      }),
    contactUuid: uuid("contact_id_pg")
      .$type<ContactUuid>()
      .references(() => hsContactsTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel:
      varchar("association_label").$type<ContactLocationLabel>(),
  },
);

export type HubspotAssociationContactLocation = InferSelectModel<
  typeof hsAssociationsContactsLocationsTable
>;

export const hsAssociationsLocationsClientsTable = pgTable(
  "associations_batiments_clients",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    locationId: varchar("batiments_id").$type<LocationHsId>(),
    clientId: varchar("clients_id").$type<ClientHsId>(),
    locationUuid: uuid("batiments_id_pg")
      .$type<LocationUuid>()
      .references(() => hsLocationsTable.uuid, {
        onDelete: "cascade",
      }),
    clientUuid: uuid("clients_id_pg")
      .$type<ClientUuid>()
      .references(() => hsClientsTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export type HubspotAssociationLocationClient = InferSelectModel<
  typeof hsAssociationsLocationsClientsTable
>;

export const ContactClientUuid = z.string().brand("ContactClientUuid");
export type ContactClientUuid = z.infer<typeof ContactClientUuid>;

export const hsAssociationsContactsClientsTable = pgTable(
  "associations_contact_clients",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom().$type<ContactClientUuid>(),
    contactId: varchar("contact_id").$type<ContactHsId>(),
    clientId: varchar("clients_id").$type<ClientHsId>(),
    contactUuid: uuid("contact_id_pg")
      .$type<ContactUuid>()
      .references(() => hsContactsTable.uuid, {
        onDelete: "cascade",
      }),
    clientUuid: uuid("clients_id_pg")
      .$type<ClientUuid>()
      .references(() => hsClientsTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label").$type<ContactClientLabel>(),
  },
);

export type HubspotAssociationContactClient = InferSelectModel<
  typeof hsAssociationsContactsClientsTable
>;

export const hsAssociationsContactsProsTable = pgTable(
  "associations_contact_pro",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    contactId: varchar("contact_id").$type<ContactHsId>(),
    proId: varchar("pro_id").$type<ProHsId>(),
    contactUuid: uuid("contact_id_pg")
      .$type<ContactUuid>()
      .references(() => hsContactsTable.uuid, {
        onDelete: "cascade",
      }),
    proUuid: uuid("pros_id_pg")
      .$type<ProUuid>()
      .references(() => hsProsTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export const hsAssociationsOperationsQuotesTable = pgTable(
  "associations_deal_devis",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    operationId: varchar("deal_id").$type<OperationHsId>(),
    quoteId: varchar("devis_id").$type<QuoteHsId>(),
    operationUuid: uuid("deal_id_pg")
      .$type<OperationUuid>()
      .references(() => hsOperationsTable.uuid, {
        onDelete: "cascade",
      }),
    quoteUuid: uuid("devis_id_pg")
      .$type<QuoteUuid>()
      .references(() => hsQuotesTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export const hsAssociationsOperationsClientsTable = pgTable(
  "associations_deal_client",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    operationId: varchar("deal_id").$type<OperationHsId>(),
    clientId: varchar("client_id").$type<ClientHsId>(),
    operationUuid: uuid("deal_id_pg")
      .$type<OperationUuid>()
      .references(() => hsOperationsTable.uuid, {
        onDelete: "cascade",
      }),
    clientUuid: uuid("client_id_pg")
      .$type<ClientUuid>()
      .references(() => hsClientsTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export const hsAssociationsContactsOperationsTable = pgTable(
  "associations_contact_deal",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    operationId: varchar("deal_id").$type<OperationHsId>(),
    contactId: varchar("contact_id").$type<ContactHsId>(),
    operationUuid: uuid("deal_id_pg")
      .$type<OperationUuid>()
      .references(() => hsOperationsTable.uuid, {
        onDelete: "cascade",
      }),
    contactUuid: uuid("contact_id_pg")
      .$type<ContactUuid>()
      .references(() => hsContactsTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export const hsAssociationsOperationsLocationsTable = pgTable(
  "associations_deal_batiments",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    operationId: varchar("deal_id").$type<OperationHsId>(),
    locationId: varchar("batiments_id").$type<LocationHsId>(),
    operationUuid: uuid("deal_id_pg")
      .$type<OperationUuid>()
      .references(() => hsOperationsTable.uuid, {
        onDelete: "cascade",
      }),
    locationUuid: uuid("batiments_id_pg")
      .$type<LocationUuid>()
      .references(() => hsLocationsTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export const hsAssociationsQuotesNotesTable = pgTable(
  "associations_devis_notes",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    quoteId: varchar("devis_id").$type<QuoteHsId>(),
    noteId: varchar("notes_id").$type<NoteHsId>(),
    quoteUuid: uuid("devis_id_pg")
      .$type<QuoteUuid>()
      .references(() => hsQuotesTable.uuid, {
        onDelete: "cascade",
      }),
    noteUuid: uuid("notes_id_pg")
      .$type<NoteUuid>()
      .references(() => hsNotesTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export const hsAssociationsQuotesProsTable = pgTable(
  "associations_devis_pros",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    quoteId: varchar("devis_id").$type<QuoteHsId>(),
    proId: varchar("pro_id").$type<ProHsId>(),
    quoteUuid: uuid("devis_id_pg")
      .$type<QuoteUuid>()
      .references(() => hsQuotesTable.uuid, {
        onDelete: "cascade",
      }),
    proUuid: uuid("pro_id_pg")
      .$type<ProUuid>()
      .references(() => hsProsTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export const hsAssociationsOperationsProsTable = pgTable(
  "associations_deal_pros",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    operationId: varchar("deal_id").$type<OperationHsId>(),
    proId: varchar("pro_id").$type<ProHsId>(),
    operationUuid: uuid("deal_id_pg")
      .$type<OperationUuid>()
      .references(() => hsOperationsTable.uuid, {
        onDelete: "cascade",
      }),
    proUuid: uuid("pro_id_pg")
      .$type<ProUuid>()
      .references(() => hsProsTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export const hsAssociationOperationsNotesTable = pgTable(
  "associations_notes_deal",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    operationId: varchar("deal_id").$type<OperationHsId>(),
    noteId: varchar("notes_id").$type<NoteHsId>(),
    operationUuid: uuid("deal_id_pg")
      .$type<OperationUuid>()
      .references(() => hsOperationsTable.uuid, {
        onDelete: "cascade",
      }),
    noteUuid: uuid("notes_id_pg")
      .$type<NoteUuid>()
      .references(() => hsNotesTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export const hsAssociationLocationsNotesTable = pgTable(
  "associations_batiments_notes",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    locationId: varchar("batiments_id").$type<LocationHsId>(),
    noteId: varchar("notes_id").$type<NoteHsId>(),
    locationUuid: uuid("batiments_id_pg")
      .$type<LocationUuid>()
      .references(() => hsLocationsTable.uuid, {
        onDelete: "cascade",
      }),
    noteUuid: uuid("notes_id_pg")
      .$type<NoteUuid>()
      .references(() => hsNotesTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export const hsAssociationOperationsFinanciersTable = pgTable(
  "associations_deal_financeurs",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    operationId: varchar("deal_id").$type<OperationHsId>(),
    operationUuid: uuid("deal_id_pg")
      .$type<OperationUuid>()
      .references(() => hsOperationsTable.uuid, {
        onDelete: "cascade",
      }),
    financierId: varchar("financeur_id").$type<FinancierHsId>(),
    financierUuid: uuid("financeur_id_pg")
      .$type<FinancierUuid>()
      .references(() => hsFinancierTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export const hsAssociationProsNotesTable = pgTable("associations_notes_pro", {
  uuid: uuid("id_pg").primaryKey().defaultRandom(),
  proId: varchar("pro_id").$type<ProHsId>(),
  proUuid: uuid("pro_id_pg")
    .$type<ProUuid>()
    .references(() => hsProsTable.uuid, {
      onDelete: "cascade",
    }),
  noteId: varchar("notes_id").$type<NoteHsId>(),
  noteUuid: uuid("notes_id_pg")
    .$type<NoteUuid>()
    .references(() => hsNotesTable.uuid, {
      onDelete: "cascade",
    }),
  associationTypeId: integer("association_type_id").notNull(),
  associationLabel: varchar("association_label"),
});

export const hsAssociationProsLocationsTable = pgTable(
  "associations_batiments_pro",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    proId: varchar("pro_id").$type<ProHsId>(),
    locationId: varchar("batiments_id").$type<LocationHsId>(),
    proUuid: uuid("pro_id_pg")
      .$type<ProUuid>()
      .references(() => hsProsTable.uuid, {
        onDelete: "cascade",
      }),
    locationUuid: uuid("batiments_id_pg")
      .$type<LocationUuid>()
      .references(() => hsLocationsTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel:
      varchar("association_label").$type<ProLocationAssociationLabel>(),
  },
  (table) => {
    return {
      idxProLocation: index("idx_asso_batiments_pro_batiment").on(
        table.proUuid,
        table.locationUuid,
      ),
      idxProLabelLocation: index("idx_asso_batiments_pro_label_batiment").on(
        table.proUuid,
        table.associationLabel,
        table.locationUuid,
      ),
    };
  },
);

export const associationProsExternalLocationsTable = pgTable(
  "associations_batiments_externes_pro",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    proId: varchar("pro_id").$type<ProHsId>(),
    locationId: varchar("batiments_id").$type<LocationBdnbHsId>(),
    proUuid: uuid("pro_id_pg")
      .$type<ProUuid>()
      .references(() => hsProsTable.uuid, {
        onDelete: "cascade",
      }),
    locationUuid: uuid("batiments_id_pg")
      .$type<LocationBdnbUuid>()
      .references(() => locationsBdnbTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel:
      varchar("association_label").$type<ProLocationAssociationLabel>(),
  },
  (table) => {
    return {
      idxProLocation: index("idx_asso_bat_ext_pro_pro_location").on(
        table.proUuid,
        table.locationUuid,
      ),
      idxProLabelLocation: index("idx_asso_bat_ext_pro_pro_label_location").on(
        table.proUuid,
        table.associationLabel,
        table.locationUuid,
      ),
    };
  },
);
export type AssociationProExternalLocation = InferSelectModel<
  typeof associationProsExternalLocationsTable
>;

export const hsAssociationProsSavedLocationsTable = pgTable(
  "associations_batiments_favoris_pro",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    proUuid: uuid("pro_id_pg")
      .$type<ProUuid>()
      .references(() => hsProsTable.uuid, {
        onDelete: "cascade",
      }),
    locationUuid: uuid("batiments_id_pg")
      .$type<LocationUuid>()
      .references(() => hsLocationsTable.uuid, {
        onDelete: "cascade",
      }),
  },
);

export type HubspotAssociationProLocation = InferSelectModel<
  typeof hsAssociationProsLocationsTable
>;

export const hsAssociationProsClientsTable = pgTable(
  "associations_clients_pro",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    proId: varchar("pro_id").$type<ProHsId>(),
    proUuid: uuid("pro_id_pg")
      .$type<ProUuid>()
      .references(() => hsProsTable.uuid, {
        onDelete: "cascade",
      }),
    clientId: varchar("client_id").$type<ClientHsId>(),
    clientUuid: uuid("client_id_pg")
      .$type<ClientUuid>()
      .references(() => hsClientsTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export type HubspotAssociationProClient = InferSelectModel<
  typeof hsAssociationProsClientsTable
>;

export const hsAssociationOperationsInvoicesTable = pgTable(
  "associations_deal_factures",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    operationId: varchar("deal_id").$type<OperationHsId>(),
    factureId: varchar("facture_id").$type<InvoiceHsId>(),
    operationUuid: uuid("deal_id_pg")
      .$type<OperationUuid>()
      .references(() => hsOperationsTable.uuid, {
        onDelete: "cascade",
      }),
    factureUuid: uuid("facture_id_pg")
      .$type<InvoiceUuid>()
      .references(() => hsInvoicesTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export const hsAssociationsQuotesClientsTable = pgTable(
  "associations_devis_clients",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    quoteId: varchar("devis_id").$type<QuoteHsId>(),
    clientId: varchar("client_id").$type<ClientHsId>(),
    quoteUuid: uuid("devis_id_pg")
      .$type<QuoteUuid>()
      .references(() => hsQuotesTable.uuid, {
        onDelete: "cascade",
      }),
    clientUuid: uuid("client_id_pg")
      .$type<ClientUuid>()
      .references(() => hsClientsTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

export const hsAssociationsQuotesLocationsTable = pgTable(
  "associations_devis_batiments",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    quoteId: varchar("devis_id").$type<QuoteHsId>(),
    locationId: varchar("batiments_id").$type<LocationHsId>(),
    quoteUuid: uuid("devis_id_pg")
      .$type<QuoteUuid>()
      .references(() => hsQuotesTable.uuid, {
        onDelete: "cascade",
      }),
    locationUuid: uuid("batiments_id_pg")
      .$type<LocationUuid>()
      .references(() => hsLocationsTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
);

// Bdnb raw

export const snapshotPublicLocationsBdnbTable = pgTable(
  "snapshot_public_location_bdnb_raw",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom().$type<LocationBdnbUuid>(),
    index: integer("index"),
    locationGroupId: text("batiment_groupe_id"),
    immatriculationNumber: text("numero_immat_principal"),
    maxConstructionPeriod: text("periode_construction_max"),
    constructionYearStr: text("l_annee_construction"),
    numberOfGarparkLots: real("nb_lot_garpark"),
    totalNumberOfLots: real("nb_lot_tot"),
    nbDwellings: real("nb_log"),
    nbTertiaryLotsRnc: real("nb_lot_tertiaire"),
    name: text("l_nom_copro"),
    LSiret: text("l_siret"),
    inPvdProgram: real("copro_dans_pvd"),
    personId: text("personne_id"),
    numberOfOpenGroupPremises: real("nb_locaux_open_groupe"),
    siren: text("siren"),
    legalForm: text("forme_juridique"),
    denomination: text("denomination"),
    zipcode: text("code_postal"),
    city: text("libelle_commune"),
    numberOfTotalOpenPremises: real("nb_locaux_open_total"),
    sector: text("usage_principal_bdnb_open"),
    longitude: real("x"),
    latitude: real("y"),
    nbBuildings: real("nb_bat_grp"),
    numberOfGroupBuildingsOutsideDept: real("nb_bat_grp_hors_dep"),
    nbStoreys: real("nb_niveau"),
    creationDate: text("annee_construction"),
    usageLevel1Text: text("usage_niveau_1_txt"),
    wallMaterial: text("mat_mur_txt"),
    roofMaterial: text("mat_toit_txt"),
    nbDwellingsFfoBat: real("nb_log_batiment_groupe_ffo_bat"),
    year: text("millesime"),
    nbResGaz2020: real("nb_pdl_res"),
    nbProGaz2020: real("nb_pdl_pro"),
    totalPdlCount: real("nb_pdl_tot"),
    resGazConsumption2020: real("conso_res"),
    proGazConsumption2020: real("conso_pro"),
    totalConsumption: real("conso_tot"),
    nbUnits: real("nb_log"),
    rplsOpen: real("rpls_open"),
    nbEnergyClassA: real("nb_classe_ener_a"),
    nbEnergyClassB: real("nb_classe_ener_b"),
    nbEnergyClassC: real("nb_classe_ener_c"),
    nbEnergyClassD: real("nb_classe_ener_d"),
    nbEnergyClassE: real("nb_classe_ener_e"),
    nbEnergyClassF: real("nb_classe_ener_f"),
    nbEnergyClassG: real("nb_classe_ener_g"),
    nbEnergyClassNc: real("nb_classe_ener_nc"),
    mainEnergyClass: text("classe_ener_principale"),
    nbGesClassA: real("nb_classe_ges_a"),
    nbGesClassB: real("nb_classe_ges_b"),
    nbGesClassC: real("nb_classe_ges_c"),
    nbGesClassD: real("nb_classe_ges_d"),
    nbGesClassE: real("nb_classe_ges_e"),
    nbGesClassF: real("nb_classe_ges_f"),
    nbGesClassG: real("nb_classe_ges_g"),
    nbGesClassNc: real("nb_classe_ges_nc"),
    mainGesClass: text("classe_ges_principale"),
    pmrAccessible: real("accessible_pmr"),
    isInQpv: real("dans_qpv"),
    constructionYearRpls: text("l_annee_construction_batiment_groupe_rpls"),
    nbDwellingsRpls: real("nb_log_batiment_groupe_rpls"),
    habitableSurface: real("s_log_hab"),
    constructionType: text("type_construction"),
    equipmentType: text("l_type_equipement"),
    irisCode: text("code_iris"),
    inseeCommuneCode: text("code_commune_insee"),
    inseeEpciCode: text("code_epci_insee"),
    containsFictiveGeometry: real("contient_fictive_geom_groupe"),
    natureLabel: text("l_nature"),
    detailedNatureLabel: text("l_nature_detaillee"),
    toponymLabel: text("l_toponyme"),
    groupBuildingDleYear: text(
      "millesime_batiment_groupe_dle_reseaux_multimillesime",
    ),
    residentialPdlCount: real(
      "nb_pdl_res_batiment_groupe_dle_reseaux_multimillesime",
    ),
    professionalPdlCount: real(
      "nb_pdl_pro_batiment_groupe_dle_reseaux_multimillesime",
    ),
    totalPdlCountDle: real(
      "nb_pdl_tot_batiment_groupe_dle_reseaux_multimillesime",
    ),
    residentialConsumption: real(
      "conso_res_batiment_groupe_dle_reseaux_multimillesime",
    ),
    professionalConsumption: real(
      "conso_pro_batiment_groupe_dle_reseaux_multimillesime",
    ),
    totalConsumptionMulti: real(
      "conso_tot_batiment_groupe_dle_reseaux_multimillesime",
    ),
    surfaceArea: real("s_geom_groupe"),
    networkId: text("identifiant_reseau"),
    networkType: text("type_reseau"),
    dpeIdentifier: text("identifiant_dpe"),
    arrete2021: real("arrete_2021"),
    dpeType: text("type_dpe"),
    buildingTypeDpe: text("type_batiment_dpe"),
    constructionPeriodDpe: text("periode_construction_dpe"),
    constructionYearDpe: text("annee_construction_dpe"),
    dpeVersion: text("version"),
    dpeEstablishedDate: text("date_etablissement_dpe"),
    dpeReceivedDate: text("date_reception_dpe"),
    nbDwellingLevels: real("nombre_niveau_logement"),
    nbBuildingLevels: real("nombre_niveau_immeuble"),
    habitableSurfaceBuilding: real("surface_habitable_immeuble"),
    habitableSurfaceDwelling: real("surface_habitable_logement"),
    electricityConsumptionPerSquareMeter: real("conso_5_usages_ep_m2"),
    consumption5Usages: real("conso_5_usages_ef_m2"),
    gesEmissions5UsesPerM2: real("emission_ges_5_usages_m2"),
    dpeLabel: text("classe_bilan_dpe"),
    gesEmissionClass: text("classe_emission_ges"),
    energyClass2012: text("classe_conso_energie_arrete_2012"),
    gesClass2012: text("classe_emission_ges_arrete_2012"),
    consumption3Usages2012: real("conso_3_usages_ep_m2_arrete_2012"),
    gesEmissions3UsesEpM2Arrete2012: real(
      "emission_ges_3_usages_ep_m2_arrete_2012",
    ),
    heatingSystem: text("type_installation_chauffage"),
    energyType: text("type_energie_chauffage"),
    heatingType: text("type_generateur_chauffage"),
    heatingGeneratorAge: text("type_generateur_chauffage_anciennete"),
    heatingBackupEnergyType: text("type_energie_chauffage_appoint"),
    heatingBackupGeneratorType: text("type_generateur_chauffage_appoint"),
    heatingBackupGeneratorAge: text(
      "type_generateur_chauffage_anciennete_appoint",
    ),
    greenhouseGasEmissionsPerSquareMeter: real("emission_ges_5_usages_m2"),
    solarHeating: real("chauffage_solaire"),
    nbHeatingGenerators: real("nb_generateur_chauffage"),
    nbHeatingInstallations: real("nb_installation_chauffage"),
    acEnergyType: text("type_energie_climatisation"),
    acGeneratorType: text("type_generateur_climatisation"),
    acGeneratorAge: text("type_generateur_climatisation_anciennete"),
    ecsInstallationType: text("type_installation_ecs"),
    ecsEnergyType: text("type_energie_ecs"),
    ecsGeneratorType: text("type_generateur_ecs"),
    ecsGeneratorAge: text("type_generateur_ecs_anciennete"),
    ecsBackupEnergyType: text("type_energie_ecs_appoint"),
    ecsBackupGeneratorType: text("type_generateur_ecs_appoint"),
    ecsBackupGeneratorAge: text("type_generateur_ecs_anciennete_appoint"),
    solarEcs: real("ecs_solaire"),
    nbEcsGenerators: real("nb_generateur_ecs"),
    nbEcsInstallations: real("nb_installation_ecs"),
    multipleExposedFacades: real("plusieurs_facade_exposee"),
    ventilationType: text("type_ventilation"),
    renewableEnergyProductionType: text("type_production_energie_renouvelable"),
    glazingType: text("type_vitrage"),
    windowMaterialType: text("type_materiaux_menuiserie"),
    gasLayerType: text("type_gaz_lame"),
    shutterType: text("type_fermeture"),
    lameThickness: real("epaisseur_lame"),
    dpeAssessmentClass: text("classe_bilan_dpe"),
    virGlazing: real("vitrage_vir"),
    northGlazedSurface: real("surface_vitree_nord"),
    southGlazedSurface: real("surface_vitree_sud"),
    westGlazedSurface: real("surface_vitree_ouest"),
    eastGlazedSurface: real("surface_vitree_est"),
    glazedSurfaceHorizontal: real("surface_vitree_horizontal"),
    crossVentilated: text("traversant"),
    windowUValue: real("u_baie_vitree"),
    uwValue: real("uw"),
    windowSolarFactor: real("facteur_solaire_baie_vitree"),
    hasBalcony: real("presence_balcon"),
    windowOrientationLabel: text("l_orientation_baie_vitree"),
    glazingSurfacePercentage: real("pourcentage_surface_baie_vitree_exterieur"),
    exteriorWallInsulationType: text("type_isolation_mur_exterieur"),
    externalWallInsulationThickness: real(
      "epaisseur_isolation_mur_exterieur_estim",
    ),
    externalWallStructureMaterial: text("materiaux_structure_mur_exterieur"),
    externalWallStructureThickness: text("epaisseur_structure_mur_exterieur"),
    totalWallSurface: real("surface_mur_totale"),
    externalWallSurface: real("surface_mur_exterieur"),
    wallSurfaceDeperditive: real("surface_mur_deperditif"),
    exteriorWallUValue: real("u_mur_exterieur"),
    unheatedWallLabel: text("l_local_non_chauffe_mur"),
    unheatedWallMain: text("local_non_chauffe_principal_mur"),
    wallOrientationLabel: text("l_orientation_mur_exterieur"),
    lowerFloorInsulationType: text("type_isolation_plancher_bas"),
    floorDeperditiveType: text("type_plancher_bas_deperditif"),
    totalLowerFloorSurface: real("surface_plancher_bas_totale"),
    floorSurfaceDeperditive: real("surface_plancher_bas_deperditif"),
    lowerFloorFinalUValue: real("u_plancher_bas_final_deperditif"),
    floorUValueRaw: real("u_plancher_bas_brut_deperditif"),
    unheatedFloorLabel: text("l_local_non_chauffe_plancher_bas"),
    unheatedFloorMain: text("local_non_chauffe_principal_plancher_bas"),
    adjacencyMainFloorType: text("type_adjacence_principal_plancher_bas"),
    upperFloorInsulationType: text("type_isolation_plancher_haut"),
    upperFloorDeperditiveType: text("type_plancher_haut_deperditif"),
    upperFloorSurfaceTotal: real("surface_plancher_haut_totale"),
    upperFloorSurfaceDeperditive: real("surface_plancher_haut_deperditif"),
    upperFloorUValue: real("u_plancher_haut_deperditif"),
    unheatedFloorLabelTop: text("l_local_non_chauffe_plancher_haut"),
    unheatedFloorMainTop: text("local_non_chauffe_principal_plancher_haut"),
    adjacencyMainFloorTop: text("type_adjacence_principal_plancher_haut"),
    doorType: text("type_porte"),
    doorSurface: real("surface_porte"),
    doorUValue: real("u_porte"),
    inertiaClass: text("classe_inertie"),
    lossWall: real("deperdition_mur"),
    thermalLossWindow: real("deperdition_baie_vitree"),
    thermalLossLowerFloor: real("deperdition_plancher_bas"),
    thermalLossUpperFloor: real("deperdition_plancher_haut"),
    lossThermalBridge: real("deperdition_pont_thermique"),
    thermalLossDoor: real("deperdition_porte"),
    groupBuildingDleElecYear: text(
      "millesime_batiment_groupe_dle_elec_multimillesime",
    ),
    nbResElec2020: real("nb_pdl_res_batiment_groupe_dle_elec_multimillesime"),
    nbProElec2020: real("nb_pdl_pro_batiment_groupe_dle_elec_multimillesime"),
    nbPdlsTotalElecMulti: real(
      "nb_pdl_tot_batiment_groupe_dle_elec_multimillesime",
    ),
    resElecConsumption2020: real(
      "conso_res_batiment_groupe_dle_elec_multimillesime",
    ),
    proElecConsumption2020: real(
      "conso_pro_batiment_groupe_dle_elec_multimillesime",
    ),
    totalConsumptionElecMulti: real(
      "conso_tot_batiment_groupe_dle_elec_multimillesime",
    ),
    clayRisk: text("alea_argiles"),
    nbDpeClassA: real("nb_classe_bilan_dpe_a"),
    nbDpeClassB: real("nb_classe_bilan_dpe_b"),
    nbDpeClassC: real("nb_classe_bilan_dpe_c"),
    nbDpeClassD: real("nb_classe_bilan_dpe_d"),
    nbDpeClassE: real("nb_classe_bilan_dpe_e"),
    nbDpeClassF: real("nb_classe_bilan_dpe_f"),
    nbDpeClassG: real("nb_classe_bilan_dpe_g"),
    nbEnergyClass2012A: real("nb_classe_conso_energie_arrete_2012_a"),
    nbEnergyClass2012B: real("nb_classe_conso_energie_arrete_2012_b"),
    nbEnergyClass2012C: real("nb_classe_conso_energie_arrete_2012_c"),
    nbEnergyClass2012D: real("nb_classe_conso_energie_arrete_2012_d"),
    nbEnergyClass2012E: real("nb_classe_conso_energie_arrete_2012_e"),
    nbEnergyClass2012F: real("nb_classe_conso_energie_arrete_2012_f"),
    nbEnergyClass2012G: real("nb_classe_conso_energie_arrete_2012_g"),
    nbEnergyClass2012Nc: real("nb_classe_conso_energie_arrete_2012_nc"),
    mainAddressInteropKey: text("cle_interop_adr_principale_ban"),
    sourceAddress: text("libelle_adr_principale_ban"),
    nbValidAddressesBan: real("nb_adresse_valid_ban"),
    addressReliabilityLevel1: text("fiabilite_cr_adr_niv_1"),
    addressReliabilityLevel2: text("fiabilite_cr_adr_niv_2"),
    districtNameQpv: text("nom_quartier"),
    networkTypeId: text("id_reseau"),
    bdnbNetworkId: text("id_reseau_bdnb"),
    networkUnderConstruction: real("reseau_en_construction"),
    distanceToNetworkIndicator: text("indicateur_distance_au_reseau"),
    buildingNatureLabelBdtopo: text("l_nature_batiment_groupe_bdtopo_zoac"),
    detailedNatureLabelBdtopo: text(
      "l_nature_detaillee_batiment_groupe_bdtopo_zoac",
    ),
    toponymLabelBdtopo: text("l_toponyme_batiment_groupe_bdtopo_zoac"),
    soilFootprintReliability: text("fiabilite_emprise_sol"),
    heightReliability: text("fiabilite_hauteur"),
    addressReliability: real("fiabilite_adresse"),
    geospXSuccess: real("croisement_geospx_reussi"),
    radonRisk: text("alea_radon"),
    bdtopoBuildingNature: text("l_nature_batiment_groupe_bdtopo_bat"),
    usage1Label: text("l_usage_1"),
    usage2Label: text("l_usage_2"),
    statusLabel: text("l_etat"),
    meanHeight: real("hauteur_mean"),
    maxHeight: real("max_hauteur"),
    averageGroundAltitude: real("altitude_sol_mean"),
    legalUnitWorkforceRange: text("trancheEffectifsUniteLegale"),
    unitWorkforceYear: text("anneeEffectifsUniteLegale"),
    companyCategory: text("categorieEntreprise"),
    companyCategoryYear: text("anneeCategorieEntreprise"),
    legalEntityStatus: text("etatAdministratifUniteLegale"),
    legalEntityName: text("denominationUniteLegale"),
    legalEntityCategory: text("categorieJuridiqueUniteLegale"),
    mainBusinessActivity: text("activitePrincipaleUniteLegale"),
    height: real("hauteur_mean"),
    legalUnitMainActivityLabel: text(
      "nomenclatureActivitePrincipaleUniteLegale",
    ),
    legalUnitSocialEconomy: text("economieSocialeSolidaireUniteLegale"),
    inSirene: text("in_sirene"),
    companyName: text("nom"),
    siret: text("siret"),
    phone: text("telephone"),
    email: text("adresse_courriel"),
    organizationType: text("type_organisme"),
    syndicCommonName: text("denominationUsuelle_syndic"),
    syndicName: text("syndic_nom"),
    syndicSiretDeprecated: text("syndic_siret"),
    syndicSiret: text("siret_syndic"),
    syndicCommune: text("syndic_commune"),
    isMainSyndic: text("syndic_principal"),
    syndicStreetNumber: real("numeroVoie_syndic"),
    syndicRepetitionIndex: text("indiceRepetition_syndic"),
    syndicCity: text("libelleCommune_syndic"),
    syndicZipCode: text("codePostal_syndic"),
    syndicStreetName: text("libelleVoie_syndic"),
    syndicStreetType: text("typeVoie_syndic"),
    // Tertiaire ci dessous
    siren1: text("siren_1"),
    nbPremises1: real("nb_locaux_du_groupe_1"),
    denomination1: text("denomination_1"),
    legalForm1: text("forme_juridique_1"),
    zipCode1: text("code_postal_1"),
    partSiren1: text("part_siren_1"),
    nbEmployeesRange1: text("trancheEffectifs_1"),
    companyType1: text("categorieEntreprise_1"),
    legalType1: text("categorieJuridique_1"),
    mainBusinessActivity1: text("activitePrincipale_1"),
    name1: text("nom_1"),
    phone1: text("telephone_1"),
    email1: text("adresse_courriel_1"),
    organizationType1: text("type_organisme_1"),
    hasRepresentative1: boolean("delegué_1"),
    //repeat for 2 and 3
    siren2: text("siren_2"),
    nbPremises2: real("nb_locaux_du_groupe_2"),
    denomination2: text("denomination_2"),
    legalForm2: text("forme_juridique_2"),
    zipCode2: text("code_postal_2"),
    partSiren2: text("part_siren_2"),
    nbEmployeesRange2: text("trancheEffectifs_2"),
    companyType2: text("categorieEntreprise_2"),
    legalType2: text("categorieJuridique_2"),
    mainBusinessActivity2: text("activitePrincipale_2"),
    name2: text("nom_2"),
    phone2: text("telephone_2"),
    email2: text("adresse_courriel_2"),
    organizationType2: text("type_organisme_2"),
    hasRepresentative2: boolean("delegué_2"),
    siren3: text("siren_3"),
    nbPremises3: real("nb_locaux_du_groupe_3"),
    denomination3: text("denomination_3"),
    legalForm3: text("forme_juridique_3"),
    zipCode3: text("code_postal_3"),
    partSiren3: text("part_siren_3"),
    nbEmployeesRange3: text("trancheEffectifs_3"),
    companyType3: text("categorieEntreprise_3"),
    legalType3: text("categorieJuridique_3"),
    mainBusinessActivity3: text("activitePrincipale_3"),
    name3: text("nom_3"),
    phone3: text("telephone_3"),
    email3: text("adresse_courriel_3"),
    organizationType3: text("type_organisme_3"),
    hasRepresentative3: boolean("delegué_3"),
    importFailed: text("import_en_echec"),
    nameNull: text("name"),
  },
);

export type SnapshotPublicLocationBdnb = InferSelectModel<
  typeof snapshotPublicLocationsBdnbTable
>;

export const ecsGeneratorTypeEnum = pgEnum(
  "type_generateur_ecs",
  ECS_GENERATOR_TYPES,
);
export const ventilationTypeEnum = pgEnum(
  "type_ventilation",
  VENTILATION_TYPES,
);
export const insulationTypeEnum = pgEnum("type_isolation", INSULATION_TYPES);
export const wallMaterialEnum = pgEnum("materiau_mur", WALL_MATERIALS);
export const roofMaterialEnum = pgEnum("materiau_toit", ROOF_MATERIALS);
export const heatingGeneratorAgeEnum = pgEnum(
  "anciennete_generateur_chauffage",
  HEATING_GENERATOR_AGES,
);
export const heatingTypeEnum = pgEnum(
  "type_generateur_chauffage",
  HEATING_TYPES,
);
export const BackupHeatingEnergyTypeEnum = pgEnum(
  "type_energie_chauffage_appoint",
  BACKUP_HEATING_ENERGY_TYPES,
);
export const glazingTypeEnum = pgEnum("type_vitrage", GLAZING_TYPES);
export const shutterTypeEnum = pgEnum("type_fermeture", SHUTTER_TYPES);
export const dpeLabelEnum = pgEnum("etiquette_dpe", DPE_LABELS);
export const windowMaterialTypeEnum = pgEnum(
  "type_materiaux_menuiserie",
  WINDOW_MATERIAL_TYPE,
);
export const MaxConstructionPeriodEnum = pgEnum(
  "periode_construction_max",
  MAX_CONSTRUCTION_PERIOD,
);
export const DpeConstructionPeriodEnum = pgEnum(
  "periode_construction_dpe",
  DPE_CONSTRUCTION_PERIOD,
);
export const EcsInstallationTypeEnum = pgEnum(
  "type_installation_ecs",
  ECS_INSTALLATION_TYPE,
);
export const WallStructureMaterialEnum = pgEnum(
  "materiaux_structure_mur",
  WALL_STRUCTURE_MATERIALS,
);
export const AleaLevelEnum = pgEnum("niveau_alea", ALEA_LEVELS);
export const buildingTypeDpeEnum = pgEnum(
  "type_batiment_dpe",
  BUILDING_TYPE_DPE,
);
export const buildingUsageEnum = pgEnum("usage_batiment_enum", BUILDING_USAGE);
export const ipeUsageEnum = pgEnum("ipe_usage_enum", IPE_EFFECTIVE_USAGE);

// Bâtiments BDNB

export const LocationBdnbUuid = z.string().brand("LocationBdnbUuid");
export type LocationBdnbUuid = z.infer<typeof LocationBdnbUuid>;

export const LocationBdnbHsId = z.string().brand("LocationBdnbHsId");
export type LocationBdnbHsId = z.infer<typeof LocationBdnbHsId>;

export const locationsBdnbTable = pgTable(
  "batiments_bdnb",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom().$type<LocationBdnbUuid>(),
    name: text("nom"),
    zipcode: text("code_postal__new_"),
    city: text("ville"),
    streetNumber: text("numero_de_la_rue"),
    streetName: text("nom_de_la_rue"),
    streetViewUrl: text("url_vue_rue"),
    department: frenchDepartmentEnum("departement"),
    locationGroupId: text("batiment_groupe_id"),
    rawBdnb: jsonb("raw_bdnb").$type<BdnbApiResponse>(),
    googlePlaceId: text("google_place_id"),
    sourceAddress: text("source_address"),
    sector: sectorEnum("secteur"),
    buildingUsage: buildingUsageEnum("usage_batiment"),
    ipeUsage: ipeUsageEnum("ipe_usage"),
    ipeUsageReason: text("ipe_usage_reason"),
    ipeRawScore: real("score_brut_ipe"),
    referenceCompanyUuid: uuid("entreprise_reference_uuid"),
    referenceCompanySelectionReason: text(
      "raison_selection_entreprise_reference",
    ),
    nbBuildings: real("nombre_de_batiments"),
    nbUnits: real("nombre_de_lots"),
    surfaceArea: real("m2"),
    facadeArea: real("facade_area"),
    glazingArea: real("glazing_area"),
    nbStoreys: real("nombre_d_etages"),
    glazingSurfacePercentage: real("pourcentage_de_surface_vitree"),
    height: real("hauteur"),
    energyType: energyTypeEnum("type_d_energie"),
    heatingSystem: heatingSystemEnum("type_de_chauffage"),
    electricityConsumptionPerSquareMeter: real(
      "consommation_electrique_par_m2",
    ),
    estimatedEnergyConsumption: real("conso_energie_estime"),
    greenhouseGasEmissionsPerSquareMeter: real(
      "emission_gaz_a_effet_de_serre_par_m2",
    ),
    creationDate: date("annee_de_construction"),
    dpeLabel: dpeLabelEnum("etiquette_dpe"),
    longitude: real("longitude"),
    latitude: real("latitude"),
    meanHeight: real("hauteur_mean"),
    inertiaClass: text("classe_inertie"),
    hasBalcony: boolean("presence_balcon"),
    nbDwellings: real("nb_log"),
    nbDwellingsRnc: real("nb_log_rnc"),
    nbTertiaryLotsRnc: real("nb_lot_tertiaire_rnc"),
    nbResElec2020: real("nb_pdl_res_dle_elec_2020"),
    nbProElec2020: real("nb_pdl_pro_dle_elec_2020"),
    nbProGaz2020: real("nb_pdl_pro_dle_gaz_2020"),
    nbResGaz2020: real("nb_pdl_res_dle_gaz_2020"),
    dpeAssessmentClass: dpeLabelEnum("classe_bilan_dpe"),
    arrete2021: boolean("arrete_2021"),
    dpeIdentifier: text("identifiant_dpe"),
    gesEmissions5UsesPerM2: real("emission_ges_5_usages_m2"),
    gesEmissions3UsesEpM2Arrete2012: real(
      "emission_ges_3_usages_ep_m2_arrete_2012",
    ),
    ventilationType: ventilationTypeEnum("type_ventilation"),
    acGeneratorType: text("type_generateur_climatisation"),
    acGeneratorAge: heatingGeneratorAgeEnum(
      "type_generateur_climatisation_anciennete",
    ),
    exteriorWallInsulationType: insulationTypeEnum(
      "type_isolation_mur_exterieur",
    ).array(),
    exteriorWallUValue: real("u_mur_exterieur"),
    lowerFloorInsulationType: insulationTypeEnum(
      "type_isolation_plancher_bas",
    ).array(),
    upperFloorInsulationType: insulationTypeEnum(
      "type_isolation_plancher_haut",
    ).array(),
    lowerFloorFinalUValue: real("u_plancher_bas_final_deperditif"),
    upperFloorUValue: real("u_plancher_haut_deperditif"),
    glazingType: glazingTypeEnum("type_vitrage"),
    windowMaterialType: windowMaterialTypeEnum(
      "type_materiaux_menuiserie",
    ).array(),
    gasLayerType: text("type_gaz_lame"),
    shutterType: shutterTypeEnum("type_fermeture").array(),
    virGlazing: boolean("vitrage_vir"),
    windowUValue: real("u_baie_vitree"),
    windowSolarFactor: real("facteur_solaire_baie_vitree"),
    proElecConsumption2020: real("conso_pro_dle_elec_2020"),
    resElecConsumption2020: real("conso_res_dle_elec_2020"),
    proGazConsumption2020: real("conso_pro_dle_gaz_2020"),
    resGazConsumption2020: real("conso_res_dle_gaz_2020"),
    networkId: text("id_reseau"),
    radonRisk: AleaLevelEnum("alea_radon"),
    clayRisk: AleaLevelEnum("alea_argiles"),
    priorityDistrict: boolean("quartier_prioritaire"),
    districtNameQpv: text("nom_quartier_qpv"),
    qpvCode: text("code_qp"),

    denomination: text("denomination"),
    LSiret: text("l_siret"),
    immatriculationNumber: text("numero_immat_principal"),
    maxConstructionPeriod: MaxConstructionPeriodEnum(
      "periode_construction_max",
    ),
    numberOfGarparkLots: real("nb_lot_garpark"),
    totalNumberOfLots: real("nb_lot_tot"),
    numberOfOpenGroupPremises: real("nb_locaux_open_groupe"),
    numberOfTotalOpenPremises: real("nb_locaux_open_total"),
    numberOfGroupBuildingsOutsideDept: real("nb_bat_grp_hors_dep"),
    wallMaterial: wallMaterialEnum("mat_mur_txt").array(),
    roofMaterial: roofMaterialEnum("mat_toit_txt").array(),
    nbDwellingsFfoBat: real("nb_log_batiment_groupe_ffo_bat"),
    totalPdlCount: real("nb_pdl_tot"),
    mainGesClass: dpeLabelEnum("classe_ges_principale"),
    pmrAccessible: boolean("accessible_pmr"),
    isInQpv: boolean("dans_qpv"),
    constructionYearRpls: date("l_annee_construction_batiment_groupe_rpls"),
    nbDwellingsRpls: real("nb_log_batiment_groupe_rpls"),
    habitableSurface: real("s_log_hab"),
    habitableSurfaceDwelling: real("surface_habitable_logement"),
    constructionType: text("type_construction").array(),
    equipmentType: text("l_type_equipement"),
    geomGroup: jsonb("geom_groupe").$type<BdnbApiResponse["geom_groupe"]>(),
    irisCode: text("code_iris"),
    inseeCommuneCode: text("code_commune_insee"),
    inseeEpciCode: text("code_epci_insee"),
    containsFictiveGeometry: boolean("contient_fictive_geom_groupe"),
    natureLabel: text("l_nature"),
    detailedNatureLabel: text("l_nature_detaillee"),
    toponymLabel: text("l_toponyme"),
    groupBuildingDleYear: text(
      "millesime_batiment_groupe_dle_reseaux_multimillesime",
    ),
    residentialPdlCount: real(
      "nb_pdl_res_batiment_groupe_dle_reseaux_multimillesime",
    ),
    professionalPdlCount: real(
      "nb_pdl_pro_batiment_groupe_dle_reseaux_multimillesime",
    ),
    totalPdlCountDle: real(
      "nb_pdl_tot_batiment_groupe_dle_reseaux_multimillesime",
    ),
    residentialConsumption: real(
      "conso_res_batiment_groupe_dle_reseaux_multimillesime",
    ),
    professionalConsumption: real(
      "conso_pro_batiment_groupe_dle_reseaux_multimillesime",
    ),
    totalConsumptionMulti: real(
      "conso_tot_batiment_groupe_dle_reseaux_multimillesime",
    ),
    networkType: text("type_reseau"),
    buildingTypeDpe: buildingTypeDpeEnum("type_batiment_dpe"),
    constructionPeriodDpe: DpeConstructionPeriodEnum(
      "periode_construction_dpe",
    ),
    constructionYearDpe: date("annee_construction_dpe"),
    dpeVersion: real("version"),
    dpeEstablishedDate: date("date_etablissement_dpe"),
    dpeReceivedDate: date("date_reception_dpe"),
    nbDwellingLevels: real("nombre_niveau_logement"),
    nbBuildingLevels: real("nombre_niveau_immeuble"),
    habitableSurfaceBuilding: real("surface_habitable_immeuble"),
    consumption5Usages: real("conso_5_usages_ef_m2"),
    gesEmissionClass: dpeLabelEnum("classe_emission_ges"),
    energyClass2012: dpeLabelEnum("classe_conso_energie_arrete_2012"),
    gesClass2012: dpeLabelEnum("classe_emission_ges_arrete_2012"),
    consumption3Usages2012: real("conso_3_usages_ep_m2_arrete_2012"),
    hasAirConditioning: boolean("presence_climatisation"),
    heatingType: heatingTypeEnum("type_generateur_chauffage"),
    heatingGeneratorAge: heatingGeneratorAgeEnum(
      "type_generateur_chauffage_anciennete",
    ),
    heatingBackupEnergyType: BackupHeatingEnergyTypeEnum(
      "type_energie_chauffage_appoint",
    ),
    heatingBackupGeneratorType: text("type_generateur_chauffage_appoint"),
    heatingBackupGeneratorAge: text(
      "type_generateur_chauffage_anciennete_appoint",
    ),
    solarHeating: boolean("chauffage_solaire"),
    nbHeatingGenerators: real("nb_generateur_chauffage"),
    nbHeatingInstallations: real("nb_installation_chauffage"),
    acEnergyType: text("type_energie_climatisation"),
    ecsInstallationType: EcsInstallationTypeEnum("type_installation_ecs"),
    ecsEnergyType: text("type_energie_ecs"),
    ecsGeneratorType: ecsGeneratorTypeEnum("type_generateur_ecs"),
    ecsGeneratorAge: heatingGeneratorAgeEnum("type_generateur_ecs_anciennete"),
    ecsBackupEnergyType: text("type_energie_ecs_appoint"),
    ecsBackupGeneratorType: text("type_generateur_ecs_appoint"),
    ecsBackupGeneratorAge: text("type_generateur_ecs_anciennete_appoint"),
    solarEcs: boolean("ecs_solaire"),
    nbEcsGenerators: real("nb_generateur_ecs"),
    nbEcsInstallations: real("nb_installation_ecs"),
    multipleExposedFacades: boolean("plusieurs_facade_exposee"),
    renewableEnergyProductionType: text("type_production_energie_renouvelable"),
    lameThickness: real("epaisseur_lame"),
    northGlazedSurface: real("surface_vitree_nord"),
    southGlazedSurface: real("surface_vitree_sud"),
    westGlazedSurface: real("surface_vitree_ouest"),
    eastGlazedSurface: real("surface_vitree_est"),
    glazedSurfaceHorizontal: real("surface_vitree_horizontal"),
    crossVentilated: text("traversant"),
    uwValue: real("uw"),
    windowOrientationLabel: text("l_orientation_baie_vitree"),
    externalWallInsulationThickness: real(
      "epaisseur_isolation_mur_exterieur_estim",
    ),
    externalWallStructureMaterial: WallStructureMaterialEnum(
      "materiaux_structure_mur_exterieur",
    ),
    externalWallStructureThickness: text("epaisseur_structure_mur_exterieur"),
    totalWallSurface: real("surface_mur_totale"),
    externalWallSurface: real("surface_mur_exterieur"),
    wallSurfaceDeperditive: real("surface_mur_deperditif"),
    unheatedWallLabel: text("l_local_non_chauffe_mur"),
    unheatedWallMain: text("local_non_chauffe_principal_mur"),
    wallOrientationLabel: text("l_orientation_mur_exterieur"),
    floorDeperditiveType: text("type_plancher_bas_deperditif"),
    totalLowerFloorSurface: real("surface_plancher_bas_totale"),
    floorSurfaceDeperditive: real("surface_plancher_bas_deperditif"),
    floorUValueRaw: real("u_plancher_bas_brut_deperditif"),
    unheatedFloorLabel: text("l_local_non_chauffe_plancher_bas"),
    unheatedFloorMain: text("local_non_chauffe_principal_plancher_bas"),
    adjacencyMainFloorType: text("type_adjacence_principal_plancher_bas"),
    upperFloorDeperditiveType: text("type_plancher_haut_deperditif"),
    upperFloorSurfaceTotal: real("surface_plancher_haut_totale"),
    upperFloorSurfaceDeperditive: real("surface_plancher_haut_deperditif"),
    unheatedFloorLabelTop: text("l_local_non_chauffe_plancher_haut"),
    unheatedFloorMainTop: text("local_non_chauffe_principal_plancher_haut"),
    adjacencyMainFloorTop: text("type_adjacence_principal_plancher_haut"),
    doorType: text("type_porte"),
    doorSurface: real("surface_porte"),
    doorUValue: real("u_porte"),
    lossWall: real("deperdition_mur"),
    thermalLossWindow: real("deperdition_baie_vitree"),
    thermalLossLowerFloor: real("deperdition_plancher_bas"),
    thermalLossUpperFloor: real("deperdition_plancher_haut"),
    lossThermalBridge: real("deperdition_pont_thermique"),
    thermalLossDoor: real("deperdition_porte"),
    groupBuildingDleElecYear: date(
      "millesime_batiment_groupe_dle_elec_multimillesime",
    ),
    nbPdlsTotalElecMulti: real(
      "nb_pdl_tot_batiment_groupe_dle_elec_multimillesime",
    ),
    totalConsumptionElecMulti: real(
      "conso_tot_batiment_groupe_dle_elec_multimillesime",
    ),
    mainAddressInteropKey: text("cle_interop_adr_principale_ban"),
    nbValidAddressesBan: real("nb_adresse_valid_ban"),
    addressReliabilityLevel1: text("fiabilite_cr_adr_niv_1"),
    addressReliabilityLevel2: text("fiabilite_cr_adr_niv_2"),
    bdnbNetworkId: text("id_reseau_bdnb"),
    networkUnderConstruction: boolean("reseau_en_construction"),
    distanceToNetworkIndicator: text("indicateur_distance_au_reseau"),
    buildingNatureLabelBdtopo: text("l_nature_batiment_groupe_bdtopo_zoac"),
    detailedNatureLabelBdtopo: text(
      "l_nature_detaillee_batiment_groupe_bdtopo_zoac",
    ),
    toponymLabelBdtopo: text("l_toponyme_batiment_groupe_bdtopo_zoac"),
    soilFootprintReliability: text("fiabilite_emprise_sol"),
    heightReliability: text("fiabilite_hauteur"),
    addressReliability: real("fiabilite_adresse"),
    geospXSuccess: boolean("croisement_geospx_reussi"),
    maxHeight: real("max_hauteur"),
    averageGroundAltitude: real("altitude_sol_mean"),
    legalUnitWorkforceRange: text("trancheEffectifsUniteLegale"),
    unitWorkforceYear: date("anneeEffectifsUniteLegale"),
    surfaceThatRequiresHeating: real("surface_that_requires_heating"),
    annualElectricityConsumption: real("annual_electricity_consumption"),
    annualElectricityCost: real("annual_electricity_cost"),
  },
  (table) => ({
    locationsBdnbLocationGroupIdIndex: index(
      "locations_bdnb_location_group_id_index",
    ).on(table.locationGroupId),
    locationsDepartmentIndex: index("locations_bdnb_department_index").on(
      table.department,
    ),
    locationsDpeLabelIndex: index("locations_bdnb_dpe_label_index").on(
      table.dpeLabel,
    ),
    locationsEnergyTypeIndex: index("locations_bdnb_energy_type_index").on(
      table.energyType,
    ),
    locationsSurfaceThatRequiresHeatingIndex: index(
      "locations_bdnb_surface_that_requires_heating_index",
    ).on(table.surfaceThatRequiresHeating),
    locationsCreationDateIndex: index("locations_bdnb_creation_date_index").on(
      table.creationDate,
    ),
    locationsHeatingTypeIndex: index("locations_bdnb_heating_type_index").on(
      table.heatingType,
    ),
    locationsSurfaceAreaIndex: index("locations_bdnb_surface_area_index").on(
      table.surfaceArea,
    ),
    locationsGlazingAreaIndex: index("locations_bdnb_glazing_area_index").on(
      table.glazingArea,
    ),
    locationsHeightIndex: index("locations_bdnb_height_index").on(table.height),
    locationsNbStoreysIndex: index("locations_bdnb_nb_storeys_index").on(
      table.nbStoreys,
    ),
    locationsNbUnitsIndex: index("locations_bdnb_nb_units_index").on(
      table.nbUnits,
    ),
    locationsNbBuildingsIndex: index("locations_bdnb_nb_buildings_index").on(
      table.nbBuildings,
    ),
    locationsIsInQpvIndex: index("locations_bdnb_is_in_qpv_index").on(
      table.isInQpv,
    ),
    locationsSectorIndex: index("locations_bdnb_sector_index").on(table.sector),
    locationsBuildingUsageIndex: index(
      "locations_bdnb_building_usage_index",
    ).on(table.buildingUsage),
    locationsStreetNumberIndex: index(
      "locations_bdnb_street_number_index",
    ).using("gin", sql`${table.streetNumber} gin_trgm_ops`),

    locationsStreetNameIndex: index("locations_bdnb_street_name_index").using(
      "gin",
      sql`${table.streetName} gin_trgm_ops`,
    ),

    locationsZipcodeIndex: index("locations_bdnb_zipcode_index").using(
      "gin",
      sql`${table.zipcode} gin_trgm_ops`,
    ),

    locationsCityIndex: index("locations_bdnb_city_index").using(
      "gin",
      sql`${table.city} gin_trgm_ops`,
    ),
    locationsMaxConstructionPeriodIndex: index(
      "locations_bdnb_max_construction_period_index",
    ).on(table.maxConstructionPeriod),
    locationsNbParkingSpotsIndex: index(
      "locations_bdnb_nb_parking_spots_index",
    ).on(table.numberOfGarparkLots),
    locationsHabitableSurfaceIndex: index(
      "locations_bdnb_habitable_surface_index",
    ).on(table.habitableSurface),
    locationsPmrAccessibleIndex: index(
      "locations_bdnb_pmr_accessible_index",
    ).on(table.pmrAccessible),
    locationsGlazingTypeIndex: index("locations_bdnb_glazing_type_index").on(
      table.glazingType,
    ),
    locationsExteriorWallInsulationTypeIndex: index(
      "locations_bdnb_exterior_wall_insulation_type_index",
    ).using("gin", table.exteriorWallInsulationType),

    locationsLowerFloorInsulationTypeIndex: index(
      "locations_bdnb_lower_floor_insulation_type_index",
    ).using("gin", table.lowerFloorInsulationType),

    locationsUpperFloorInsulationTypeIndex: index(
      "locations_bdnb_upper_floor_insulation_type_index",
    ).using("gin", table.upperFloorInsulationType),

    locationsHabitableSurfaceAreaIndex: index(
      "locations_bdnb_habitable_surface_area_index",
    ).on(table.habitableSurfaceDwelling),
    locationsInertiaClassIndex: index("locations_bdnb_inertia_class_index").on(
      table.inertiaClass,
    ),
    locationsHasAirConditioningIndex: index(
      "locations_bdnb_has_air_conditioning_index",
    ).on(table.hasAirConditioning),
    locationsVentilationTypeIndex: index(
      "locations_bdnb_ventilation_type_index",
    ).on(table.ventilationType),
    locationsEcsGeneratorTypeIndex: index(
      "locations_bdnb_ecs_generator_type_index",
    ).on(table.ecsGeneratorType),
    locationsMainGesClassIndex: index("locations_bdnb_main_ges_class_index").on(
      table.mainGesClass,
    ),
    locationsDpeEstablishedDateIndex: index(
      "locations_bdnb_dpe_established_date_index",
    ).on(table.dpeEstablishedDate),
    locationsElectricityConsumptionPerSquareMeterIndex: index(
      "locations_bdnb_electricity_consumption_per_square_meter_index",
    ).on(table.electricityConsumptionPerSquareMeter),
    locationsGreenhouseGasEmissionsPerSquareMeterIndex: index(
      "locations_bdnb_greenhouse_gas_emissions_per_square_meter_index",
    ).on(table.greenhouseGasEmissionsPerSquareMeter),
    locationsAnnualElectricityConsumptionIndex: index(
      "locations_bdnb_annual_electricity_consumption_index",
    ).on(table.annualElectricityConsumption),
    locationsDpeLabelUuidIndex: index("locations_bdnb_dpe_label_uuid_index").on(
      table.dpeLabel,
      table.uuid,
    ),
  }),
);
export type LocationBdnb = InferSelectModel<typeof locationsBdnbTable>;
export type NewLocationBdnb = InferInsertModel<typeof locationsBdnbTable>;

export const locationBdnbStatsTable = pgTable(
  "batiments_bdnb_stats",
  {
    locationBdnbUuid: uuid("batiments_bdnb_id_pg")
      .$type<LocationBdnbUuid>()
      .primaryKey()
      .references(() => locationsBdnbTable.uuid, {
        onDelete: "cascade",
      }),
    nbLegalEntities: integer("nb_legal_entities").notNull().default(0),
    nbSirenOnly: integer("nb_siren_only").notNull().default(0),
    nbSiret: integer("nb_siret").notNull().default(0),
    nbRelatedPros: integer("nb_related_pros").notNull().default(0),
    lastSolicitationDate: timestamp("last_solicitation_date"),
  },
  (table) => ({
    locationBdnbStatsLocationIndex: index(
      "idx_batiments_bdnb_stats_batiment",
    ).on(table.locationBdnbUuid),
    locationBdnbStatsNbLegalEntitiesIndex: index(
      "idx_batiments_bdnb_stats_nb_legal_entities",
    ).on(table.nbLegalEntities),
    locationsBdnbStatsNbRelatedProsIndex: index(
      "idx_batiments_bdnb_stats_nb_related_pros",
    ).on(table.nbRelatedPros),
  }),
);
export type LocationBdnbStats = InferSelectModel<typeof locationBdnbStatsTable>;

// LegalEntity
export const LegalEntityUuid = z.string().brand("LegalEntityUuid");
export type LegalEntityUuid = z.infer<typeof LegalEntityUuid>;

export const employeeRangeEnum = pgEnum(
  "legal_entity_employee_range",
  EMPLOYEE_RANGES,
);

export const legalEntityTable = pgTable(
  "personne_morale",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom().$type<LegalEntityUuid>(),
    type: legalEntityEnum("type").notNull(),
    name: text("denomination"),
    usualName: text("denomination_usuelle"),
    siret: text("siret"),
    siren: text("siren"),
    partSiren: text("part_siren"),
    phone: text("telephone"),
    email: text("adresse_courriel"),
    nbPremises: real("nb_locaux_du_groupe"),
    nbEmployeesRange: employeeRangeEnum("trancheEffectifs"),
    companyType: text("categorieEntreprise"),
    legalType: text("categorieJuridique"),
    mainBusinessActivity: text("activitePrincipale"),
    organizationType: text("type_organisme"),
    legalForm: text("forme_juridique"),
    hasRepresentative: boolean("delegue"),
    openingHoursInternal: text("horaires_ouverture_interne"),

    // Google
    googlePlaceId: text("google_place_id"),
    openingHours: jsonb("horaires_ouverture"),
    rating: real("note"),
    userRatingCount: real("nombre_avis"),
    website: text("site_internet"),
    mapsItineraryUrl: text("url_itineraire_maps"),
    businessStatus: text("statut_entreprise"),
    isUnavailableForGoogle: boolean("is_unavailable_for_google").default(false),
    lastFetchedAtForGoogle: timestamp("last_fetched_at_for_google"),

    // Pappers
    purpose: text("objectif"),
    isUnavailableForPappers: boolean("is_unavailable_for_pappers").default(
      false,
    ),
    lastFetchedAtForPappers: timestamp("last_fetched_at_for_pappers"),

    // Hunter
    isUnavailableForHunter: boolean("is_unavailable_for_hunter").default(false),
    lastFetchedAtForHunter: timestamp("last_fetched_at_for_hunter"),

    // Societe Info
    isUnavailableForSocieteInfo: boolean(
      "is_unavailable_for_societe_info",
    ).default(false),
    lastFetchedAtForSocieteInfo: timestamp("last_fetched_at_for_societe_info"),

    //Copro property syndic info
    isMainSyndic: boolean("syndic_principal"),
    syndicRepetitionIndex: text("indiceRepetition_syndic"),
    streetNumber: text("numero_voie"), // @todo add syndic prefix ?
    streetType: text("typeVoie_syndic"),
    streetName: text("libelle_voie"),
    city: text("ville"),
    zipCode: text("code_postal"),
    streetViewUrl: text("url_vue_rue_syndic"),

    // No info found from any source
    noContactCanBeFound: boolean("aucun_contact_trouvable").default(false),
  },
  (table) => ({
    legalEntityTypeIndex: index("legal_entity_type").on(table.type),
    legalEntityNameIndex: index("legal_entity_name_index").using(
      "gin",
      sql`${table.name} gin_trgm_ops`,
    ),
    legalEntityUsualNameIndex: index("legal_entity_usual_name_index").using(
      "gin",
      sql`${table.usualName} gin_trgm_ops`,
    ),
    legalEntitySiretIndex: index("legal_entity_siret_index").using(
      "gin",
      sql`${table.siret} gin_trgm_ops`,
    ),
    legalEntitySirenIndex: index("legal_entity_siren_index").using(
      "gin",
      sql`${table.siren} gin_trgm_ops`,
    ),
    nbEmployeesRangeIndex: index("legal_entity_nb_employees_range_index").on(
      table.nbEmployeesRange,
    ),
    nbPremisesIndex: index("legal_entity_nb_premises_index").on(
      table.nbPremises,
    ),
    LegalEntityActivityIndex: index("legal_entity_activity_index").on(
      table.mainBusinessActivity,
    ),
  }),
);

export type LegalEntity = InferSelectModel<typeof legalEntityTable>;
export type NewLegalEntity = InferInsertModel<typeof legalEntityTable>;

export const legalEntityStatsTable = pgTable(
  "personne_morale_stats",
  {
    legalEntityUuid: uuid("personne_morale_id_pg")
      .$type<LegalEntityUuid>()
      .primaryKey()
      .references(() => legalEntityTable.uuid, {
        onDelete: "cascade",
      }),
    nbRelatedLocations: integer("nb_related_locations").notNull().default(0),
    nbRelatedPros: integer("nb_related_pros").notNull().default(0),
    lastSolicitationDate: timestamp("last_solicitation_date"),
  },
  (table) => ({
    legalEntityStatsNbRelatedLocationsIndex: index(
      "idx_personne_morale_stats_nb_related_locations",
    ).on(table.nbRelatedLocations),
    legalEntityStatsNbRelatedProsIndex: index(
      "idx_personne_morale_stats_nb_related_pros",
    ).on(table.nbRelatedPros),
  }),
);
export type LegalEntityStats = InferSelectModel<typeof legalEntityStatsTable>;

export const corruptLegalEntityTable = pgTable("personne_morale_corrompue", {
  uuid: uuid("id_pg").primaryKey().defaultRandom().$type<LegalEntityUuid>(),
  bdnbId: text("batiment_groupe_id"),
  name: text("nom"),
  raw: jsonb("raw_data"),
  reason: text("raison"),
});
export type CorruptLegalEntity = InferSelectModel<
  typeof corruptLegalEntityTable
>;

export const ExternalContactUuid = z.string().brand("ExternalContactUuid");
export type ExternalContactUuid = z.infer<typeof ExternalContactUuid>;

export const externalContactOriginEnum = pgEnum(
  "contact_externe_source",
  Object.values(ExternalContactSource) as [
    ExternalContactSource,
    ...ExternalContactSource[],
  ],
);

export const externalContactTypeEnum = pgEnum(
  "contact_externe_type",
  Object.values(ExternalContactType) as [
    ExternalContactType,
    ...ExternalContactType[],
  ],
);

export const externalContactSeniorityEnum = pgEnum(
  "contact_externe_seniorite",
  Object.values(ExternalContactSeniority) as [
    ExternalContactSeniority,
    ...ExternalContactSeniority[],
  ],
);

export const externalContactTable = pgTable("contact_externe", {
  uuid: uuid("id_pg").primaryKey().defaultRandom().$type<ExternalContactUuid>(),
  role: text("role"),
  firstName: text("prenom"),
  lastName: text("nom"),
  email: text("adresse_courriel"),
  phone: text("telephone"),
  linkedInUrl: text("url_linkedin"),
  twitterUrl: text("url_twitter"),
  confidenceScore: real("confidence_score"),
  type: externalContactTypeEnum("type"),
  isUnavailableForFullEnrich: boolean("indisponible_pour_fullenrich").default(
    false,
  ),
  isMailUnavailableForFullEnrich: boolean(
    "mail_indisponible_pour_fullenrich",
  ).default(false),
  isPhoneUnavailableForFullEnrich: boolean(
    "telephone_indisponible_pour_fullenrich",
  ).default(false),
  lastFetchedAtForFullEnrich: timestamp(
    "derniere_recuperation_pour_fullenrich",
  ),
  origin: externalContactOriginEnum("source")
    .default(ExternalContactSource.PAPPERS)
    .notNull(),
  seniority: externalContactSeniorityEnum("seniorite"),
  societeInfoId: text("societe_info_id"),
  department: text("departement"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const associationsLegalEntityExternalContactTable = pgTable(
  "associations_personne_morale_contact_externe",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    legalEntityUuid: uuid("personne_morale_id_pg")
      .$type<LegalEntityUuid>()
      .references(() => legalEntityTable.uuid, {
        onDelete: "cascade",
      }),
    externalContactUuid: uuid("contact_externe_id_pg")
      .$type<ExternalContactUuid>()
      .references(() => externalContactTable.uuid, {
        onDelete: "cascade",
      }),
  },
);

export const associationProExternalContactTypeEnum = pgEnum(
  "type_association_pro_contact_externe",
  Object.values(AssociationProExternalContactType) as [
    AssociationProExternalContactType,
    ...AssociationProExternalContactType[],
  ],
);

export const associationProExternalContactStatusEnum = pgEnum(
  "type_association_pro_contact_externe_status",
  Object.values(AssociationProExternalContactStatus) as [
    AssociationProExternalContactStatus,
    ...AssociationProExternalContactStatus[],
  ],
);

export const associationsProExternalContactTable = pgTable(
  "associations_pros_contact_externe",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    proUuid: uuid("pro_id_pg")
      .$type<ProUuid>()
      .references(() => hsProsTable.uuid, {
        onDelete: "cascade",
      })
      .notNull(),
    externalContactUuid: uuid("contact_externe_id_pg")
      .$type<ExternalContactUuid>()
      .references(() => externalContactTable.uuid, {
        onDelete: "cascade",
      })
      .notNull(),
    associationType:
      associationProExternalContactTypeEnum("type_association").notNull(),
    status: associationProExternalContactStatusEnum("statut_association")
      .notNull()
      .default(AssociationProExternalContactStatus.NEW),
    createdAt: timestamp("cree_le").defaultNow().notNull(),
    updatedAt: timestamp("mis_a_jour_le"),
    addedByContactUuid: uuid("ajoute_par_contact_id_pg")
      .$type<ContactUuid>()
      .references(() => hsContactsTable.uuid, {
        onDelete: "set null",
      }),
  },
  (table) => {
    return {
      proExternalContactUnique: unique(
        "uq_associations_pros_contact_externe_pro_contact",
      ).on(table.proUuid, table.externalContactUuid),

      idxProOwner: index("idx_associations_pros_contact_externe_pro_owner").on(
        table.proUuid,
        table.addedByContactUuid,
      ),
    };
  },
);

export type ExternalContact = InferSelectModel<typeof externalContactTable>;
export type NewExternalContact = InferInsertModel<typeof externalContactTable>;

export const associationsProLegalEntityTable = pgTable(
  "associations_pros_personne_morale",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    proUuid: uuid("pros_id_pg")
      .$type<ProUuid>()
      .references(() => hsProsTable.uuid, {
        onDelete: "cascade",
      }),
    legalEntityUuid: uuid("personne_morale_id_pg")
      .$type<LegalEntityUuid>()
      .references(() => legalEntityTable.uuid, {
        onDelete: "cascade",
      }),
    associationTypeId: integer("association_type_id").notNull(),
    associationLabel: varchar("association_label"),
  },
  (table) => {
    return {
      idxProLegalEntity: index("idx_asso_pro_personne_pro_legal_entity").on(
        table.proUuid,
        table.legalEntityUuid,
      ),
    };
  },
);

export const associationsLocationsBdnbLegalEntityTable = pgTable(
  "associations_batiments_bdnb_personne_morale",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    locationBdnbUuid: uuid("batiments_bdnb_id_pg")
      .$type<LocationBdnbUuid>()
      .references(() => locationsBdnbTable.uuid, {
        onDelete: "cascade",
      }),
    legalEntityUuid: uuid("personne_morale_id_pg")
      .$type<LegalEntityUuid>()
      .references(() => legalEntityTable.uuid, {
        onDelete: "cascade",
      }),
  },
  (table) => {
    return {
      byLocation: index(
        "associations_batiments_bdnb_personne_morale_batiments_idx",
      ).on(table.locationBdnbUuid),

      byLegalEntity: index(
        "associations_batiments_bdnb_personne_morale_personne_idx",
      ).on(table.legalEntityUuid),

      byLocationLegalEntity: index(
        "associations_batiments_bdnb_personne_morale_batiments_personne_idx",
      ).on(table.locationBdnbUuid, table.legalEntityUuid),
    };
  },
);

export const geomGroupTable = pgTable("geom_groupe", {
  uuid: uuid("id_pg").primaryKey().defaultRandom(),
  bdnbId: text("batiment_groupe_id"),
  geom_groupe: text("geom_groupe"),
});

export const enrichmentStatusEnum = pgEnum(
  "enrichment_status",
  Object.values(FullEnrichEnrichmentStatus) as [
    FullEnrichEnrichmentStatus,
    ...FullEnrichEnrichmentStatus[],
  ],
);

export const enrichmentsTable = pgTable("enrichissements", {
  uuid: uuid("id_pg").primaryKey().defaultRandom(),
  legalEntityUuid: uuid("personne_morale_id_pg")
    .$type<LegalEntityUuid>()
    .references(() => legalEntityTable.uuid, {
      onDelete: "cascade",
    })
    .notNull(),
  enrichmentId: text("enrichissement_id")
    .unique()
    .$type<FullEnrichEnrichmentId>(),
  status: enrichmentStatusEnum("statut").notNull(),
  contacts: text("contacts").$type<ExternalContactUuid[]>().array(),
  dependsOn: text("depend_de").$type<FullEnrichEnrichmentId[]>().array(),
  startedAt: timestamp("commence_le"),
  proUuid: uuid("pro_id_pg")
    .$type<ProUuid>()
    .references(() => hsProsTable.uuid, {
      onDelete: "cascade",
    }),
  contactUuid: uuid("contact_id_pg")
    .$type<ContactUuid>()
    .references(() => hsContactsTable.uuid, {
      onDelete: "cascade",
    }),
});

export type Enrichment = InferSelectModel<typeof enrichmentsTable>;
export type NewEnrichment = InferInsertModel<typeof enrichmentsTable>;

export const LeadParametersTable = pgTable("ProspectionParametres", {
  uuid: uuid("id_pg").primaryKey().defaultRandom(),
  proUuid: uuid("pro_id_pg")
    .$type<ProUuid>()
    .references(() => hsProsTable.uuid, {
      onDelete: "cascade",
    })
    .unique()
    .notNull(),
  recipientContactUuid: uuid("contact_reception_id_pg")
    .$type<ContactUuid>()
    .references(() => hsContactsTable.uuid, {
      onDelete: "set null",
    }),
  leadsToGenerate: integer("nombre_de_leads_a_generer"),
  sendFrequencyPerWeek: integer("frequence_envoi_par_semaine"),
  lastSentAt: timestamp("dernier_envoi_at"),
  buildingUsage: buildingUsageEnum("usage_batiment").array(),
  nbLegalEntitiesPerLocation: real("nb_personne_morale_par_batiment")
    .array()
    .$type<[number, number]>(),
  nbEmployeesRange: employeeRangeEnum("trancheEffectifs").array(),
  locationDepartment: frenchDepartmentEnum("departement").array(),
  locationBuildingType: text("type_batiment_naf").array().$type<NafCode[]>(),
  sector: sectorEnum("secteur").array(),
  address: text("adresse"),
  isInQpv: boolean("dans_qpv"),
  nbRelatedLocations: real("nb_batiment_groupe_related")
    .array()
    .$type<[number, number]>(),
  nbBuildings: real("nombre_de_batiments").array().$type<[number, number]>(),
  buildingOccupancyStatus: text("statut_occupation_batiment")
    .array()
    .$type<BuildingOccupancyStatus[]>(),
  creationDate: date("date_construction").array().$type<Date[]>(),
  maxConstructionPeriod: MaxConstructionPeriodEnum(
    "periode_construction_max",
  ).array(),
  energyType: energyTypeEnum("type_energie").array(),
  annualElectricityConsumption: real("annual_electricity_consumption")
    .array()
    .$type<[number, number]>(),
  heatingSystem: heatingSystemEnum("type_de_chauffage").array(),
  dpeLabel: text("classe_dpe")
    .array()
    .$type<((typeof DPE_LABELS)[number] | "NC")[]>(),
  nbUnits: real("nombre_de_lots").array().$type<[number, number]>(),
  nbParkingSpots: real("nombre_de_places_de_parking")
    .array()
    .$type<[number, number]>(),
  habitableSurfaceDwelling: real("surface_habitable_logement")
    .array()
    .$type<[number, number]>(),
  pmrAccessible: boolean("accessible_pmr"),
  glazingType: glazingTypeEnum("type_vitrage").array(),
  exteriorWallInsulationType: insulationTypeEnum(
    "type_isolation_mur_exterieur",
  ).array(),
  lowerFloorInsulationType: insulationTypeEnum(
    "type_isolation_plancher_bas",
  ).array(),
  upperFloorInsulationType: insulationTypeEnum(
    "type_isolation_plancher_haut",
  ).array(),
  surfaceArea: real("surface_au_sol").array().$type<[number, number]>(),
  habitableSurfaceArea: real("surface_habitable")
    .array()
    .$type<[number, number]>(),
  surfaceThatRequiresHeating: real("surface_that_requires_heating")
    .array()
    .$type<[number, number]>(),
  nbStoreys: real("nombre_d_etages").array().$type<[number, number]>(),
  glazingArea: real("surface_vitree").array().$type<[number, number]>(),
  dpeCertified: boolean("dpe_fiabilise"),
  inertiaClass: text("classe_inertie").array().$type<InertiaClass[]>(),
  nbDwellings: real("nombre_de_logements").array().$type<[number, number]>(),
  heatingType: heatingTypeEnum("type_generateur_chauffage").array(),
  hasAirConditioning: boolean("presence_climatisation"),
  ventilationType: ventilationTypeEnum("type_ventilation").array(),
  ecsGeneratorType: ecsGeneratorTypeEnum("type_generateur_ecs").array(),
  mainGesClass: text("classe_ges")
    .array()
    .$type<((typeof DPE_LABELS)[number] | "NC")[]>(),
  dpeEstablishedDate: date("date_etablissement_dpe").array().$type<Date[]>(),
  electricityConsumptionPerSquareMeter: real("conso_elec_par_m2")
    .array()
    .$type<[number, number]>(),
  greenhouseGasEmissionsPerSquareMeter: real("ges_par_m2")
    .array()
    .$type<[number, number]>(),
  legalEntityTypes: text("types_personne_morale")
    .array()
    .$type<LegalEntityFilterType[]>(),
  tertiaryActivityType: text("activite_tertiaire").array().$type<NafCode[]>(),
  nbPremises: real("nombre_de_locaux").array().$type<[number, number]>(),
  type: legalEntityEnum("type_personne_morale").array(),
  ipeUsageReason: text("ipe_usage_reason").array().$type<IpeUsageReason[]>(),
  ipeNormalizedScore: real("ipe_normalized_score")
    .array()
    .$type<[number, number]>(),
  legalForm: text("forme_juridique").array().$type<LegalForm[]>(),
  mainBusinessActivity: text("activite_principale").array(),
  domains: text("domaine_activite_contact").array().$type<WorkDomain[]>(),
  levels: text("niveau_hierarchique_contact").array().$type<ContactLevel[]>(),
  name: text("nom"),
  zipCode: text("code_postal"),
  legalEntityDepartment: frenchDepartmentEnum(
    "departement_personne_morale",
  ).array(),
  height: real("hauteur").array().$type<[number, number]>(),
  hasBalcony: boolean("presence_balcon"),
  multipleExposedFacades: boolean("plusieurs_facades_exposees"),
  heatingBackupEnergyType: BackupHeatingEnergyTypeEnum(
    "type_energie_chauffage_appoint",
  ).array(),
  solarHeating: boolean("chauffage_solaire"),
  solarEcs: boolean("ecs_solaire"),
  wallMaterial: wallMaterialEnum("materiau_mur").array(),
  roofMaterial: roofMaterialEnum("materiau_toit").array(),
});

export type LeadParameters = InferSelectModel<typeof LeadParametersTable>;

export const LeadHistoryTable = pgTable(
  "ProspectionHistoriqueLeads",
  {
    uuid: uuid("id_pg").primaryKey().defaultRandom(),
    proUuid: uuid("pro_id_pg")
      .$type<ProUuid>()
      .references(() => hsProsTable.uuid, {
        onDelete: "cascade",
      })
      .notNull(),
    locationBdnbUuid: uuid("batiments_bdnb_id_pg")
      .$type<LocationBdnbUuid>()
      .references(() => locationsBdnbTable.uuid, {
        onDelete: "cascade",
      })
      .notNull(),
    recommendedExternalContactUuid: uuid("contact_externe_recommande_id_pg")
      .$type<ExternalContactUuid>()
      .references(() => externalContactTable.uuid, {
        onDelete: "set null",
      }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      leadHistoryProLocationUnique: unique(
        "uq_prospection_historique_leads_pro_location",
      ).on(table.proUuid, table.locationBdnbUuid),
      leadHistoryProIdx: index("idx_prospection_historique_leads_pro").on(
        table.proUuid,
      ),
      leadHistoryLocationBdnbIdx: index(
        "idx_prospection_historique_leads_location_bdnb",
      ).on(table.locationBdnbUuid),
    };
  },
);

export type LeadHistory = InferSelectModel<typeof LeadHistoryTable>;
