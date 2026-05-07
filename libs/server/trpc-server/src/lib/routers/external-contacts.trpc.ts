import {
  AssociationProExternalContactStatus,
  AssociationProExternalContactType,
  CONTACT_DISCOVERY_COST,
  externalContactListInputSchema,
  ExternalContactSource,
} from "@optee/constants";
import { ContactRepository } from "@optee/contact-server";
import {
  ExternalContactProvider,
  ExternalContactRepository,
} from "@optee/external-contact-server";

import { ExternalContactUuid, LegalEntityUuid } from "@optee/models";
import { isNotNullish } from "@optee/utils";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { proProcedure, router } from "../trpc";

export const externalContactsRouter = router({
  getAllPaginatedForPro: proProcedure()
    .input(externalContactListInputSchema)
    .query(({ input: filters, ctx }) =>
      ExternalContactRepository.getAllForProPaginated({
        proUuid: ctx.pro.id,
        filters,
      }),
    ),

  getAllByLegalEntity: proProcedure()
    .input(LegalEntityUuid)
    .query(async ({ input, ctx }) => {
      const rows = await ExternalContactProvider.getAllByLegalEntity(input);

      if (!rows.length) {
        return [];
      }

      const associations =
        await ExternalContactRepository.getAssociationsWithPro({
          proUuid: ctx.pro.id,
          externalContactUuids: rows.map((row) => row.contact.uuid),
        });
      const associationsByContactUuid = new Map(
        associations.map((association) => [
          association.contactUuid,
          association,
        ]),
      );

      return rows
        .map((row) => {
          // we want to know if the current pro is associated with the contact
          const proHasAccessToContact =
            associationsByContactUuid.get(row.contact.uuid) ?? null;

          // We return null if the pro is not associated with the contact at all
          if (!proHasAccessToContact?.associationType) {
            return null;
          }

          const hasFullAccess =
            proHasAccessToContact?.associationType ===
            AssociationProExternalContactType.BOTH;
          const hasEmailAccess =
            hasFullAccess ||
            proHasAccessToContact?.associationType ===
              AssociationProExternalContactType.MAIL;
          const hasPhoneAccess =
            hasFullAccess ||
            proHasAccessToContact?.associationType ===
              AssociationProExternalContactType.PHONE;

          return {
            contact: {
              ...row.contact,
              email: hasEmailAccess ? row.contact.email : null,
              phone: hasPhoneAccess ? row.contact.phone : null,
            },
            associationType: proHasAccessToContact?.associationType ?? null,
            isAssociatedWithPro: !!proHasAccessToContact.uuid,
            isBillable: false,
            legalEntities: row.legalEntities,
          };
        })
        .filter(isNotNullish);
    }),

  getByUuidsForPro: proProcedure()
    .input(
      z.object({
        contactUuids: z.array(ExternalContactUuid).min(1),
      }),
    )
    .query(({ input, ctx }) =>
      ExternalContactRepository.getAllByUuidForPro({
        proUuid: ctx.pro.id,
        externalContactUuids: input.contactUuids,
      }),
    ),

  countByLegalEntity: proProcedure()
    .input(LegalEntityUuid)
    .query(async ({ input }) =>
      ExternalContactRepository.countByLegalEntity(input),
    ),

  getStatusCountsForPro: proProcedure()
    .input(externalContactListInputSchema)
    .query(({ input: filters, ctx }) =>
      ExternalContactRepository.countByStatusForPro({
        proUuid: ctx.pro.id,
        filters: { ...filters, status: null },
      }),
    ),

  getOwnersForPro: proProcedure().query(async ({ ctx }) => {
    return ExternalContactRepository.getOwnersForPro(ctx.pro.id);
  }),

  getLegalEntitiesForPro: proProcedure().query(async ({ ctx }) => {
    return ExternalContactRepository.getLegalEntitiesForPro(ctx.pro.id);
  }),

  updateStatus: proProcedure()
    .input(
      z.object({
        associationUuid: z.string().uuid(),
        status: z.nativeEnum(AssociationProExternalContactStatus),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ExternalContactRepository.updateAssociationStatus({
        proUuid: ctx.pro.id,
        associationUuid: input.associationUuid,
        status: input.status,
      });
      return { success: result.updated, status: input.status };
    }),

  associateWithPro: proProcedure()
    .input(
      z.object({
        contactsUuids: z.array(ExternalContactUuid).min(1),
        type: z.nativeEnum(AssociationProExternalContactType),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const proUuid = ctx.pro.id;
      const userUuid = ctx.user.id;
      const { contactsUuids, type } = input;

      const addedByContact = await ContactRepository.getByUser(userUuid);

      if (!addedByContact) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Aucun contact trouvé pour l'utilisateur connecté.",
        });
      }

      const { uuid: addedByContactUuid } = addedByContact;

      const results = await Promise.allSettled(
        contactsUuids.map((contactUuid) =>
          ExternalContactRepository.associateWithPro(
            proUuid,
            contactUuid,
            type,
            addedByContactUuid,
          ),
        ),
      );

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `❌ Failed to associate contact [${contactsUuids[index]}] with pro [${proUuid}]:`,
            result.reason,
          );
        }
      });

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return {
        success: failed === 0,
        succeeded,
        failed,
        total: contactsUuids.length,
      };
    }),

  discoverContacts: proProcedure()
    .input(
      z.object({
        legalEntityUuid: LegalEntityUuid,
        contacts: z
          .object({
            uuid: ExternalContactUuid.nullable(),
            societeInfoId: z.string().nullable(),
            origin: z.nativeEnum(ExternalContactSource).nullable(),
          })
          .array()
          .min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { legalEntityUuid, contacts } = input;

      const remainingCredits = ctx.pro.remainingCredits;
      if (
        remainingCredits === null ||
        remainingCredits < CONTACT_DISCOVERY_COST * contacts.length
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Votre solde de crédits est insuffisant pour découvrir ce contact.",
        });
      }

      return ExternalContactProvider.discoverContacts({
        legalEntityUuid,
        contacts,
        proUuid: ctx.pro.id,
      });
    }),
});
