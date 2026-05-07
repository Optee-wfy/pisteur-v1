import type {
  ContractType,
  ProStatus,
  YouSignDocumentId,
  YousignHookEvent,
  YouSignLocation,
  YouSignRequestId,
  YouSignSigner,
  YouSignSignerId,
} from "@optee/constants";
import {
  contactSupport,
  HTTP_STATUS_MESSAGES,
  QuoteStage,
  youSignDocumentSchema,
  yousignErrorResponseSchema,
  youSignFieldSchema,
  youSignRequestSchema,
  YouSignRequestStatus,
  youSignSignerSchema,
} from "@optee/constants";
import type { ProUuid, QuoteUuid } from "@optee/models";
import { ProProvider, ProRepository } from "@optee/pro-server";
import { QuoteProvider, QuoteRepository } from "@optee/quote-server";
import { formatZodError, getFile } from "@optee/utils";
import type { ZodTypeAny } from "zod";
import z from "zod";

export const isYousignCompatibleEnvironment = ["production"].includes(
  process.env["VITE_ENV"] ?? "",
);

const BASE_URL = `https://api${isYousignCompatibleEnvironment ? "" : "-sandbox"}.yousign.app/v3`;
const httpHeaders = {
  Authorization: `Bearer ${process.env["YOUSIGN_API_KEY"]}`,
};

type RelatedEntity =
  | {
      entity: "quote";
      data: {
        uuid: QuoteUuid;
        stage: QuoteStage | null;
      };
    }
  | {
      entity: "pro";
      data: {
        uuid: ProUuid;
        stage: ProStatus | null;
        contract: ContractType | null;
      };
    };

// Consommation API Yousign par workflow:
// - Quand un devis est validé: 4 requêtes
// - Quand le pro s’onboard: 14 * 2 = 28
// - Quand le client visualise sont devis: 1 requête

export const YouSignProvider = {
  /**
   * Creates a signature workflow with Yousign:
   * 1. Creates a signature request (skeleton of the workflow)
   * 2. Uploads the document to Yousign
   * 3. Adds a signer to the signature request with given position
   * 4. Activates the signature request
   * 5. Returns the signature link for the signer
   * @param opt options to create the signature workflow (signature location, contact information, quote name, file url)
   * @returns the identifier of the signer and the signature request
   * @see https://developers.yousign.com/docs/electronic-signature
   */
  async initSignatureWorkflow({
    signatureLocation,
    contact,
    quote,
    fileUrl,
  }: {
    signatureLocation: YouSignLocation;
    contact: {
      email: string;
      firstName: string;
      lastName: string;
    };
    quote: {
      name: string;
    };
    fileUrl: string;
  }) {
    const signRequestYousignId = await YouSignProvider.createSignatureRequest(
      quote.name,
    );

    const documentId = await YouSignProvider.upload({
      signatureRequestId: signRequestYousignId,
      fileUrl,
      fileName: `${quote.name}.pdf`,
    });

    await YouSignProvider.addSigner(
      signRequestYousignId,
      documentId,
      contact,
      signatureLocation,
    );

    const { id: signerYousignId } =
      await YouSignProvider.activate(signRequestYousignId);

    return { signerYousignId, signRequestYousignId };
  },

  async parseResponse<Schema extends ZodTypeAny>(
    response: Response,
    schema: Schema,
    actionPerformed: string,
  ): Promise<z.infer<Schema>> {
    if (!response.ok) {
      // Check if the response is a common error (like 401, 403, 429, 500), if so, throw a common error
      const commonErrorMessage = HTTP_STATUS_MESSAGES[response.status];
      if (commonErrorMessage) {
        console.error(
          `Yousign [${actionPerformed}] failed: ${commonErrorMessage}`,
          {
            status: response.status,
            url: response.url,
            message: response.statusText,
          },
        );
        throw new Error(commonErrorMessage);
      }
    }

    const resJson = await response.json();

    // Check if the response is ok, and if the parsed data is valid, if so return the data
    const parsed = schema.safeParse(resJson);
    if (response.ok && parsed.success) {
      return parsed.data;
    }

    // If response is ok but parsed data is not valid, log the error and throw a new error
    if (parsed.error) {
      const errorMessage =
        `Lors de ${actionPerformed}, Le serveur n'a pas renvoyé la réponse attendue: ` +
        (formatZodError(parsed.error).errors?.join(", ") ??
          "Aucune information disponible");
      console.error(errorMessage, resJson);
      throw new Error(errorMessage);
    }

    // Otherwise, Check error source, format error & throw with message
    const error = yousignErrorResponseSchema.safeParse(resJson);

    if (error.success) {
      if (error.data.type === "parameters_not_valid") {
        const invalidParamsStr = error.data.invalid_params
          ?.map(
            (p: { name: string; reason: string }) =>
              `la propriété '${p.name}' est invalide: ${p.reason}`,
          )
          .join(", et");
        throw new Error(
          `Une erreur est survenue lors de ${actionPerformed}.\n Les paramètres suivants sont invalides: ${invalidParamsStr}`,
        );
      }

      if (error.data.detail) {
        throw new Error(
          `Une erreur est survenue lors de ${actionPerformed}\n: ${error.data.detail}`,
        );
      }
    }

    console.error("🚩 Impossible de parser cette erreur Yousign: ", {
      resJson,
      actionPerformed,
      error: error.error,
    });
    throw new Error(
      actionPerformed +
        " a échouée pour une raison inconnue. Merci de contacter le support.",
    );
  },

  /**
   * Creates the signature request which is the "skeleton" of the signature workflow. Once created, you can add documents and signers to it.
   * @param name - The name of the signature request (will be displayed on Yousign UI).
   * @see https://developers.yousign.com/docs/document-1
   * @see https://developers.yousign.com/reference/post-signature_requests-signaturerequestid-documents-upload
   */
  async createSignatureRequest(name: string) {
    const request = await fetch(`${BASE_URL}/signature_requests`, {
      method: "POST",
      headers: {
        ...httpHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        delivery_mode: "none",
        timezone: "Europe/Paris",
      }),
    });

    const { id: signatureRequestId } = await YouSignProvider.parseResponse(
      request,
      youSignRequestSchema,
      "la création de la demande de signature",
    );
    return signatureRequestId;
  },

  /**
   * Uploads the document to Yousign. The document must be a PDF file.
   * @param opt options to upload the document (identifier of the signature request, file url, file name)
   * @see https://developers.yousign.com/docs/document-1
   * @see https://developers.yousign.com/reference/post-signature_requests-signaturerequestid-documents-upload
   * @returns the identifier of the document
   */
  async upload({
    signatureRequestId,
    fileUrl,
    fileName,
  }: {
    signatureRequestId: YouSignRequestId;
    fileUrl: string;
    fileName: string;
  }) {
    const fileBlob = await getFile(fileUrl);
    if (fileBlob.type !== "application/pdf") {
      throw new Error(
        "Erreur lors de la mise en ligne du document: le fichier n'est pas un PDF",
      );
    }

    // @todo get actual pageHeight
    const pageHeight = 842; // correspond to standard A4 page height in points
    const form = new FormData();
    const filename = `${fileName.trim().replace(/[/\\]/g, "_")}`;

    form.append("file", fileBlob, filename);
    form.append("nature", "signable_document");
    form.append("initials[alignment]", "right");
    form.append("initials[y]", String(Math.floor(pageHeight - 50)));

    const uploadResponse = await fetch(
      `${BASE_URL}/signature_requests/${signatureRequestId}/documents`,
      {
        method: "POST",
        headers: {
          ...httpHeaders,
        },
        body: form,
      },
    );

    const { id: documentId } = await YouSignProvider.parseResponse(
      uploadResponse,
      youSignDocumentSchema,
      "la mise en ligne du document",
    );
    return documentId;
  },

  /**
   * Adds a signer to the signature request with given position. Multiple signers can be added to the same document.
   * @param signatureRequestId identifier of related the signature request
   * @param documentId identifier of the document
   * @param contact information of the signer
   * @param signatureLocation position of the signature on the document
   * @returns the identifier of the signer
   *
   * @see https://developers.yousign.com/docs/signer-1
   */
  async addSigner(
    signatureRequestId: YouSignRequestId,
    documentId: YouSignDocumentId,
    contact: {
      email: string;
      firstName: string;
      lastName: string;
    },
    signatureLocation: YouSignLocation,
  ) {
    const request = await fetch(
      `${BASE_URL}/signature_requests/${signatureRequestId}/signers`,
      {
        method: "POST",
        headers: {
          ...httpHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          info: {
            first_name: contact.firstName.trim(),
            last_name: contact.lastName.trim(),
            email: contact.email,
            locale: "fr",
          },
          signature_level: "electronic_signature",
          signature_authentication_mode: "no_otp",
          fields: [
            {
              document_id: documentId,
              type: "signature",
              ...signatureLocation,
            },
          ],
        }),
      },
    );

    const { id: signerId } = await YouSignProvider.parseResponse(
      request,
      youSignSignerSchema,
      "l'ajout du signataire",
    );
    return signerId;
  },

  /**
   * Activates the signature request. This is the last step before sending the signature request to the signers.
   * @param signatureRequestId identifier of the signature request
   * @returns the signature request with the signers information (like signature link)
   */
  async activate(signatureRequestId: YouSignRequestId) {
    const response = await fetch(
      `${BASE_URL}/signature_requests/${signatureRequestId}/activate`,
      {
        method: "POST",
        headers: {
          ...httpHeaders,
          "Content-Type": "application/json",
        },
      },
    );

    const { signers } = await YouSignProvider.parseResponse(
      response,
      youSignRequestSchema,
      "l'activation de la demande de signature",
    );
    if (!signers.length) {
      throw new Error(
        "Aucun signataire trouvé. Vérifiez que le signataire a bien été ajouté au document.",
      );
    }
    return signers.at(0) as YouSignSigner; // We checked above that signers is not empty
  },

  /**
   * Get the signature link for a signer. This link is used to sign the document.
   * @param ids identifiers of the signers and signature request
   * @returns the signature link if available
   */
  async getSignatureLink({
    signatureRequestId,
    signerId,
  }: {
    signatureRequestId: YouSignRequestId;
    signerId: YouSignSignerId;
  }) {
    const status =
      await YouSignProvider.getSignatureRequestStatus(signatureRequestId);

    if (status !== YouSignRequestStatus.ONGOING) {
      return null;
    }

    const request = await fetch(
      `${BASE_URL}/signature_requests/${signatureRequestId}/signers/${signerId}`,
      {
        method: "GET",
        headers: httpHeaders,
      },
    );

    const { signature_link } = await YouSignProvider.parseResponse(
      request,
      youSignSignerSchema,
      "la récupération du lien de signature",
    );
    return signature_link ?? null;
  },

  /**
   * Attach fields to the document. (only supports read_only_text for now)
   * @param opt options to add fields to the document (identifiers of the document and signature request, fields to add)
   * @see https://developers.yousign.com/docs/read-only-text
   */
  async addFieldsToDocument({
    signatureRequestId,
    documentId,
    fields,
  }: {
    signatureRequestId: YouSignRequestId;
    documentId: YouSignDocumentId;
    fields: {
      text: string | null; //@todo remove null (forced because pro has null value....... 🧶)
      position: YouSignLocation;
    }[];
  }) {
    await Promise.all(
      fields.map(async (field) => {
        const request = await fetch(
          `${BASE_URL}/signature_requests/${signatureRequestId}/documents/${documentId}/fields`,
          {
            method: "POST",
            headers: {
              ...httpHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "read_only_text",
              text: field.text,
              ...field.position,
            }),
          },
        );

        await YouSignProvider.parseResponse(
          request,
          youSignFieldSchema,
          "l'ajout du champ de signature",
        );
      }),
    );
  },

  /**
   * Downloads the document from Yousign and returns it as a blob
   * @param ids identifiers of the document and signature request
   * @returns
   */
  async downloadDocument({
    signatureRequestId,
    documentId,
  }: {
    signatureRequestId: YouSignRequestId;
    documentId: YouSignDocumentId;
  }) {
    const request = await fetch(
      `${BASE_URL}/signature_requests/${signatureRequestId}/documents/${documentId}/download`,
      {
        method: "GET",
        headers: httpHeaders,
      },
    );

    if (!request.ok) {
      console.error("Téléchargement du document en échec: ", {
        documentId,
        request,
      });
      const errorResponse = await request.json();
      const error = yousignErrorResponseSchema.safeParse(errorResponse);

      throw new Error(
        "Téléchargement du document en échec: " +
          (error.data?.detail ?? "Erreur inconnue"),
      );
    }

    return request.blob();
  },

  /**
   * Get all documents from Yousign and returns it as a list of blob
   * @returns
   */
  async getAllDocuments({
    signatureRequestId,
  }: {
    signatureRequestId: YouSignRequestId;
  }) {
    const request = await fetch(
      `${BASE_URL}/signature_requests/${signatureRequestId}/documents`,
      {
        method: "GET",
        headers: httpHeaders,
      },
    );

    if (!request.ok) {
      console.error(
        "Échec de récupération de la liste des documents: ",
        request,
      );
      const errorResponse = await request.json();
      const error = yousignErrorResponseSchema.safeParse(errorResponse);

      throw new Error(
        "Échec de récupération de la liste des documents: " +
          (error.data?.detail ?? "Erreur inconnue"),
      );
    }

    return YouSignProvider.parseResponse(
      request,
      z.array(youSignDocumentSchema),
      "Échec de récupération de la liste des documents",
    );
  },

  async getSignatureRequestStatus(signatureRequestId: YouSignRequestId) {
    const request = await fetch(
      `${BASE_URL}/signature_requests/${signatureRequestId}`,
      {
        method: "GET",
        headers: {
          ...httpHeaders,
          "Content-Type": "application/json",
        },
      },
    );

    const { status } = await YouSignProvider.parseResponse(
      request,
      youSignRequestSchema,
      "la récupération du status de la demande de signature",
    );

    const relatedEntity =
      await YouSignProvider.getRelatedEntity(signatureRequestId);

    if (status === YouSignRequestStatus.DONE && relatedEntity) {
      const needUpdate =
        (relatedEntity?.entity === "quote" &&
          relatedEntity.data.stage !== QuoteStage.DEVIS_SIGNE) ||
        (relatedEntity?.entity === "pro" &&
          relatedEntity.data?.stage === "En attente de signature plateforme" &&
          relatedEntity.data.contract !== "partnership");

      if (needUpdate) {
        await YouSignProvider.handleYousignEvent(
          "signature_request.done",
          relatedEntity,
        );
      }
    }

    return status;
  },

  async cancelSignatureRequest(signatureRequestId: YouSignRequestId) {
    const request = await fetch(
      `${BASE_URL}/signature_requests/${signatureRequestId}/cancel`,
      {
        method: "POST",
        headers: {
          ...httpHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "other",
        }),
      },
    );

    await YouSignProvider.parseResponse(
      request,
      youSignRequestSchema,
      "l'annulation de la demande de signature",
    );
  },

  async deleteSignatureRequest(signatureRequestId: YouSignRequestId) {
    const request = await fetch(
      `${BASE_URL}/signature_requests/${signatureRequestId}`,
      {
        method: "DELETE",
        headers: {
          ...httpHeaders,
        },
      },
    );

    // Yousign answers 204 No-Content on success.
    if (request.status !== 204) {
      await YouSignProvider.parseResponse(
        request,
        youSignRequestSchema,
        "la suppression de la demande de signature",
      );
    }
  },

  /**
   * Retrieves from database related entity that is linked by given id. It could be a quote, but it could also be a pro, contract. Check return type for usage.
   * @param signatureRequestId Yousign identifier for signature request
   */
  async getRelatedEntity(
    signatureRequestId: YouSignRequestId,
  ): Promise<RelatedEntity | null> {
    const [quote, pro] = await Promise.all([
      QuoteRepository.getBySignatureRequestId(signatureRequestId),
      ProRepository.getBySignatureRequestId(signatureRequestId),
    ]);

    if (quote) {
      return { entity: "quote" as const, data: quote };
    }

    if (pro) {
      return { entity: "pro" as const, data: pro };
    }
    return null;
  },

  async handleYousignEvent(
    eventName: YousignHookEvent["event_name"],
    entity: RelatedEntity,
  ) {
    if (
      [
        "signature_request.canceled",
        "signature_request.expired",
        "signature_request.deleted",
      ].includes(eventName)
    ) {
      console.log(
        `Nouvel évènement entrant depuis Yousign (non pris en charge): [${entity.entity} - ${entity.data?.uuid}] ${eventName}`,
      );
      return;
    }

    if (eventName === "signature_request.done") {
      if (entity.entity === "quote") {
        const signRequestYousignId = (
          await QuoteRepository.getThirdPartyIdentifiers(entity.data.uuid)
        )?.signRequestYousignId;

        if (!signRequestYousignId) {
          console.error(
            `🚩 Aucune Signature trouvée pour le devis ${entity.data.uuid}.`,
          );
          throw new Error(
            `Signature manquante pour le devis. ${contactSupport}.`,
          );
        }

        QuoteProvider.acceptWithYousign({
          quoteUuid: entity.data.uuid,
          signatureRequestId: signRequestYousignId,
        });
      } else {
        if (!entity.data || !entity.data?.contract) {
          console.error(
            `Impossible de signer le contrat pour le pro ${entity.data?.uuid} car il n'a pas de contrat défini.`,
            entity,
          );
          throw Error("Failed to receive YS event: Pro or Contract not found");
        }

        await ProProvider.signedContract(
          entity.data.uuid,
          entity.data.contract,
        );
      }
    } else {
      throw Error("unsupported Yousign event received: " + eventName);
    }
  },
};
