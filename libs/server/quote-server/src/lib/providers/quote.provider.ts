import { ClientRepository } from "@optee/client-server";
import type { YouSignLocation, YouSignRequestId } from "@optee/constants";
import {
  contactSupport,
  MARKETPLACE_UI_URL,
  missingInformation,
  QuoteRejectReason,
  QuoteStage,
  tryAgainOrContactUs,
  YouSignRequestStatus,
} from "@optee/constants";
import { ContactRepository } from "@optee/contact-server";
import { LocationRepository } from "@optee/location-server";
import { MailersendProvider } from "@optee/mailersend-server";
import type { ProUuid } from "@optee/models";
import {
  hsQuotesTable,
  QuoteHsId,
  QuoteUuid,
  type OperationUuid,
  type UserUuid,
} from "@optee/models";
import { OperationRepository } from "@optee/operation-server";
import { ProRepository } from "@optee/pro-server";
import { QuoteClientRepository } from "@optee/quote-client-server";
import { QuoteLocationRepository } from "@optee/quote-location-server";
import { QuoteOperationRepository } from "@optee/quote-operation-server";
import { QuoteProRepository } from "@optee/quote-pro-server";
import { UserProvider } from "@optee/user-server";
import { YouSignProvider } from "@optee/yousign-server";
import { randomInt } from "crypto";
import { eq } from "drizzle-orm";
import { QuoteRepository } from "../repositories/quote.repository";

export const QuoteProvider = {
  async create(
    operationUuid: OperationUuid,
    proUuid: ProUuid,
    name: string | null,
    stage: QuoteStage,
  ) {
    const [createdQuote] = await QuoteRepository.create({
      name: name ?? `Devis ${randomInt(1000, 9999)}`,
      stage,
    });

    if (!createdQuote) {
      throw new Error("Une erreur est survenue lors de la création du devis");
    }

    try {
      const locationUuid =
        await LocationRepository.getUuidByOperation(operationUuid);

      if (!locationUuid) {
        throw new Error(
          `Aucun bâtiment trouvé pour cette opération. ${contactSupport}`,
        );
      }
      const clientUuid = await ClientRepository.getUuidByLocation(locationUuid);

      if (!clientUuid) {
        throw new Error(
          `Aucun client trouvé pour cette opération. ${contactSupport}`,
        );
      }

      await QuoteOperationRepository.create(createdQuote.uuid, operationUuid);
      await QuoteProRepository.create(createdQuote.uuid, proUuid);
      await QuoteClientRepository.create(createdQuote.uuid, clientUuid);
      await QuoteLocationRepository.create(createdQuote.uuid, locationUuid);

      return createdQuote.uuid;
    } catch (error) {
      console.error("🚩 Création d'un devis en échec. ", {
        operationUuid,
        error,
      });
      throw Error(
        "Une erreur est survenue lors de la création du devis. " + error,
      );
    }
  },

  async get({
    quoteUuid,
    userUuid,
  }: {
    quoteUuid: QuoteUuid;
    userUuid: UserUuid;
  }) {
    //@todo should have its own query
    let [row] = await QuoteRepository.getAllForUserByClient(userUuid, [
      eq(hsQuotesTable.uuid, quoteUuid),
    ]);

    if (!row) {
      throw new Error(
        `Devis introuvable: ${quoteUuid}. Merci de contacter le support.`,
      );
    }

    const url: string | null = null;

    const status = row.hsQuote.signRequestYousignId
      ? await YouSignProvider.getSignatureRequestStatus(
          row.hsQuote.signRequestYousignId,
        )
      : null;

    let signUrl = null;

    // If the quote is in waiting for signature stage and has a Yousign request, we need to check the status
    if (
      row.hsQuote.stage === QuoteStage.EN_ATTENTE_DE_SIGNATURE &&
      row.hsQuote.signRequestYousignId &&
      row.hsQuote.signerYousignId &&
      status
    ) {
      try {
        // Something is out of sync: autofix depending on Yousign status
        if (status !== YouSignRequestStatus.ONGOING) {
          const quoteUuid = row?.hsQuote.uuid;
          if (!quoteUuid) {
            throw new Error(" Quote UUID is missing");
          }
          switch (status) {
            case YouSignRequestStatus.DONE: {
              await QuoteProvider.acceptWithYousign({
                quoteUuid: row.hsQuote.uuid,
                signatureRequestId: row.hsQuote.signRequestYousignId,
              });
              break;
            }
            case YouSignRequestStatus.DECLINED: {
              await QuoteProvider.reject({
                quoteUuid,
                reason: QuoteRejectReason.UNKNOWN,
              });
              break;
            }
            default:
              throw new Error(
                "Le document n'est plus en attente de signature. Merci de contacter le support",
              );
          }
          // fetch once again
          row = (
            await QuoteRepository.getAllForUserByClient(userUuid, [
              eq(hsQuotesTable.uuid, quoteUuid),
            ])
          )[0];
        } else {
          signUrl = await YouSignProvider.getSignatureLink({
            signatureRequestId: row.hsQuote.signRequestYousignId,
            signerId: row.hsQuote.signerYousignId,
          });
        }
      } catch (err) {
        console.error(
          `🚩 Impossible de récupérer le lien de signature pour le devis [${row?.hsQuote.uuid}]: `,
          err,
        );
      }
    }

    if (!row) {
      throw new Error(`Devis mis à jour introuvable: ${quoteUuid}`);
    }

    return { row, signUrl, url, status };
  },

  async getSignatureInformation(quoteUuid: QuoteUuid, userUuid: UserUuid) {
    const quote = await QuoteProvider.get({
      quoteUuid: quoteUuid,
      userUuid: userUuid,
    });

    if (!quote) {
      throw new Error(
        `Impossible de trouver le devis correspondant. ` + contactSupport,
      );
    }

    const {
      signRequestYousignId: signatureRequestId,
      signerYousignId: signerId,
      name,
      signatureLocation,
    } = quote.row.hsQuote;

    const url = quote.url;
    const operationUuid = quote.row.hsOperation.uuid;

    const status = signatureRequestId
      ? await YouSignProvider.getSignatureRequestStatus(signatureRequestId)
      : null;

    return {
      name,
      signatureLocation,
      url,
      signatureRequestId,
      signerId,
      operationUuid,
      status,
      stage: quote.row.hsQuote.stage,
    };
  },

  async getOrCreateSignatureLink(quoteUuid: QuoteUuid, userUuid: UserUuid) {
    const { signatureRequestId, signerId, status, stage, ...res } =
      await QuoteProvider.getSignatureInformation(quoteUuid, userUuid);

    if (signatureRequestId && signerId) {
      if (
        stage === QuoteStage.EN_ATTENTE_DE_SIGNATURE &&
        status !== YouSignRequestStatus.ONGOING
      ) {
        console.error(
          "🚩 Les status ne sont pas correctement synchronisés avec Yousign.. ",
          { stage, status, quoteUuid, signatureRequestId },
        );
      }
      return {
        signatureLink:
          status === YouSignRequestStatus.ONGOING
            ? await YouSignProvider.getSignatureLink({
                signatureRequestId,
                signerId,
              })
            : null,
        signatureRequestId,
        signerId,
        status,
      };
    }

    if (!res.name || !res.signatureLocation || !res.url) {
      console.error(
        `Il manque des informations pour initier la signature du devis ${quoteUuid}`,
        {
          quoteUuid,
          userUuid,
          hasMissingFields: {
            name: !res.name,
            signatureLocation: !res.signatureLocation,
            url: !res.url,
          },
        },
      );
      throw new Error(missingInformation);
    }

    return QuoteProvider.initSignatureWorkflow(
      quoteUuid,
      res.name,
      res.operationUuid,
      res.signatureLocation,
      res.url,
    );
  },

  async accept({ quoteUuid, blob }: { quoteUuid: QuoteUuid; blob: Blob }) {
    const quote = await QuoteRepository.getThirdPartyIdentifiers(quoteUuid);

    if (!quote || !quote.id) {
      throw new Error(`Devis introuvable: ${quoteUuid}.` + contactSupport);
    }

    // If one quotes is accepted, reject all others
    const association =
      await QuoteRepository.getRelatedProAndOperationUuid(quoteUuid);

    if (!association) {
      console.error(
        `🚩 Récupération du pro et de l'opération d'un devis; Aucune association trouvée pour le devis [${quoteUuid}].`,
      );
      throw new Error(
        `Aucune association trouvée entre le professionnel et l'opération. ${tryAgainOrContactUs}`,
      );
    }

    const { proUuid, operationUuid } = association;

    if (!proUuid || !operationUuid) {
      console.error(
        `🚩 Récupération du pro et de l'opération d'un devis; Les identifiants trouvés pour le devis [${quoteUuid}] sont null.`,
      );
      throw new Error(
        `Une erreur est survenue lors de la récupération des informations. ${contactSupport}`,
      );
    }

    await OperationRepository.associateToPro(operationUuid, proUuid);
    await QuoteRepository.updateStage(quoteUuid, QuoteStage.DEVIS_SIGNE);
    await QuoteProvider.upload(quote.id, blob);

    const concurrentQuotes = (
      await QuoteRepository.getAllByOperation(operationUuid)
    ).filter((quote) => quote.uuid !== quoteUuid);

    await Promise.all(
      concurrentQuotes
        .filter((quote) => quote.stage === QuoteStage.EN_ATTENTE_DE_SIGNATURE)
        .map((quote) =>
          QuoteProvider.reject({
            quoteUuid: quote.uuid,
            reason: QuoteRejectReason.OTHER_QUOTE_ACCEPTED,
          }),
        ),
    );
  },

  reject({
    quoteUuid,
    reason,
  }: {
    quoteUuid: QuoteUuid;
    reason?: QuoteRejectReason;
  }) {
    return QuoteRepository.updateStage(
      quoteUuid,
      QuoteStage.FERME_PERDU,
      reason,
    );
  },

  /**
   * Validates the quote and sends an email to the signatory
   * Meant to be used by the admin for now (only)
   */
  async validate({
    quoteUuid,
    signatureLocation,
    skipEmail,
    proInCC,
  }: {
    quoteUuid: QuoteUuid;
    skipEmail: boolean;
    proInCC: boolean;
    signatureLocation: YouSignLocation;
  }) {
    try {
      const { quote, operationUuid } =
        await QuoteRepository.getForAdmin(quoteUuid);

      if (!quote) {
        throw new Error(
          "Aucun devis trouvé à partir de l'uuid hubspot: " + quoteUuid,
        );
      }

      if (!operationUuid) {
        throw new Error(
          "Aucune opération trouvée pour ce devis, à partir de l'uuid:" +
            quoteUuid,
        );
      }

      const { name: quoteName } = quote;

      if (!quoteName) {
        throw new Error("Ce devis n'a pas de nom");
      }

      const { email, firstName, lastName, userUuid, id } =
        await QuoteProvider.validateSignatoryInfo(operationUuid, quoteUuid);

      if (!userUuid && email) {
        await UserProvider.createUserAccount({
          email,
          emailTemplate: "INVITE_CLIENT_CONTACT",
        });
      }

      if (!firstName || !lastName) {
        throw new Error(
          "Le prénom et le nom du signataire sont requis pour continuer",
        );
      }

      await QuoteRepository.updateSignatureLocation(
        quote.uuid,
        signatureLocation,
      );

      await QuoteRepository.updateStage(
        quote.uuid,
        QuoteStage.EN_ATTENTE_DE_SIGNATURE,
      );

      if (!skipEmail) {
        const operation = await OperationRepository.get(operationUuid);

        if (!operation) {
          throw new Error("Operation not found for given quote");
        }

        const cc = [
          { email: "operations@optee.io", name: "Optee opérations" },
          { email: "pro@optee.io", name: "Optee professionnels" },
        ];

        const pro = await QuoteRepository.getRelatedPro(quote.uuid);

        if (proInCC && pro && pro.email && pro.name && pro.uuid) {
          const [mainContact] = await ProRepository.getMainContacts(pro.uuid);
          cc.push({ email: mainContact?.email ?? pro.email, name: pro.name });
        }

        await MailersendProvider.sendEmail({
          to: [{ email, name: `${firstName} ${lastName}` }],
          cc,
          template: "NEW_QUOTE",
          subject: "Votre devis est prêt à être signé",
          data: {
            quoteName,
            redirectLink: `${MARKETPLACE_UI_URL}/client/quotes/${quote.uuid}`,
          },
        });
      }
    } catch (error) {
      console.error(error);
      throw new Error(
        "La création de la requête de signature à échouée: " + error,
      );
    }
  },

  async initSignatureWorkflow(
    quoteUuid: QuoteUuid,
    quoteName: string,
    operationUuid: OperationUuid,
    signatureLocation: YouSignLocation,
    fileUrl: string,
  ) {
    try {
      const { email, firstName, lastName } =
        await QuoteProvider.validateSignatoryInfo(operationUuid, quoteUuid);

      const {
        signRequestYousignId: signatureRequestId,
        signerYousignId: signerId,
      } = await YouSignProvider.initSignatureWorkflow({
        signatureLocation,
        contact: { email, firstName, lastName },
        quote: { name: quoteName },
        fileUrl: fileUrl,
      });

      await QuoteRepository.updateYousignIdentifiers({
        quoteUuid: quoteUuid,
        signRequestYousignId: signatureRequestId,
        signerYousignId: signerId,
      });

      const signatureLink = await YouSignProvider.getSignatureLink({
        signatureRequestId,
        signerId,
      });

      return {
        signatureLink,
        signatureRequestId,
        signerId,
        status: YouSignRequestStatus.ONGOING,
      };
    } catch (error) {
      console.error(
        `Failed to initialize signature workflow for quote ${quoteUuid}:`,
        error,
      );
      throw new Error(
        `La création de la requête de signature a échoué: ${error}`,
      );
    }
  },

  async validateSignatoryInfo(
    operationUuid: OperationUuid,
    quoteUuid: QuoteUuid,
  ) {
    const signatoryUuid =
      await OperationRepository.getSignatoryUuid(operationUuid);

    if (!signatoryUuid) {
      throw new Error("Aucun signataire trouvé pour ce devis: " + quoteUuid);
    }

    const contact = await ContactRepository.get(signatoryUuid);

    if (!contact) {
      throw new Error(
        "Aucun contact trouvé pour ce signataire:" + signatoryUuid,
      );
    }

    const { email, firstName, lastName, userUuid, id } = contact;
    if (!firstName || !lastName || !email) {
      throw new Error(
        "Le prénom, le nom et l'e-mail du signataire sont requis pour continuer.",
      );
    }

    return { contact, email, firstName, lastName, userUuid, id };
  },

  async upload(id: QuoteHsId | QuoteUuid, blob: Blob) {
    const hsParse = QuoteHsId.safeParse(id);
    let quote;
    if (hsParse.success) {
      const row = await QuoteRepository.getByHsIdWithNullableAttachment(
        hsParse.data,
      );
      quote = row?.quote;
    }

    if (!quote) {
      const uuidParse = QuoteUuid.safeParse(id);
      if (!uuidParse.success) {
        throw new Error(`Invalid quote identifier: ${id}`);
      }
      const uuidRow = await QuoteRepository.get(uuidParse.data);
      quote = uuidRow?.hsQuote;
    }

    if (!quote) {
      throw new Error("Impossible de trouver le devis correspondant");
    }

    if (!blob) {
      throw new Error("Impossible de transférer le fichier.");
    }

  },

  async acceptWithYousign({
    quoteUuid,
    signatureRequestId,
  }: {
    quoteUuid: QuoteUuid;
    signatureRequestId: YouSignRequestId;
  }) {
    const [document] = await YouSignProvider.getAllDocuments({
      signatureRequestId,
    });

    if (!document) {
      console.error(
        `🚩 Aucun document signé trouvé pour le devis ${quoteUuid} avec l'id Yousign : ${signatureRequestId}.`,
      );
      throw new Error(
        `Aucun document signé trouvé pour le devis. ${contactSupport}.`,
      );
    }

    const blob = await YouSignProvider.downloadDocument({
      signatureRequestId,
      documentId: document.id,
    });

    if (!blob) {
      console.error(
        `🚩 Impossible de télécharger le document signé pour le devis ${quoteUuid} avec l'id Yousign : ${signatureRequestId}.`,
      );
      throw new Error(
        `Impossible de télécharger le document signé pour le devis ${quoteUuid}. ${contactSupport}`,
      );
    }

    await QuoteProvider.accept({ quoteUuid, blob });
  },
};
