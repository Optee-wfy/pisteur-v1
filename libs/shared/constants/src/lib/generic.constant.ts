import z from "zod";

export const BEARER_TOKEN_PREFIX = "Bearer";
export const operationsEmail = "operations@optee.io";
export const contactEmail = "contact@optee.io";

export const KWH_RATE = 7000;
export const KWH_PRICE = 0.22; // In euros

export const DEMO_FILE_URL =
  "https://144886321.fs1.hubspotusercontent-eu1.net/hubfs/144886321/quotes/3-2.pdf";

export const VICTOR_CALENDLY =
  "https://meetings-eu1.hubspot.com/victor-giacobbi";
export const ANTOINE_CALENDLY =
  "https://info.optee.io/meetings/antoine-gibeaux";
export const THAIS_CALENDLY = "https://meetings-eu1.hubspot.com/thais-aubriet";
export const ALEXIA_CALENDLY =
  "https://meetings-eu1.hubspot.com/alexia-libouban";

export const SHOWCASE_URL = "https://optee.io";
export const MARKETPLACE_UI_URL = "https://app.optee.io";
export const MARKETPLACE_API_URL = MARKETPLACE_UI_URL + "/api";
export const MARKETPLACE_AUTH_URL = MARKETPLACE_UI_URL + "/auth";

export const SHOWCASE_DEMO_URL = "https://www.optee.io/demo";

export const HUBSPOT_OPERATIONS_URL =
  "https://app-eu1.hubspot.com/contacts/144886321/record/0-3/";

export const CEELAB_ADDRESS =
  "8 rue Notre Dame de \n Lorette 75009 PARIS \n FRANCE";
export const HS_QUOTES_BASE_URL =
  "https://app-eu1.hubspot.com/contacts/144886321/record/2-130955327/";
export const HS_CONTACTS_BASE_URL =
  "https://app-eu1.hubspot.com/contacts/144886321/record/0-1/";

export const SIMULATION_BASE_UUID = "uuid_";

export const CTA = {
  getQuotes: "Obtenir des devis",
  getFunding: "Financer un devis",
  planOperation: "Planifier une opération",
  planThisOperation: "Planifier cette opération",
  plannedOperation: "Opération planifiée",
  negociateContract: "Négocier un contrat",
  alreadyAdded: "Déjà intégrée",
  launchOperation: "Lancer une opération",
  launchThisOperation: "Lancer cette opération",
  launchCallForTender: "Lancer un appel d'offres",
  launchMyCallForTender: "Lancer mon appel d'offres",
  seeThisOperation: "Voir cette opération",
  newProject: "Nouveau projet",
  startThisProject: "Démarrer ce projet",
  chooseProject: "Choisir",
  newOperation: "Nouvelle opération",
  operationsToLaunch: "Opérations en attente de lancement",
  quoteSignature: "Signature du devis",
  updateSignatory: "Modifier le signataire",
  accessToQualifiedProjects: "Accéder à des projets qualifiés",
  makeAnAppointment: "Prendre rendez-vous",
  buyFeatureWithImpactSubscription: `Débloquez cette fonctionnalité en passant à l’abonnement Impact ! Contactez nous sur operations@optee.io`,
  createClientProject: "Vente intelligente",
  proposeClientProject: "Proposer un projet",
  proposeNewClientProject: "Nouveau projet",
};

export const contactSupport = "Merci de contacter notre support.";

export const tryAgainOrContactUs =
  "Merci de réessayer plus tard. Si le problème persiste, contactez notre support.";

export const unknownError = `Erreur inconnue. ${contactSupport}`;

export const missingInformation = `Certaines informations requises sont manquantes. ${contactSupport}`;

export const HTTP_STATUS_MESSAGES: { [key: number]: string } = {
  403: "Accès refusé. Vérifiez vos permissions.",
  404: "Ressource introuvable. Vérifiez l'URL et les identifiants.",
  429: `Trop de requêtes envoyées. ${tryAgainOrContactUs}`,
  500: `Erreur interne du serveur. ${tryAgainOrContactUs}`,
  502: `Service indisponible. ${tryAgainOrContactUs}`,
  503: `Service indisponible. ${tryAgainOrContactUs}`,
};

export type Arcade = {
  id: string;
  label: string;
};

export const ARCADES: [Arcade, ...Arcade[]] = [
  {
    id: "pcTKpp7ovPp3XSo2QZLc",
    label: "Ajoutez vos bâtiments",
  },
  {
    id: "ircutf76KcHhGHQ6Xc0w",
    label: "Analysez le potentiel de rénovation",
  },
  {
    id: "gKS2FzjHBzClIG5cGkGM",
    label: "Structurez vos plans",
  },
  {
    id: "fB2e7wXwNe2UUtzYANWe",
    label: "Lancez des appels d’offres",
  },
  {
    id: "BrUUePiWKZ9FxU9EKRhW",
    label: "Obtenez des financements",
  },
  {
    id: "YpOwKuvXVEtHDKpp1ZVo",
    label: "Voir et analyser les devis",
  },
  {
    id: "hPNnnDpxcws5mlamzn4O",
    label: "Générez des briefs techniques",
  },
  {
    id: "or0jqRsMwho0HqyODvhG",
    label: "Collaborez avec votre équipe",
  },
];

export const numberRangeSchema = z.tuple([z.number(), z.number()]).nullable();
export type NumberRange = z.infer<typeof numberRangeSchema>;

export const dateRangeSchema = z.coerce.date().array().min(1).max(2).nullish();
export type DateRange = z.infer<typeof dateRangeSchema>;
