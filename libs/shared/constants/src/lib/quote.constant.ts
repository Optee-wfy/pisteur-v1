export enum QuoteStage {
  PRO_ASSIGNED = "2632767713",
  LEAD_PAYED = "2269458679",
  ORGANISATION_VT = "694626784",
  RECUPERATION_DU_DEVIS = "674210003",
  EN_ATTENTE_DE_SIGNATURE = "712508645",
  DEVIS_SIGNE = "702310850",
  REJET_PRO = "1135917303",
  FERME_PERDU = "712519380",
  ARCHIVE = "698849526",
  //CREATION_ET_ENVOI_DE_LA_PH = "695282417",
  //ATTENTE_COACH_COPRO = "1142188256", // Phase entre "attente de signature" et "devis signé" c'est le moment où un devis est accepté parle client mais pas encore signé car il doit d'abord être validé côté Coach copro
}

export const QUOTE_STAGES = Object.values(QuoteStage) as [
  QuoteStage,
  ...QuoteStage[],
];

export const QUOTE_STAGES_ALLOWED = [
  QuoteStage.EN_ATTENTE_DE_SIGNATURE,
  //QuoteStage.ATTENTE_COACH_COPRO,
  QuoteStage.DEVIS_SIGNE,
  QuoteStage.FERME_PERDU,
] as const;

export type QuoteStageAllowed = (typeof QUOTE_STAGES_ALLOWED)[number];

export enum QuoteRejectReason {
  INSUFFICIENT_BUDGET = "Budget insuffisant",
  BETTER_PRICE_ELSEWHERE = "J'ai trouvé un meilleur tarif ailleurs",
  PROJECT_CANCELLED = "Le projet est annulé",
  LATE_RESPONSE = "Réponse tardive du prestataire",
  OTHER_QUOTE_ACCEPTED = "J'ai accepté un autre devis",
  UNKNOWN = "Raison inconnue.",
}

export const QUOTE_REJECT_REASONS = Object.values(QuoteRejectReason).filter(
  (r) => r !== QuoteRejectReason.UNKNOWN,
);

export const IMPORTED_SIGNED_QUOTE_PREFIX = "[Import_Client] ";
