import { ClientProvider } from "@optee/client-server";
import type {
  ContractType,
  OperationHubspotPrestationId,
  ProLegalEntityAssociation,
  ProStatus,
} from "@optee/constants";
import {
  buildAssetUrl,
  CONTACT_CONNECTION_COST,
  CONTACT_DETAILS_ENRICHMENT_COST,
  CONTACT_PRO_ASSOCIATIONS,
  ContactOrigin,
  contactSupport,
  determineDocumentType,
  getContractFromType,
  getMaxSeatsAllowed,
  MARKETPLACE_UI_URL,
  operationsEmail,
  PRO_CLIENT_ASSOCIATIONS,
  PRO_FILES_METADATA_LABELS,
  PRO_LOCATION_ASSOCIATIONS,
  PRO_MARKETPLACE_PHASES,
  ProSubscription,
  QuoteStage,
  YouSignRequestStatus,
} from "@optee/constants";
import {
  ContactProProvider,
  ContactProRepository,
} from "@optee/contact-pro-server";
import { ContactRepository } from "@optee/contact-server";
import { ExternalContactRepository } from "@optee/external-contact-server";
import { FileProvider } from "@optee/file-server";
import { GooglePlacesProvider } from "@optee/google-places-server";
import {
  LegalEntityProvider,
  LegalEntityRepository,
} from "@optee/legal-entity-server";
import { LocationRepository } from "@optee/location-server";
import {
  MailersendProvider,
  type MailTemplateId,
} from "@optee/mailersend-server";
import type {
  ContactUuid,
  HubspotPro,
  InputProWithoutIds,
  LegalEntity,
  LegalEntityUuid,
  LocationBdnbUuid,
  LocationUuid,
  OperationUuid,
  ProUuid,
  UserUuid,
} from "@optee/models";
import {
  associationProsExternalLocationsTable,
  associationsProLegalEntityTable,
  hsAssociationsContactsProsTable,
  hsContactsTable,
  hsProsTable,
  legalEntityStatsTable,
  locationBdnbStatsTable,
} from "@optee/models";
import {
  OperationProvider,
  OperationRepository,
} from "@optee/operation-server";
import { OwnerRepository } from "@optee/owner-server";
import { ProClientRepository } from "@optee/pro-client-server";
import { ProLegalEntityRepository } from "@optee/pro-legal-entity-server";
import { ProLocationRepository } from "@optee/pro-location-server";
import { ProSavedLocationRepository } from "@optee/pro-saved-location-server";
import { QuoteProvider, QuoteRepository } from "@optee/quote-server";
import { AuthProvider, db } from "@optee/supabase-server";
import type { FileDto, LabelledFileDto } from "@optee/utils";
import { isEmailFromOptee, isNotNullish } from "@optee/utils";
import { YouSignProvider } from "@optee/yousign-server";
import { and, eq, inArray, ne, notInArray, sql } from "drizzle-orm";
import { ProRepository } from "../repositories/pro.repository";

interface QuoteDataType {
  preTaxAmount: number;
  validityEndDate: Date;
  vatRate: number;
  fundingAmount: number;
  file: FileDto;
}

export class ProMemberInvitationNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProMemberInvitationNotFoundError";
  }
}

export class ProMemberInvitationForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProMemberInvitationForbiddenError";
  }
}

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const hasProLegalEntityAssociationInTx = async ({
  tx,
  legalEntityUuid,
  proUuid,
  associationType,
}: {
  tx: DbTransaction;
  legalEntityUuid: LegalEntityUuid;
  proUuid: ProUuid;
  associationType: ProLegalEntityAssociation;
}) => {
  const [existingAssociation] = await tx
    .select({
      uuid: associationsProLegalEntityTable.uuid,
    })
    .from(associationsProLegalEntityTable)
    .where(
      and(
        eq(associationsProLegalEntityTable.legalEntityUuid, legalEntityUuid),
        eq(associationsProLegalEntityTable.proUuid, proUuid),
        eq(
          associationsProLegalEntityTable.associationTypeId,
          associationType.id,
        ),
      ),
    )
    .limit(1);

  return Boolean(existingAssociation);
};

const decrementProCreditsInTx = async ({
  tx,
  proUuid,
  creditsToDecrement,
}: {
  tx: DbTransaction;
  proUuid: ProUuid;
  creditsToDecrement: number;
}) => {
  if (creditsToDecrement <= 0) {
    throw new Error("Le nombre de crédits à débiter doit être > 0.");
  }
  const [updatedPro] = await tx
    .update(hsProsTable)
    .set({
      remainingCredits: sql<number>`
        ${hsProsTable.remainingCredits} - ${creditsToDecrement}
      `,
    })
    .where(
      and(
        eq(hsProsTable.uuid, proUuid),
        sql<boolean>`${hsProsTable.remainingCredits} >= ${creditsToDecrement}`,
      ),
    )
    .returning({ remainingCredits: hsProsTable.remainingCredits });

  if (updatedPro?.remainingCredits !== null && updatedPro) {
    return;
  }

  const [pro] = await tx
    .select({ uuid: hsProsTable.uuid })
    .from(hsProsTable)
    .where(eq(hsProsTable.uuid, proUuid));

  if (!pro) {
    throw new Error(`Aucun professionnel trouvé. ${contactSupport}`);
  }

  throw new Error(`Vous n'avez plus assez de crédits.`);
};

const createProLegalEntityAssociationInTx = async ({
  tx,
  proUuid,
  legalEntityUuid,
  associationType,
}: {
  tx: DbTransaction;
  proUuid: ProUuid;
  legalEntityUuid: LegalEntityUuid;
  associationType: ProLegalEntityAssociation;
}) => {
  await tx.insert(associationsProLegalEntityTable).values({
    proUuid,
    legalEntityUuid,
    associationTypeId: associationType.id,
    associationLabel: associationType.label,
  });
};

/**
 * Advisory transaction lock to serialize concurrent unlock attempts
 * for the same (proUuid, legalEntityUuid, associationTypeId) tuple.
 *
 * Why this exists:
 * - The in-transaction "already exists" check is not enough on its own:
 *   two concurrent transactions can both pass the check before either inserts.
 * - We don't enforce a DB unique constraint on this tuple yet.
 *
 * Behavior:
 * - `pg_advisory_xact_lock` blocks concurrent transactions on the same key.
 * - The lock is automatically released at transaction end (commit/rollback).
 */
const lockProLegalEntityAssociationInTx = async ({
  tx,
  proUuid,
  legalEntityUuid,
  associationTypeId,
}: {
  tx: DbTransaction;
  proUuid: ProUuid;
  legalEntityUuid: LegalEntityUuid;
  associationTypeId: string | number;
}) => {
  const associationScopeKey = `${associationTypeId}:${legalEntityUuid}`;
  await tx.execute(
    sql`select pg_advisory_xact_lock(hashtext(${proUuid}), hashtext(${associationScopeKey}))`,
  );
};

const lockProMemberInvitationInTx = async ({
  tx,
  proUuid,
}: {
  tx: DbTransaction;
  proUuid: ProUuid;
}) => {
  await tx.execute(
    sql`select pg_advisory_xact_lock(hashtext(${proUuid}), hashtext(${`invite-member`}))`,
  );
};

const refreshLegalEntityNbRelatedProsInTx = async ({
  tx,
  legalEntityUuid,
  shouldUpdateLastSolicitationDate,
}: {
  tx: DbTransaction;
  legalEntityUuid: LegalEntityUuid;
  shouldUpdateLastSolicitationDate: boolean;
}) => {
  const excludedProUuids = await ProProvider.getAllTesterUuids();

  const [relatedProsRow] = await tx
    .select({
      total: sql<number>`
        count(distinct ${associationsProLegalEntityTable.proUuid})
      `,
    })
    .from(associationsProLegalEntityTable)
    .where(
      and(
        eq(associationsProLegalEntityTable.legalEntityUuid, legalEntityUuid),
        excludedProUuids.length > 0
          ? notInArray(
              associationsProLegalEntityTable.proUuid,
              excludedProUuids,
            )
          : sql`true`,
      ),
    );

  const nbRelatedPros = Number(relatedProsRow?.total ?? 0);

  await tx
    .insert(legalEntityStatsTable)
    .values(
      shouldUpdateLastSolicitationDate
        ? {
            legalEntityUuid,
            nbRelatedPros,
            lastSolicitationDate: sql`now()`,
          }
        : {
            legalEntityUuid,
            nbRelatedPros,
          },
    )
    .onConflictDoUpdate({
      target: legalEntityStatsTable.legalEntityUuid,
      set: shouldUpdateLastSolicitationDate
        ? { nbRelatedPros, lastSolicitationDate: sql`now()` }
        : { nbRelatedPros },
    });
};

const refreshLocationsNbRelatedProsInTx = async ({
  tx,
  locationUuids,
  shouldUpdateLastSolicitationDate,
}: {
  tx: DbTransaction;
  locationUuids: LocationBdnbUuid[];
  shouldUpdateLastSolicitationDate: boolean;
}) => {
  const uniqueLocationUuids = Array.from(new Set(locationUuids));
  if (uniqueLocationUuids.length === 0) {
    return;
  }
  const excludedProUuids = await ProProvider.getAllTesterUuids();

  const relatedProsRows = await tx
    .select({
      locationUuid: associationProsExternalLocationsTable.locationUuid,
      total: sql<number>`
        count(distinct ${associationProsExternalLocationsTable.proUuid})
      `,
    })
    .from(associationProsExternalLocationsTable)
    .where(
      and(
        inArray(
          associationProsExternalLocationsTable.locationUuid,
          uniqueLocationUuids,
        ),
        eq(
          associationProsExternalLocationsTable.associationTypeId,
          PRO_LOCATION_ASSOCIATIONS.UNBLOCKED.id,
        ),
        excludedProUuids.length > 0
          ? notInArray(
              associationProsExternalLocationsTable.proUuid,
              excludedProUuids,
            )
          : sql`true`,
      ),
    )
    .groupBy(associationProsExternalLocationsTable.locationUuid);

  const relatedProsByLocation = new Map(
    relatedProsRows.map((row) => [row.locationUuid, Number(row.total ?? 0)]),
  );

  for (const locationUuid of uniqueLocationUuids) {
    const nbRelatedPros = relatedProsByLocation.get(locationUuid) ?? 0;
    await tx
      .insert(locationBdnbStatsTable)
      .values(
        shouldUpdateLastSolicitationDate
          ? {
              locationBdnbUuid: locationUuid,
              nbRelatedPros,
              lastSolicitationDate: sql`now()`,
            }
          : {
              locationBdnbUuid: locationUuid,
              nbRelatedPros,
            },
      )
      .onConflictDoUpdate({
        target: locationBdnbStatsTable.locationBdnbUuid,
        set: shouldUpdateLastSolicitationDate
          ? { nbRelatedPros, lastSolicitationDate: sql`now()` }
          : { nbRelatedPros },
      });
  }
};

const getUnlockableExternalLocationUuidsInTx = async ({
  tx,
  locationUuids,
  proUuid,
}: {
  tx: DbTransaction;
  locationUuids: LocationBdnbUuid[];
  proUuid: ProUuid;
}) => {
  const uniqueUuids = Array.from(new Set(locationUuids));
  if (uniqueUuids.length === 0) {
    return [];
  }

  const existingAssociations = await tx
    .select({
      locationUuid: associationProsExternalLocationsTable.locationUuid,
    })
    .from(associationProsExternalLocationsTable)
    .where(
      and(
        eq(associationProsExternalLocationsTable.proUuid, proUuid),
        eq(
          associationProsExternalLocationsTable.associationTypeId,
          PRO_LOCATION_ASSOCIATIONS.UNBLOCKED.id,
        ),
        inArray(
          associationProsExternalLocationsTable.locationUuid,
          uniqueUuids,
        ),
      ),
    );

  const existingUuids = new Set(
    existingAssociations.map((assoc) => assoc.locationUuid),
  );

  return uniqueUuids.filter((locationUuid) => !existingUuids.has(locationUuid));
};

const unlockExternalLocationsInTx = async ({
  tx,
  locationUuids,
  proUuid,
}: {
  tx: DbTransaction;
  locationUuids: LocationBdnbUuid[];
  proUuid: ProUuid;
}) => {
  const unlockableUuids = await getUnlockableExternalLocationUuidsInTx({
    tx,
    locationUuids,
    proUuid,
  });

  if (unlockableUuids.length === 0) {
    return { count: 0, unlockableUuids: [] };
  }

  const [pro] = await tx
    .select({ testAccount: hsProsTable.testAccount })
    .from(hsProsTable)
    .where(eq(hsProsTable.uuid, proUuid));

  if (!pro) {
    throw new Error(`Aucun professionnel trouvé. ${contactSupport}`);
  }

  await tx.insert(associationProsExternalLocationsTable).values(
    unlockableUuids.map((locationUuid) => ({
      locationUuid,
      proUuid,
      associationTypeId: PRO_LOCATION_ASSOCIATIONS.UNBLOCKED.id,
      associationLabel: PRO_LOCATION_ASSOCIATIONS.UNBLOCKED.label,
    })),
  );

  await refreshLocationsNbRelatedProsInTx({
    tx,
    locationUuids: unlockableUuids,
    shouldUpdateLastSolicitationDate: !pro.testAccount,
  });

  return { count: unlockableUuids.length, unlockableUuids };
};

export const ProProvider = {
  async getAllTesterUuids() {
    const rows = await db
      .select({
        proUuid: hsProsTable.uuid,
      })
      .from(hsProsTable)
      .where(eq(hsProsTable.testAccount, true));

    return Array.from(
      new Set(rows.map((row) => row.proUuid).filter(isNotNullish)),
    );
  },

  async create(userId: UserUuid, input: Partial<HubspotPro>) {
    try {
      const contact = await ContactRepository.getByUser(userId);

      if (!contact) {
        throw new Error(
          `Erreur lors de la création du pro. Aucun contact trouvé pour l'utilisateur connecté.`,
        );
      }

      const proUuid = await ProRepository.create(input);

      await ContactRepository.associateToPro({
        contactUuid: contact.uuid,
        proUuid,
        role: CONTACT_PRO_ASSOCIATIONS.MAIN_CONTACT,
      });

      return {
        body: proUuid,
        status: 201,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(
          `Erreur lors de la création du pro. "${error.message}"`,
        );
      }

      throw new Error("Erreur inconnue lors de la création du pro.");
    }
  },

  // @todo reduce cognitive load (extract in smaller parts, create reusable functions or reuse/adapt existing one)
  async createClientProject({
    proUuid,
    proName,
    input,
    currentUserUuid,
  }: {
    proUuid: ProUuid;
    proName: string;
    currentUserUuid: UserUuid;
    input: {
      hsPrestationId: OperationHubspotPrestationId;
      locationUuid: LocationUuid;
      signatoryUuid: ContactUuid;
      quoteInformation: QuoteDataType;
    };
  }) {
    const { hsPrestationId, locationUuid, signatoryUuid, quoteInformation } =
      input;

    try {
      const signatory = await ContactRepository.get(signatoryUuid);
      if (!signatory) {
        throw new Error("Signataire introuvable.");
      }
      if (!signatory.firstName || !signatory.lastName || !signatory.email) {
        throw new Error("Le signataire possède des informations manquantes.");
      }
      const signatoryName = `${signatory.firstName} ${signatory.lastName}`;

      const contactPro = await ContactRepository.getByUser(currentUserUuid);
      if (!contactPro) {
        throw new Error(
          `Vos informations de contact sont manquantes. ${contactSupport}`,
        );
      }
      if (
        !contactPro.email ||
        !contactPro.firstName ||
        !contactPro.lastName ||
        !proName
      ) {
        throw new Error(
          "Certaines informations de votre compte professionnel sont manquantes. Champs requis: prénom, nom, email et raison sociale. Merci de compléter votre profil.",
        );
      }

      const { operationUuid, name, hsClient } =
        await OperationProvider.createByPro({
          proUuid: proUuid,
          hsPrestationId,
          locationUuid,
          signatoryUuid,
        });

      if (!operationUuid) {
        throw new Error("Impossible de créer l'opération.");
      }

      const quoteUuid = await QuoteProvider.create(
        operationUuid,
        proUuid,
        "Devis_" + name,
        QuoteStage.EN_ATTENTE_DE_SIGNATURE,
      );

      if (!quoteUuid) {
        throw new Error("Impossible de créer le devis.");
      }

      await QuoteRepository.updateQuoteInformation({
        ...quoteInformation,
        quoteUuid,
      });

      const blob = FileProvider.base64ToBlob({
        base64Data: quoteInformation.file.data,
        contentType: quoteInformation.file.type,
      });
      await QuoteProvider.upload(quoteUuid, blob);

      let amEmail: string;
      let amName: string;

      if (!hsClient.ownerId) {
        console.warn(
          `⚠️ Le client ${hsClient.uuid} n'a pas d'ownerId. Email envoyé à l'équipe Opérations à la place.`,
        );
        amEmail = operationsEmail;
        amName = "Opérations Optee";
      } else {
        const am = await OwnerRepository.get(hsClient.ownerId);
        if (!am) {
          console.warn(
            `⚠️ Aucun owner trouvé pour l'ID: ${hsClient.ownerId}. Email envoyé à l'équipe Opérations à la place.`,
          );
          amEmail = operationsEmail;
          amName = "Opérations Optee";
        } else {
          amEmail = am.email;
          amName = `${am.firstName} ${am.lastName}`;
        }
      }

      await MailersendProvider.sendEmail({
        to: [{ email: signatory.email, name: signatoryName }],
        subject: "Création d'un nouveau projet",
        cc: [
          {
            email: contactPro.email,
            name: `${contactPro.firstName} ${contactPro.lastName}`,
          },
          { email: amEmail, name: amName },
        ],
        template: "CREATE_CLIENT_PROJECT",
        data: {
          clientSurname: signatory.firstName ?? "",
          proCompanyName: proName,
          proSurname: contactPro.firstName,
          proName: contactPro.lastName,
          proPhone: contactPro.phone ?? "Non communiqué",
          proMail: contactPro.email,
        },
        mailAttachments: [
          {
            content: quoteInformation.file.data,
            fileName: quoteInformation.file.name,
          },
        ],
      });

      return operationUuid;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Erreur lors de la création de l'opération: ${msg}`);
    }
  },

  async getContract(pro: HubspotPro, contractType: ContractType) {
    const contract = getContractFromType(contractType, !!pro?.eligibilityCee);
    if (!contract) {
      throw new Error("Type de contrat inconnu: " + contractType);
    }

    let contractId =
      contractType === "cee" ? pro.ceeContractId : pro.partnershipContractId;

    let status =
      contractId &&
      (await YouSignProvider.getSignatureRequestStatus(contractId));

    let signatureLink = null;

    if (contractId && pro.signerId) {
      if (status !== YouSignRequestStatus.ONGOING) {
        console.error(
          "🚩 Demande du lien de signature d'un document qui n'est plus en attente de signature: " +
            contractId,
        );
      } else {
        signatureLink = await YouSignProvider.getSignatureLink({
          signatureRequestId: contractId,
          signerId: pro.signerId,
        });
      }
    } else {
      const activatedContract = await ProProvider.activateContract(
        pro.uuid,
        contractType,
      );
      signatureLink = activatedContract.signatureLink;
      contractId = activatedContract.contractId;
      status = YouSignRequestStatus.ONGOING;
    }

    return {
      contractId,
      signatureLink,
      signerId: pro.signerId,
      status,
    };
  },

  async getDocuments(userUuid: UserUuid) {
    const pro = await ProRepository.getByUser(userUuid);

    if (!pro) {
      throw new Error(
        `Erreur lors la récupération des documents du pro. Aucun pro trouvé pour l'utilisateur connecté.`,
      );
    }

    const documents = await ProRepository.getRelatedDocuments(pro.uuid);
    return documents
      .map((document) => {
        const fileName = document.name;
        if (!fileName) {
          console.error(
            "🚩 Impossible de récupérer le nom du fichier.",
            document,
          );
          return null;
        }
        const trimmedFileName = fileName.replace(`[${pro.name}] `, "");

        const documentType = determineDocumentType(trimmedFileName);
        return {
          type: documentType,
          fileName: trimmedFileName,
          id: document.id,
        };
      })
      .filter((d) => PRO_FILES_METADATA_LABELS.find((l) => l === d?.type))
      .filter(isNotNullish);
  },

  getEmailTemplateDependingOnStatus(status: ProStatus | null): MailTemplateId {
    return ["Actif", "Inactif"].find((s) => s === status)
      ? "INVITE_ACTIF_INACTIF_PRO_CONTACT"
      : "INVITE_PRO_CONTACT";
  },

  async update(proUuid: ProUuid, input: InputProWithoutIds) {
    const updatedPro = await ProRepository.update(proUuid, input);

    return {
      body: updatedPro,
      status: 200,
    };
  },

  async getSummaryCardFromProspectExternal(locationUuid: LocationBdnbUuid) {
    const legalEntities =
      await LegalEntityRepository.getAllByLocation(locationUuid);
    if (!legalEntities) {
      console.error(
        `🚩 [Mise en relation] Aucune entité légale trouvée pour l'uuid: ${locationUuid}`,
      );
      throw new Error(
        `Aucune entité légale trouvée pour ce bâtiment. ${contactSupport}`,
      );
    }

    const result = await Promise.all(
      legalEntities.map<Promise<LegalEntity | null>>(async (row) => {
        const legalEntity = row.legalEntity;
        // const location = await LocationBdnbRepository.get(locationUuid);
        // if (!location) {
        //   return null;
        // }

        // @todo-lisa bizarre que l'info du place Id soit dans la location et pas dans l'entité légale
        // const placeId = location.batiments_bdnb.googlePlaceId;
        const placeId = legalEntity.googlePlaceId;

        const hasAlreadyFetched = legalEntity?.lastFetchedAtForGoogle;

        if (hasAlreadyFetched) {
          return legalEntity;
        }

        if (!placeId) {
          // This case should not happen because we fetch the placeId when we do connectWithExternalLocation
          console.error("No placeId found for location bdnb:", locationUuid);
          return legalEntity;
        }

        const placeDetails =
          await GooglePlacesProvider.getPlaceDetailsByPlaceId(placeId);

        if (!placeDetails) {
          console.error(
            `🚩 [Mise en relation] Impossible de récupérer les infos Google pour ${locationUuid}`,
          );
          return legalEntity;
        }

        await LegalEntityRepository.update(legalEntity.uuid, {
          openingHours: placeDetails.openingHours ?? null,
          rating: placeDetails.rating ?? null,
          phone: placeDetails.internationalPhoneNumber ?? null,
          userRatingCount: placeDetails.userRatingCount ?? null,
          website: placeDetails.website ?? null,
          mapsItineraryUrl: placeDetails.mapsItineraryUrl ?? null,
          lastFetchedAtForGoogle: new Date(),
        });

        return {
          ...legalEntity,
          phone:
            placeDetails?.internationalPhoneNumber ?? legalEntity.phone ?? null,
          openingHours: placeDetails?.openingHours ?? null,
          rating: placeDetails?.rating ?? null,
          userRatingCount: placeDetails?.userRatingCount ?? null,
          website: placeDetails?.website ?? null,
          mapsItineraryUrl: placeDetails?.mapsItineraryUrl ?? null,
          type: "copro" as const,
        };
      }),
    );
    return result.filter(isNotNullish);
  },

  async getDataFromProspectExternal(locationUuid: LocationBdnbUuid) {
    const legalEntities =
      await LegalEntityRepository.getAllByLocation(locationUuid);
    if (!legalEntities) {
      console.error(
        `🚩 [Mise en relation] Aucune entité légale trouvée pour l'uuid: ${locationUuid}`,
      );
      throw new Error(
        `Aucune entité légale trouvée pour ce bâtiment. ${contactSupport}`,
      );
    }

    const result = await Promise.all(
      legalEntities.map(async (row) => {
        const legalEntity = row.legalEntity;
        const externalContactsAssociations =
          await ExternalContactRepository.getAllAssociationsByLegalEntityUuid(
            legalEntity.uuid,
          );

        const externalContacts = await Promise.all(
          externalContactsAssociations.map(async (association) => {
            const contact = await ExternalContactRepository.get(
              // an association must have externalContactUuid defined
              association.externalContactUuid!,
            );
            return contact ? { ...contact, legalEntity } : legalEntity;
          }),
        );

        return externalContacts.filter(isNotNullish);
      }),
    );

    return result.flat();
  },

  async upload(proUuid: ProUuid, file: LabelledFileDto) {
    await ProProvider.attachDocument(proUuid, file);
  },

  async attachDocument(_proUuid: ProUuid, _document: LabelledFileDto) {
    // File upload to external storage removed (HubSpot deprecated)
  },

  async updateStatus(proUuid: ProUuid, status: ProStatus) {
    await ProRepository.updateStatus(proUuid, status);
  },

  async setMainContact(proUuid: ProUuid, contactUuid: ContactUuid) {
    // delete existing relation
    await ContactProProvider.delete({ proUuid, contactUuid });

    await ContactProRepository.create(
      contactUuid,
      proUuid,
      CONTACT_PRO_ASSOCIATIONS.MAIN_CONTACT,
    );
  },

  async removeMember({
    proUuid,
    contactUuid,
  }: {
    proUuid: ProUuid;
    contactUuid: ContactUuid;
  }) {
    return db.transaction(async (tx) => {
      // Serialize concurrent member removals for the same pro.
      // Locking all membership rows ensures totalMembers is evaluated atomically
      // with the subsequent delete in this transaction.
      await tx.execute(sql`
        select ${hsAssociationsContactsProsTable.uuid}
        from ${hsAssociationsContactsProsTable}
        where ${hsAssociationsContactsProsTable.proUuid} = ${proUuid}
        for update
      `);

      const [membership] = await tx
        .select({
          contactUuid: hsAssociationsContactsProsTable.contactUuid,
          associationTypeId: hsAssociationsContactsProsTable.associationTypeId,
        })
        .from(hsAssociationsContactsProsTable)
        .where(
          and(
            eq(hsAssociationsContactsProsTable.proUuid, proUuid),
            eq(hsAssociationsContactsProsTable.contactUuid, contactUuid),
          ),
        )
        .limit(1);

      if (!membership) {
        throw new Error("Ce membre n'est pas associé à ce pro.");
      }

      if (
        membership.associationTypeId ===
        CONTACT_PRO_ASSOCIATIONS.MAIN_CONTACT.id
      ) {
        const [otherMainContact] = await tx
          .select({
            contactUuid: hsAssociationsContactsProsTable.contactUuid,
          })
          .from(hsAssociationsContactsProsTable)
          .where(
            and(
              eq(hsAssociationsContactsProsTable.proUuid, proUuid),
              eq(
                hsAssociationsContactsProsTable.associationTypeId,
                CONTACT_PRO_ASSOCIATIONS.MAIN_CONTACT.id,
              ),
              ne(hsAssociationsContactsProsTable.contactUuid, contactUuid),
            ),
          )
          .limit(1);

        if (!otherMainContact) {
          throw new Error(
            "Impossible de supprimer le contact principal sans réaffectation préalable.",
          );
        }
      }

      const countRows = await tx
        .select({
          totalMembers: sql<number>`count(distinct ${hsAssociationsContactsProsTable.contactUuid})`,
        })
        .from(hsAssociationsContactsProsTable)
        .where(eq(hsAssociationsContactsProsTable.proUuid, proUuid));

      const totalMembers = Number(countRows[0]?.totalMembers ?? 0);
      if (totalMembers <= 1) {
        throw new Error("Impossible de supprimer le dernier membre du compte.");
      }

      const [deletedContact] = await tx
        .delete(hsContactsTable)
        .where(eq(hsContactsTable.uuid, contactUuid))
        .returning({
          uuid: hsContactsTable.uuid,
          email: hsContactsTable.email,
        });

      if (!deletedContact) {
        throw new Error("Aucun contact trouvé.");
      }

      return {
        contactUuid: deletedContact.uuid,
        email: deletedContact.email ?? null,
      };
    });
  },

  async activateContract(proUuid: ProUuid, contractType: ContractType) {
    const pro = await ProRepository.get(proUuid);
    if (!pro) {
      throw new Error(
        "Aucun professionnel trouvé pour l'utilisateur connecté.",
      );
    }

    const contract = getContractFromType(contractType, !!pro.eligibilityCee);
    if (!contract) {
      throw new Error("Type de contrat inconnu: " + contractType);
    }

    const documentName = `[${pro.name}] ${contract.documentName}.pdf`;

    const signatureRequestId =
      await YouSignProvider.createSignatureRequest(documentName);

    const documentId = await YouSignProvider.upload({
      signatureRequestId,
      fileUrl: `${MARKETPLACE_UI_URL}${buildAssetUrl(contract.file)}`,
      fileName: documentName,
    });

    const contractInput = {
      proUuid: pro.uuid,
      contractId: signatureRequestId,
      documentId,
    };

    if (contractType === "cee") {
      await ProRepository.attachCeeContract(contractInput);
    } else {
      await ProRepository.attachPartnershipContract(contractInput);
    }

    const [contact] = await ProRepository.getMainContacts(pro.uuid);
    if (!contact) {
      throw new Error(
        "Aucun contact principal trouvé pour le pro: " + pro.name,
      );
    }

    const fields = contract.fields(pro, contact);
    await YouSignProvider.addFieldsToDocument({
      signatureRequestId,
      documentId,
      fields,
    });

    const { email, firstName, lastName } = contact;
    if (!email || !firstName || !lastName) {
      throw new Error(
        "Informations de contact manquantes. (champs requis: email, prénom et nom): " +
          contact.uuid,
      );
    }

    const signerId = await YouSignProvider.addSigner(
      signatureRequestId,
      documentId,
      {
        email,
        firstName,
        lastName,
      },
      contract.signaturePosition,
    );
    await ProRepository.setSignerId({ proUuid: pro.uuid, signerId });

    const { signature_link } =
      await YouSignProvider.activate(signatureRequestId);

    return {
      signatureLink: signature_link ?? null,
      contractId: signatureRequestId,
    };
  },

  async signedContract(proUuid: ProUuid, contractType: ContractType) {
    const pro = await ProRepository.get(proUuid);
    if (!pro) {
      throw new Error("Aucun pro trouvé pour l'utilisateur connecté.");
    }

    const { documentId, signatureRequestId } =
      contractType === "cee"
        ? {
            signatureRequestId: pro.ceeContractId,
            documentId: pro.ceeContractDocumentId,
          }
        : {
            signatureRequestId: pro.partnershipContractId,
            documentId: pro.partnershipContractDocumentId,
          };

    if (!signatureRequestId || !documentId) {
      throw new Error("Aucun document trouvé pour le contrat.");
    }

    const blob = await YouSignProvider.downloadDocument({
      signatureRequestId,
      documentId,
    });

    const contract = getContractFromType(contractType, !!pro?.eligibilityCee);

    const today = new Date().toISOString();

    const commonDto = {
      negotiatedMargin: 18,
      negotiatedCeeRate: 6,
    };

    if (contractType === "cee") {
      await ProRepository.update(pro.uuid, {
        ceeContractSignedAt: today,
        status: "Compte en attente de validation",
        ...commonDto,
      });
    } else {
      await ProRepository.update(pro.uuid, {
        ...commonDto,
        partnershipContractSignedAt: today,
        status: !pro.eligibilityCee
          ? "Compte en attente de validation"
          : "En attente de signature plateforme",
      });
    }
  },

  async getLead(proUuid: ProUuid, operationUuid: OperationUuid) {
    const { hsOperation: operation } =
      (await OperationRepository.get(operationUuid)) ?? {};
    if (!operation) {
      console.error(
        `🚩 Impossible de récupérer l'opération avec l'uuid: ${operationUuid} pour le pro ${proUuid}`,
      );
      throw new Error(`Cette opération n’existe pas ou n’est plus disponible.`);
    }

    if (!PRO_MARKETPLACE_PHASES.find((phase) => phase === operation.phase)) {
      throw new Error(
        `Cette opération n’est plus disponible pour prise de contact. ${contactSupport}`,
      );
    }

    const locationUuid =
      await LocationRepository.getUuidByOperation(operationUuid);

    if (!locationUuid) {
      console.error(
        `🚩 Aucun bâtiment trouvé pour l'opération avec l'uuid: ${operationUuid}`,
      );
      throw new Error(
        `Aucun bâtiment trouvé pour cette opération. ${contactSupport}`,
      );
    }

    // @todo Risk of inconsistent state: Promise.all runs side-effects concurrently without transaction/compensation.
    // Consider using a transaction or compensating actions to ensure consistency.

    return Promise.all([
      ProLocationRepository.create({
        proUuid: proUuid,
        locationUuid,
        associationType: PRO_LOCATION_ASSOCIATIONS.UNBLOCKED,
      }),
      QuoteProvider.create(
        operationUuid,
        proUuid,
        operation.name,
        QuoteStage.PRO_ASSIGNED,
      ),
    ]);
  },

  async decrementCredits({
    proUuid,
    creditsToDecrement,
  }: {
    proUuid: ProUuid;
    creditsToDecrement: number;
  }) {
    const updatedPro = await ProRepository.decrementCredits({
      proUuid,
      creditsToDecrement,
    });

    if (!updatedPro) {
      const pro = await ProRepository.get(proUuid);
      if (!pro) {
        console.error(
          `🚩 [Dépense de credits] Aucun professionnel trouvé avec l'uuid: ${proUuid}`,
        );
        throw new Error(`Aucun professionnel trouvé. ${contactSupport}`);
      }

      throw new Error(`Vous n'avez plus assez de crédits.`);
    }

    if (updatedPro.remainingCredits === null) {
      throw new Error(`Vous n'avez plus assez de crédits.`);
    }
  },

  async connectWithLocation(locationUuid: LocationUuid, proUuid: ProUuid) {
    const summary =
      await ClientProvider.getSummaryCardFromLocation(locationUuid);

    await ProClientRepository.create({
      proUuid,
      clientUuid: summary.client.uuid,
      associationType: PRO_CLIENT_ASSOCIATIONS.CONNECTED,
    });

    await ProLocationRepository.create({
      proUuid: proUuid,
      locationUuid,
      associationType: PRO_LOCATION_ASSOCIATIONS.INTERESTED,
    });

    return summary;
  },

  //We want to connect a pro with an external location
  async connectWithExternalLocation(
    locationUuid: LocationBdnbUuid,
    proUuid: ProUuid,
  ) {
    return ProProvider.connectWithExternalLocations([locationUuid], proUuid);
  },

  async connectWithExternalLocationWithoutCredits(
    locationUuid: LocationBdnbUuid,
    proUuid: ProUuid,
  ) {
    return db.transaction((tx) =>
      unlockExternalLocationsInTx({
        tx,
        locationUuids: [locationUuid],
        proUuid,
      }),
    );
  },

  async connectWithExternalLocations(
    locationUuids: LocationBdnbUuid[],
    proUuid: ProUuid,
  ) {
    const uniqueUuids = Array.from(new Set(locationUuids));
    if (uniqueUuids.length === 0) {
      return { count: 0, unlockableUuids: [] };
    }

    const result = await db.transaction(async (tx) => {
      const unlockableUuids = await getUnlockableExternalLocationUuidsInTx({
        tx,
        locationUuids: uniqueUuids,
        proUuid,
      });

      if (unlockableUuids.length === 0) {
        return { count: 0, unlockableUuids: [] };
      }

      const creditsToDecrement =
        CONTACT_CONNECTION_COST * unlockableUuids.length;

      const [updatedPro] = await tx
        .update(hsProsTable)
        .set({
          remainingCredits: sql<number>`
            ${hsProsTable.remainingCredits} - ${creditsToDecrement}
          `,
        })
        .where(
          and(
            eq(hsProsTable.uuid, proUuid),
            sql<boolean>`${hsProsTable.remainingCredits} >= ${creditsToDecrement}`,
          ),
        )
        .returning({
          remainingCredits: hsProsTable.remainingCredits,
          testAccount: hsProsTable.testAccount,
        });

      if (!updatedPro) {
        const [pro] = await tx
          .select({ uuid: hsProsTable.uuid })
          .from(hsProsTable)
          .where(eq(hsProsTable.uuid, proUuid));
        if (!pro) {
          throw new Error(`Aucun professionnel trouvé. ${contactSupport}`);
        }
        throw new Error(`Vous n'avez plus assez de crédits.`);
      }

      const result = await unlockExternalLocationsInTx({
        tx,
        locationUuids: unlockableUuids,
        proUuid,
      });

      return {
        ...result,
        unlockableUuids,
        count: unlockableUuids.length,
      };
    });

    return result;
  },

  // We want to connect a pro with an legal entity and fetch the infos from external sources (google places, pappers, hunter)
  async connectProWithLegalEntity(
    legalEntityUuid: LegalEntityUuid,
    proUuid: ProUuid,
    associationType: ProLegalEntityAssociation,
  ) {
    const existing = await ProLegalEntityRepository.get({
      legalEntityUuid,
      proUuid,
      associationTypeId: associationType.id,
    });
    if (existing.length === 0) {
      try {
        // External enrichment is done before DB transaction (network I/O, potentially long-running).
        await LegalEntityProvider.refreshDataFromProviders(legalEntityUuid);
        await db.transaction(async (tx) => {
          // Serialize concurrent association attempts for the same tuple.
          await lockProLegalEntityAssociationInTx({
            tx,
            proUuid,
            legalEntityUuid,
            associationTypeId: associationType.id,
          });

          // Re-check inside the transaction to avoid race conditions on concurrent unlocks.
          const alreadyLinked = await hasProLegalEntityAssociationInTx({
            tx,
            legalEntityUuid,
            proUuid,
            associationType,
          });
          if (alreadyLinked) {
            return;
          }

          const [originPro] = await tx
            .select({ testAccount: hsProsTable.testAccount })
            .from(hsProsTable)
            .where(eq(hsProsTable.uuid, proUuid));

          // Debit credits first with an in-SQL guard; if this fails we rollback everything.
          await decrementProCreditsInTx({
            tx,
            proUuid,
            creditsToDecrement: CONTACT_DETAILS_ENRICHMENT_COST,
          });

          // Create the association only after credits are secured.
          await createProLegalEntityAssociationInTx({
            tx,
            proUuid,
            legalEntityUuid,
            associationType,
          });

          // Recompute solicitation count from source-of-truth associations table.
          // Upsert stats in the same transaction to keep association/credits/stats atomic.
          await refreshLegalEntityNbRelatedProsInTx({
            tx,
            legalEntityUuid,
            shouldUpdateLastSolicitationDate: originPro?.testAccount !== true,
          });
        });
      } catch (error) {
        console.error(
          `🚩 [Mise en relation] Erreur lors de la récupération des données pour l'entité légale ${legalEntityUuid}:`,
          error,
        );
        throw new Error(
          `Une erreur est survenue lors de la récupération des données de l'entité légale. ${contactSupport}`,
        );
      }
    }
  },

  async isLocationInFavorites(locationUuid: LocationUuid, proUuid: ProUuid) {
    const result = await ProSavedLocationRepository.get({
      locationUuid,
      proUuid,
    });

    return result.length > 0;
  },

  addLocationToFavorites(locationUuid: LocationUuid, proUuid: ProUuid) {
    return ProSavedLocationRepository.create({
      locationUuid,
      proUuid,
    });
  },

  async hasAccessToLocation(locationUuid: LocationUuid, proUuid: ProUuid) {
    const associations = await ProLocationRepository.get({
      locationUuid,
      proUuid,
    });
    return associations.some(
      (a) => a.associationTypeId === PRO_LOCATION_ASSOCIATIONS.UNBLOCKED.id,
    );
  },

  async hasAccessToExternalLocation(
    locationUuid: LocationBdnbUuid,
    proUuid: ProUuid,
  ) {
    const associations = await ProLocationRepository.getExternal({
      locationUuid,
      proUuid,
    });
    return associations.some(
      (a) => a.associationTypeId === PRO_LOCATION_ASSOCIATIONS.UNBLOCKED.id,
    );
  },

  removeLocationFromFavorites(locationUuid: LocationUuid, proUuid: ProUuid) {
    return ProSavedLocationRepository.delete({
      locationUuid,
      proUuid,
    });
  },

  async validateAndInviteMember({
    proUuid,
    contactEmail,
    inviterContactUuid,
  }: {
    proUuid: ProUuid;
    contactEmail: string;
    inviterContactUuid?: ContactUuid;
  }) {
    const pro = await ProRepository.get(proUuid);
    if (!pro) {
      throw new ProMemberInvitationNotFoundError(
        "Aucun compte trouvé pour ce pro.",
      );
    }

    const mainContacts = await ProRepository.getMainContacts(pro.uuid);
    if (!mainContacts.length) {
      throw new ProMemberInvitationForbiddenError(
        "Le compte n'a pas de contact principal. Impossible d'inviter un membre. Contacter le support.",
      );
    }

    if (
      inviterContactUuid &&
      mainContacts.find((contact) => contact.uuid === inviterContactUuid) ===
        undefined
    ) {
      throw new ProMemberInvitationForbiddenError(
        "Seul le contact principal du pro peut inviter des membres.",
      );
    }

    const maxMembersLimit = getMaxSeatsAllowed(
      pro.subscription ?? ProSubscription.FREE,
    );

    return db.transaction(async (tx) => {
      await lockProMemberInvitationInTx({
        tx,
        proUuid: pro.uuid,
      });

      const existingMembers = (
        await ContactRepository.getAllByPro(pro.uuid, { tx })
      ).filter((member) => !isEmailFromOptee(member.contact.email));

      if (existingMembers.length >= maxMembersLimit) {
        throw new ProMemberInvitationForbiddenError(
          `Vous avez atteint le nombre maximum de membres (${maxMembersLimit}) pour cette formule d'abonnement.`,
        );
      }

      return ProProvider.inviteMember(pro.uuid, contactEmail, tx);
    });
  },

  async inviteMember(
    proUuid: ProUuid,
    contactEmail: string,
    tx?: DbTransaction,
  ) {
    let createdUserUuid: UserUuid | null = null;
    try {
      const contact = await ContactRepository.getByEmail(contactEmail, { tx });
      if (contact) {
        throw new Error(
          `Un contact avec l'email ${contactEmail} existe déjà dans notre système.`,
        );
      }

      const createdUser = await AuthProvider.createUser({
        email: contactEmail,
        password: crypto.randomUUID(),
      });

      if (!createdUser) {
        throw new Error(
          `Une erreur est survenue lors de la création de l'utilisateur pour l'email ${contactEmail}. ${contactSupport}`,
        );
      }

      createdUserUuid = createdUser.user.id;

      try {
        const newContact = await ContactRepository.create(
          {
            email: contactEmail,
            userUuid: createdUser.user.id,
            origin: ContactOrigin.INVITATION_BY_PRO,
          },
          { tx },
        );

        await ContactRepository.associateToPro({
          contactUuid: newContact.uuid,
          proUuid,
          tx,
        });
      } catch (error) {
        if (createdUserUuid) {
          try {
            await AuthProvider.deleteUser({ userUuid: createdUserUuid });
          } catch (cleanupError) {
            console.error(
              `[invitation du membre] Nettoyage utilisateur échoué pour ${contactEmail}:`,
              cleanupError,
            );
          }
        }

        throw error;
      }

      await AuthProvider.inviteUser({
        email: contactEmail,
        emailTemplate: "INVITE_PRO_CONTACT",
      });

      return { email: contactEmail };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[invitation du membre] Une erreur est survenue: ${msg}`);
      throw new Error(`Erreur lors de l'invitation du membre: ${msg}`);
    }
  },
};
