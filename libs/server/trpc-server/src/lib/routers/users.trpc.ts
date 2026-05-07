import { CLIENT_TRACKING_EVENTS_IDS } from "@optee/constants";
import { ContactRepository } from "@optee/contact-server";
import { HubspotProvider } from "@optee/hubspot-server";
import { AuthProvider } from "@optee/supabase-server";
import { UserProvider } from "@optee/user-server";
import { z } from "zod";
import { privateProcedure, publicProcedure, router } from "../trpc";

export const userRouter = router({
  getContact: privateProcedure.query(({ ctx }) =>
    ContactRepository.getByUser(ctx.user.id),
  ),

  getPermissions: privateProcedure.query(({ ctx }) => ctx.permissions),

  getUserTypes: privateProcedure.query(({ ctx }) =>
    UserProvider.getUserTypes(ctx.user.id),
  ),

  trackEvent: privateProcedure
    .input(
      z.object({
        eventId: z.enum(CLIENT_TRACKING_EVENTS_IDS),
        properties: z.record(z.string()).optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      if (!ctx.user.email) {
        return;
      }

      return HubspotProvider.trackEvent({
        email: ctx.user.email,
        eventId: input.eventId,
        properties: input.properties,
      });
    }),

  sendResetPasswordMail: publicProcedure
    .input(
      z.object({
        email: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const contact = await ContactRepository.getByEmail(input.email);

      await AuthProvider.sendResetPasswordMail({
        email: input.email,
        firstName: contact?.firstName || null,
      });
    }),
});
