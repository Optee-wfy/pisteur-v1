import type {
  FullEnrichEnrichmentId,
  LegalFormToExcludeFromGoogleAndHunterSearch,
} from "@optee/constants";
import {
  AssociationProExternalContactType,
  coerceSeniority,
  contactSupport,
  ExternalContactSeniority,
  ExternalContactSource,
  ExternalContactType,
  LEGAL_FORM_TO_EXCLUDE_FROM_GOOGLE_AND_HUNTER_SEARCH,
  SIX_MONTHS_DURATION,
} from "@optee/constants";
import { EnrichmentRepository } from "@optee/enrichment-server";
import {
  ExternalContactProvider,
  ExternalContactRepository,
} from "@optee/external-contact-server";
import { GooglePlacesProvider } from "@optee/google-places-server";
import type {
  ExternalContact,
  ExternalContactUuid,
  LegalEntity,
  LegalEntityUuid,
  ProUuid,
} from "@optee/models";
import type { Officer } from "@optee/pappers-server";
import {
  mapPappersWorkforceRange,
  PappersProvider,
} from "@optee/pappers-server";
import { isNotNullish } from "@optee/utils";
import {
  buildEnrichFields,
  buildRequestedEnrichmentType,
  getContactPresence,
  getDebitType,
  getEnrichmentFlags,
  getPaidFlags,
  getRecentlyFetched,
  getRequestedType,
  getSkipReasons,
} from "../helpers/fullenrich-enrichment";
import { LegalEntityRepository } from "../repositories/legal-entity.repository";

export const LegalEntityProvider = {
  async setGooglePlaceId(legalEntityUuid: LegalEntityUuid) {
    const entity = await LegalEntityRepository.get(legalEntityUuid);

    if (!entity) {
      console.error(
        `🚩 [Mise en relation] Aucune entreprise trouvée pour l'uuid: ${legalEntityUuid}`,
      );
      throw new Error(`Aucune entreprise trouvée. ${contactSupport}`);
    }

    const identifier = [
      entity.name,
      entity.streetType,
      entity.streetName,
      entity.city,
    ]
      .filter(Boolean)
      .join(" ");

    const placeId = await GooglePlacesProvider.getPlaceId(identifier);

    if (!placeId) {
      await LegalEntityRepository.update(legalEntityUuid, {
        isUnavailableForGoogle: true,
        lastFetchedAtForGoogle: new Date(),
      });
    } else {
      await LegalEntityRepository.update(legalEntityUuid, {
        isUnavailableForGoogle: false,
        lastFetchedAtForGoogle: new Date(),
        googlePlaceId: placeId,
      });
    }

    return placeId;
  },

  async updateGooglePlacesData(legalEntity: LegalEntity) {
    if (
      legalEntity.lastFetchedAtForGoogle &&
      new Date().getTime() - legalEntity.lastFetchedAtForGoogle.getTime() <
        SIX_MONTHS_DURATION
    ) {
      return legalEntity;
    }

    const fetchedAt = new Date();

    if (
      legalEntity.legalForm &&
      LEGAL_FORM_TO_EXCLUDE_FROM_GOOGLE_AND_HUNTER_SEARCH.includes(
        legalEntity.legalForm as LegalFormToExcludeFromGoogleAndHunterSearch,
      )
    ) {
      await LegalEntityRepository.update(legalEntity.uuid, {
        isUnavailableForGoogle: true,
        lastFetchedAtForGoogle: fetchedAt,
      });
      return legalEntity;
    }

    try {
      const legalEntityPlaceId = await LegalEntityProvider.setGooglePlaceId(
        legalEntity.uuid,
      );

      if (!legalEntityPlaceId) {
        throw new Error("Aucun Place ID disponible");
      }

      const placeDetails =
        await GooglePlacesProvider.getPlaceDetailsByPlaceId(legalEntityPlaceId);

      if (!placeDetails) {
        throw new Error("Aucune information trouvée sur Google Places");
      }

      await LegalEntityRepository.update(legalEntity.uuid, {
        openingHours: placeDetails.openingHours ?? null,
        rating: placeDetails.rating ?? null,
        phone: placeDetails.internationalPhoneNumber ?? null,
        userRatingCount: placeDetails.userRatingCount ?? null,
        website: placeDetails.website ?? null,
        mapsItineraryUrl: placeDetails.mapsItineraryUrl ?? null,
        businessStatus: placeDetails.businessStatus ?? null,
        lastFetchedAtForGoogle: fetchedAt,
      });

      return {
        ...legalEntity,
        phone:
          placeDetails?.internationalPhoneNumber ?? legalEntity.phone ?? null,
        openingHours: placeDetails?.openingHours ?? null,
        rating: placeDetails?.rating ?? null,
        userRatingCount: placeDetails?.userRatingCount ?? null,
        website: placeDetails?.website ?? null,
        businessStatus: placeDetails?.businessStatus ?? null,
        mapsItineraryUrl: placeDetails?.mapsItineraryUrl ?? null,
      };
    } catch (error) {
      await LegalEntityRepository.update(legalEntity.uuid, {
        isUnavailableForGoogle: true,
        lastFetchedAtForGoogle: fetchedAt,
      });
      console.error(
        `🚩 Récupération des données Google en échec pour l'entité légale [${legalEntity.uuid}]: ${error instanceof Error ? error.message : String(error)}`,
      );
      return legalEntity;
    }
  },

  async updatePappersData(legalEntity: LegalEntity) {
    if (
      legalEntity.lastFetchedAtForPappers &&
      new Date().getTime() - legalEntity.lastFetchedAtForPappers.getTime() <
        SIX_MONTHS_DURATION
    ) {
      const existingContacts =
        await ExternalContactRepository.getAllByLegalEntity(legalEntity.uuid);
      return existingContacts.map((contact) => ({
        legalEntityUuid: legalEntity.uuid,
        ...contact,
      }));
    }

    if (legalEntity.isUnavailableForPappers) {
      return [];
    }

    try {
      const siren = legalEntity.siren;

      if (!siren) {
        throw new Error("Aucun SIREN disponible");
      }

      const pappersData = await PappersProvider.fetchCompanyInfo(siren);

      if (!pappersData) {
        throw new Error("Aucune information trouvée sur Pappers");
      }

      const officers = pappersData.officers.filter(
        (officer: Officer) => officer.type === "physical",
      );

      if (officers.length === 0) {
        throw new Error("Aucun dirigeant physique trouvé");
      }

      const rawRange = pappersData.workforce_range;

      const nbEmployeesRange = mapPappersWorkforceRange(rawRange);

      await LegalEntityRepository.update(legalEntity.uuid, {
        lastFetchedAtForPappers: new Date(),
        isUnavailableForPappers: false,
        purpose: pappersData.purpose ?? null,
        mainBusinessActivity: pappersData.local_activities
          ? pappersData.local_activities[0]?.code
          : (legalEntity.mainBusinessActivity ?? null),
        nbEmployeesRange:
          nbEmployeesRange ?? legalEntity.nbEmployeesRange ?? null,
        siret: pappersData.establishments
          ? pappersData.establishments[0]?.number
          : (legalEntity.siret ?? null),
      });

      const createdContacts = await Promise.all(
        officers.map((officer: Officer) =>
          ExternalContactProvider.create(
            {
              firstName: officer.first_name,
              lastName: officer.last_name,
              role: officer.role,
              department: "Direction",
              seniority: ExternalContactSeniority.DIRIGEANT,
              origin: ExternalContactSource.PAPPERS,
              type: ExternalContactType.PERSONAL,
            },
            legalEntity.uuid,
          ),
        ),
      );

      return createdContacts.filter(isNotNullish);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      // Extract HTTP status if present (ex: "401 : message")
      const statusMatch = message.match(/(\d{3})\s*:/);
      const status = statusMatch ? Number(statusMatch[1]) : null;

      if (status === 401) {
        if (message.includes("api_token")) {
          throw new Error(
            "Une erreur de token est survenue avec l'API Pappers. Merci de contacter le support.",
          );
        }

        if (message.includes("credits")) {
          throw new Error(
            "Une erreur de crédits est survenue avec l'API Pappers. Merci de contacter le support.",
          );
        }

        throw new Error(
          `Une erreur est survenue avec l'API Pappers. Merci de contacter le support.`,
        );
      } else {
        await LegalEntityRepository.update(legalEntity.uuid, {
          isUnavailableForPappers: true,
          lastFetchedAtForPappers: new Date(),
        });
      }

      console.error(
        `🚩 Récupération des données Pappers en échec pour l'entité légale [${legalEntity.uuid}]: ${message}`,
      );

      return [];
    }
  },

  // async updateHunterData(legalEntity: LegalEntity) {
  //   // Skip fetching from Hunter if last fetched was less than 3 months ago AND if last fetched date is after merge date
  //   // Merge date is the date we updated the hunter select logic
  //   const mergeDate = new Date("2026-01-05T00:00:00Z");
  //   if (
  //     legalEntity.lastFetchedAtForHunter &&
  //     new Date().getTime() - legalEntity.lastFetchedAtForHunter.getTime() <
  //       THREE_MONTHS_DURATION &&
  //     legalEntity.lastFetchedAtForHunter.getTime() > mergeDate.getTime()
  //   ) {
  //     const existingContacts =
  //       await ExternalContactRepository.getAllByLegalEntity(legalEntity.uuid);
  //     return existingContacts.map((contact) => ({
  //       legalEntityUuid: legalEntity.uuid,
  //       ...contact,
  //     }));
  //   }

  //   const fetchedAt = new Date();

  //   if (
  //     legalEntity.legalForm &&
  //     LEGAL_FORM_TO_EXCLUDE_FROM_GOOGLE_AND_HUNTER_SEARCH.includes(
  //       legalEntity.legalForm as LegalFormToExcludeFromGoogleAndHunterSearch,
  //     )
  //   ) {
  //     await LegalEntityRepository.update(legalEntity.uuid, {
  //       isUnavailableForHunter: true,
  //       lastFetchedAtForHunter: fetchedAt,
  //     });
  //     const existingContacts =
  //       await ExternalContactRepository.getAllByLegalEntity(legalEntity.uuid);
  //     return existingContacts.map((contact) => ({
  //       legalEntityUuid: legalEntity.uuid,
  //       ...contact,
  //     }));
  //   }

  //   if (legalEntity.isUnavailableForHunter) {
  //     return [];
  //   }

  //   const domain = legalEntity.website;
  //   if (!domain) {
  //     console.error(
  //       `🚩 [Mise en relation] Aucune URL de site web trouvée pour l'entité légale: ${legalEntity.uuid}`,
  //     );
  //     await LegalEntityRepository.update(legalEntity.uuid, {
  //       isUnavailableForHunter: true,
  //       lastFetchedAtForHunter: fetchedAt,
  //     });
  //     return [];
  //   }

  //   try {
  //     const hunterData = await HunterProvider.fetchHunterData(domain);

  //     if (!hunterData) {
  //       throw new Error("Aucune information trouvée sur Hunter");
  //     }

  //     if (!hunterData.emails || hunterData.emails.length === 0) {
  //       console.error(
  //         `🚩 [Mise en relation] Aucune donnée trouvée sur Hunter pour le domaine: ${domain}`,
  //       );
  //       await LegalEntityRepository.update(legalEntity.uuid, {
  //         isUnavailableForHunter: true,
  //         lastFetchedAtForHunter: fetchedAt,
  //       });
  //       return [];
  //     }

  //     const emailsFound = hunterData.emails;

  //     await LegalEntityRepository.update(legalEntity.uuid, {
  //       isUnavailableForHunter: false,
  //       lastFetchedAtForHunter: fetchedAt,
  //     });

  //     const { isGroupDomain } = formatAndGroupDomain(domain);

  //     const created = await Promise.all(
  //       emailsFound.map(async (email) => {
  //         try {
  //           const ec = await ExternalContactRepository.create({
  //             firstName: email.first_name ?? null,
  //             lastName: email.last_name ?? null,
  //             email: email.value,
  //             phone: email.phone_number ?? null,
  //             linkedInUrl: email.linkedin ?? null,
  //             twitterUrl: email.twitter ?? null,
  //             role: email.position ?? null,
  //             confidenceScore: email.confidence ?? null,
  //             origin: isGroupDomain
  //               ? ExternalContactSource.HUNTER_GROUP
  //               : ExternalContactSource.HUNTER,
  //             type: email.type ?? null,
  //             seniority: email.seniority ?? null,
  //             department: email.department ?? null,
  //             createdAt: new Date(),
  //           });
  //           if (!ec) {
  //             throw new Error(
  //               `Une erreur est survenue lors de la création du contact externe. ${contactSupport}`,
  //             );
  //           }
  //           await ExternalContactRepository.associateWithLegalEntity(
  //             legalEntity.uuid,
  //             ec.uuid,
  //           );
  //           return {
  //             legalEntityUuid: legalEntity.uuid,
  //             firstName: ec.firstName,
  //             lastName: ec.lastName,
  //             email: ec.email,
  //             phone: ec.phone,
  //             linkedInUrl: ec.linkedInUrl,
  //             twitterUrl: ec.twitterUrl,
  //             role: ec.role,
  //             confidenceScore: ec.confidenceScore,
  //             type: ec.type,
  //             seniority: ec.seniority,
  //             department: ec.department,
  //           };
  //         } catch (error) {
  //           console.error(
  //             `🚩 Récupération des données Hunter en échec pour l'entité légale [${legalEntity.uuid}]: ${error instanceof Error ? error.message : String(error)}`,
  //           );
  //           return null;
  //         }
  //       }),
  //     );

  //     return created.filter(isNotNullish);
  //   } catch (error) {
  //     await LegalEntityRepository.update(legalEntity.uuid, {
  //       isUnavailableForHunter: true,
  //       lastFetchedAtForHunter: fetchedAt,
  //     });
  //     console.error(
  //       `🚩 Récupération des données Hunter en échec pour l'entité légale [${legalEntity.uuid}]: ${error instanceof Error ? error.message : String(error)}`,
  //     );
  //     return [];
  //   }
  // },

  // updateSocieteInfoData: async (
  //   legalEntity: LegalEntity,
  //   excludeLeaders: boolean,
  // ) => {
  //   if (
  //     legalEntity.lastFetchedAtForSocieteInfo &&
  //     new Date().getTime() - legalEntity.lastFetchedAtForSocieteInfo.getTime() <
  //       SIX_MONTHS_DURATION
  //   ) {
  //     const existingContacts =
  //       await ExternalContactRepository.getAllByLegalEntity(legalEntity.uuid);
  //     return existingContacts.map((contact) => ({
  //       legalEntityUuid: legalEntity.uuid,
  //       ...contact,
  //     }));
  //   }

  //   if (legalEntity.isUnavailableForSocieteInfo) {
  //     return [];
  //   }

  //   const fetchedAt = new Date();

  //   try {
  //     const siren = legalEntity.siren;

  //     if (!siren) {
  //       throw new Error("Aucun SIREN disponible");
  //     }

  //     const societeInfoResponse = await SocieteInfoProvider.get({
  //       siren,
  //       excludeLeaders,
  //     });

  //     if ("errorCode" in societeInfoResponse) {
  //       if (societeInfoResponse.errorCode === "API_MAX_MATCH_EXCEEDED") {
  //         return [];
  //       }
  //       if (societeInfoResponse.errorCode === "NO_MATCH") {
  //         await LegalEntityRepository.update(legalEntity.uuid, {
  //           lastFetchedAtForSocieteInfo: fetchedAt,
  //           isUnavailableForSocieteInfo: true,
  //         });
  //         return [];
  //       }
  //       throw new Error(
  //         `Societe Info API error: ${societeInfoResponse.errorCode}`,
  //       );
  //     }

  //     const contacts = societeInfoResponse.contacts;

  //     if (!contacts || contacts.length === 0) {
  //       throw new Error("Aucun contact trouvé sur Societe Info");
  //     }

  //     await LegalEntityRepository.update(legalEntity.uuid, {
  //       lastFetchedAtForSocieteInfo: fetchedAt,
  //       isUnavailableForSocieteInfo: false,
  //     });

  //     const created = await Promise.all(
  //       contacts.map(async (contact) => {
  //         const ec = await ExternalContactRepository.create({
  //           firstName: contact.firstName,
  //           lastName: contact.lastName,
  //           email: contact.email,
  //           role: contact.role,
  //           origin: ExternalContactSource.SOCIETE_INFO,
  //           type: ExternalContactType.PERSONAL,
  //           department: contact.domain_label ?? null,
  //           confidenceScore: contact.contact_score
  //             ? contact.contact_score * 100
  //             : null,
  //           createdAt: new Date(),
  //         });
  //         if (!ec) {
  //           console.error(
  //             `🚩 Récupération des données Societe Info en échec pour l'entité légale [${legalEntity.uuid}]: Impossible de créer le contact externe.`,
  //           );
  //           return null;
  //         }
  //         await ExternalContactRepository.associateWithLegalEntity(
  //           legalEntity.uuid,
  //           ec.uuid,
  //         );
  //         return {
  //           legalEntityUuid: legalEntity.uuid,
  //           firstName: ec.firstName,
  //           lastName: ec.lastName,
  //           email: ec.email,
  //           role: ec.role,
  //           confidenceScore: ec.confidenceScore,
  //           department: ec.department,
  //         };
  //       }),
  //     );

  //     return created.filter(isNotNullish);
  //   } catch (error) {
  //     const message = error instanceof Error ? error.message : String(error);

  //     console.error(
  //       `🚩 Récupération des données Societe Info en échec pour l'entité légale [${legalEntity.uuid}]: ${message}`,
  //     );

  //     await LegalEntityRepository.update(legalEntity.uuid, {
  //       isUnavailableForSocieteInfo: true,
  //       lastFetchedAtForSocieteInfo: fetchedAt,
  //     });

  //     return [];
  //   }
  // },
  /**
   * Refresh legal entity data from external providers (Google Places, Pappers) and update the legal entity accordingly
   * @param legalEntityUuid Legal entity identier
   * @returns Updated entity
   */
  async refreshDataFromProviders(legalEntityUuid: LegalEntityUuid) {
    try {
      const legalEntity = await LegalEntityRepository.get(legalEntityUuid);

      if (!legalEntity) {
        throw new Error(`Aucune entité légale trouvée. ${contactSupport}`);
      }

      const updatedEntity =
        await LegalEntityProvider.updateGooglePlacesData(legalEntity);

      // Utiliser la version enrichie pour les appels suivants
      const entityForFollowUps = updatedEntity ?? legalEntity;

      // const newExternalContactsFromHunter =
      //   await LegalEntityProvider.updateHunterData(entityForFollowUps);
      const newExternalContacts =
        await LegalEntityProvider.updatePappersData(entityForFollowUps);

      // const newExternalContactsFromSocieteInfo =
      //   await LegalEntityProvider.updateSocieteInfoData(
      //     entityForFollowUps,
      //     newExternalContactsFromPappers.length !== 0,
      //   );

      // const newExternalContacts = newExternalContactsFromPappers.concat(
      //   newExternalContactsFromHunter,
      //   newExternalContactsFromSocieteInfo,
      // );

      const noContactCanBeFound =
        legalEntity.type !== "public" && // pour public, on a déjà le numéro de téléphone et email
        !updatedEntity.phone &&
        !updatedEntity.email &&
        !updatedEntity.website &&
        newExternalContacts.length === 0;

      // Dans le cas de copro/tertiaire, si je n'ai pas de téléphone, ni d'email, et que je n'ai pas pu contacter Pappers ni obtenu une url via google, alors je le flag en isUnavailable
      if (noContactCanBeFound) {
        await LegalEntityRepository.update(legalEntity.uuid, {
          noContactCanBeFound,
        });
      }

      return {
        legalEntity: entityForFollowUps,
        externalContacts: newExternalContacts,
      };
    } catch (error) {
      console.error(
        `🚩 Échec de la récupération des données externes pour l'entité légale [${legalEntityUuid}]: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new Error(
        `Échec de la récupération des données externes pour l'entité légale. ${contactSupport}`,
      );
    }
  },

  /**
   * Prepare contacts for enrichment and filter out those that don't need enrichment
   * Associate contacts with the pro
   * @param externalContactsUuids
   * @param proUuid
   * @param legalEntityUuid
   * @param type
   * @returns contacts to enrich and dependant enrichments
   */
  async startContactsEnrichment(
    externalContactsUuids: ExternalContactUuid[],
    proUuid: ProUuid,
    legalEntityUuid: LegalEntityUuid,
    type: AssociationProExternalContactType,
  ) {
    // Workflow step 1: decide which contacts need enrichment vs. debit-only, then queue enrichments.
    const contactsToEnrich = [];
    const contactsToDebit = [];
    const dependantEnrichments: FullEnrichEnrichmentId[] = [];

    const legalEntity = await LegalEntityRepository.get(legalEntityUuid);

    if (!legalEntity) {
      console.error(
        `🚩 [Mise en relation] Aucune entité légale trouvée pour l'uuid: ${legalEntityUuid}`,
      );
      throw new Error(
        `Aucune entité légale trouvée pour cet uuid. ${contactSupport}`,
      );
    }

    const { name, website } = legalEntity;

    for (const contactUuid of externalContactsUuids) {
      const contact = await ExternalContactRepository.get(contactUuid);

      if (!contact) {
        console.error(
          `🚩 [Mise en relation] Aucune contact externe trouvée pour l'uuid: ${contactUuid}`,
        );
        continue;
      }

      const existingAssociation =
        await ExternalContactRepository.getAssociationWithPro({
          proUuid,
          externalContactUuid: contactUuid,
        });
      const previousAssociationType =
        existingAssociation?.associationType ??
        AssociationProExternalContactType.NONE;

      // We update the association according to the requested type
      await ExternalContactRepository.associateWithPro(
        proUuid,
        contactUuid,
        type,
      );

      const { hasEmail, hasPhone } = getContactPresence(contact);
      const { hasPaidEmail, hasPaidPhone } = getPaidFlags(
        previousAssociationType,
      );
      const { requestEmail, requestPhone } = getRequestedType({
        type,
        hasPaidEmail,
        hasPaidPhone,
      });
      const { allRequestedDataPresent, shouldEnrichEmail, shouldEnrichPhone } =
        getEnrichmentFlags({
          requestEmail,
          requestPhone,
          hasEmail,
          hasPhone,
        });
      const requestedType = buildRequestedEnrichmentType({
        shouldEnrichEmail,
        shouldEnrichPhone,
      });
      const { debitType } = getDebitType({
        requestEmail,
        requestPhone,
        hasEmail,
        hasPhone,
        hasPaidEmail,
        hasPaidPhone,
      });

      // If requested data already exists, we will debit without calling FullEnrich.
      if (debitType !== AssociationProExternalContactType.NONE) {
        contactsToDebit.push({
          contact,
          previousAssociationType,
          requestedType: debitType,
        });
      }
      const recentlyFetched = getRecentlyFetched(contact);

      const hasRequestedSameTypeAsBefore =
        requestedType === previousAssociationType;

      const skipReasons = getSkipReasons({
        contact,
        requestedType,
        allRequestedDataPresent,
        hasRequestedSameTypeAsBefore,
        recentlyFetched,
      });

      // Skip enrichment when data is already complete or the contact is not enrichable.
      if (skipReasons.length > 0) {
        continue;
      }

      const enrichmentsInProgress =
        await EnrichmentRepository.whichEnrichmentsContain(contactUuid);

      // skip if an enrichment is already in progress for this contact
      if (enrichmentsInProgress?.length) {
        dependantEnrichments.push(
          ...(enrichmentsInProgress
            ?.map((e) => e.enrichmentId)
            .filter(isNotNullish) || []),
        );
        continue;
      }

      const enrichFields = buildEnrichFields({
        shouldEnrichEmail,
        shouldEnrichPhone,
      });

      contactsToEnrich.push({
        contact,
        website: website ?? "",
        name: name ?? "",
        previousAssociationType,
        associationType: requestedType,
        enrichFields,
      });
    }
    const uniqueDependantEnrichments = [...new Set(dependantEnrichments)];
    return {
      contactsToEnrich,
      contactsToDebit,
      dependantEnrichments: uniqueDependantEnrichments,
    };
  },

  async getSearchableMembers(
    legalEntityUuid: LegalEntityUuid,
    proUuid: ProUuid,
  ) {
    const legalEntity = await LegalEntityRepository.get(legalEntityUuid);
    if (!legalEntity) {
      throw new Error(
        `Aucune entité légale trouvée pour cet identifiant. ${contactSupport}`,
      );
    }
    // Fetch all external contacts already associated with the legal entity
    await LegalEntityProvider.updatePappersData(legalEntity);
    const { searchable: searchableContacts, knownByPro } =
      await ExternalContactProvider.buildSearchableContacts({
        legalEntityUuid,
        proUuid,
      });

    const societeInfoContacts =
      await ExternalContactProvider.fetchSocieteInfoContacts({
        siren: legalEntity.siren,
        context: {
          legalEntityUuid,
          proUuid,
        },
      });

    console.log(
      `ℹ️ [Mise en relation] Pour l'entité légale ${legalEntity.uuid}, ${searchableContacts.length} contacts recherchables trouvés via les contacts existants, et ${societeInfoContacts.length} contacts trouvés via Societe Info.`,
    );

    const res = [
      ...searchableContacts,
      ...societeInfoContacts.map((contact) => ({
        contact: {
          // uuid: contact.id as ExternalContactUuid,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          role: contact.role,
          origin: ExternalContactSource.SOCIETE_INFO,
          type: ExternalContactType.PERSONAL,
          department: contact.domain_label ?? null,
          seniority: coerceSeniority(contact.level_label),
          confidenceScore: contact.contact_score
            ? contact.contact_score * 100
            : null,
          societeInfoId: contact.id,
        } satisfies Partial<ExternalContact>,
        associationType:
          knownByPro.find((row) => row.contact.societeInfoId === contact.id)
            ?.associationType || null,
        legalEntities: [legalEntity],
      })),
    ];
    // We return all contacts, but we mask personal data for contacts not already associated with the pro
    return res.map((row) =>
      row.associationType
        ? row
        : {
            ...row,
            contact: {
              ...row.contact,
              firstName: null,
              lastName: null,
              email: null,
              phone: null,
              linkedInUrl: null,
            },
          },
    );
  },
};
