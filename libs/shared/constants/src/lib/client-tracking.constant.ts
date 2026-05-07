export const CLIENT_TRACKING_EVENTS = {
  login: {
    name: "pe144886321_connexion_plateforme",
    properties: {},
  },
  location_add: {
    name: "pe144886321_ajout_d_un_batiment",
    properties: {
      source: [
        "Piloter > Searchbar",
        "Explorer > Searchbar",
        "Sites",
        "Dashboard",
        "Onboarding",
        "Admin > CSV upload",
      ],
    },
  },
  brief_open: {
    name: "pe144886321_ouverture_brief",
    properties: {
      source: [
        "Lancement - Modale de succès",
        "Intégration - Modale de succès",
        "Panneau latéral",
        "Redirection depuis page publique",
        "Direct",
        "Outil cyclope",
      ],
    },
  },
  operation_plan_started: {
    name: "pe144886321_debut_de_planification_d_operation",
    properties: {
      source: [
        "Header > Nouveau projet",
        "Explorer > Tableau de bord",
        "Explorer > Side panel",
      ],
    },
  },
  operation_plan_aborted: {
    name: "pe144886321_planification_d_operation_abandonnee",
    properties: {
      source: [
        "Header > Nouveau projet",
        "Explorer > Tableau de bord",
        "Explorer > Side panel",
      ],
    },
  },
  operation_plan_completed: {
    name: "pe144886321_operation_planifiee",
    properties: {
      source: [
        "Header > Nouveau projet",
        "Explorer > Tableau de bord",
        "Explorer > Side panel",
      ],
    },
  },
  operation_launch_started: {
    name: "pe144886321_debut_d_un_appel_d_offre",
    properties: {
      source: [
        "Header > Nouveau projet",
        "Piloter > Tableau de bord",
        "Piloter > Side panel",
        "Explorer > Tableau de bord",
        "Explorer > Side panel",
      ],
    },
  },
  operation_launch_aborted: {
    name: "pe144886321_abandon_d_un_appel_d_offre",
    properties: {
      source: [
        "Header > Nouveau projet",
        "Piloter > Tableau de bord",
        "Piloter > Side panel",
        "Explorer > Tableau de bord",
        "Explorer > Side panel",
      ],
    },
  },
  operation_launch_completed: {
    name: "pe144886321_lancement_d_un_appel_d_offre",
    properties: {
      source: [
        "Header > Nouveau projet",
        "Piloter > Tableau de bord",
        "Piloter > Side panel",
        "Explorer > Tableau de bord",
        "Explorer > Side panel",
      ],
    },
  },
  quote_open: {
    name: "pe144886321_ouverture_d_un_devis_signable",
    properties: {},
  },
  quote_accept: {
    name: "pe144886321_devis_accepte",
    properties: {},
  },
  quote_reject: {
    name: "pe144886321_devis_refuse",
    properties: {},
  },
  right_management_open: {
    name: "pe144886321_consultation_de_la_page_gestion_des_droits",
    properties: {},
  },
  right_management_invite: {
    name: "pe144886321_invitation_de_nouveaux_utilisateurs",
    properties: {},
  },
  right_management_update: {
    name: "pe144886321_modification_des_droits_utilisateurs",
    properties: {},
  },
  funding_started: {
    name: "pe144886321_demande_de_financement_amorcee",
    properties: {},
  },
  funding_aborted: {
    name: "pe144886321_demande_de_financement_abandonnee",
    properties: {},
  },
  funding_completed: {
    name: "pe144886321_demande_de_financement_lancee",
    properties: {},
  },
  contract_negociation_started: {
    name: "pe144886321_demande_de_renegociation_de_contrat_d_energie_",
    properties: {},
  },
  contract_negociation_aborted: {
    name: "pe144886321_demande_de_renegociation_de_contrat_d_energie__v2",
    properties: {},
  },
  contract_negociation_completed: {
    name: "pe144886321_lancement_d_une_renegociation_de_contrat_d_energie",
    properties: {},
  },
} as const;

export type ClientTrackingEventId = keyof typeof CLIENT_TRACKING_EVENTS;

export type TrackingEventProperties<T extends ClientTrackingEventId> =
  (typeof CLIENT_TRACKING_EVENTS)[T]["properties"];

export const CLIENT_TRACKING_EVENTS_IDS = Object.keys(
  CLIENT_TRACKING_EVENTS,
) as [ClientTrackingEventId, ...ClientTrackingEventId[]];

export const BRIEF_PAGE_SOURCE_QUERY_PARAM = "source";

export type BriefPageQueryParams = {
  [BRIEF_PAGE_SOURCE_QUERY_PARAM]?: (typeof CLIENT_TRACKING_EVENTS)["brief_open"]["properties"]["source"][number];
};
