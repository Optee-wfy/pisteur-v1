import { ClientProvider, ClientRepository } from "@optee/client-server";
import {
  contactSupport,
  LOCATION_ADDRESS_DETAILS,
  LOCATION_PLACE_DETAILS,
  ROLES_SLUGS,
} from "@optee/constants";
import { ContactRepository } from "@optee/contact-server";
import {
  ClientUuid,
  ContactUuid,
  Location,
  locationBdnbSchema,
  LocationUuid,
} from "@optee/models";
import { UserProvider } from "@optee/user-server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  adminProcedure,
  clientProcedure,
  privateProcedure,
  proProcedure,
  router,
} from "../trpc";

export const clientRouter = router({
  onboard: privateProcedure
    .input(
      z.object({
        client: z.object({
          companyName: z.string(),
        }),
        location: z.object({
          addressData: LOCATION_ADDRESS_DETAILS,
          placeData: LOCATION_PLACE_DETAILS,
          customBdnbData: locationBdnbSchema,
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
            `🚩 [clients.onboard] Un utilisateur [${ctx.user.id}] sans contact associé a tenté de s'onboarder`,
          );

          return "missing_contact" as const;
        }

        if (contact.otp !== dto.OTP) {
          // @todo We should invalidate the OTP here so it can't be brut forced...
          return "invalid_otp" as const;
        }

        return ClientProvider.onboard({
          dto,
          userUuid: ctx.user.id,
          contact,
        });
      } catch (error) {
        console.error("🚩 [clients.onboard]: " + error, {
          details: error,
          client: dto.client,
          location: Location.makeAddress(dto.location.addressData),
        });
        throw error;
      }
    }),

  getByLoggedUser: privateProcedure.query(({ ctx }) =>
    ClientRepository.getByUser(ctx.user.id),
  ),

  getCurrentContacts: clientProcedure([
    "CONTACT_READ_BY_CLIENT",
    "CONTACT_READ_BY_LOCATION",
  ]).query(async ({ ctx }) => {
    //@todo should be handled / provided by clientProcedure
    const client = await ClientRepository.getByUser(ctx.user.id);

    if (!client) {
      console.error(
        `🚩 [clients.getCurrentContacts] Aucun client associé à l'utilisateur [${ctx.user.id}]`,
      );
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Vous n'avez pas de compte client associé. ${contactSupport}`,
      });
    }

    return ClientProvider.getContactsWithLocationAndRoles(client.uuid);
  }),

  getUuidByLocation: proProcedure()
    .input(LocationUuid)
    .query(({ input: locationUuid }) =>
      ClientRepository.getUuidByLocation(locationUuid),
    ),

  getSummaryCardFromLocation: proProcedure()
    .input(LocationUuid)
    .query(({ input: locationUuid }) =>
      ClientProvider.getSummaryCardFromLocation(locationUuid),
    ),

  getAll: adminProcedure
    .input(z.object({ filter: z.string() }))
    .query(({ input }) => ClientRepository.getAll(input.filter)),

  setCurrentUserAsClientAdmin: adminProcedure
    .input(ClientUuid)
    .mutation(async ({ ctx, input: clientUuid }) => {
      await ClientRepository.setUserAsClientAdmin({
        clientUuid,
        userUuid: ctx.user.id,
      });
    }),

  //@todo we should extract the admin workflow in separate route + verify logic for permissions
  updateContactRole: clientProcedure([
    "CONTACT_UPDATE_CLIENT_ADMINISTRATOR_RIGHTS",
    "CONTACT_UPDATE_LOCATION_ADMINISTRATOR_RIGHTS",
    "CONTACT_UPDATE_LOCATION_VIEWER_RIGHTS",
  ])
    .input(
      z.object({
        contactUuid: ContactUuid,
        role: z.enum(ROLES_SLUGS),
        locationUuids: z.array(LocationUuid).nullish(),
        clientUuid: ClientUuid.nullish(), // only for admin
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        contactUuid,
        clientUuid,
        role: grantedRole,
        locationUuids,
      } = input;

      // If not admin, checks if the user has the right to update the contact
      if (!ctx.isAdmin) {
        const currentContactRole = await ClientProvider.getRole(contactUuid);

        const canUpdateTargetContact = ctx.permissions.some(
          (p) =>
            p.masterSlug === "CONTACT_UPDATE_RIGHTS" &&
            p.targetRole === currentContactRole, // @todo Pas sûr que ça soit ce qu'on veut ça
        );

        if (!canUpdateTargetContact) {
          throw new Error(
            "Vous n'avez pas la permission de mettre à jour les contacts.",
          );
        }
      }

      // Get client (from current user or from input)
      const client =
        ctx.isAdmin && clientUuid
          ? await ClientRepository.get(clientUuid)
          : await ClientRepository.getByUser(ctx.user.id);

      if (!client) {
        const reason = ctx.isAdmin
          ? "Le client associé n'existe pas: " + clientUuid
          : `Aucun client trouvé pour l'utilisateur invitant un contact.`;
        throw new Error("Erreur lors de la création du contact: " + reason);
      }

      // Grants permissions to the contact
      await ClientProvider.grantRole({
        clientUuid: client.uuid,
        contactUuid,
        grantedRole,
        locationUuids,
      });
    }),

  sendInvitation: clientProcedure([
    "INVITE_CLIENT_ADMINISTRATOR",
    "INVITE_LOCATION_ADMINISTRATOR",
    "INVITE_LOCATION_VIEWER",
    "INVITE_CONTACT_WITHOUT_RIGHTS",
  ])
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        role: z.enum(ROLES_SLUGS),
        locationUuids: z.array(LocationUuid).nullish(),
        clientUuid: ClientUuid.nullish(), // only for admin
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Checks permissions to invite a contact
      if (!ctx.isAdmin) {
        const canInviteTargetContactWithRole = ctx.permissions.some(
          (p) =>
            p.masterSlug === "CONTACT_INVITE" && p.targetRole === input.role,
        );

        if (!canInviteTargetContactWithRole) {
          throw new Error(
            "Vous n'avez pas la permission d'inviter un contact avec ce rôle.",
          );
        }
      }

      // Get client (from current user or from input)
      const client =
        ctx.isAdmin && input.clientUuid
          ? await ClientRepository.get(input.clientUuid)
          : await ClientRepository.getByUser(ctx.user.id);

      if (!client) {
        const reason = ctx.isAdmin
          ? "Le client associé n'existe pas"
          : `Aucun client trouvé pour l'utilisateur invitant un contact.`;
        throw new Error("Erreur lors de la création du contact: " + reason);
      }

      // Checks if email already exists
      const existingContact = await ContactRepository.getByEmail(input.email);
      let contactUuid: ContactUuid;

      // if the contact already exists and linked to another client => throw
      if (existingContact) {
        contactUuid = existingContact.uuid;

        // Check if the user has permission to invite an existing contact without rights
        if (
          !ctx.isAdmin &&
          !ctx.permissionsSlugs.includes("INVITE_CONTACT_WITHOUT_RIGHTS")
        ) {
          throw new Error(
            "Un contact avec cette adresse mail existe déjà et vous n'avez pas la permission d'inviter un contact existant.",
          );
        }

        const allContactsByClient =
          await ClientProvider.getContactsWithLocationAndRoles(client.uuid);

        const foundContact = allContactsByClient.find(
          (c) => c.uuid === contactUuid,
        );

        if (!foundContact) {
          const reason = ctx.isAdmin
            ? "Le contact est déjà associé à un autre client"
            : `Le contact n'est pas associé au compte auquel vous êtes connecté.`;
          throw new Error("Erreur lors de l'invitation du contact. " + reason);
        }

        if (foundContact.userUuid) {
          throw new Error(
            `Erreur lors de l'invitation du contact. Un compte utilisateur existe déjà pour le contact.`,
          );
        }
      } else {
        const contact = await ContactRepository.create({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          invitedAt: new Date(),
        });

        contactUuid = contact.uuid;
      }

      await ClientProvider.grantRole({
        contactUuid,
        clientUuid: client.uuid,
        locationUuids: input.locationUuids,
        grantedRole: input.role,
      });

      const { user } = await UserProvider.createUserAccount({
        email: input.email,
        contactUuid,
        emailTemplate: "INVITE_CLIENT_CONTACT",
      });

      if (!user.id) {
        throw new Error("Erreur lors de la création du compte utilisateur.");
      }

      return user.id;
    }),
});
