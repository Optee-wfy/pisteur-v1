import { BdnbProvider } from "@optee/bdnb-server";
import { ClientRepository } from "@optee/client-server";
import {
  CONTACT_LOCATION_ASSOCIATIONS,
  isOpteeTester,
  LOCATION_ADDRESS_DETAILS,
  LOCATION_PLACE_DETAILS,
  locationsProListInputSchema,
} from "@optee/constants";
import { ContactLocationRepository } from "@optee/contact-location-server";
import { ContactRepository } from "@optee/contact-server";
import { GooglePlacesProvider } from "@optee/google-places-server";
import { HubspotProvider } from "@optee/hubspot-server";
import { LegalEntityRepository } from "@optee/legal-entity-server";
import {
  LocationBdnbAdminProvider,
  LocationBdnbRepository,
} from "@optee/location-bdnb-server";
import { LocationProvider, LocationRepository } from "@optee/location-server";
import {
  ClientUuid,
  ContactUuid,
  locationBdnbSchema,
  LocationBdnbUuid,
  LocationUuid,
} from "@optee/models";
import { ProLocationRepository } from "@optee/pro-location-server";
import { ProProvider } from "@optee/pro-server";
import { z } from "zod";
import {
  adminProcedure,
  clientProcedure,
  privateProcedure,
  proProcedure,
  publicProcedure,
  router,
} from "../trpc";

const locationIdSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("optee"), locationUuid: LocationUuid }),
  z.object({ type: z.literal("external"), locationUuid: LocationBdnbUuid }),
]);

export const locationRouter = router({
  create: privateProcedure
    .input(
      z.object({
        addressData: LOCATION_ADDRESS_DETAILS,
        placeData: LOCATION_PLACE_DETAILS,
        customBdnbData: locationBdnbSchema,
        source: z.string(), // Would be nice to have something like "z.enum(CLIENT_TRACKING_EVENTS.location_add.properties)" instead
        sourceAddress: z.string().trim().max(255).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.email) {
        return;
      }

      const contact = await ContactRepository.getByUser(ctx.user.id);

      if (!contact) {
        throw new Error(
          `Erreur lors de la création du site. Aucun contact trouvé pour l'utilisateur connecté.`,
        );
      }

      const client = await ClientRepository.getByUser(ctx.user.id);

      if (!client) {
        throw new Error(
          `Erreur lors de la création du site. Aucun client trouvé pour l'utilisateur connecté.`,
        );
      }

      const hasPermissionToCreateLocation =
        ctx.permissionsSlugs.includes("LOCATION_CREATE");

      if (!hasPermissionToCreateLocation) {
        const contactLocations = await LocationRepository.getAllByContact(
          contact.uuid,
        );

        //@todo règle métier à confirmer: sans permission LOCATION_CREATE,
        // l'utilisateur ne peut créer un site s'il en a déjà un associé.
        if (contactLocations.length > 0) {
          throw new Error(
            `Erreur lors de la création du site. Vous ne pouvez pas créer de site car vous avez déjà un site associé à votre compte.`,
          );
        }
      }

      const [res] = await Promise.all([
        LocationProvider.create({
          clientUuid: client.uuid,
          contactUuid: contact.uuid,
          ...input,
        }),

        HubspotProvider.trackEvent({
          email: ctx.user.email,
          eventId: "location_add",
          properties: {
            source: input.source,
          },
        }),
      ]);

      return res;
    }),

  get: privateProcedure
    .input(z.object({ uuid: LocationUuid }))
    .query(async ({ input }) => LocationRepository.get(input.uuid)),

  getExternal: privateProcedure
    .input(LocationBdnbUuid)
    .query(async ({ input }) => {
      return LocationBdnbRepository.get(input);
    }),

  getByAddressData: proProcedure()
    .input(
      z.object({
        streetNumber: z.string().nullish(),
        streetName: z.string().nullish(),
        zipcode: z.string().nullish(),
        city: z.string().nullish(),
      }),
    )
    .query(({ input }) => LocationRepository.getAllByAddressData(input)),

  getBdnbData: publicProcedure
    .input(
      z.object({
        address: z.string(),
        lat: z.number().nullish(),
        lng: z.number().nullish(),
      }),
    )
    .query(({ input }) => BdnbProvider.getDataFromAddress(input)),

  getGooglePlaceData: privateProcedure
    .input(z.object({ address: z.string() }))
    .query(({ input }) => GooglePlacesProvider.getAddressInfo(input.address)),

  getStreetViewUrl: publicProcedure
    .input(
      z.object({
        address: z.string(),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
    )
    .query(({ input }) =>
      GooglePlacesProvider.getStreetViewUrlFromAddress(input),
    ),

  getAllUnsynced: adminProcedure.query(() =>
    LocationRepository.getAllUnsynced(),
  ),

  getAllWithoutBdnb: adminProcedure.query(() =>
    LocationRepository.getAllWithoutBdnb(),
  ),

  getAllByClientForAdmin: adminProcedure
    .input(
      z.object({
        uuid: ClientUuid,
      }),
    )
    .query(({ input }) => LocationRepository.getAllByClient(input.uuid)),

  getAllPaginatedForPro: proProcedure()
    .input(locationsProListInputSchema)
    .query(({ input: filters, ctx }) => {
      return LocationRepository.getAllForProPaginated({
        filters,
        proUuid: ctx.pro.id,
        showDemoClients: isOpteeTester(ctx.user.email),
      });
    }),

  getAllForClient: privateProcedure.query(async ({ ctx }) => {
    const hsLocations = ctx.permissionsSlugs.includes("LOCATION_READ_BY_CLIENT")
      ? await LocationProvider.getAll({
          userUuid: ctx.user.id,
          listBy: "client",
        })
      : ctx.permissionsSlugs.includes("LOCATION_READ_BY_LOCATION")
        ? await LocationProvider.getAll({
            userUuid: ctx.user.id,
            listBy: "contact",
          })
        : [];

    return hsLocations.map((hsLocation) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { rawBdnb, geomGroup, ...hsLocationLight } = hsLocation;
      return hsLocationLight;
    });
  }),

  update: clientProcedure(["LOCATION_UPDATE"])
    .input(
      z.object({
        locationUuid: LocationUuid,
        addressData: LOCATION_ADDRESS_DETAILS,
        placeData: LOCATION_PLACE_DETAILS,
        customBdnbData: locationBdnbSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.isAdmin) {
        await LocationProvider.throwErrorIfUserIsNotAssociatedToLocation({
          userUuid: ctx.user.id,
          locationUuid: input.locationUuid,
        });
      }

      await LocationProvider.update({ ...input });
    }),

  updateBdnbData: clientProcedure(["LOCATION_UPDATE"])
    .input(z.object({ uuid: LocationUuid }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.isAdmin) {
        await LocationProvider.throwErrorIfUserIsNotAssociatedToLocation({
          userUuid: ctx.user.id,
          locationUuid: input.uuid,
        });
      }

      return LocationProvider.updateBdnbData(input.uuid);
    }),

  markAsBdnbFailure: clientProcedure(["LOCATION_UPDATE"])
    .input(z.object({ uuid: LocationUuid }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.isAdmin) {
        await LocationProvider.throwErrorIfUserIsNotAssociatedToLocation({
          userUuid: ctx.user.id,
          locationUuid: input.uuid,
        });
      }

      return LocationProvider.markAsBdnbFailure(input.uuid);
    }),

  convertAddressToPlaceResult: clientProcedure(["LOCATION_UPDATE"])
    .input(
      z.object({
        address: z.string(),
      }),
    )
    .query(({ input }) => {
      return GooglePlacesProvider.convertAddressToPlaceResult(input.address);
    }),

  upload: clientProcedure(["LOCATION_CREATE", "LOCATION_UPDATE"])
    .input(
      z.object({
        uuid: LocationUuid,
        storageFolder: z.string(),
        filesUrls: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.isAdmin) {
        await LocationProvider.throwErrorIfUserIsNotAssociatedToLocation({
          userUuid: ctx.user.id,
          locationUuid: input.uuid,
        });
      }

      await LocationProvider.uploadToHubspot(input);

      return {
        status: 201,
        message: `Document mis en ligne avec succès 🥳`,
      };
    }),

  updateContactOnSite: clientProcedure(["LOCATION_UPDATE"])
    .input(
      z.object({
        uuid: LocationUuid,
        nameContactOnSite: z.string(),
        phoneContactOnSite: z.string(),
      }),
    )
    .mutation(({ input }) => LocationProvider.updateContactOnSite(input)),

  makeContactAdmin: adminProcedure
    .input(
      z.object({
        contactUuid: ContactUuid,
        locationUuid: LocationUuid,
      }),
    )
    .mutation(async ({ input }) => {
      await ContactLocationRepository.create(
        input.contactUuid,
        input.locationUuid,
        CONTACT_LOCATION_ASSOCIATIONS.ADMINISTRATOR,
      );
    }),

  hasContact: privateProcedure
    .input(locationIdSchema)
    .query(async ({ input }) => {
      const count =
        input.type === "optee"
          ? (await LocationProvider.getAdministrators(input.locationUuid))
              .length
          : await LegalEntityRepository.countByLocation(input.locationUuid);

      return count > 0;
    }),

  // need to clean, no more use of external location here
  connectWithLocation: proProcedure()
    .input(locationIdSchema)
    .mutation(async ({ input, ctx }) => {
      const result =
        input.type === "optee"
          ? {
              type: "optee" as const,
              res: await ProProvider.connectWithLocation(
                input.locationUuid,
                ctx.pro.id,
              ),
            }
          : {
              type: "external" as const,
              res: await ProProvider.connectWithExternalLocation(
                input.locationUuid,
                ctx.pro.id,
              ),
            };

      return result;
    }),

  countByLoggedUser: privateProcedure.query(async ({ ctx }) => {
    if (ctx.permissionsSlugs.includes("LOCATION_READ_BY_CLIENT")) {
      return (
        await LocationProvider.getAll({
          userUuid: ctx.user.id,
          listBy: "client",
        })
      ).length;
    } else if (ctx.permissionsSlugs.includes("LOCATION_READ_BY_LOCATION")) {
      return (
        await LocationProvider.getAll({
          userUuid: ctx.user.id,
          listBy: "contact",
        })
      ).length;
    }

    return 0;
  }),

  importLocationBdnb: adminProcedure
    .input(
      locationsProListInputSchema.and(
        z.object({
          batchSize: z.number().min(1).max(10_000),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      await LocationBdnbAdminProvider.createBatch(input, input.batchSize);
    }),

  countRemainingLocationBdnb: adminProcedure
    .input(locationsProListInputSchema)
    .query(({ input }) => LocationBdnbAdminProvider.countRemaining(input)),

  // need to clean , no more use of external location here
  getAssociationsWithLocation: proProcedure()
    .input(locationIdSchema)
    .query(async ({ ctx, input }) => {
      const associations =
        input.type === "optee"
          ? await ProLocationRepository.get({
              locationUuid: input.locationUuid,
              proUuid: ctx.pro.id,
            })
          : await ProLocationRepository.getExternal({
              locationUuid: input.locationUuid,
              proUuid: ctx.pro.id,
            });

      return associations.map((assoc) => assoc.associationLabel);
    }),
});
