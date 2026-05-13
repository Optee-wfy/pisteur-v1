import { ClientRepository } from "@optee/client-server";
import {
  CONTACT_CLIENT_ASSOCIATIONS,
  CONTACT_JOB_TYPES_SLUGS,
  ContactOrigin,
  ContactStage,
  contactSupport,
  UserType,
} from "@optee/constants";
import {
  ContactClientProvider,
  ContactClientRepository,
} from "@optee/contact-client-server";
import { ContactLocationProvider } from "@optee/contact-location-server";
import { ContactProvider, ContactRepository } from "@optee/contact-server";
import type { MailTemplateId } from "@optee/mailersend-server";
import { ContactUuid, UserUuid } from "@optee/models";
import { ProProvider, ProRepository } from "@optee/pro-server";
import { AuthProvider } from "@optee/supabase-server";
import { UserProvider } from "@optee/user-server";
import { TRPCError } from "@trpc/server";
import { randomInt } from "crypto";
import { z } from "zod";
import {
  adminProcedure,
  privateProcedure,
  publicProcedure,
  router,
} from "../trpc";

export const contactsRouter = router({
  createMany: adminProcedure
    .input(
      z.object({
        emails: z.array(z.string().email()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { emails } = input;

      const client = await ClientRepository.getByUser(ctx.user.id);

      if (!client) {
        throw new Error("Aucun client trouvé pour l'utilisateur connecté.");
      }

      const normalized = emails.map((e) => e.trim().toLowerCase());
      const dedupeEmails = Array.from(new Set(normalized));

      const createdContacts = await Promise.all(
        dedupeEmails.map(async (email) => {
          // Check if contact already exists
          const existingContact = await ContactRepository.getByEmail(email);

          // @todo Potential buf; When a contact already exists, we return it without creating the client association. The caller expects all returned contacts to be linked.
          if (existingContact) {
            return existingContact;
          }

          // Create new contact
          const contact = await ContactRepository.create({
            email,
          });

          await ContactClientRepository.create(
            contact.uuid,
            client.uuid,
            CONTACT_CLIENT_ASSOCIATIONS.NULL,
          );

          return contact;
        }),
      );

      return createdContacts.map((contact) => ({
        uuid: contact.uuid,
        email: contact.email,
      }));
    }),

  onboard: publicProcedure
    .input(
      z.object({
        contact: z.union([
          // For a client onboarding
          z.object({
            firstName: z.string(),
            lastName: z.string(),
            email: z.string(),
            phone: z.string(),
            password: z.string(),
            jobType: z.enum(CONTACT_JOB_TYPES_SLUGS),
            activitySector: z.string(),
          }),
          // For a pro onboarding
          z.object({
            firstName: z.string(),
            lastName: z.string(),
            phone: z.string().nullish(),
            email: z.string(),
            password: z.string(),
          }),
        ]),
        partner: z.string().nullish(),
        utmData: z.object({
          utmTerm: z.string().nullish(),
          utmMedium: z.string().nullish(),
          utmSource: z.string().nullish(),
          utmContent: z.string().nullish(),
          utmCampaign: z.string().nullish(),
        }),
      }),
    )
    .mutation(async ({ input: dto, ctx }) => {
      try {
        // A
        // Let's not onboard someone already logged in?
        if (ctx.user) {
          return "already_logged_in" as const;
        }

        // Checks if the email is already used or linked to an account
        const existingContact = await ContactRepository.getByEmail(
          dto.contact.email,
        );

        const OTP = randomInt(100000, 999999).toString();

        // If the contact has a jobType, then it's a client onboarding, otherwise, it's a pro onboarding
        const userType =
          "jobType" in dto.contact ? UserType.CLIENT : UserType.PRO;

        // B
        // I guess the user forgot they had an account and are trying to create a new one
        // Let's send them a password reset email
        if (existingContact && existingContact.userUuid) {
          await AuthProvider.inviteUser({
            email: dto.contact.email,
            firstName: dto.contact.firstName,
            emailTemplate: "RESET_PASSWORD",
          });

          // Ideally the same response so we don't leak information about the existence of the account
          return "email_sent" as const;
        }

        if (existingContact) {
          // C
          // If the contact already exists but is not linked to an account, we create the account
          if (!existingContact.userUuid) {
            await ContactRepository.updateOTP(existingContact.uuid, OTP);

            await UserProvider.createUserAccount({
              email: dto.contact.email,
              password: dto.contact.password,
              contactUuid: existingContact.uuid,
              OTP,
              partner: dto.partner,
              userType: userType,
            });

            return "email_sent" as const;
          }
        }

        // D
        // Can't find anyone with this email, let's create a new contact

        // If the contact has a jobType, then it's a client onboarding, otherwise, it's a pro onboarding
        const onboardingOrigin =
          "jobType" in dto.contact
            ? ContactOrigin.ONBOARDING_CLIENT
            : ContactOrigin.ONBOARDING_PRO;

        const { uuid: contactUuid } = await ContactRepository.create({
          ...dto.contact,
          stage: ContactStage.ACCESS_SIGNUP,
          origin: onboardingOrigin,
          ...dto.utmData,
          otp: OTP,
        });

        await UserProvider.createUserAccount({
          email: dto.contact.email,
          password: dto.contact.password,
          contactUuid,
          OTP,
          partner: dto.partner,
          userType: userType,
        });

        return "email_sent" as const;
      } catch (error) {
        console.error("L'onboarding du contact à échoué: ", {
          error,
        });
        throw error;
      }
    }),

  // @todo check is user has permission to see contact
  get: privateProcedure
    .input(ContactUuid)
    .query(async ({ input: uuid }) => ContactRepository.get(uuid)),

  getByLoggedUser: privateProcedure.query(({ ctx }) =>
    ContactRepository.getByUser(ctx.user.id),
  ),

  getAllWithClientAndAssociations: adminProcedure
    .input(
      z.object({
        term: z.string().nullish(),
        duplicatedAssociations: z.boolean().nullish(),
        limit: z.number(),
      }),
    )
    .query(({ input }) =>
      ContactProvider.getAllWithClientAndAssociations(input),
    ),

  getAllWithPro: adminProcedure
    .input(
      z.object({
        term: z.string().nullish(),
        limit: z.number(),
      }),
    )
    .query(({ input }) => ContactProvider.getAllWithPro(input)),

  searchForAdmin: adminProcedure
    .input(
      z.object({
        term: z
          .string()
          .trim()
          .min(2, "Le terme de recherche doit contenir au moins 2 caractères."),
        limit: z.number().int().min(1).max(50).default(10),
      }),
    )
    .query(({ input }) =>
      ContactRepository.searchForAdmin({
        term: input.term,
        limit: input.limit,
      }),
    ),

  selfUpdate: privateProcedure
    .input(
      z.object({
        firstName: z.string().nullable(),
        lastName: z.string().nullable(),
        phone: z.string().nullable(),
        jobTitle: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const contact = await ContactRepository.getByUser(ctx.user.id);

      if (!contact) {
        console.error(
          `🚩 [contacts.selfUpdate] Un utilisateur [${ctx.user.id}] sans contact associé a tenté de mettre à jour ses informations`,
          input,
        );
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Vous n'avez pas de contact associé. ${contactSupport}`,
        });
      }

      return ContactRepository.update(contact.uuid, input);
    }),

  sendInvitationEmailToContactWithUser: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        userType: z.nativeEnum(UserType),
        userUuid: UserUuid,
      }),
    )
    .mutation(async ({ input }) => {
      let template: MailTemplateId = "INVITE_CLIENT_CONTACT";
      if (input.userType === UserType.PRO) {
        const pro = await ProRepository.getByUser(input.userUuid);
        if (!pro) {
          console.error(
            `🚩 [contacts.sendInvitationEmailToContactWithUser] Aucun professionnel trouvé pour l'utilisateur ${input.userUuid}`,
          );
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Aucun professionnel trouvé pour l'utilisateur ${input.userUuid}`,
          });
        }

        template = ProProvider.getEmailTemplateDependingOnStatus(pro.status);
      }

      const email = input.email.trim().toLowerCase();
      await ContactProvider.sendInvitationEmailToContactWithUser({
        email,
        template,
      });

      return { success: true };
    }),

  cleanupDuplicatedAssociations: adminProcedure.query(async () => {
    try {
      await Promise.all([
        ContactClientProvider.cleanupDuplicatedAssociations(),
        ContactLocationProvider.cleanupDuplicatedAssociations(),
      ]);
      return "Associations nettoyées avec succès 🧼";
    } catch (error) {
      console.error(
        `🚩 [contacts.cleanupDuplicatedAssociations] Erreur lors du nettoyage des associations: ${error}`,
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Une erreur est survenue lors du nettoyage des associations: " +
          error,
      });
    }
  }),

  updateLastSignInAt: privateProcedure.mutation(async ({ ctx }) => {
    const contact = await ContactRepository.getByUser(ctx.user.id);
    if (!contact) return;
    await ContactRepository.update(contact.uuid, {
      lastSignInAt: new Date(),
    });
  }),

  checkExistenceByEmails: adminProcedure
    .input(z.object({ emails: z.array(z.string().email()) }))
    .query(async ({ input }) =>
      Promise.all(
        input.emails.map(async (email) => {
          const emailFormatted = email.trim().toLowerCase();
          const contact = await ContactRepository.getByEmail(emailFormatted);
          return {
            email,
            exists: !!contact,
            contactUuid: contact?.uuid ?? null,
          };
        }),
      ),
    ),
});
