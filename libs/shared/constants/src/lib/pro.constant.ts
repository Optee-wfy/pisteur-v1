import { PUBLIC_ASSETS, type PublicAssetPath } from "./assets.constant";
import { OperationPhaseEnum } from "./operation-phase.constant";
import type {
  OperationHubspotCategory,
  OperationHubspotPrestationId,
} from "./operation.constant";
import {
  getPrestationsParentCategories,
  OPERATION_TYPES_ARR,
} from "./operation.constant";
import type { YouSignLocation } from "./yousign.constant";

export const PRO_FILES_METADATA = [
  {
    label: "rib",
    title: "Relevé d’identité bancaire",
    subtitle: null,
    required: true,
    multiple: false,
    hasModel: false,
  },
  {
    label: "kbis",
    title: "Kbis de moins de 3 mois",
    subtitle: null,
    required: true,
    multiple: false,
    hasModel: false,
  },
  {
    label: "statuts",
    title: "Statuts de l'entreprise",
    subtitle: "Les statuts doivent obligatoirement être signés",
    required: true,
    multiple: false,
    hasModel: false,
  },
  {
    label: "id-dirigeant",
    title: "Document d’identité du/des gérant(s)",
    subtitle:
      "Pour toutes les personnes possédant +25% des parts de l’entreprise",
    required: true,
    multiple: false,
    hasModel: false,
  },
  {
    label: "dbe-s-1",
    title: "Déclaration bénéficiaire effectif (DBE-S-1)",
    subtitle: "Document relatif au bénéficiaire effectif d’une société",
    required: true,
    multiple: false,
    hasModel: true,
  },
  {
    label: "dbe-s-2",
    title: "Déclaration annexe bénéficiaire effectif (DBE-S-2) (facultatif)",
    subtitle: "Autre bénéficiaire possédant au moins 25% de l’entreprise",
    required: false,
    multiple: false,
    hasModel: true,
  },
  {
    label: "assurances",
    title: "Assurances décennales (facultatif)",
    subtitle: null,
    required: false,
    multiple: false,
    hasModel: false,
  },
  {
    label: "autres",
    title: "Autres documents (facultatif)",
    subtitle: "Documents spécifiques à la catégorie de travaux choisie",
    required: false,
    multiple: true,
    hasModel: false,
  },
] as const;

export function determineDocumentType(
  fileName: string,
): ProFileMetadataLabel | null {
  if (fileName.startsWith("Autres - ")) {
    return "autres";
  }

  // Otherwise, find the metadata that has this label
  const found = PRO_FILES_METADATA.find((meta) => meta.label === fileName);
  return found?.label ?? null;
}

export const PRO_WITH_CEE_FILES_METADATA = [
  ...PRO_FILES_METADATA,
  {
    label: "rge",
    title: "Certifications RGE",
    subtitle: "Certificats liés aux opérations que vous prenez en charge",
    required: true,
    multiple: false,
    hasModel: false,
  },
] as const;
export type ProFileMetadata = (typeof PRO_WITH_CEE_FILES_METADATA)[number];

export type ProFileMetadataLabel = ProFileMetadata["label"];
export const PRO_FILES_METADATA_LABELS = PRO_WITH_CEE_FILES_METADATA.map(
  (metadata) => metadata.label,
) as [ProFileMetadataLabel, ...ProFileMetadataLabel[]];

export const REQUIRED_FILES_LABELS = PRO_WITH_CEE_FILES_METADATA.filter(
  (metadata) => metadata.required,
).map((metadata) => metadata.label) as [
  ProFileMetadataLabel,
  ...ProFileMetadataLabel[],
];

export const PRO_STATUSES = [
  "Invitation envoyée",
  "Onboarding plateforme",
  "inscription_plateforme_autonome",
  "En attente de signature plateforme",
  "Compte en attente de validation",
  "Actif",
  "Inactif",
  "Out",
] as const;
export type ProStatus = (typeof PRO_STATUSES)[number];

export const ADMIN_PRO_SORT_FIELDS = [
  "activeSubscription",
  "remainingCredits",
  "lastNonOpteeSignInAt",
] as const;
export type AdminProSortField = (typeof ADMIN_PRO_SORT_FIELDS)[number];

export const ADMIN_PRO_SUBSCRIPTION_ACTIVITY_FILTERS = [
  "active",
  "inactive",
] as const;
export type AdminProSubscriptionActivityFilter =
  (typeof ADMIN_PRO_SUBSCRIPTION_ACTIVITY_FILTERS)[number];

export type ContractType = "partnership" | "cee";

export type ProContract = {
  documentName: string;
  cee: boolean;
  id: ContractType;
  file: PublicAssetPath;
  signaturePosition: YouSignLocation;
  fields: (
    pro: {
      name: string | null;
      rcsLocation: string | null;
      siren: string | null;
      street: string | null;
      zipcode: string | null;
      city: string | null;
      capital: number | null;
      prestations: string | null;
    },
    contact: {
      firstName: string | null;
      lastName: string | null;
      jobTitle: string | null;
      email: string | null;
    },
  ) => {
    text: string | null;
    position: YouSignLocation;
  }[];
};

export const PRO_CONTRACTS: ProContract[] = [
  {
    documentName: "Contrat de Partenariat - Certificat d'économie d'énergie",
    cee: true,
    id: "partnership",
    file: PUBLIC_ASSETS.PDF_CONTRACTS_PARTNERSHIP_CEE,
    signaturePosition: {
      page: 13,
      width: 251,
      height: 70,
      x: 64,
      y: 551,
    },
    fields(
      pro,
      contact,
    ): {
      text: string | null;
      position: YouSignLocation;
    }[] {
      return [
        {
          text: pro.name,
          position: {
            page: 1,
            width: 363,
            height: 24,
            x: 165,
            y: 351,
          },
        },
        {
          text: pro.rcsLocation,
          position: {
            page: 1,
            width: 310,
            height: 24,
            x: 232,
            y: 381,
          },
        },
        {
          text: pro.siren,
          position: {
            page: 1,
            width: 370,
            height: 24,
            x: 157,
            y: 409,
          },
        },
        {
          text: `${pro.street} ${pro.zipcode} ${pro.city}`,
          position: {
            page: 1,
            width: 340,
            height: 24,
            x: 250,
            y: 438,
          },
        },
        {
          text: `${contact.firstName} ${contact.lastName}`,
          position: {
            page: 1,
            width: 283,
            height: 24,
            x: 300,
            y: 467,
          },
        },
        {
          text: contact.jobTitle,
          position: {
            page: 1,
            width: 246,
            height: 24,
            x: 190,
            y: 495,
          },
        },
        {
          text: contact.email,
          position: {
            page: 1,
            width: 386,
            height: 24,
            x: 142,
            y: 524,
          },
        },
        {
          text: getProPrestationsParentCategories(
            (pro.prestations?.split(";") ??
              []) as OperationHubspotPrestationId[],
          ).join(", "),
          position: {
            page: 2,
            width: 456,
            height: 50,
            x: 67,
            y: 290,
          },
        },

        {
          text: "Lu et approuvé le " + new Date().toLocaleDateString("fr-FR"),
          position: {
            page: 13,
            width: 251,
            height: 24,
            x: 122,
            y: 414,
          },
        },
        {
          text: pro.name,
          position: {
            page: 13,
            width: 251,
            height: 24,
            x: 96,
            y: 477,
          },
        },
        {
          text: `${contact.firstName} ${contact.lastName}`,
          position: {
            page: 13,
            width: 251,
            height: 24,
            x: 63,
            y: 514,
          },
        },
      ];
    },
  },
  {
    documentName: "Contrat de Partenariat",
    cee: false,
    id: "partnership",
    file: PUBLIC_ASSETS.PDF_CONTRACTS_PARTNERSHIP,
    signaturePosition: {
      page: 12,
      width: 190,
      height: 72,
      x: 63,
      y: 732,
    },
    fields(
      pro,
      contact,
    ): {
      text: string | null;
      position: YouSignLocation;
    }[] {
      return [
        {
          text: pro.name,
          position: {
            page: 1,
            width: 355,
            height: 24,
            x: 167,
            y: 351,
          },
        },
        {
          text: pro.rcsLocation,
          position: {
            page: 1,
            width: 294,
            height: 24,
            x: 234,
            y: 379,
          },
        },

        {
          text: pro.siren,
          position: {
            page: 1,
            width: 368,
            height: 24,
            x: 158,
            y: 410,
          },
        },
        {
          text: `${pro.street} ${pro.zipcode} ${pro.city}`,
          position: {
            page: 1,
            width: 300,
            height: 24,
            x: 252,
            y: 437,
          },
        },
        {
          text: `${contact.firstName} ${contact.lastName}`,
          position: {
            page: 1,
            width: 230,
            height: 24,
            x: 300,
            y: 466,
          },
        },
        {
          text: contact.jobTitle,
          position: {
            page: 1,
            width: 240,
            height: 24,
            x: 190,
            y: 495,
          },
        },
        {
          text: contact.email,
          position: {
            page: 1,
            width: 383,
            height: 24,
            x: 144,
            y: 524,
          },
        },
        {
          text: getProPrestationsParentCategories(
            (pro.prestations?.split(";") ??
              []) as OperationHubspotPrestationId[],
          ).join(", "),
          position: {
            page: 2,
            width: 453,
            height: 24,
            x: 72,
            y: 290,
          },
        },

        {
          text: "Lu et approuvé le " + new Date().toLocaleDateString("fr-FR"),
          position: {
            page: 12,
            width: 190,
            height: 24,
            x: 120,
            y: 576,
          },
        },
        {
          text: pro.name,
          position: {
            page: 12,
            width: 190,
            height: 24,
            x: 94,
            y: 651,
          },
        },
        {
          text: `${contact.firstName} ${contact.lastName}`,
          position: {
            page: 12,
            width: 190,
            height: 24,
            x: 63,
            y: 685,
          },
        },
      ];
    },
  },
  {
    documentName: "Contrat de valorisation - Certificat d'économie d'énergie",
    cee: true,
    id: "cee",
    file: PUBLIC_ASSETS.PDF_CONTRACTS_CEE,
    signaturePosition: {
      page: 29,
      width: 192,
      height: 50,
      x: 70,
      y: 500,
    },
    fields(
      pro,
      contact,
    ): {
      text: string | null;
      position: YouSignLocation;
    }[] {
      return [
        {
          text: pro.name,
          position: {
            page: 1,
            width: 319,
            height: 24,
            x: 133,
            y: 372,
          },
        },
        {
          text: pro.capital?.toFixed(0) ?? null,
          position: {
            page: 1,
            width: 103,
            height: 24,
            x: 140,
            y: 398,
          },
        },
        {
          text: `${pro.street} ${pro.zipcode} ${pro.city}`,
          position: {
            page: 1,
            width: 308,
            height: 24,
            x: 222,
            y: 425,
          },
        },
        {
          text: pro.rcsLocation,
          position: {
            page: 1,
            width: 219,
            height: 24,
            x: 373,
            y: 453,
          },
        },
        {
          text: pro.siren,
          position: {
            page: 1,
            width: 392,
            height: 24,
            x: 154,
            y: 481,
          },
        },
        {
          text: `${contact.firstName} ${contact.lastName}`,
          position: {
            page: 1,
            width: 392,
            height: 24,
            x: 159,
            y: 509,
          },
        },
        {
          text: contact.jobTitle,
          position: {
            page: 1,
            width: 392,
            height: 24,
            x: 141,
            y: 536,
          },
        },
        {
          text: "Lu et approuvé le " + new Date().toLocaleDateString("fr-FR"),
          position: {
            page: 29,
            width: 192,
            height: 24,
            x: 70,
            y: 430,
          },
        },
        {
          text: contact.jobTitle,
          position: {
            page: 29,
            width: 192,
            height: 24,
            x: 117,
            y: 469,
          },
        },
      ];
    },
  },
];

export const ContractTypes = PRO_CONTRACTS.map((contract) => contract.id) as [
  ContractType,
  ...ContractType[],
];

export const getContractFromType = (type: ContractType, cee: boolean) =>
  PRO_CONTRACTS.find(
    (contract) => contract.id === type && cee === contract.cee,
  );

export const PRO_MARKETPLACE_PHASES: OperationPhaseEnum[] = [
  OperationPhaseEnum.CSM_PASSATION,
  OperationPhaseEnum.PRO_SEARCH,
  OperationPhaseEnum.TO_BE_TAKEN_IN_CHARGE,
  OperationPhaseEnum.PROJECT_PHASE,
];

export const PRO_MARKETPLACE_PHASES_SHOULD_HAVE_QUOTES: OperationPhaseEnum[] = [
  OperationPhaseEnum.UPSELL,
  OperationPhaseEnum.UPSELL_RECOVERED,
  OperationPhaseEnum.PROJECT_PHASE,
  OperationPhaseEnum.PRE_LAUNCH,
  OperationPhaseEnum.CSM_PASSATION,
  OperationPhaseEnum.TO_COME,
  OperationPhaseEnum.TO_REQUALIFY,
  OperationPhaseEnum.PRO_SEARCH,
  OperationPhaseEnum.TO_BE_TAKEN_IN_CHARGE,
  OperationPhaseEnum.RESERVED_PROJECT,
  OperationPhaseEnum.COMMERCIAL_NEGOTIATION,
  OperationPhaseEnum.WAITING_FOR_COACH_COPRO,
];

export const PRO_PRESTATIONS_EXTRA_SUBTYPES = ["Surélévation"] as const;
export type ProHubspotPrestationId =
  (typeof PRO_PRESTATIONS_EXTRA_SUBTYPES)[number];

type Prestation = {
  hsOperationCategory: OperationHubspotCategory;
  subTypes: {
    label: string;
    hsPrestationId: OperationHubspotPrestationId | ProHubspotPrestationId;
  }[];
};

const PRESTATIONS: Prestation[] = [
  {
    hsOperationCategory: "Rénovation globale",
    subTypes: [
      {
        label: "Surélévation",
        hsPrestationId: "Surélévation",
      },
    ],
  },
];

type ProSubType = {
  hsPrestationId: OperationHubspotPrestationId | ProHubspotPrestationId;
  label: string;
};

type ProOperationCategory = {
  label: string;
  hsOperationCategory: OperationHubspotCategory;
  subTypes: ProSubType[];
};

const PRO_PRESTATIONS_MAP = new Map<
  OperationHubspotCategory,
  ProOperationCategory
>(
  OPERATION_TYPES_ARR.filter((operation) => operation.showAsProOption).map(
    (operation) => [
      operation.hsOperationCategory,
      {
        label: operation.label,
        hsOperationCategory: operation.hsOperationCategory,
        subTypes: operation.subTypes.map(({ hsPrestationId, label }) => ({
          hsPrestationId,
          label,
        })),
      },
    ],
  ),
);

for (const prestation of PRESTATIONS) {
  const existingCategory = PRO_PRESTATIONS_MAP.get(
    prestation.hsOperationCategory,
  );

  if (existingCategory) {
    const mergedSubTypes = [
      ...existingCategory.subTypes,
      ...prestation.subTypes.filter(
        (subType) =>
          !existingCategory.subTypes.some(
            (existingSubType) =>
              existingSubType.hsPrestationId === subType.hsPrestationId,
          ),
      ),
    ];

    PRO_PRESTATIONS_MAP.set(prestation.hsOperationCategory, {
      ...existingCategory,
      subTypes: mergedSubTypes,
    });
    continue;
  }

  PRO_PRESTATIONS_MAP.set(prestation.hsOperationCategory, {
    label: prestation.hsOperationCategory,
    hsOperationCategory: prestation.hsOperationCategory,
    subTypes: prestation.subTypes,
  });
}

export const PRO_PRESTATIONS = Array.from(PRO_PRESTATIONS_MAP.values());

export const getProSubTypesByCategory = (
  category: OperationHubspotCategory,
): ProSubType[] => PRO_PRESTATIONS_MAP.get(category)?.subTypes ?? [];

export const getProPrestationsParentCategories = (
  ids: OperationHubspotPrestationId[],
): string[] => {
  const labels = new Set<string>();

  for (const id of ids) {
    const proCategory = Array.from(PRO_PRESTATIONS_MAP.values()).find((cat) =>
      cat.subTypes.some((s) => s.hsPrestationId === id),
    );

    if (proCategory) {
      labels.add(proCategory.label);
      continue;
    }

    try {
      getPrestationsParentCategories([id]).forEach((label) =>
        labels.add(label),
      );
    } catch {
      console.warn(`Prestation non résolue: ${id}`);
    }
  }

  return Array.from(labels);
};
