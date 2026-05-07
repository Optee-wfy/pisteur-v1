import { z } from "zod";
import { UserType } from "./user.constant";

export enum InvoiceStage {
  DEPOSIT_INVOICE_TO_RECOVER = "2151961797",
  DEPOSIT_PROVISION_CALL_TO_SEND = "2151961798",
  DEPOSIT_WAITING_FOR_CLIENT_PAYMENT = "2151600352",
  DEPOSIT_PRO_PAYMENT = "2151600353",
  DEPOSIT_OPERATION_LAUNCH = "2151600354",
  DEPOSIT_OPERATION_LAUNCH_BLOCKED = "2151600355",
  DEPOSIT_OPERATION_LAUNCH_ORGANIZED = "2151600356",
  DEPOSIT_OPERATION_FOLLOW_UP = "2151600357",
  DEPOSIT_OPERATION_END = "2151600358",
  FINAL_INVOICE_TO_RECOVER = "2151600359",
  FINAL_INVOICE_PROVISION_CALL_TO_SEND = "2151600360",
  FINAL_INVOICE_WAITING_FOR_CLIENT = "2151600361",
  FINAL_INVOICE_PRO_PAYMENT = "2151600362",
  FINAL_INVOICE_SENT = "2151600363",
  FINAL_INVOICE_OPERATION_END = "2484244729",
  OPERATION_END = "2528054478",
}

export const INVOICE_STAGES = Object.values(InvoiceStage) as [
  InvoiceStage,
  ...InvoiceStage[],
];

export const INVOICE_PHASES_LABELS_CLIENT = [
  "🧾 Lancement administratif",
  "🔴 Acompte à payer",
  "🚧 Travaux en cours",
  "🔴 Solde à payer",
  "🏁 Fin des travaux",
] as const;
export const InvoicePhaseLabelClientSchema = z.enum(
  INVOICE_PHASES_LABELS_CLIENT,
);
export type InvoicePhaseLabelClient = z.infer<
  typeof InvoicePhaseLabelClientSchema
>;

export const INVOICE_PHASES_LABELS_PRO = [
  "🔴 Facture à envoyer",
  "🟡 En attente paiement client",
  "🟢 Opération à lancer",
  "🚧 Travaux en cours",
  "📂 Traitement des aides",
  "✅ Paiement effectué",
  "🔴 Commission à payer",
  "🏁 Fin des travaux",
] as const;
export const InvoicePhaseLabelProSchema = z.enum(INVOICE_PHASES_LABELS_PRO);
export type InvoicePhaseLabelPro = z.infer<typeof InvoicePhaseLabelProSchema>;

export type InvoicePhaseLabel = InvoicePhaseLabelClient | InvoicePhaseLabelPro;

export type InvoicePhaseInformation = {
  description: string;
  badge: "green" | "yellow" | "red";
};

export type InvoicePhaseInformationPro = InvoicePhaseInformation & {
  label: InvoicePhaseLabelPro;
};

export type InvoicePhaseInformationClient = InvoicePhaseInformation & {
  label: InvoicePhaseLabelClient;
};

export type InvoiceStageHydrated = {
  enum: InvoiceStage;
  clientInfos: InvoicePhaseInformationClient;
  proInfos: InvoicePhaseInformationPro;
};

/**
 * Defines all phases possible for an invoice.
 * @see https://docs.google.com/spreadsheets/d/1-adeTUi2thR9qodIPQ0HA5fnlu5R-YG-kZpiisgCdAc/edit?pli=1&gid=1466351019#gid=1466351019
 */
export const INVOICE_PHASES_DATA: InvoiceStageHydrated[] = [
  {
    enum: InvoiceStage.DEPOSIT_INVOICE_TO_RECOVER,
    clientInfos: {
      label: "🧾 Lancement administratif",
      description: "Lancement administratif",
      badge: "green",
    },
    proInfos: {
      label: "🔴 Facture à envoyer",
      description: "Facture à envoyer au client",
      badge: "yellow",
    },
  },

  {
    enum: InvoiceStage.DEPOSIT_PROVISION_CALL_TO_SEND,
    clientInfos: {
      label: "🧾 Lancement administratif",
      description: "Lancement administratif",
      badge: "yellow",
    },
    proInfos: {
      label: "🟡 En attente paiement client",
      description: "En attente du paiement de l'acompte par le client",
      badge: "green",
    },
  },

  {
    enum: InvoiceStage.DEPOSIT_WAITING_FOR_CLIENT_PAYMENT,
    clientInfos: {
      label: "🔴 Acompte à payer",
      description: "Acompte à payer",
      badge: "yellow",
    },
    proInfos: {
      label: "🟡 En attente paiement client",
      description:
        "En attente du paiement de l'acompte par le client. Vous pouvez relancer le client.",
      badge: "green",
    },
  },

  {
    enum: InvoiceStage.DEPOSIT_PRO_PAYMENT,
    clientInfos: {
      label: "🚧 Travaux en cours",
      description: "Travaux en cours",
      badge: "green",
    },
    proInfos: {
      label: "🟢 Opération à lancer",
      description: "Lancement de l'opération",
      badge: "green",
    },
  },

  {
    enum: InvoiceStage.DEPOSIT_OPERATION_LAUNCH,
    clientInfos: {
      label: "🚧 Travaux en cours",
      description: "Travaux en cours",
      badge: "green",
    },
    proInfos: {
      label: "🟢 Opération à lancer",
      description: "Lancement de l'opération",
      badge: "green",
    },
  },

  {
    enum: InvoiceStage.DEPOSIT_OPERATION_LAUNCH_BLOCKED,
    clientInfos: {
      label: "🚧 Travaux en cours",
      description: "Travaux en cours",
      badge: "red",
    },
    proInfos: {
      label: "🟢 Opération à lancer",
      description:
        "Lancement de l'opération bloqué. Vous devez relancer le client.",
      badge: "red",
    },
  },

  {
    enum: InvoiceStage.DEPOSIT_OPERATION_LAUNCH_ORGANIZED,
    clientInfos: {
      label: "🚧 Travaux en cours",
      description: "Travaux en cours",
      badge: "green",
    },
    proInfos: {
      label: "🚧 Travaux en cours",
      description: "Opération lancée.",
      badge: "green",
    },
  },

  {
    enum: InvoiceStage.DEPOSIT_OPERATION_FOLLOW_UP,
    clientInfos: {
      label: "🚧 Travaux en cours",
      description: "Travaux en cours",
      badge: "green",
    },
    proInfos: {
      label: "🚧 Travaux en cours",
      description: "Opération lancée.",
      badge: "green",
    },
  },

  {
    enum: InvoiceStage.DEPOSIT_OPERATION_END,
    clientInfos: {
      label: "🚧 Travaux en cours",
      description:
        "Fin des travaux. Vous pouvez demander le paiement du solde au client.",
      badge: "green",
    },
    proInfos: {
      label: "🚧 Travaux en cours",
      description: "Opération lancée.",
      badge: "green",
    },
  },

  {
    enum: InvoiceStage.FINAL_INVOICE_TO_RECOVER,
    clientInfos: {
      label: "🔴 Solde à payer",
      description:
        "Solde à payer. Vous pouvez demander le paiement du solde au client.",
      badge: "yellow",
    },
    proInfos: {
      label: "🔴 Facture à envoyer",
      description: "Facture à envoyer au client",
      badge: "yellow",
    },
  },

  {
    enum: InvoiceStage.FINAL_INVOICE_PROVISION_CALL_TO_SEND,
    clientInfos: {
      label: "🔴 Solde à payer",
      description:
        "Solde à payer. Vous pouvez demander le paiement du solde au client.",
      badge: "yellow",
    },
    proInfos: {
      label: "🟡 En attente paiement client",
      description: "En attente du paiement de l'acompte par le client",
      badge: "green",
    },
  },

  {
    enum: InvoiceStage.FINAL_INVOICE_WAITING_FOR_CLIENT,
    clientInfos: {
      label: "🔴 Solde à payer",
      description:
        "Solde à payer. Vous pouvez demander le paiement du solde au client.",
      badge: "yellow",
    },
    proInfos: {
      label: "🟡 En attente paiement client",
      description: "En attente du paiement de l'acompte par le client",
      badge: "green",
    },
  },

  {
    enum: InvoiceStage.FINAL_INVOICE_PRO_PAYMENT,
    clientInfos: {
      label: "🏁 Fin des travaux",
      description: "Fin des travaux",
      badge: "green",
    },
    proInfos: {
      label: "✅ Paiement effectué",
      description: "Paiement effectué",
      badge: "green",
    },
  },

  {
    enum: InvoiceStage.FINAL_INVOICE_SENT,
    clientInfos: {
      label: "🏁 Fin des travaux",
      description: "Fin des travaux",
      badge: "green",
    },
    proInfos: {
      label: "🔴 Commission à payer",
      description:
        "Commission à payer. Vous devez payer la commission à Optee.",
      badge: "red",
    },
  },

  {
    enum: InvoiceStage.FINAL_INVOICE_OPERATION_END,
    clientInfos: {
      label: "🏁 Fin des travaux",
      description: "Fin des travaux",
      badge: "green",
    },
    proInfos: {
      label: "🏁 Fin des travaux",
      description: "Paiement effectué",
      badge: "green",
    },
  },

  {
    enum: InvoiceStage.OPERATION_END,
    clientInfos: {
      label: "🏁 Fin des travaux",
      description: "Fin des travaux",
      badge: "green",
    },
    proInfos: {
      label: "🏁 Fin des travaux",
      description: "Paiement effectué",
      badge: "green",
    },
  },
];

export const getInvoicePhase = (
  phaseId: InvoiceStage | null,
  userType: UserType = UserType.CLIENT,
) => {
  const phaseData = INVOICE_PHASES_DATA.find((p) => p.enum === phaseId);

  if (!phaseData) {
    throw new Error(`No phase found for ${phaseId}`);
  }

  if (userType === UserType.CLIENT) {
    if (!phaseData.clientInfos) {
      throw new Error(`No client infos found for ${phaseId}`);
    }
    return {
      ...phaseData,
      ...phaseData.clientInfos,
    };
  }
  if (!phaseData.proInfos) {
    throw new Error(`No pro infos found for ${phaseId}`);
  }

  return {
    ...phaseData,
    ...phaseData.proInfos,
  };
};
