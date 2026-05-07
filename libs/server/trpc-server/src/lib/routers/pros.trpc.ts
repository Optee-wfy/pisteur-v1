import {
  ADMIN_PRO_SORT_FIELDS,
  ADMIN_PRO_SUBSCRIPTION_ACTIVITY_FILTERS,
  AssociationProExternalContactStatus,
  CONTACT_DETAILS_ENRICHMENT_COST,
  CONTACT_PRO_ASSOCIATIONS,
  contactSupport,
  ContractTypes,
  OPERATION_HUBSPOT_PRESTATION_IDS,
  PRO_FILES_METADATA_LABELS,
  PRO_LEGAL_ENTITY_ASSOCIATIONS,
  PRO_STATUSES,
  ProSubscription,
  UserType,
} from "@optee/constants";
import { PRO_ONBOARD_FREE_PREFIX } from "@optee/constants/pro-onboarding.constant";
import { ContactRepository } from "@optee/contact-server";
import {
  ContactUuid,
  LegalEntityUuid,
  LocationBdnbUuid,
  LocationUuid,
  OperationUuid,
  ProUuid,
  proWithoutIdsSchema,
} from "@optee/models";
import {
  ProAdminProvider,
  ProMemberInvitationForbiddenError,
  ProMemberInvitationNotFoundError,
  ProProvider,
  ProRepository,
} from "@optee/pro-server";
import { AuthProvider } from "@optee/supabase-server";
import { UserProvider } from "@optee/user-server";
import { fileDtoSchema, isEmailFromOptee } from "@optee/utils";
import { TRPCError } from "@trpc/server";
import { randomInt } from "crypto";
import z from "zod";
import {
  adminProcedure,
  privateProcedure,
  proProcedure,
  router,
} from "../trpc";

const mapInviteMemberErrorToTRPC = (error: unknown): never => {
  if (error instanceof ProMemberInvitationNotFoundError) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: error.message,
    });
  }

  if (error instanceof ProMemberInvitationForbiddenError) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: error.message,
    });
  }

  throw error;
};

export const prosRouter = router({
  create: privateProcedure
    .input(proWithoutIdsSchema)
    .mutation(({ ctx, input }) => ProProvider.create(ctx.user.id, input)),

  // @todo extract to provider
  // The user must be logged in, which means if they started the registration but didn't finish it, they won't be able to onboard
  // What happens if a user tries to onboard but isn't logged in?
  // They will receive a reset password email but then they will have to log in again to complete the onboarding
  onboard: privateProcedure
    .input(
      z.object({
        pro: z.object({
          email: z.string(),
          name: z.string().nullish(),
          siret: z.string().nullish(),
          street: z.string().nullish(),
          zipcode: z.string().nullish(),
          city: z.string().nullish(),
        }),
        OTP: z.string(),
      }),
    )
    .mutation(async ({ input: dto, ctx }) => {
      try {
        // Checks if the email is already used or linked to an account
        const contact = await ContactRepository.getByUser(ctx.user.id);

        if (!contact) {
          console.error(
            "🚩 Somehow the user has no contact associated and tried to onboard",
          );

          return "missing_contact" as const;
        }

        // @todo OTP mismatch handling leaks timing and can be abused for spamming
        // Use constant‑time comparison & Avoid regenerating/sending a new OTP on every mismatch; rate-limit resend via a dedicated route and TTL
        if (contact.otp !== dto.OTP) {
          const OTP = randomInt(100000, 999999).toString();
          await ContactRepository.updateOTP(contact.uuid, OTP);

          if (!contact.email) {
            console.error("🚩 The contact has no email, we can't send the OTP");
            return "missing_email" as const;
          }

          await AuthProvider.sendOTP({
            email: contact.email,
            firstName: contact.firstName ?? "",
            OTP,
            userType: UserType.PRO,
          });
          return "invalid_otp" as const;
        }

        const pro = await ProRepository.getByUser(ctx.user.id);

        // If the user is already a pro, we don't allow them to onboard again
        if (pro) {
          return "already_onboarded" as const;
        }

        const { email, street, zipcode, city, name, siret } = dto.pro;

        await ProProvider.create(ctx.user.id, {
          mailContact: email,
          name: name ?? PRO_ONBOARD_FREE_PREFIX + email,
          status: "Actif",
          subscription: ProSubscription.FREE,
          remainingCredits: 25,
          street,
          zipcode,
          city,
          siret,
        });

        // We remove the OTP from the contact so it can't be used again
        await ContactRepository.updateOTP(contact.uuid, null);

        return "success" as const;
      } catch (error) {
        console.error("🚩 L'onboarding du pro à échoué: ", {
          error,
          pro: dto.pro,
        });

        throw error;
      }
    }),

  createClientProject: proProcedure()
    .input(
      z.object({
        hsPrestationId: z.enum(OPERATION_HUBSPOT_PRESTATION_IDS),
        locationUuid: LocationUuid,
        signatoryUuid: ContactUuid,
        quoteInformation: z.object({
          preTaxAmount: z.number(),
          validityEndDate: z.coerce.date(),
          vatRate: z.number(),
          fundingAmount: z.number(),
          file: fileDtoSchema,
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hasAccess = await ProProvider.hasAccessToLocation(
        input.locationUuid,
        ctx.pro.id,
      );

      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous n'avez pas accès à ce bâtiment. " + contactSupport,
        });
      }

      return ProProvider.createClientProject({
        proUuid: ctx.pro.id,
        proName: ctx.pro.name ?? "",
        currentUserUuid: ctx.user.id,
        input,
      });
    }),

  getByLoggedPro: proProcedure().query(({ ctx }) =>
    ProRepository.get(ctx.pro.id),
  ),

  getClientsAndLocationsByLoggedPro: proProcedure().query(async ({ ctx }) =>
    ProRepository.getClientsAndLocations(ctx.pro.id),
  ),

  getDocuments: privateProcedure.query(({ ctx }) =>
    ProProvider.getDocuments(ctx.user.id),
  ),

  getContract: proProcedure()
    .input(z.enum(ContractTypes))
    .mutation(async ({ ctx, input }) => {
      const pro = await ProRepository.get(ctx.pro.id);
      if (!pro) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Aucun pro trouvé pour l'utilisateur connecté.",
        });
      }
      return ProProvider.getContract(pro, input);
    }),

  getAll: adminProcedure
    .input(z.object({ filter: z.string() }))
    .query(({ input }) => ProRepository.getAll(input.filter)),

  getAllForAdmin: adminProcedure
    .input(
      z.object({
        term: z.string().nullish(),
        page: z.number().int().min(0).default(0),
        pageSize: z.number().int().min(1).max(200).default(50),
        filters: z
          .object({
            status: z.enum(PRO_STATUSES).nullish(),
            statusInterne: z
              .nativeEnum(AssociationProExternalContactStatus)
              .nullish(),
            subscriptionActivity: z
              .enum(ADMIN_PRO_SUBSCRIPTION_ACTIVITY_FILTERS)
              .nullish(),
            hubspotSubscription: z.boolean().nullish(),
          })
          .nullish(),
        sort: z
          .object({
            sortBy: z.enum(ADMIN_PRO_SORT_FIELDS),
            sortOrder: z.enum(["asc", "desc"]),
          })
          .nullish(),
      }),
    )
    .query(({ input }) =>
      ProAdminProvider.getAllForAdmin({
        term: input.term,
        page: input.page,
        pageSize: input.pageSize,
        filters: input.filters,
        sort: input.sort,
      }),
    ),

  addCreditsToPro: adminProcedure
    .input(
      z.object({
        proUuid: ProUuid,
        creditsToAdd: z.number().int().positive(),
      }),
    )
    .mutation(({ input }) =>
      ProAdminProvider.addCreditsToPro({
        proUuid: input.proUuid,
        creditsToAdd: input.creditsToAdd,
      }),
    ),

  updateStatusForAdmin: adminProcedure
    .input(
      z.object({
        proUuid: ProUuid,
        status: z.enum(PRO_STATUSES),
      }),
    )
    .mutation(({ input }) =>
      ProAdminProvider.updateStatusForAdmin({
        proUuid: input.proUuid,
        status: input.status,
      }),
    ),

  updateInternalStatusForAdmin: adminProcedure
    .input(
      z.object({
        proUuid: ProUuid,
        statusInterne: z.nativeEnum(AssociationProExternalContactStatus),
      }),
    )
    .mutation(({ input }) =>
      ProAdminProvider.updateInternalStatusForAdmin({
        proUuid: input.proUuid,
        statusInterne: input.statusInterne,
      }),
    ),

  updateStripeCustomerIdForAdmin: adminProcedure
    .input(
      z.object({
        proUuid: ProUuid,
        stripeCustomerId: z
          .string()
          .trim()
          .min(1)
          .max(255)
          .regex(/^cus_[A-Za-z0-9_]+$/),
        stripeSubscriptionId: z
          .string()
          .trim()
          .min(1)
          .max(255)
          .regex(/^sub_[A-Za-z0-9_]+$/),
        stripeCurrentPlanPriceId: z
          .string()
          .trim()
          .min(1)
          .max(255)
          .regex(/^price_[A-Za-z0-9_]+$/),
      }),
    )
    .mutation(({ input }) =>
      ProAdminProvider.updateStripeCustomerIdForAdmin({
        proUuid: input.proUuid,
        stripeCustomerId: input.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId,
        stripeCurrentPlanPriceId: input.stripeCurrentPlanPriceId,
      }),
    ),

  deleteForAdmin: adminProcedure
    .input(
      z.object({
        proUuid: ProUuid,
      }),
    )
    .mutation(({ input }) =>
      ProAdminProvider.deleteForAdmin({
        proUuid: input.proUuid,
      }),
    ),

  setAsTestAccount: adminProcedure
    .input(
      z.object({
        proUuid: ProUuid,
      }),
    )
    .mutation(({ input }) =>
      ProAdminProvider.setAsTestAccount({
        proUuid: input.proUuid,
      }),
    ),

  unsetAsTestAccount: adminProcedure
    .input(
      z.object({
        proUuid: ProUuid,
      }),
    )
    .mutation(({ input }) =>
      ProAdminProvider.unsetAsTestAccount({
        proUuid: input.proUuid,
      }),
    ),

  getMembers: proProcedure().query(async ({ ctx }) => {
    const members = await ContactRepository.getAllByPro(ctx.pro.id);
    return ctx.isAdmin
      ? members
      : members.filter((member) => !isEmailFromOptee(member.contact.email));
  }),

  getMembersByPro: adminProcedure
    .input(
      z.object({
        proUuid: ProUuid,
      }),
    )
    .query(({ input }) => ProAdminProvider.getMembersByPro(input.proUuid)),

  getCurrentRoleOfUser: proProcedure().query(async ({ ctx }) => {
    const pro = await ProRepository.get(ctx.pro.id);
    if (!pro) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Aucun pro trouvé pour l'utilisateur connecté.",
      });
    }

    const contact = await ContactRepository.getByUser(ctx.user.id);
    if (!contact) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Aucun contact trouvé pour l'utilisateur connecté.",
      });
    }

    const isMainContact =
      (await ProRepository.getMainContacts(pro.uuid)).find(
        (c) => c.uuid === contact.uuid,
      ) !== undefined;

    return isMainContact ? "MAIN_CONTACT" : "MEMBER";
  }),

  selfUpdate: proProcedure()
    .input(proWithoutIdsSchema)
    .mutation(({ ctx, input }) => ProProvider.update(ctx.pro.id, input)),

  updateStatus: proProcedure()
    .input(z.enum(PRO_STATUSES))
    .mutation(({ ctx, input }) => ProProvider.updateStatus(ctx.pro.id, input)),

  setCurrentUserAsProAdmin: adminProcedure
    .input(z.object({ proUuid: ProUuid }))
    .mutation(async ({ ctx, input }) => {
      await ProRepository.setUserAsProAdmin({
        proUuid: input.proUuid,
        userUuid: ctx.user.id,
      });
    }),

  upload: proProcedure()
    .input(
      z.object({
        file: fileDtoSchema,
        label: z.enum(PRO_FILES_METADATA_LABELS),
      }),
    )
    .mutation(({ ctx, input }) => ProProvider.upload(ctx.pro.id, input)),

  // @todo need refacto; extract admin part in separate procedure + business logic in provider
  grantPlatformAccess: privateProcedure
    .input(
      z.object({
        uuid: ContactUuid,
        proUuid: ProUuid.nullish(), // Only for admins
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const contactUuid = input.uuid;

      const existingContact = await ContactRepository.get(contactUuid);

      if (!existingContact) {
        throw new Error(
          `Impossible de donner accès à la plateforme à ce contact. Il n'existe pas`,
        );
      }

      if (!existingContact.email) {
        throw new Error(
          `Impossible de donner accès à la plateforme à ce contact. L'email est manquant.`,
        );
      }

      const pro =
        ctx.isAdmin && input.proUuid
          ? await ProRepository.get(input.proUuid)
          : await ProRepository.getByUser(ctx.user.id);

      if (!pro) {
        const reason = ctx.isAdmin
          ? "Le pro n'existe pas"
          : "Vous n'êtes pas un pro.";
        throw new Error(`Erreur lors de l'invitation du contact: ${reason}`);
      }

      if (ctx.isAdmin) {
        if (!(await ProRepository.getMainContacts(pro.uuid)).length) {
          throw new Error(
            `Erreur lors de l'invitation du contact. Le pro n'a pas de contact principal.`,
          );
          //await ProProvider.setMainContact(pro.uuid, contactUuid);
        }

        if (pro.status === null) {
          await ProRepository.updateStatus(pro.uuid, "Invitation envoyée");
        }
      } else {
        const allProContacts = await ContactRepository.getAllByPro(pro.uuid);
        if (!allProContacts.some((c) => c.contact.uuid === contactUuid)) {
          throw new Error(
            `Erreur lors de l'invitation du contact. Le contact n'est pas associé à votre compte.`,
          );
        }
      }

      await ContactRepository.update(contactUuid, {
        invitedAt: new Date(),
      });

      return UserProvider.createUserAccount({
        email: existingContact.email,
        contactUuid: existingContact.uuid,
        emailTemplate: ProProvider.getEmailTemplateDependingOnStatus(
          pro.status,
        ),
      });
    }),

  inviteMember: proProcedure()
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const currentUserContact = await ContactRepository.getByUser(ctx.user.id);
      if (!currentUserContact) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "L'utilisateur connecté n'a pas de contact associé. Impossible d'inviter un membre. Contacter le support.",
        });
      }

      try {
        return await ProProvider.validateAndInviteMember({
          proUuid: ctx.pro.id,
          contactEmail: input.email,
          inviterContactUuid: currentUserContact.uuid,
        });
      } catch (error) {
        return mapInviteMemberErrorToTRPC(error);
      }
    }),

  inviteMemberByPro: adminProcedure
    .input(
      z.object({
        proUuid: ProUuid,
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await ProProvider.validateAndInviteMember({
          proUuid: input.proUuid,
          contactEmail: input.email,
        });
      } catch (error) {
        return mapInviteMemberErrorToTRPC(error);
      }
    }),

  removeMember: proProcedure()
    .input(
      z.object({
        contactUuid: ContactUuid,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserContact = await ContactRepository.getByUser(ctx.user.id);
      if (!currentUserContact) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "L'utilisateur connecté n'a pas de contact associé. Impossible de supprimer un membre.",
        });
      }

      const members = await ContactRepository.getAllByPro(ctx.pro.id);
      const currentMembership = members.find(
        (member) => member.contact.uuid === currentUserContact.uuid,
      );
      const isAccountOwner =
        currentMembership?.role === CONTACT_PRO_ASSOCIATIONS.MAIN_CONTACT.id;

      if (!isAccountOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Seul le propriétaire du compte peut supprimer un membre.",
        });
      }

      return ProProvider.removeMember({
        proUuid: ctx.pro.id,
        contactUuid: input.contactUuid,
      });
    }),

  removeMemberByPro: adminProcedure
    .input(
      z.object({
        proUuid: ProUuid,
        contactUuid: ContactUuid,
      }),
    )
    .mutation(({ input }) =>
      ProProvider.removeMember({
        proUuid: input.proUuid,
        contactUuid: input.contactUuid,
      }),
    ),

  setMainContactForAdmin: adminProcedure
    .input(
      z.object({
        proUuid: ProUuid,
        contactUuid: ContactUuid,
      }),
    )
    .mutation(({ input }) => ProAdminProvider.setMainContactForAdmin(input)),

  isProLinkedToOperation: privateProcedure
    .input(OperationUuid)
    .query(async ({ ctx, input }) => {
      const pro = await ProRepository.getByUser(ctx.user.id);
      if (!pro) {
        return false;
      }

      return ProRepository.isProLinkedToOperation({
        proUuid: pro.uuid,
        operationUuid: input,
      });
    }),

  getLead: proProcedure()
    .input(OperationUuid)
    .mutation(({ ctx, input }) => ProProvider.getLead(ctx.pro.id, input)),

  addLocationToFavorites: proProcedure()
    .input(LocationUuid)
    .mutation(({ input: locationUuid, ctx }) =>
      ProProvider.addLocationToFavorites(locationUuid, ctx.pro.id),
    ),

  isLocationInFavorites: proProcedure()
    .input(LocationUuid)
    .query(({ input: locationUuid, ctx }) =>
      ProProvider.isLocationInFavorites(locationUuid, ctx.pro.id),
    ),

  removeLocationFromFavorites: proProcedure()
    .input(LocationUuid)
    .mutation(({ input: locationUuid, ctx }) =>
      ProProvider.removeLocationFromFavorites(locationUuid, ctx.pro.id),
    ),

  getSummaryCardFromProspectExternal: proProcedure()
    .input(LocationBdnbUuid)
    .query(async ({ input: locationUuid, ctx }) => {
      const hasAccess = await ProProvider.hasAccessToExternalLocation(
        locationUuid,
        ctx.pro.id,
      );

      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous n'avez pas accès à ce bâtiment. " + contactSupport,
        });
      }

      return ProProvider.getSummaryCardFromProspectExternal(locationUuid);
    }),

  hasAccessToLocationBdnb: proProcedure()
    .input(LocationBdnbUuid)
    .query(async ({ input: locationUuid, ctx }) => {
      const hasAccess = await ProProvider.hasAccessToExternalLocation(
        locationUuid,
        ctx.pro.id,
      );

      return hasAccess;
    }),

  getDataFromProspectExternal: proProcedure()
    .input(LocationBdnbUuid)
    .query(async ({ input: locationUuid, ctx }) => {
      const hasAccess = await ProProvider.hasAccessToExternalLocation(
        locationUuid,
        ctx.pro.id,
      );

      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Vous n'avez pas accès à ce bâtiment. " + contactSupport,
        });
      }

      return ProProvider.getDataFromProspectExternal(locationUuid);
    }),

  connectProWithLegalEntity: proProcedure(CONTACT_DETAILS_ENRICHMENT_COST)
    .input(
      z.object({
        legalEntityUuid: LegalEntityUuid,
        associationType: z.enum(["CONTACT", "GLOBAL"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const associationType =
        input.associationType === "CONTACT"
          ? PRO_LEGAL_ENTITY_ASSOCIATIONS.CONTACT
          : PRO_LEGAL_ENTITY_ASSOCIATIONS.GLOBAL;
      return ProProvider.connectProWithLegalEntity(
        input.legalEntityUuid,
        ctx.pro.id,
        associationType,
      );
    }),
});
