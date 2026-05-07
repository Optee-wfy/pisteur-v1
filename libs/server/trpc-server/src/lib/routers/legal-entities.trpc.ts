import type { FullEnrichEnrichmentId } from "@optee/constants";
import {
  ADMIN_LEGAL_ENTITY_SORT_FIELDS,
  AssociationProExternalContactType,
  ExternalContactSource,
  fullEnrichEnrichmentId,
  FullEnrichEnrichmentStatus,
  locationsBdnbLegalEntityProListInputSchema,
} from "@optee/constants";
import { ExternalContactProvider } from "@optee/external-contact-server";
import { ContactRepository } from "@optee/contact-server";
import {
  EnrichmentProvider,
  EnrichmentRepository,
} from "@optee/enrichment-server";
import { ExternalContactRepository } from "@optee/external-contact-server";
import { FullEnrichProvider } from "@optee/fullenrich-server";
import { GooglePlacesProvider } from "@optee/google-places-server";
import {
  LegalEntityAdminProvider,
  LegalEntityProvider,
  LegalEntityRepository,
} from "@optee/legal-entity-server";
import {
  ExternalContactUuid,
  LegalEntityUuid,
  LocationBdnbUuid,
} from "@optee/models";
import { ProLegalEntityRepository } from "@optee/pro-legal-entity-server";
import { isNotNullish } from "@optee/utils";
import { randomUUID } from "crypto";
import z from "zod";
import { adminProcedure, proProcedure, router } from "../trpc";

export const legalEntityRouter = router({
  get: proProcedure()
    .input(LegalEntityUuid)
    .query(async ({ input }) => {
      return LegalEntityRepository.get(input);
    }),

  getNbRelatedPros: proProcedure()
    .input(LegalEntityUuid)
    .query(async ({ input }) => {
      return LegalEntityRepository.getNbRelatedPros(input);
    }),

  getBasicData: proProcedure()
    .input(LegalEntityUuid)
    .query(async ({ input: uuid }) => {
      const data = await LegalEntityRepository.get(uuid);

      if (!data) {
        return null;
      }

      const trimmedData = {
        ...data,
        type: null,
        siret: null,
        siren: null,
        partSiren: null,
        streetNumber: null,
        streetName: null,
        streetType: null,
        zipCode: null,
        city: null,
        phone: null,
        googlePlaceId: null,
        openingHours: null,
        mapsItineraryUrl: null,
        rating: null,
        userRatingCount: null,
        purpose: null,
      };

      if (data.streetViewUrl) {
        return trimmedData;
      }

      const address =
        data.streetNumber && data.streetName && data.city && data.zipCode
          ? `${data.streetNumber} ${data.streetName}, ${data.zipCode} ${data.city}`
          : null;

      if (!address) {
        return trimmedData;
      }

      const streetViewUrl =
        await GooglePlacesProvider.getStreetViewUrlFromAddress({
          address,
          width: 600,
          height: 400,
        });

      await LegalEntityRepository.update(uuid, { streetViewUrl });

      return {
        ...trimmedData,
        streetViewUrl,
      };
    }),

  getAllByLocationBdnb: proProcedure()
    .input(LocationBdnbUuid)
    .query(async ({ input }) => {
      return LegalEntityRepository.getAllByLocation(input);
    }),

  getAssociationsWithLocationBdnbCount: proProcedure()
    .input(LocationBdnbUuid)
    .query(async ({ input }) => {
      return LegalEntityRepository.countByLocation(input);
    }),

  getAssociationsWithPro: proProcedure()
    .input(LegalEntityUuid)
    .query(async ({ input, ctx }) => {
      return ProLegalEntityRepository.get({
        legalEntityUuid: input,
        proUuid: ctx.pro.id,
      });
    }),

  getAllPaginated: proProcedure()
    .input(locationsBdnbLegalEntityProListInputSchema)
    .mutation(({ input: filters, ctx }) =>
      LegalEntityRepository.getAllPaginated({ filters, proUuid: ctx.pro.id }),
    ),

  getAllForAdmin: adminProcedure
    .input(
      z.object({
        term: z.string().nullish(),
        page: z.number().int().min(0).default(0),
        pageSize: z.number().int().min(1).max(200).default(50),
        sort: z
          .object({
            sortBy: z.enum(ADMIN_LEGAL_ENTITY_SORT_FIELDS),
            sortOrder: z.enum(["asc", "desc"]),
          })
          .nullish(),
      }),
    )
    .query(({ input }) =>
      LegalEntityAdminProvider.getAllForAdmin({
        term: input.term,
        page: input.page,
        pageSize: input.pageSize,
        sort: input.sort,
      }),
    ),

  deleteForAdmin: adminProcedure
    .input(LegalEntityUuid)
    .mutation(({ input }) => LegalEntityAdminProvider.deleteForAdmin(input)),

  getFullEnrichEnrichmentStatusAndContacts: proProcedure()
    .input(fullEnrichEnrichmentId)
    .query(async ({ input }) => {
      const res = await EnrichmentRepository.get(input);
      if (!res) {
        return null;
      }

      const status = await EnrichmentProvider.getStatus(input);

      const contacts = (
        await Promise.all(
          (res.contacts ?? []).map((contactUuid) =>
            ExternalContactRepository.get(contactUuid as ExternalContactUuid),
          ),
        )
      ).filter(isNotNullish);

      return {
        status,
        contacts,
      };
    }),

  getActiveEnrichmentByLegalEntity: proProcedure()
    .input(LegalEntityUuid)
    .query(async ({ input }) => {
      return EnrichmentRepository.getActiveByLegalEntity(input);
    }),

  startFullEnrichEnrichment: proProcedure()
    .input(
      z.object({
        legalEntityUuid: LegalEntityUuid,
        contacts: z.array(ExternalContactUuid),
        type: z.nativeEnum(AssociationProExternalContactType),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Workflow step 0: API entry point for starting enrichment on a set of contacts.
      const userUuid = ctx.user.id;
      const contact = await ContactRepository.getByUser(userUuid);
      if (!contact) {
        // This should never happen
        console.error(
          "[FullEnrich] Could not retrieve contact linked to the logged-in user",
          { userUuid },
        );
        throw new Error(
          "Impossible de récupérer le contact lié à l'utilisateur connecté.",
        );
      }
      const { legalEntityUuid, contacts, type } = input;
      const proUuid = ctx.pro.id;
      // Workflow step 1: split contacts into "to enrich" vs. "to debit" and gather dependencies.
      const { contactsToEnrich, contactsToDebit, dependantEnrichments } =
        await LegalEntityProvider.startContactsEnrichment(
          contacts,
          proUuid,
          legalEntityUuid,
          type,
        );

      // Workflow step 2: if nothing to enrich, debit existing data and create a fake enrichment record.
      // If there is no contact to enrich, we simulate a fake enrichment
      if (!contactsToEnrich.length) {
        const fakeEnrichmentId = randomUUID() as FullEnrichEnrichmentId;

        if (contactsToDebit.length > 0) {
          await FullEnrichProvider.decrementCreditsForExistingData({
            contactsToDebit,
            proUuid,
          });
        }

        await FullEnrichProvider.createFakeEnrichmentAndDecrementCredits({
          enrichmentId: fakeEnrichmentId,
          legalEntityUuid,
          contactsToEnrich,
          proUuid,
          contactUuid: contact.uuid,
        });

        return fakeEnrichmentId;
      }

      // Workflow step 3: call FullEnrich with filtered contacts only.
      const enrichmentId = await FullEnrichProvider.startBulkEnrichment(
        contactsToEnrich,
        ctx.pro.id,
      );

      if (!enrichmentId) {
        console.error(
          "[FullEnrich] Bulk enrichment did not return an id; no enrichment record created",
          {
            legalEntityUuid,
            contactsToEnrich: contactsToEnrich.map((c) => c.contact.uuid),
          },
        );
        throw new Error(
          "[FullEnrich] Impossible de créer l'enrichissement : aucun identifiant retourné par FullEnrich.",
        );
      }

      // Workflow step 4: dev environment uses simulated enrichment + debit.
      // If VITE_ENV is not preview or production, we are in development environment
      if (
        process.env["VITE_ENV"] !== "preview" &&
        process.env["VITE_ENV"] !== "production"
      ) {
        if (contactsToDebit.length > 0) {
          await FullEnrichProvider.decrementCreditsForExistingData({
            contactsToDebit,
            proUuid,
          });
        }
        await FullEnrichProvider.createFakeEnrichmentAndDecrementCredits({
          enrichmentId,
          legalEntityUuid,
          contactsToEnrich,
          proUuid,
          contactUuid: contact.uuid,
        });
        return enrichmentId;
      }

      // Workflow step 5: debit existing data (already in DB), then persist enrichment record.
      if (contactsToDebit.length > 0) {
        await FullEnrichProvider.decrementCreditsForExistingData({
          contactsToDebit,
          proUuid,
        });
      }

      await EnrichmentRepository.create({
        enrichmentId,
        legalEntityUuid: legalEntityUuid,
        contacts: contactsToEnrich.map((c) => c.contact.uuid),
        status: FullEnrichEnrichmentStatus.CREATED,
        dependsOn: dependantEnrichments,
        startedAt: new Date(),
        proUuid,
        contactUuid: contact.uuid,
      });
      return enrichmentId;
    }),

  getMembers: proProcedure()
    .input(LegalEntityUuid)
    .query(async ({ input, ctx }) => {
      return LegalEntityProvider.getSearchableMembers(input, ctx.pro.id);
    }),

  getMembersCount: proProcedure()
    .input(LegalEntityUuid)
    .query(async ({ input, ctx }) => {
      const [knownContacts, searchableContacts] = await Promise.all([
        ExternalContactProvider.getAllByLegalEntity(input),
        LegalEntityProvider.getSearchableMembers(input, ctx.pro.id),
      ]);

      const excludedRoles = [
        "Administrateur",
        "Commissaire aux comptes",
        "Commissaire aux comptes titulaire",
        "Commissaire aux comptes suppléant",
      ];

      let pappersContactsCount = 0;

      return [...knownContacts, ...searchableContacts]
        .filter((row, index, self) => {
          return (
            index ===
            self.findIndex((candidate) => {
              if ("uuid" in candidate.contact && "uuid" in row.contact) {
                const rowUuid = row.contact.uuid;
                const candidateUuid = candidate.contact.uuid;
                const bothUuidsPresent =
                  rowUuid !== null &&
                  rowUuid !== undefined &&
                  candidateUuid !== null &&
                  candidateUuid !== undefined;

                if (bothUuidsPresent) {
                  return candidateUuid === rowUuid;
                }
              }

              const rowSocieteInfoId = row.contact.societeInfoId;
              const candidateSocieteInfoId = candidate.contact.societeInfoId;
              const bothSocieteInfoIdsPresent =
                rowSocieteInfoId !== null &&
                rowSocieteInfoId !== undefined &&
                candidateSocieteInfoId !== null &&
                candidateSocieteInfoId !== undefined;

              if (bothSocieteInfoIdsPresent) {
                return candidateSocieteInfoId === rowSocieteInfoId;
              }

              return false;
            })
          );
        })
        .filter((row) => {
          if (row.contact.role) {
            return !excludedRoles.includes(row.contact.role);
          }

          return true;
        })
        .filter((row) => {
          if (row.contact.origin === ExternalContactSource.PAPPERS) {
            if (pappersContactsCount < 10) {
              pappersContactsCount++;
              return true;
            }

            return false;
          }

          return true;
        }).length;
    }),
});
