import { ClientProvider, ClientRepository } from "@optee/client-server";
import {
  BOT_BRIEF_SCHEMA,
  isOpteeTester,
  MAIN_SECTORS,
  OPERATION_HUBSPOT_PRESTATION_IDS,
  OperationPhaseEnum,
  UserType,
} from "@optee/constants";
import { ContactRepository } from "@optee/contact-server";
import { LocationProvider, LocationRepository } from "@optee/location-server";
import {
  ClientUuid,
  ContactUuid,
  locationBdnbSchema,
  LocationUuid,
  Operation,
  OperationHsId,
  OperationUuid,
} from "@optee/models";
import {
  OperationProvider,
  OperationRepository,
} from "@optee/operation-server";
import { ProProvider, ProRepository } from "@optee/pro-server";
import {
  fileDtoSchema,
  isEmailFromOptee,
} from "@optee/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  adminProcedure,
  clientProcedure,
  privateProcedure,
  proProcedure,
  publicProcedure,
  router,
} from "../trpc";

export const operationRouter = router({
  createByClient: clientProcedure(["DEAL_CREATE"])
    .input(
      z.object({
        hsPrestationId: z.enum(OPERATION_HUBSPOT_PRESTATION_IDS),
        isFunding: z.boolean(),
        locationUuid: LocationUuid,
        plannedLaunchDate: z.coerce.date().nullish(),
        launchingDate: z.coerce.date().nullish(),
        files: z.array(fileDtoSchema).nullish(),
      }),
    )
    .mutation(({ input }) => OperationProvider.createByClient(input)),

  // @todo shouldn't be public (for now it's public because of brief page: we should have another route for that (with lesser info))
  get: publicProcedure
    .input(OperationUuid)
    .query(async ({ input: uuid }) => OperationProvider.getWithSignatory(uuid)),

  getStatisticsForPro: privateProcedure.query(async ({ ctx }) => {
    const pro = await ProRepository.getByUser(ctx.user.id);
    if (!pro) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Vous devez être un professionnel pour accéder à cette ressource.",
      });
    }
    const {
      operationsRevenue,
      signedOperationsCount,
      upcomingOperationsCount,
    } = await OperationProvider.getStatistics(pro.uuid);

    const availableOperationsCount =
      await OperationRepository.countAllDiscoverableForPro({
        proUuid: pro.uuid,
        showDemoClients: isOpteeTester(ctx.user.email),
      });

    return {
      operationsRevenue,
      signedOperationsCount,
      upcomingOperationsCount,
      availableOperationsCount,
    };
  }),

  getUuidByHsId: publicProcedure
    .input(z.object({ operationHsId: OperationHsId }))
    .query(async ({ input }) =>
      OperationRepository.getUuidByHsId(input.operationHsId),
    ),

  getByActivePrestationAndLocation: privateProcedure
    .input(
      z.object({
        hsPrestationId: z.enum(OPERATION_HUBSPOT_PRESTATION_IDS),
        locationUuid: LocationUuid,
        operationUuid: OperationUuid.nullish(),
      }),
    )
    .query(({ input }) =>
      OperationRepository.getByActivePrestationAndLocation(input),
    ),

  getDocuments: privateProcedure
    .input(
      z.object({
        operationUuid: OperationUuid,
        displayFor: z.nativeEnum(UserType),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.displayFor === UserType.PRO) {
        const pro = await ProRepository.getByUser(ctx.user.id);
        if (!pro) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "Affichage demandé pour un pro mais pas de pro associé à l'utilisateur.",
          });
        }
        const canAccess = await ProRepository.isProLinkedToOperation({
          operationUuid: input.operationUuid,
          proUuid: pro.uuid,
        });

        if (!canAccess) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "L'utilisateur n'a pas la permission de lire l'opération demandée.",
          });
        }
      } else if (input.displayFor === UserType.CLIENT) {
        // check ctx.user.id is linked to correct client (linked to operation asked);
        const client = await ClientRepository.getByUser(ctx.user.id);
        if (!client) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "Affichage demandé pour un client mais pas de client associé à l'utilisateur.",
          });
        }
        // @todo improve this check (only check by client (by-passing permissions until refactoring))
        const canAccess = await OperationRepository.canClientAccessOperation({
          operationUuid: input.operationUuid,
          clientUuid: client.uuid,
        });
        if (!canAccess) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "L'utilisateur n'a pas la permission de lire l'opération demandée.",
          });
        }
      } else {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Type d'utilisateur non supporté.",
        });
      }

      const documents = await OperationRepository.getDocuments(
        input.operationUuid,
      );
      return Promise.all(
        documents.map(async (document) => {
          return {
            name: document.name,
            updatedAt: document.updatedAt,
            fileUrl: null as string | null,
          };
        }),
      );
    }),

  getPotentialSignatoriesForClient: clientProcedure([
    "LOCATION_LIST_POTENTIAL_SIGNATORIES",
  ])
    .input(
      z
        .object({
          operationUuid: OperationUuid.nullish(),
          locationUuid: LocationUuid.nullish(),
        })
        .refine(
          (v) => v.operationUuid ?? v.locationUuid,
          "Aucun lieu ou opération fourni.",
        ),
    )
    .query(async ({ input, ctx }) => {
      const client = await ClientRepository.getByUser(ctx.user.id);

      if (!client) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Client non trouvé",
        });
      }

      const currentContact = await ContactRepository.getByUser(ctx.user.id);

      if (!currentContact) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Contact non trouvé",
        });
      }

      let locationUuid: LocationUuid;

      if (input.locationUuid) {
        locationUuid = input.locationUuid;
      } else if (input.operationUuid) {
        const operation = await OperationRepository.get(input.operationUuid);
        if (!operation?.hsLocation?.uuid) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "L'opération n'a pas de lieu associé.", // @red flag
          });
        }
        locationUuid = operation?.hsLocation?.uuid;
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Aucun lieu ou opération fourni.",
        });
      }

      const contactRole = await ClientProvider.getRole(currentContact.uuid);
      if (
        !isEmailFromOptee(currentContact.email) &&
        contactRole !== "CLIENT_ADMINISTRATOR"
      ) {
        const contactLocations = await LocationRepository.getAllByContact(
          currentContact.uuid,
        );

        const hasAccessToOperation = contactLocations.some(
          (location) => location.uuid === locationUuid,
        );

        if (!hasAccessToOperation) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "L'utilisateur n'a pas accès à cette opération.",
          });
        }
      }

      return LocationProvider.getAdministrators(locationUuid, false);
    }),

  getPotentialSignatoriesForPro: proProcedure()
    .input(
      z.object({
        locationUuid: LocationUuid,
        clientUuid: ClientUuid,
      }),
    )
    .query(async ({ input, ctx }) => {
      //@todo check if pro has access to location
      if (
        !(await ProProvider.hasAccessToLocation(input.locationUuid, ctx.pro.id))
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Vous devez être en lien avec ce bâtiment pour voir les signataires potentiels.",
        });
      }

      return LocationProvider.getAdministrators(input.locationUuid, false);
    }),

  getAllUuidsByLocationUuid: clientProcedure(["DEAL_READ_BY_LOCATION"])
    .input(LocationUuid)
    .query(({ input }) => OperationRepository.getAllUuidsByLocation(input)),

  getAllCompatibleWithPro: privateProcedure.query(async ({ ctx }) => {
    const pro = await ProRepository.getByUser(ctx.user.id);
    if (!pro) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Vous devez être un professionnel pour accéder à cette ressource.",
      });
    }

    return OperationProvider.getAllDiscoverableForPro(
      pro.uuid,
      isOpteeTester(ctx.user.email),
    );
  }),

  getAllHydratedForClient: privateProcedure.query(async ({ ctx }) => {
    const rows = ctx.permissionsSlugs.includes("DEAL_READ_BY_CLIENT")
      ? await OperationRepository.getAllForUserByClient(ctx.user.id)
      : ctx.permissionsSlugs.includes("DEAL_READ_BY_LOCATION")
        ? await OperationRepository.getAllForUserByLocation(ctx.user.id)
        : [];

    return rows.map((row) => {
      if (!row.hsLocation) {
        return row;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { rawBdnb, geomGroup, ...hsLocationLight } = row.hsLocation;

      return {
        ...row,
        hsLocation: hsLocationLight,
      };
    });
  }),

  getAllHydratedForPro: proProcedure().query(async ({ ctx }) => {
    return OperationProvider.getAllByPro(ctx.pro.id);
  }),

  getAllByAdmin: adminProcedure
    .input(z.object({ filter: z.string() }))
    .query(({ input }) => OperationRepository.getAllByAdmin(input.filter)),

  getAllToSimulate: adminProcedure
    .input(z.void())
    .query(() => OperationRepository.getAllToSimulate()),

  getAllByOperationTypes: adminProcedure
    .input(
      z.object({
        operationTypes: z.array(z.enum(OPERATION_HUBSPOT_PRESTATION_IDS)),
      }),
    )
    .query(({ input }) => OperationRepository.getAllByOperationTypes(input)),

  getAllUnsynced: adminProcedure
    .input(z.void())
    .query(() => OperationRepository.getAllUnsynced()),

  getAllWithoutPrestationAndNotUpsell: adminProcedure
    .input(z.void())
    .query(() => OperationRepository.getAllWithoutPrestationAndNotUpsell()),

  updatePhase: clientProcedure(["DEAL_ARCHIVE", "DEAL_UPDATE"])
    .input(
      z.object({
        uuid: OperationUuid,
        phase: z.nativeEnum(OperationPhaseEnum),
      }),
    )
    .mutation(async ({ input }) => {
      await OperationRepository.update(input.uuid, { phase: input.phase });
    }),

  updateStartDate: clientProcedure(["DEAL_UPDATE"])
    .input(
      z.object({
        uuid: OperationUuid,
        startDate: z.coerce.date(),
      }),
    )
    .mutation(async ({ input }) => {
      await OperationRepository.update(input.uuid, {
        launchingDate: input.startDate.toISOString(),
      });
    }),

  updateCalculation: clientProcedure(["DEAL_UPDATE"])
    .input(
      z.object({
        operationUuid: OperationUuid,
      }),
    )
    .mutation(({ input }) =>
      OperationProvider.updateCalculation(input.operationUuid),
    ),

  updateCalculations: clientProcedure(["DEAL_UPDATE"])
    .input(
      z.object({
        operationUuids: z.array(OperationUuid),
      }),
    )
    .mutation(async ({ input }) => {
      await Promise.all(
        input.operationUuids.map((operationUuid) =>
          OperationProvider.updateCalculation(operationUuid),
        ),
      );
    }),

  updateProvisionCallSdcInfo: adminProcedure
    .input(
      z.object({
        uuid: OperationUuid,
        provisionCallSdcId: z.string(),
        provisionCallSdcSendingDate: z.coerce.date(),
        provisionCallSdcExpirationDate: z.coerce.date(),
      }),
    )
    .mutation(async ({ input }) => {
      await OperationRepository.update(input.uuid, {
        provisionCallSdcSendingDate:
          input.provisionCallSdcSendingDate.toISOString(),
        provisionCallSdcExpirationDate:
          input.provisionCallSdcExpirationDate.toISOString(),
        provisionCallSdcId: input.provisionCallSdcId,
      });
    }),

  updateProvisionCallInfo: adminProcedure
    .input(
      z.object({
        uuid: OperationUuid,
        provisionCallId: z.string(),
        provisionCallSendingDate: z.coerce.date(),
        provisionCallExpirationDate: z.coerce.date(),
      }),
    )
    .mutation(async ({ input }) => {
      await OperationRepository.update(input.uuid, {
        provisionCallSendingDate: input.provisionCallSendingDate.toISOString(),
        provisionCallExpirationDate:
          input.provisionCallExpirationDate.toISOString(),
        provisionCallId: input.provisionCallId,
      });
    }),

  launch: clientProcedure(["DEAL_LAUNCH"])
    .input(
      z.object({
        uuid: OperationUuid,
        signatoryUuid: ContactUuid,
        plannedBudgetRange: z.string(),
        startDate: z.coerce.date(),
        additionalInfo: z.string().nullish(),
        files: z.array(fileDtoSchema).nullish(),
      }),
    )
    .mutation(({ input }) => OperationProvider.launch(input)),

  upload: clientProcedure(["DEAL_UPDATE", "DEAL_CREATE"])
    .input(
      z.object({
        uuid: OperationUuid,
        filesUrls: z.array(z.string()),
      }),
    )
    .mutation(async () => {
      return {
        status: 201,
        message: `Document téléchargé avec succès 🥳`,
      };
    }),

  updateSignatory: clientProcedure(["DEAL_UPDATE_SIGNATORY"])
    .input(
      z.object({
        uuid: OperationUuid,
        signatoryUuid: ContactUuid,
      }),
    )
    .mutation(async ({ input }) => {
      await OperationProvider.updateSignatory(input.uuid, input.signatoryUuid);
    }),

  editBrief: clientProcedure(["DEAL_UPDATE"])
    .input(
      z.object({
        uuid: OperationUuid,
        botBrief: BOT_BRIEF_SCHEMA,
      }),
    )
    .mutation(async ({ input }) => {
      const { uuid, botBrief } = input;
      await OperationProvider.updateBrief(uuid, botBrief);
      return {
        body: "Critères mis à jour avec succès 🥳",
        status: 200,
      };
    }),

  // @todo shouldn't be public (but now used by public brief ..)
  updateMissingBrief: publicProcedure
    .input(
      z.object({
        uuid: OperationUuid,
      }),
    )
    .mutation(async ({ input }) => {
      const { uuid } = input;

      const res = await OperationProvider.getWithSignatory(uuid);

      if (res && res.hsOperation && !res.hsOperation.botBrief) {
        await OperationProvider.regenerateBrief(uuid);
      }
    }),

  operationSignatoryCanBeUpdated: clientProcedure(["DEAL_UPDATE_SIGNATORY"])
    .input(OperationUuid)
    .query(({ input }) => OperationRepository.canSignatoryBeUpdated(input)),

  generateBrief: privateProcedure
    .input(
      z.object({
        prestationId: z.enum(OPERATION_HUBSPOT_PRESTATION_IDS),
        location: z.object({
          bdnbData: locationBdnbSchema,
          address: z.string(),
          mainSector: z.enum(MAIN_SECTORS),
        }),
      }),
    )
    .query(async ({ input }) =>
      OperationProvider.generateBrief(input.prestationId, input.location),
    ),

  delete: clientProcedure(["DEAL_DELETE"])
    .input(
      z.object({
        uuid: OperationUuid,
      }),
    )
    .mutation(async ({ input }) => {
      const { uuid } = input;

      const res = await OperationRepository.get(uuid);
      if (!res) {
        throw new Error("Operation inconnue");
      }

      const operation = Operation.init(res.hsOperation);

      if (!operation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Operation inconnue",
        });
      }

      if (!operation.canBeDeleted) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Cette opération ne peut pas être supprimée car elle a déjà été lancée",
        });
      }

      await OperationRepository.update(uuid, {
        phase: OperationPhaseEnum.CLOSED_LOST,
      });

      return true;
    }),
});
