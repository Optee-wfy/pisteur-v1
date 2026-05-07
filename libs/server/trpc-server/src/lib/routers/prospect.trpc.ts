import { locationsBdnbLegalEntityProListInputSchema } from "@optee/constants";
import { ContactRepository } from "@optee/contact-server";
import { ExternalContactRepository } from "@optee/external-contact-server";
import { LocationBdnbRepository } from "@optee/location-bdnb-server";
import {
  ContactUuid,
  ExternalContactUuid,
  LocationBdnbUuid,
} from "@optee/models";
import { OpenAIProvider } from "@optee/openai-server";
import { ProRepository } from "@optee/pro-server";
import { ProspectProvider, ProspectRepository } from "@optee/prospect-server";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { proProcedure, router } from "../trpc";

export const prospectRouter = router({
  prospectContact: proProcedure()
    .input(
      z.object({
        prompt: z.string(),
        contactUuid: ExternalContactUuid,
        locationBdnbUuid: LocationBdnbUuid,
      }),
    )
    .query(async ({ ctx, input }) => {
      // Check that the user has the right to prospect contacts
      const hasRelation =
        !!(await ExternalContactRepository.getAssociationWithPro({
          proUuid: ctx.pro.id,
          externalContactUuid: input.contactUuid,
        }));

      if (!hasRelation) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous n'avez pas la permission de prospecter ce contact.",
        });
      }

      const [contact, locationBdnb, pro, currentContact] = await Promise.all([
        ExternalContactRepository.get(input.contactUuid),
        LocationBdnbRepository.get(input.locationBdnbUuid),
        ProRepository.get(ctx.pro.id),
        ContactRepository.getByUser(ctx.user.id),
      ]);

      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact non trouvé",
        });
      }

      if (!locationBdnb) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bâtiment BDNB non trouvé",
        });
      }

      if (!pro) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Professionnel non trouvé",
        });
      }

      if (!currentContact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact utilisateur non trouvé",
        });
      }

      const prompt = await ProspectProvider.buildProspectionPrompt({
        prompt: input.prompt,
        externalContact: contact,
        locationBdnb: locationBdnb.batiments_bdnb,
        pro,
        proContact: currentContact,
      });

      return OpenAIProvider.generateProspectionEmail(prompt);
    }),

  getProspectParameters: proProcedure().query(({ ctx }) =>
    ProspectProvider.getProspectParametersForPro(ctx.pro.id),
  ),

  getLeadDetailsInsights: proProcedure()
    .input(
      z.object({
        filters: z.record(z.string(), z.unknown()),
        lead: z.record(z.string(), z.unknown()),
      }),
    )
    .mutation(async ({ input }) =>
      OpenAIProvider.generateLeadDetailsInsights({
        filters: input.filters,
        lead: input.lead,
      }),
    ),

  getLeadRecommendedContact: proProcedure()
    .input(LocationBdnbUuid)
    .query(async ({ ctx, input }) => {
      const leadHistory = await ProspectRepository.getLeadHistoryByLocation({
        proUuid: ctx.pro.id,
        locationBdnbUuid: input,
      });

      if (!leadHistory?.recommendedExternalContactUuid) {
        return null;
      }

      const [recommendedContact] =
        await ExternalContactRepository.getAllByUuidForPro({
          proUuid: ctx.pro.id,
          externalContactUuids: [leadHistory.recommendedExternalContactUuid],
        });

      if (!recommendedContact) {
        return null;
      }

      return recommendedContact;
    }),

  addProspectParameters: proProcedure()
    .input(
      locationsBdnbLegalEntityProListInputSchema.and(
        z.object({
          leadsToGenerate: z.number().int().min(1).max(10),
          recipientContactUuid: ContactUuid.nullish(),
          sendFrequencyPerWeek: z.number().int().min(1).max(5),
        }),
      ),
    )
    .mutation(({ input, ctx }) => {
      const {
        leadsToGenerate,
        recipientContactUuid,
        sendFrequencyPerWeek,
        ...filters
      } = input;

      return ProspectRepository.addProspectParameters({
        filters,
        leadsToGenerate,
        proUuid: ctx.pro.id,
        recipientContactUuid: recipientContactUuid ?? null,
        sendFrequencyPerWeek,
      });
    }),
});
