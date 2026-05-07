import {
  CONTACT_CONNECTION_COST,
  locationBdnbLegalEntityFilterProSchema,
  locationsBdnbLegalEntityProListInputSchema,
} from "@optee/constants";
import { LocationBdnbRepository } from "@optee/location-bdnb-server";
import { LocationBdnbUuid } from "@optee/models";
import { ProLocationRepository } from "@optee/pro-location-server";
import { ProProvider } from "libs/server/pro-server/src/lib/providers/pro.provider";
import { GooglePlacesProvider } from "libs/server/third-party/google-places-server/src/lib/providers/google-places.provider";
import z from "zod";
import { proProcedure, router } from "../trpc";

export const locationBdnbRouter = router({
  getAllPaginatedForPro: proProcedure()
    .input(locationsBdnbLegalEntityProListInputSchema)
    .mutation(({ input: filters, ctx }) =>
      LocationBdnbRepository.getAllForProPaginated({
        filters,
        proUuid: ctx.pro.id,
      }),
    ),

  getLeadHistoryPaginatedForPro: proProcedure()
    .input(locationsBdnbLegalEntityProListInputSchema)
    .query(({ input: filters, ctx }) =>
      LocationBdnbRepository.getAllLeadHistoryPaginatedForPro({
        filters,
        proUuid: ctx.pro.id,
      }),
    ),

  get: proProcedure()
    .input(LocationBdnbUuid)
    .query(async ({ input: locationUuid }) => {
      const locationBdnb = await LocationBdnbRepository.get(locationUuid);
      if (!locationBdnb) {
        return null;
      }
      const address =
        locationBdnb.batiments_bdnb.streetNumber &&
        locationBdnb.batiments_bdnb.streetName &&
        locationBdnb.batiments_bdnb.city &&
        locationBdnb.batiments_bdnb.zipcode
          ? `${locationBdnb.batiments_bdnb.streetNumber} ${locationBdnb.batiments_bdnb.streetName}, ${locationBdnb.batiments_bdnb.zipcode} ${locationBdnb.batiments_bdnb.city}`
          : null;
      if (!locationBdnb.batiments_bdnb.streetViewUrl && address) {
        const streetView =
          await GooglePlacesProvider.getStreetViewUrlFromAddress({
            address,
          });
        await LocationBdnbRepository.update(locationUuid, {
          streetViewUrl: streetView,
        });
        locationBdnb.batiments_bdnb.streetViewUrl = streetView;
      }
      return locationBdnb;
    }),

  getByBdnbGroupId: proProcedure()
    .input(z.string())
    .query(async ({ input: bdnbGroupId }) =>
      LocationBdnbRepository.getByLocationGroupId(bdnbGroupId),
    ),

  getByAddress: proProcedure()
    .input(z.string())
    .query(async ({ input: address }) => {
      const locationBdnb = await LocationBdnbRepository.getByAddress(address);
      return locationBdnb;
    }),

  connectWithLocation: proProcedure(CONTACT_CONNECTION_COST)
    .input(LocationBdnbUuid)
    .mutation(async ({ input, ctx }) => {
      const count = await ProProvider.connectWithExternalLocation(
        input,
        ctx.pro.id,
      );
      return { count };
    }),

  autoConnectWithLocation: proProcedure()
    .input(LocationBdnbUuid)
    .mutation(async ({ input, ctx }) => {
      const count = await ProProvider.connectWithExternalLocationWithoutCredits(
        input,
        ctx.pro.id,
      );
      return { count };
    }),

  connectWithLocations: proProcedure()
    .input(z.array(LocationBdnbUuid).min(1))
    .mutation(async ({ input, ctx }) => {
      const { count, unlockableUuids } =
        await ProProvider.connectWithExternalLocations(input, ctx.pro.id);
      return { count, unlockedUuids: unlockableUuids };
    }),

  getAssociationsWithLocation: proProcedure()
    .input(LocationBdnbUuid)
    .query(async ({ ctx, input }) => {
      const associations = await ProLocationRepository.getExternal({
        locationUuid: input,
        proUuid: ctx.pro.id,
      });

      return associations.map((assoc) => assoc.associationLabel);
    }),

  countMatchingLocations: proProcedure()
    .input(locationBdnbLegalEntityFilterProSchema)
    .mutation(async ({ input, ctx }) =>
      LocationBdnbRepository.countMatchingLocations(input, ctx.pro.id),
    ),
});
