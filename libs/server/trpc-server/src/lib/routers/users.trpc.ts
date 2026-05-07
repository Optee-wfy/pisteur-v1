import { ContactRepository } from "@optee/contact-server";
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
