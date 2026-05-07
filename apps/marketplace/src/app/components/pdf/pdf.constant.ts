import trpcClient from "../../../trpc-client";
import {
  isNeutralContributionData,
  NeutralContributionSchema,
  NeutralContributionTemplateComponent,
} from "./templates/neutral-contribution.template.component";
import type { ProvisionInput } from "./templates/provision.template.component";
import {
  isProvisionData,
  ProvisionSchema,
  ProvisionTemplateComponent,
} from "./templates/provision.template.component";
import {
  isSwornCertificateData,
  SwornCertificateSchema,
  SwornCertificateTemplateComponent,
} from "./templates/sworn-certificate.template.component";

export const PDF_TEMPLATES = [
  {
    label: "Cadre de contribution",
    items: [
      {
        label: "Neutre",
        slug: "contribution-neutral",
        documentName: "cadre de contribution",
        requiredParams: NeutralContributionSchema,
      },
    ],
  },
  {
    label: "Attestation sur l’honneur",
    items: [
      {
        label: "Attestation sur l’honneur",
        slug: "sworn-certificate",
        documentName: "attestation sur l'honneur",
        requiredParams: SwornCertificateSchema,
      },
    ],
  },
  {
    label: "Appel de provision",
    items: [
      {
        label: "Acompte",
        slug: "provision-deposit",
        documentName: "appel de provision (acompte)",
        requiredParams: ProvisionSchema,
        action: ({
          uuid,
          pdfId,
          sendingDate,
          expirationDate,
        }: ProvisionInput) =>
          trpcClient.operations.updateProvisionCallInfo.mutate({
            uuid,
            provisionCallId: pdfId,
            provisionCallSendingDate: sendingDate,
            provisionCallExpirationDate: expirationDate,
          }),
      },
      {
        label: "solde de tout compte",
        slug: "provision-sdc",
        documentName: "appel de provision (solde tout compte)",
        requiredParams: ProvisionSchema,
        action: ({
          uuid,
          pdfId,
          sendingDate,
          expirationDate,
        }: ProvisionInput) =>
          trpcClient.operations.updateProvisionCallSdcInfo.mutate({
            uuid,
            provisionCallSdcId: pdfId,
            provisionCallSdcSendingDate: sendingDate,
            provisionCallSdcExpirationDate: expirationDate,
          }),
      },
    ],
  },
] as const;

export type templateKey =
  (typeof PDF_TEMPLATES)[number]["items"][number]["slug"];

export type PdfRequiredParams =
  (typeof PDF_TEMPLATES)[number]["items"][number]["requiredParams"];

export type PdfTemplate = (typeof PDF_TEMPLATES)[number]["items"][number];

// Type checkers for PDF data
export const pdfDataValidators = {
  isNeutralContributionData,
  isProvisionData,
  isSwornCertificateData,
};

export const PdfTemplateComponents = [
  NeutralContributionTemplateComponent,
  ProvisionTemplateComponent,
  SwornCertificateTemplateComponent,
];
