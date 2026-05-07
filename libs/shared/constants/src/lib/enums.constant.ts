import { CLIENT_ORIGINS, CLIENT_STAGES, CLIENT_TYPES } from "./client.constant";
import {
  CONTACT_JOB_TYPES,
  CONTACT_ORIGINS,
  CONTACT_STAGES,
} from "./contact.constant";
import { INVOICE_STAGES } from "./invoice.constant";
import { LEGAL_ENTITY_TYPES } from "./legal-entity.constant";
import {
  ENERGY_TYPES,
  HEATING_SYSTEMS,
  SECTOR_DATA,
} from "./location.constant";
import { DEAL_STAGES } from "./operation-phase.constant";
import { PRO_STATUSES } from "./pro.constant";
import { QUOTE_STAGES } from "./quote.constant";

export const APP_ENUMS = [
  {
    enumName: "type_d_energie_enum",
    constantsArray: Array.from(ENERGY_TYPES),
  },
  {
    enumName: "type_de_chauffage_enum",
    constantsArray: Array.from(HEATING_SYSTEMS),
  },
  {
    enumName: "secteur_enum",
    constantsArray: Array.from(SECTOR_DATA),
  },
  {
    enumName: "pipeline_stage_enum",
    constantsArray: Array.from(QUOTE_STAGES),
  },
  {
    enumName: "pro_status_enum",
    constantsArray: Array.from(PRO_STATUSES),
  },
  {
    enumName: "origine_inscription_plateforme_client_enum",
    constantsArray: Array.from(CLIENT_ORIGINS),
  },
  {
    enumName: "pipeline_client_stage_enum",
    constantsArray: Array.from(CLIENT_STAGES),
  },
  {
    enumName: "type_de_compte_enum",
    constantsArray: Array.from(CLIENT_TYPES),
  },
  {
    enumName: "origine_inscription_plateforme_contact_enum",
    constantsArray: Array.from(CONTACT_ORIGINS),
  },
  {
    enumName: "pipeline_contact_stage_enum",
    constantsArray: Array.from(CONTACT_STAGES),
  },
  {
    enumName: "type_de_poste_enum",
    constantsArray: Array.from(CONTACT_JOB_TYPES).map((job) => job.value),
  },
  {
    enumName: "invoice_pipeline_stage_enum",
    constantsArray: Array.from(INVOICE_STAGES),
  },
  {
    enumName: "operation_phase_enum",
    constantsArray: Array.from(DEAL_STAGES),
  },
  {
    enumName: "personne_morale_enum",
    constantsArray: Array.from(LEGAL_ENTITY_TYPES),
  },
] as const;

export type AppEnum = (typeof APP_ENUMS)[number]["enumName"];

export const APP_ENUMS_NAMES = APP_ENUMS.map((item) => item.enumName) as [
  AppEnum,
  ...AppEnum[],
];
