import {
  PRO_LOCATION_ASSOCIATIONS,
  QuoteRejectReason,
  QuoteStage,
  UserType,
} from "@optee/constants";
import { ContactRepository } from "@optee/contact-server";
import { FileProvider } from "@optee/file-server";
import {
  AttachmentHsId,
  hsLocationsTable,
  hsOperationsTable,
  hsProsTable,
  hsQuotesTable,
  LocationUuid,
  OperationUuid,
  ProUuid,
  QuoteHsId,
  QuoteUuid,
} from "@optee/models";
import { OperationRepository } from "@optee/operation-server";
import { ProLocationRepository } from "@optee/pro-location-server";
import { ProRepository } from "@optee/pro-server";
import { QuoteProvider, QuoteRepository } from "@optee/quote-server";
import { fileDtoSchema } from "@optee/utils";
import { TRPCError } from "@trpc/server";
import { eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import {
  adminProcedure,
  clientProcedure,
  privateProcedure,
  proProcedure,
  publicProcedure,
  router,
} from "../trpc";

export const quotesRouter = router({
  get: clientProcedure(["QUOTE_READ_BY_CLIENT", "QUOTE_READ_BY_LOCATION"])
    .input(z.object({ uuid: QuoteUuid }))
    .query(({ input, ctx }) =>
      QuoteProvider.get({
        userUuid: ctx.user.id,
        quoteUuid: input.uuid,
      }),
    ),

  getFileUrl: privateProcedure
    .input(
      z.object({
        hsId: AttachmentHsId,
        quoteUuid: QuoteUuid,
        loggedAs: z.nativeEnum(UserType),
      }),
    )
    .query(async ({ input, ctx }) => {
      const forbiddenMsg = `Vous n'avez pas les permissions nécessaires pour accéder à ce fichier.`;
      if (input.loggedAs === UserType.CLIENT) {
        const hasAccess = ctx.permissionsSlugs.includes("QUOTE_READ_BY_CLIENT");
        if (!hasAccess) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: forbiddenMsg,
          });
        }
      } else if (input.loggedAs === UserType.PRO) {
        const quotePro = await QuoteRepository.getRelatedPro(input.quoteUuid);
        const currentPro = await ProRepository.getByUser(ctx.user.id);
        if (!currentPro || quotePro?.uuid !== currentPro?.uuid) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: forbiddenMsg,
          });
        }
      } else if (input.loggedAs === UserType.ADMIN && !ctx.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: forbiddenMsg,
        });
      }

      return null;
    }),

  getSignatureLink: clientProcedure(["QUOTE_SIGN"])
    .input(QuoteUuid)
    .mutation(({ ctx, input: uuid }) =>
      QuoteProvider.getOrCreateSignatureLink(uuid, ctx.user.id),
    ),

  getAllForClientByLoggedUser: clientProcedure([
    "QUOTE_READ_BY_CLIENT",
    "QUOTE_READ_BY_LOCATION",
  ])
    .input(
      z
        .object({
          filter: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      const wheres = [];
      if (input?.filter) {
        const filterPattern = `%${input.filter}%`;
        wheres.push(
          or(
            ilike(hsOperationsTable.name, filterPattern),
            ilike(hsQuotesTable.name, filterPattern),
            ilike(hsLocationsTable.streetName, filterPattern),
            ilike(hsLocationsTable.city, filterPattern),
            ilike(hsProsTable.name, filterPattern),
          ),
        );
      }

      let rows = null;

      if (ctx.permissionsSlugs.includes("QUOTE_READ_BY_CLIENT")) {
        rows = await QuoteRepository.getAllForUserByClient(ctx.user.id, wheres);
      } else if (ctx.permissionsSlugs.includes("QUOTE_READ_BY_LOCATION")) {
        rows = await QuoteRepository.getAllForUserByLocation(
          ctx.user.id,
          wheres,
        );
      } else {
        throw new Error(
          "Vous n'avez pas les permissions suffisantes pour lister les devis.",
        );
      }

      const updatableCache = new Map<OperationUuid, boolean>();

      return Promise.all(
        rows.map(async (row) => {
          const contactUuid = await OperationRepository.getSignatoryUuid(
            row.hsOperation.uuid,
          );

          if (!contactUuid) {
            return { ...row, signatoryContact: null };
          }
          const contact = await ContactRepository.get(contactUuid);

          if (!contact) {
            return { ...row, signatoryContact: null };
          }

          const { uuid, email, firstName, lastName } = contact;

          let updatable = updatableCache.get(row.hsOperation.uuid);

          if (updatable === undefined) {
            updatable = await OperationRepository.canSignatoryBeUpdated(
              row.hsOperation.uuid,
            );
            updatableCache.set(row.hsOperation.uuid, updatable);
          }

          return {
            ...row,
            signatoryContact: {
              uuid,
              email,
              firstName,
              lastName,
              updatable,
            },
          };
        }),
      );
    }),

  getAllByOperationUuid: privateProcedure
    .input(
      z.object({
        operationUuid: OperationUuid,
        displayFor: z.nativeEnum(UserType),
      }),
    )
    .query(async ({ input, ctx }) => {
      let rows = null;
      if (input.displayFor === UserType.PRO) {
        const pro = await ProRepository.getByUser(ctx.user.id);
        if (!pro) {
          throw new Error(
            "Vous n'avez pas les permissions suffisantes pour accéder à cette ressource.",
          );
        }
        rows = await QuoteRepository.getAllForProByOperation({
          operationUuid: input.operationUuid,
          proUuid: pro.uuid,
        });
      } else if (input.displayFor === UserType.CLIENT) {
        if (ctx.permissionsSlugs.includes("QUOTE_READ_BY_CLIENT")) {
          rows = await QuoteRepository.getAllForUserByClient(ctx.user.id, [
            eq(hsOperationsTable.uuid, input.operationUuid),
          ]);
        } else if (ctx.permissionsSlugs.includes("QUOTE_READ_BY_LOCATION")) {
          rows = await QuoteRepository.getAllForUserByLocation(ctx.user.id, [
            eq(hsOperationsTable.uuid, input.operationUuid),
          ]);
        } else {
          throw new Error(
            "Vous n'avez pas les permissions suffisantes pour lister les devis.",
          );
        }
      }

      return Promise.all(
        (rows ?? []).map(async (row) => {
          const contactUuid = await OperationRepository.getSignatoryUuid(
            row.hsOperation.uuid,
          );

          if (!contactUuid) {
            return { ...row, signatoryContact: null };
          }
          const contact = await ContactRepository.get(contactUuid);

          if (!contact) {
            return { ...row, signatoryContact: null };
          }

          const { uuid, email, firstName, lastName } = contact;

          const updatable = await OperationRepository.canSignatoryBeUpdated(
            row.hsOperation.uuid,
          );

          return {
            ...row,
            signatoryContact: {
              uuid,
              email,
              firstName,
              lastName,
              updatable,
            },
          };
        }),
      );
    }),

  getAllPending: adminProcedure
    .input(z.object({ term: z.string().nullish() }))
    .query(({ input }) => QuoteRepository.getAllPending(input.term)),

  getAllUnsynced: adminProcedure
    .input(z.void())
    .query(() => QuoteRepository.getAllUnsynced()),

  getAllWithProByOperationUuid: adminProcedure
    .input(z.object({ operationUuid: OperationUuid }))
    .query(async ({ input }) => {
      const { operationUuid } = input;

      const quotes = await QuoteRepository.getAllByOperation(operationUuid);
      return Promise.all(
        quotes.map(async (quote) => {
          const pro = await QuoteRepository.getRelatedPro(quote.uuid);
          return { ...quote, pro };
        }),
      );
    }),

  getAllCorrupt: adminProcedure.query(() => QuoteRepository.getAllCorrupted()),

  getAllForProByLoggedUser: proProcedure().query(({ ctx }) =>
    QuoteRepository.getAllByPro(ctx.pro.id),
  ),

  getAllByOperationAndProWithNullableNotes: proProcedure()
    .input(
      z.object({
        operationUuid: OperationUuid,
      }),
    )
    .query(({ input, ctx }) =>
      QuoteRepository.getAllByOperationAndProWithNullableNotes(
        input.operationUuid,
        ctx.pro.id,
      ),
    ),

  // Until the marketplace with Pro is released and the quote dropbox is in protected mode, we need to keep this endpoint public.
  // To delete once we won't use the dropbox page publicly anymore.
  updateAndUploadDeprecated: publicProcedure
    .input(
      z.object({
        preTaxAmount: z.number(),
        validityEndDate: z.coerce.date(),
        vatRate: z.number(),
        fundingAmount: z.number(),
        file: fileDtoSchema,
        hsId: QuoteHsId,
      }),
    )
    .mutation(async ({ input }) => {
      const quoteUuid = await QuoteRepository.getUuidByHsId(input.hsId);
      if (!quoteUuid) {
        throw new Error(
          "Aucun devis trouvé à partir de l'uuid hubspot: " + input.hsId,
        );
      }

      // @todo extract to provider
      await QuoteRepository.updateQuoteInformation({ ...input, quoteUuid });

      const blob = FileProvider.base64ToBlob({
        base64Data: input.file.data,
        contentType: input.file.type,
      });

      await QuoteProvider.upload(input.hsId, blob);

      await QuoteRepository.updateStage(
        quoteUuid,
        QuoteStage.EN_ATTENTE_DE_SIGNATURE,
      );

      return quoteUuid;
    }),

  updateAndUpload: proProcedure()
    .input(
      z.object({
        preTaxAmount: z.number(),
        validityEndDate: z.coerce.date(),
        vatRate: z.number(),
        fundingAmount: z.number(),
        file: fileDtoSchema,
        uuid: QuoteUuid,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const quoteUuid = input.uuid;

      const hasAccessToQuote = await QuoteRepository.isQuoteLinkedToPro(
        quoteUuid,
        ctx.pro.id,
      );
      if (!hasAccessToQuote) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Vous n'avez pas les permissions suffisantes pour modifier ce devis.",
        });
      }

      // @todo extract to provider
      await QuoteRepository.updateQuoteInformation({ ...input, quoteUuid });

      const blob = FileProvider.base64ToBlob({
        base64Data: input.file.data,
        contentType: input.file.type,
      });

      await QuoteProvider.upload(input.uuid, blob);

      await QuoteRepository.updateStage(
        quoteUuid,
        QuoteStage.EN_ATTENTE_DE_SIGNATURE,
      );

      return quoteUuid;
    }),

  validate: adminProcedure
    .input(
      z.object({
        uuid: QuoteUuid,
        signatureLocation: z.object({
          x: z.number(),
          y: z.number(),
          page: z.number(),
          width: z.number(),
          height: z.number(),
        }),
        skipEmail: z.boolean(),
        proInCC: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      await QuoteProvider.validate({
        quoteUuid: input.uuid,
        signatureLocation: input.signatureLocation,
        skipEmail: input.skipEmail,
        proInCC: input.proInCC,
      });

      return {
        statusCode: 200,
        message: `Le devis a été validé${input.skipEmail ? "" : ", et le mail a été envoyé"} avec succès ! 🥳`,
      };
    }),

  uploadSignedQuote: privateProcedure
    .input(
      z.object({
        uuid: QuoteUuid,
        file: fileDtoSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const contact = await ContactRepository.getByUser(ctx.user.id);
      if (!contact) {
        throw new Error(
          "Vous devez être connecté pour uploader un devis signé.",
        );
      }

      //@todo extract to provider
      const [operationRows] =
        await OperationRepository.getAllHydratedByQuoteUuids([input.uuid]);
      const operationUuid = operationRows?.hsOperation.uuid;

      if (!operationUuid) {
        throw new Error("Aucune opération trouvée pour ce devis.");
      }

      const operationSignatory =
        await OperationRepository.getSignatoryUuid(operationUuid);

      if (operationSignatory !== contact.uuid) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous n'êtes pas le signataire de cette opération.",
        });
      }
      const blob = FileProvider.base64ToBlob({
        base64Data: input.file.data,
        contentType: input.file.type,
      });

      await QuoteProvider.accept({ quoteUuid: input.uuid, blob });
    }),

  reject: clientProcedure(["QUOTE_CLOSE"])
    .input(
      z.object({
        uuid: QuoteUuid,
        reason: z.nativeEnum(QuoteRejectReason).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await QuoteProvider.reject({
        quoteUuid: input.uuid,
        reason: input.reason,
      });

      return { success: true };
    }),

  // findDifferences: adminProcedure.query(async () => {
  //   try {
  //     // Step 1: Get all the pros' UUIDs
  //     const prosUuids = await ProRepository.getAllUuids();
  //     console.log(`Processing ${prosUuids.length} pros`);

  //     // Step 2: Retrieve quotes, operations, and locations for each pro
  //     const prosWithLocations = (
  //       await Promise.all(
  //         prosUuids.map((pro) =>
  //           ProLocationRepository.getQuotesAndLocationsByPro(pro.uuid),
  //         ),
  //       )
  //     ).flat(); // combines all quotes from all pros

  //     console.log(
  //       `Found ${prosWithLocations.length} pro-location associations`,
  //     );

  //     //Step 3 : Get all quote and pros associations
  //     const quotesPros = await QuoteProRepository.getAll();
  //     console.log(`Found ${quotesPros.length} quotes-pros associations`);

  //     // Step 4: Find differences
  //     const prosWithLocationsSet = new Set(
  //       prosWithLocations.map((assoc) => `${assoc.proUuid}-${assoc.quoteUuid}`),
  //     );

  //     // Create a set for quotesPros (using proUuid and quoteUuid)
  //     const quotesProsSet = new Set(
  //       quotesPros.map((assoc) => `${assoc.proUuid}-${assoc.quoteUuid}`),
  //     );

  //     const quotesWithoutOperation =
  //       await QuoteRepository.getAllWithoutOperation();

  //     console.log(
  //       `Found ${quotesWithoutOperation.length} quotes without operation`,
  //     );

  //     const operationWithoutLocation =
  //       await OperationRepository.getAllWithoutLocation();

  //     console.log(
  //       `Found ${operationWithoutLocation.length} operations without location`,
  //     );

  //     // Find items in prosWithLocations that are not in quotesPros => none

  //     // Find items in quotesPros that are not in prosWithLocations
  //     const diffQuotesPros = quotesPros.filter(
  //       (assoc) =>
  //         !prosWithLocationsSet.has(`${assoc.proUuid}-${assoc.quoteUuid}`),
  //     );

  //     // Combine the differences
  //     const differences = [...diffQuotesPros];

  //     console.log(`Found ${differences.length} differences`);
  //     //console.log(differences);

  //     return differences;
  //   } catch (error) {
  //     console.error("Failed to find differences:", error);
  //     throw new TRPCError({
  //       code: "INTERNAL_SERVER_ERROR",
  //       message: "Failed to find differences",
  //     });
  //   }
  // }),

  //Admin route to get all locations and pros that are not linked, but should be because they are linked to a quote that are linked to an operation.
  getAllOrphanedLocationsAndPros: adminProcedure.query(async () => {
    try {
      // Step 1: Get all the pros' UUIDs
      const prosUuids = await ProRepository.getAllUuids();
      console.log(`Processing ${prosUuids.length} pros`);

      // Step 2: Retrieve quotes, operations, and locations for each pro using getAllByProUuidTest
      const prosWithLocations = (
        await Promise.all(
          prosUuids.map((pro) =>
            ProLocationRepository.getQuotesAndLocationsByPro(pro.uuid),
          ),
        )
      ).flat();

      return prosWithLocations;
    } catch (error) {
      console.error("Failed to process orphaned locations and pros:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to process orphaned locations and pros",
      });
    }
  }),

  unlockBatchProLocation: adminProcedure
    .input(z.array(z.object({ locationUuid: LocationUuid, proUuid: ProUuid })))
    .mutation(({ input }) =>
      Promise.all(
        input.map(({ locationUuid, proUuid }) =>
          ProLocationRepository.update(
            { locationUuid, proUuid },
            PRO_LOCATION_ASSOCIATIONS.UNBLOCKED,
          ),
        ),
      ),
    ),
});
