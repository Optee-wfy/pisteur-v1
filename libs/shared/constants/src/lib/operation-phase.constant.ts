import type { Prettify } from "@optee/utils";
import { z } from "zod";
import { UserType } from "./user.constant";

export type OperationGroupKey =
  | "upcoming"
  | "in_progress"
  | "archived"
  | "invisible";

export enum OperationPipeline {
  PHASE_PROJET = "Phase projet",
  CHIFFRAGE_OFFRES = "Chiffrage et offres",
  OPERATION_EN_COURS = "Opération en cours",
  FINALISATION_CEE = "Finalisation avec CEE",
  FACTURATION = "Facturation",
  ARCHIVAGE = "Archivage",
}

export enum OperationPhaseEnum {
  UPSELL = "1213338842",
  UPSELL_RECOVERED = "1890531575",
  DTG_OPERATION = "3275647202",
  PROJECT_PHASE = "694365148",
  PRE_LAUNCH = "2031421667",
  CSM_PASSATION = "703741912",
  TO_COME = "705801954",
  TO_REQUALIFY = "761117135",
  PRO_SEARCH = "836338411",
  TO_BE_TAKEN_IN_CHARGE = "appointmentscheduled",
  RESERVED_PROJECT = "2673571023",
  ELIGIBILITY_VERIFICATION = "1896500466",
  COMMERCIAL_NEGOTIATION = "689981135",
  WAITING_FOR_COACH_COPRO = "701687530",
  SIGNED_QUOTE = "675694020",
  CLOSED_LOST_BYPASS_PIPELINE = "1467121872",
  LAUNCH_ORGANIZED = "693123278",
  OPERATION_FOLLOW_UP = "693324987",
  WORKS_END = "698025953",
  CONFORMITY_FILE_ATTACHMENTS = "693324995",
  CONFORMITY_FILE_VERIFICATION = "1500858581",
  FILE_REVIEW_BY_DELEGATE = "693570530",
  COFRAC_IN_PROGRESS = "1663340755",
  INVOICING_TO_DELEGATE = "693570531",
  FUNDING_RECEIPT = "693570532",
  PAYMENT_CEE = "1932423400",
  OPERATION_END = "2221683959",
  COMMISSION_TRANSACTION = "693375989",
  AWAITING_COMMISSION_TRANSACTION = "1306715322",
  FINALISATION_ARCHIVING = "697959357",
  ARCHIVED_OPERATION = "697959364",
  CLOSED_LOST = "705701620",
}

export const DEAL_STAGES = Object.values(OperationPhaseEnum) as [
  OperationPhaseEnum,
  ...OperationPhaseEnum[],
];

/**
 * Defines all phases possible for an operation.
 *
 * @see https://docs.google.com/spreadsheets/d/1-adeTUi2thR9qodIPQ0HA5fnlu5R-YG-kZpiisgCdAc/edit?pli=1&gid=1712330812#gid=1712330812
 */
export const OPERATION_PHASES_DATA = [
  {
    visibleInApp: false,
    isLaunchable: false,
    enum: OperationPhaseEnum.UPSELL,
  },

  {
    visibleInApp: false,
    isLaunchable: false,
    enum: OperationPhaseEnum.UPSELL_RECOVERED,
  },

  {
    visibleInApp: false,
    isLaunchable: false,
    enum: OperationPhaseEnum.DTG_OPERATION,
  },

  {
    visibleInApp: true,
    isLaunchable: true,
    pipeline: OperationPipeline.PHASE_PROJET,
    enum: OperationPhaseEnum.PROJECT_PHASE,
    clientInfos: {
      category: "upcoming",
      label: "⏳ Opération prévue",
      badge: "green",
      description:
        "Cette solution est recommandée pour améliorer la performance énergétique ou structurelle de votre bâtiment.",
    },
    proInfos: {
      category: "upcoming",
      label: "📩 Devis reçu", // it's "Devis reçu" by default but the display should be updated accordingly to the presence of a quote ("Devis à fournir" => WAITING_FOR_QUOTE_LABEL if the quote is missing)
      badge: "green",
      description:
        "Opération déclarée par un client, mais dont l’appel d’offres n’a pas encore été lancé.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.CHIFFRAGE_OFFRES,
    enum: OperationPhaseEnum.PRE_LAUNCH,
    clientInfos: {
      category: "in_progress",
      label: "📩 Appel d’offres lancé",
      badge: "yellow",
      description:
        "L’opération doit d’abord être validée par l’équipe Optee avant que les professionnels puissent soumettre leurs devis.",
    },
    proInfos: {
      category: "invisible",
      label: "📩 Appel d’offres en préparation",
      badge: "green",
      description:
        "L’opération doit d’abord être validée par l’équipe Optee avant que les professionnels puissent soumettre leurs devis.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.CHIFFRAGE_OFFRES,
    enum: OperationPhaseEnum.CSM_PASSATION,
    clientInfos: {
      category: "in_progress",
      label: "📩 Appel d’offres lancé",
      badge: "green",
      description:
        "Les entreprises sont en train de répondre à l’appel d’offres. Vous recevrez des demandes de visite technique ou des devis dans les prochains jours.",
    },
    proInfos: {
      category: "upcoming",
      label: "📩 Devis reçu",
      badge: "green",
      description:
        "Opération lancée par un client et ouverte à un appel d’offres.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.CHIFFRAGE_OFFRES,
    enum: OperationPhaseEnum.TO_COME,
    clientInfos: {
      category: "in_progress",
      badge: "green",
      label: "📩 Appel d’offres lancé",
      description:
        "L'appel d'offres pour cette opération est planifié mais n’a pas encore été lancé. Vous pouvez encore ajuster le périmètre si besoin.",
    },
    proInfos: {
      category: "upcoming",
      label: "📩 Devis reçu",
      badge: "green",
      description: "L’appel d’offres va bientôt être lancé par le client.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.CHIFFRAGE_OFFRES,
    enum: OperationPhaseEnum.TO_REQUALIFY,
    clientInfos: {
      category: "in_progress",
      label: "⚠️ Projet bloqué",
      badge: "red",
      description:
        "Le processus est temporairement arrêté. Veuillez nous contacter pour débloquer la situation ou ajuster le projet.",
    },
    proInfos: {
      category: "upcoming",
      label: "⚠️ Projet bloqué",
      badge: "red",
      description: "L’appel d’offres est temporairement suspendu.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.CHIFFRAGE_OFFRES,
    enum: OperationPhaseEnum.PRO_SEARCH,
    clientInfos: {
      category: "in_progress",
      label: "📩 Appel d’offres lancé",
      badge: "green",
      description:
        "Nous collectons les offres des entreprises partenaires. Vous serez notifié dès qu’un devis sera disponible.",
    },
    proInfos: {
      category: "upcoming",
      label: "📩 Devis reçu",
      badge: "green",
      description:
        "Opération lancée par un client et ouverte à un appel d’offres.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.CHIFFRAGE_OFFRES,
    enum: OperationPhaseEnum.TO_BE_TAKEN_IN_CHARGE,
    clientInfos: {
      category: "in_progress",
      label: "📩 Appel d’offres lancé",
      badge: "green",
      description:
        "Nous collectons les offres des entreprises partenaires. Vous serez notifié dès qu’un devis sera disponible.",
    },
    proInfos: {
      category: "upcoming",
      label: "📩 Devis reçu",
      badge: "green",
      description:
        "Opération lancée par un client et ouverte à un appel d’offres.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.CHIFFRAGE_OFFRES,
    enum: OperationPhaseEnum.RESERVED_PROJECT,
    clientInfos: {
      category: "in_progress",
      label: "📩 Appel d’offres lancé",
      badge: "green",
      description: "opération réservée",
    },
    proInfos: {
      category: "upcoming",
      label: "📩 Devis reçu",
      badge: "green",
      description: "L’opération est réservée.",
    },
  },

  // {
  //   visibleInApp: true,
  //   isLaunchable: false,
  //   pipeline: OperationPipeline.CHIFFRAGE_OFFRES,
  //   enum: OperationPhaseEnum.ELIGIBILITY_VERIFICATION,
  //   clientInfos: {
  //     category: "in_progress",
  //     label: "📩 Appel d’offres lancé",
  //     badge: "green",
  //     description: "Nous vérifions l'éligibilité de CEE de votre devis",
  //   },
  //   proInfos: {
  //     category: "upcoming",
  //     label: "📝 Réponse envoyée",
  //     badge: "green",
  //     description:
  //       "L’éligibilité du devis aux CEE est en cours de vérification.",
  //   },
  // },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.CHIFFRAGE_OFFRES,
    enum: OperationPhaseEnum.COMMERCIAL_NEGOTIATION,
    clientInfos: {
      category: "in_progress",
      label: "✅ Offre(s) reçue(s)",
      badge: "yellow",
      description:
        "Le devis vous a été transmis. La validation est en attente pour pouvoir démarrer les travaux.",
    },
    proInfos: {
      category: "upcoming",
      label: "🟡 En attente de retour client",
      badge: "green",
      description:
        "Le client analyse les devis reçus et finalisera bientôt son choix.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.CHIFFRAGE_OFFRES,
    enum: OperationPhaseEnum.WAITING_FOR_COACH_COPRO,
    clientInfos: {
      category: "in_progress",
      label: "✍️ Devis à valider",
      badge: "yellow",
      description: "En attente de validation du devis",
    },
    proInfos: {
      category: "upcoming",
      label: "🟡 En attente de retour client",
      badge: "green",
      description: "Contrôle du devis en cours.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.CHIFFRAGE_OFFRES,
    enum: OperationPhaseEnum.SIGNED_QUOTE,
    clientInfos: {
      category: "in_progress",
      label: "✅ Devis accepté",
      badge: "green",
      description:
        "Vous avez validé le devis. Nous allons organiser le lancement de l’opération avec l’entreprise.",
    },
    proInfos: {
      category: "in_progress",
      label: "✅ Devis accepté",
      badge: "green",
      description:
        "Votre devis a été accepté, préparation du lancement en cours.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.CHIFFRAGE_OFFRES,
    enum: OperationPhaseEnum.CLOSED_LOST_BYPASS_PIPELINE,
    clientInfos: {
      category: "archived",
      label: "📁 Opération annulée",
      badge: "red",
      description:
        "L’opération a été annulée. Aucune suite ne sera engagée pour ce projet.",
    },
    proInfos: {
      category: "archived",
      label: "📁 Opération annulée",
      badge: "red",
      description:
        "L’opération a été annulée. Aucune suite ne sera engagée pour ce projet.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.OPERATION_EN_COURS,
    enum: OperationPhaseEnum.LAUNCH_ORGANIZED,
    clientInfos: {
      category: "in_progress",
      label: "🚧 Démarrage des travaux",
      badge: "green",
      description:
        "L’opération a été lancée. Les travaux vont bientôt commencer.",
    },
    proInfos: {
      category: "in_progress",
      label: "🚧 Démarrage des travaux",
      badge: "green",
      description:
        "L’opération a été lancée. Les travaux vont bientôt commencer.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.OPERATION_EN_COURS,
    enum: OperationPhaseEnum.OPERATION_FOLLOW_UP,
    clientInfos: {
      category: "in_progress",
      label: "🚧 Travaux en cours",
      badge: "green",
      description: "Les travaux ont commencé.",
    },
    proInfos: {
      category: "in_progress",
      label: "🚧 Travaux en cours",
      badge: "green",
      description: "Les travaux ont commencé.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.OPERATION_EN_COURS,
    enum: OperationPhaseEnum.WORKS_END,
    clientInfos: {
      category: "in_progress",
      label: "🏁 Fin des travaux",
      badge: "green",
      description: "Les travaux sont terminés.",
    },
    proInfos: {
      category: "in_progress",
      label: "🏁 Fin des travaux",
      badge: "green",
      description: "Les travaux sont terminés.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.FINALISATION_CEE,
    enum: OperationPhaseEnum.CONFORMITY_FILE_ATTACHMENTS,
    clientInfos: {
      category: "in_progress",
      label: "📂 Traitement des aides",
      badge: "yellow",
      description: "Traitement du dossier de conformité en cours.",
    },
    proInfos: {
      category: "in_progress",
      label: "📂 Traitement des aides",
      badge: "yellow",
      description: "Traitement du dossier de conformité en cours.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.FINALISATION_CEE,
    enum: OperationPhaseEnum.CONFORMITY_FILE_VERIFICATION,
    clientInfos: {
      category: "in_progress",
      label: "📂 Traitement des aides",
      badge: "yellow",
      description: "Traitement du dossier de conformité en cours.",
    },
    proInfos: {
      category: "in_progress",
      label: "📂 Traitement des aides",
      badge: "yellow",
      description: "Traitement du dossier de conformité en cours.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.FINALISATION_CEE,
    enum: OperationPhaseEnum.FILE_REVIEW_BY_DELEGATE,
    clientInfos: {
      category: "in_progress",
      label: "📂 Traitement des aides",
      badge: "yellow",
      description: "Traitement du dossier de conformité en cours.",
    },
    proInfos: {
      category: "in_progress",
      label: "📂 Traitement des aides",
      badge: "yellow",
      description: "Traitement du dossier de conformité en cours.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.FINALISATION_CEE,
    enum: OperationPhaseEnum.COFRAC_IN_PROGRESS,
    clientInfos: {
      category: "in_progress",
      label: "📂 Traitement des aides",
      badge: "yellow",
      description: "Traitement du dossier de conformité en cours.",
    },
    proInfos: {
      category: "in_progress",
      label: "📂 Traitement des aides",
      badge: "yellow",
      description: "Traitement du dossier de conformité en cours.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.FINALISATION_CEE,
    enum: OperationPhaseEnum.INVOICING_TO_DELEGATE,
    clientInfos: {
      category: "in_progress",
      label: "📂 Traitement des aides",
      badge: "yellow",
      description: "Traitement du dossier de conformité en cours.",
    },
    proInfos: {
      category: "in_progress",
      label: "📂 Traitement des aides",
      badge: "yellow",
      description: "Traitement du dossier de conformité en cours.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.FINALISATION_CEE,
    enum: OperationPhaseEnum.FUNDING_RECEIPT,
    clientInfos: {
      category: "in_progress",
      label: "📂 Traitement des aides",
      badge: "yellow",
      description: "Traitement du dossier de conformité en cours.",
    },
    proInfos: {
      category: "in_progress",
      label: "📂 Traitement des aides",
      badge: "yellow",
      description: "Traitement du dossier de conformité en cours.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.FINALISATION_CEE,
    enum: OperationPhaseEnum.PAYMENT_CEE,
    clientInfos: {
      category: "in_progress",
      label: "📂 Traitement des aides",
      badge: "yellow",
      description: "Traitement du dossier de conformité en cours.",
    },
    proInfos: {
      category: "in_progress",
      label: "📂 Traitement des aides",
      badge: "yellow",
      description: "Traitement du dossier de conformité en cours.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.OPERATION_EN_COURS,
    enum: OperationPhaseEnum.OPERATION_END,
    clientInfos: {
      category: "in_progress",
      label: "🏁 Fin des travaux",
      badge: "green",
      description: "Fin des travaux. Vous allez bientôt recevoir la facture.",
    },
    proInfos: {
      category: "in_progress",
      label: "📩 Facture à envoyer",
      badge: "yellow",
      description: "Fin des travaux. La facture doit être envoyée au client.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.FACTURATION,
    enum: OperationPhaseEnum.COMMISSION_TRANSACTION,
    clientInfos: {
      category: "in_progress",
      label: "🏁 Fin des travaux",
      badge: "green",
      description: "Fin des travaux. Vous allez bientôt recevoir la facture.",
    },
    proInfos: {
      category: "in_progress",
      label: "📩 Facture à envoyer",
      badge: "yellow",
      description: "Fin des travaux. La facture doit être envoyée au client.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.FACTURATION,
    enum: OperationPhaseEnum.AWAITING_COMMISSION_TRANSACTION,
    clientInfos: {
      category: "archived",
      label: "🏁 Fin des travaux",
      badge: "green",
      description:
        "L’opération est achevée. Vous pouvez consulter les documents de fin de mission dans l’interface.",
    },
    proInfos: {
      category: "in_progress",
      label: "🔴 Commission à payer",
      badge: "yellow",
      description: "En attente du règlement de la commission Optee.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.FACTURATION,
    enum: OperationPhaseEnum.FINALISATION_ARCHIVING,
    clientInfos: {
      category: "archived",
      label: "✅ Projet clôturé",
      badge: "green",
      description:
        "L’opération est achevée. Vous pouvez consulter les documents de fin de mission dans l’interface.",
    },
    proInfos: {
      category: "archived",
      label: "✅ Projet clôturé",
      badge: "green",
      description: "L’opération est terminée. Aucune action n’est requise.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.ARCHIVAGE,
    enum: OperationPhaseEnum.ARCHIVED_OPERATION,
    clientInfos: {
      category: "archived",
      label: "✅ Projet clôturé",
      badge: "green",
      description:
        "L’opération est achevée. Vous pouvez consulter les documents de fin de mission dans l’interface.",
    },
    proInfos: {
      category: "archived",
      label: "✅ Projet clôturé",
      badge: "green",
      description: "L’opération est terminée. Aucune action n’est requise.",
    },
  },

  {
    visibleInApp: true,
    isLaunchable: false,
    pipeline: OperationPipeline.ARCHIVAGE,
    enum: OperationPhaseEnum.CLOSED_LOST,
    clientInfos: {
      category: "archived",
      label: "📁 Archivé",
      badge: "red",
      description:
        "L’opération a été annulée. Aucune suite ne sera engagée pour ce projet.",
    },
    proInfos: {
      category: "archived",
      label: "📁 Archivé",
      badge: "red",
      description:
        "L’opération a été annulée. Aucune suite ne sera engagée pour ce projet.",
    },
  },
] as const;

type OperationPhaseBase = {
  enum: OperationPhaseEnum;
};

const CLIENT_OPERATIONS_PHASES = OPERATION_PHASES_DATA.filter(
  (op) => "clientInfos" in op,
);

export type OperationPhaseLabelClient =
  (typeof CLIENT_OPERATIONS_PHASES)[number]["clientInfos"]["label"];

export const OPERATION_PHASES_LABELS_CLIENT = [
  ...new Set(CLIENT_OPERATIONS_PHASES.map((op) => op.clientInfos.label)),
] as [OperationPhaseLabelClient, ...OperationPhaseLabelClient[]];

export const OperationPhaseLabelClientSchema = z.enum(
  OPERATION_PHASES_LABELS_CLIENT,
);

const PRO_OPERATIONS_PHASES = OPERATION_PHASES_DATA.filter(
  (op) => "proInfos" in op,
);

export type OperationPhaseLabelPro =
  (typeof PRO_OPERATIONS_PHASES)[number]["proInfos"]["label"];

export const OPERATION_PHASES_LABELS_PRO = [
  ...new Set(
    PRO_OPERATIONS_PHASES.filter(
      (op) => op.proInfos?.category !== "invisible",
    ).map((op) => op.proInfos.label),
  ),
] as [OperationPhaseLabelPro, ...OperationPhaseLabelPro[]];

export const WAITING_FOR_QUOTE_LABEL =
  "📩 Devis à fournir" as OperationPhaseLabelPro;

export const OperationPhaseLabelProSchema = z.enum(OPERATION_PHASES_LABELS_PRO);

export type OperationPhaseLabel =
  | OperationPhaseLabelClient
  | OperationPhaseLabelPro;

export type PhaseInformation = {
  description: string;
  badge: "green" | "yellow" | "red";
  category: OperationGroupKey;
};

export type PhaseInformationPro = PhaseInformation & {
  label: OperationPhaseLabelPro;
};

export type PhaseInformationClient = PhaseInformation & {
  label: OperationPhaseLabelClient;
};

type VisibleOperationPhase = OperationPhaseBase & {
  visibleInApp: true;
  isLaunchable: boolean;
  pipeline: OperationPipeline;
  clientInfos: PhaseInformationClient;
  proInfos: PhaseInformationPro; // ProInfos is not defined until "Passation CSM" because it is not visible in the app since no quotes are linked yet
};

type HiddenOperationPhase = OperationPhaseBase & {
  visibleInApp: false;
  isLaunchable: false;
  category?: undefined;
  pipeline?: undefined;
  clientInfos?: undefined;
  proInfos?: undefined;
};

type OperationPhase = VisibleOperationPhase | HiddenOperationPhase;

const VISIBLE_OPERATION_PHASES = OPERATION_PHASES_DATA.filter(
  (phase) => phase.visibleInApp,
);

export const OPERATION_PHASES_ALLOWED_IN_APP = VISIBLE_OPERATION_PHASES.map(
  (phase) => phase.enum,
);

export const OPERATION_PHASES_CLIENT_IN_PROGRESS_OR_UPCOMING =
  VISIBLE_OPERATION_PHASES.filter(
    (phase) =>
      phase.clientInfos.category === "in_progress" ||
      phase.clientInfos.category === "upcoming",
  ).map((phase) => phase.enum.valueOf());

// Helper function to get the label from a an operation phase
const getOperationLabelFromPhase = (
  phase: (typeof VISIBLE_OPERATION_PHASES)[number],
  userType: UserType,
) => {
  if (userType === UserType.PRO && "proInfos" in phase) {
    return phase.proInfos?.label;
  }
  if (userType === UserType.CLIENT && "clientInfos" in phase) {
    return phase.clientInfos?.label;
  }
  return null;
};

function findWeight(
  label: OperationPhaseLabelPro | OperationPhaseLabelClient,
  userType: UserType,
) {
  // Special rules for specific labels
  if (label === "📁 Opération annulée") {
    return Number.MAX_SAFE_INTEGER;
  }
  if (label === "⚠️ Projet bloqué") {
    return Number.MAX_SAFE_INTEGER - 1;
  }

  if (label === WAITING_FOR_QUOTE_LABEL) {
    return 0;
  }

  // We need to find the index of the label in the operation phases
  const phaseOpIndex = VISIBLE_OPERATION_PHASES.findIndex(
    (p) => getOperationLabelFromPhase(p, userType) === label,
  );

  if (phaseOpIndex === -1) {
    console.error(`🚩 Libellé « ${label} » non reconnu.`);
    return Number.MAX_SAFE_INTEGER - 2;
  }
  return phaseOpIndex;
}

export const findWeightPro = (label: OperationPhaseLabelPro) =>
  findWeight(label, UserType.PRO);

export const findWeightClient = (label: OperationPhaseLabelClient) =>
  findWeight(label, UserType.CLIENT);

/**
 * Represents the information about an operation phase, either with explicit phase information
 * or indicating it depends on an invoice stage to determine its status.
 */
export type OperationPhaseInfos = Prettify<
  Pick<
    VisibleOperationPhase,
    "enum" | "isLaunchable" | "pipeline" | "visibleInApp"
  > &
    (PhaseInformationPro | PhaseInformationClient)
>;

export const getOperationPhaseFromEnum = (
  phaseEnum: OperationPhaseEnum,
  userType = UserType.CLIENT,
): OperationPhaseInfos => {
  const phaseData: OperationPhase | undefined = [...OPERATION_PHASES_DATA].find(
    (p) => p.enum === phaseEnum,
  );

  if (!phaseData) {
    throw new Error(`Aucune phase trouvée pour l'identifiant ${phaseEnum}`);
  }

  if (userType === UserType.ADMIN) {
    throw new Error(
      "Pour les admins, appelez `getOperationPhaseFromEnumForAdmin()` a la place",
    );
  }

  if (userType === UserType.CLIENT) {
    if (!phaseData.clientInfos) {
      throw new Error(
        `Aucune information de phase client trouvée pour l'identifiant ${phaseEnum}`,
      );
    }

    return {
      ...phaseData,
      ...phaseData.clientInfos,
    };
  } else if (userType === UserType.PRO) {
    if (!phaseData.proInfos) {
      throw new Error(
        `Aucune information de phase professionnelle trouvée pour l'identifiant ${phaseEnum}`,
      );
    }

    return {
      ...phaseData,
      ...phaseData.proInfos,
    };
  }
  throw new Error(`No user type found for ${userType}`);
};

export const getOperationPhaseFromEnumForAdmin = (
  phaseEnum: OperationPhaseEnum,
) => {
  const phaseData = OPERATION_PHASES_DATA.find((p) => p.enum === phaseEnum);

  if (!phaseData) {
    throw new Error(`No phase found for ${phaseEnum}`);
  }
  return phaseData;
};
