import {
  CONTACT_PRO_ASSOCIATIONS,
  PRO_PLANS,
  ProSubscription,
  SUBSCRIPTION_LABELS,
} from "@optee/constants";
import { ContactRepository } from "@optee/contact-server";
import {
  hsAssociationsContactsProsTable,
  type ContactUuid,
  type ProUuid,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { ProAdminRepository } from "../repositories/pro-admin.repository";
import { ProRepository } from "../repositories/pro.repository";

const SUBSCRIPTION_PRICE_IDS: Partial<Record<ProSubscription, string>> = {
  [ProSubscription.ESSENTIAL]: process.env["STRIPE_PRICE_ESSENTIAL"],
  [ProSubscription.PRO]: process.env["STRIPE_PRICE_PRO"],
  [ProSubscription.PRO_PLUS]: process.env["STRIPE_PRICE_BUSINESS"],
};

const normalizeSubscriptionForStripePlan = (
  subscription: string | null | undefined,
): ProSubscription | null => {
  if (!subscription) {
    return null;
  }

  const normalized = subscription.trim().toLowerCase();

  if (normalized === ProSubscription.ESSENTIAL.toLowerCase()) {
    return ProSubscription.ESSENTIAL;
  }
  if (normalized === ProSubscription.PRO.toLowerCase()) {
    return ProSubscription.PRO;
  }
  if (
    normalized === ProSubscription.PRO_PLUS.toLowerCase() ||
    normalized === "pro plus"
  ) {
    return ProSubscription.PRO_PLUS;
  }

  return null;
};

export const ProAdminProvider = {
  getAllForAdmin: ProAdminRepository.getAllForAdmin,
  getByStripeCurrentPlanPriceForAdmin:
    ProAdminRepository.getByStripeCurrentPlanPriceForAdmin,
  async getStripeProductsForAdmin() {
    const buyablePlans = PRO_PLANS.filter((plan) => plan.buyable);
    const pros = await ProAdminRepository.getBySubscriptionsForAdmin();

    const prosBySubscription = new Map<
      ProSubscription,
      Array<(typeof pros)[number]>
    >();

    for (const pro of pros) {
      const normalizedSubscription = normalizeSubscriptionForStripePlan(
        pro.subscription,
      );
      if (!normalizedSubscription) {
        continue;
      }
      const currentPros = prosBySubscription.get(normalizedSubscription) ?? [];
      currentPros.push(pro);
      prosBySubscription.set(normalizedSubscription, currentPros);
    }

    return buyablePlans.map((plan) => ({
      productName: plan.name,
      subscription: plan.subscription,
      subscriptionLabel: SUBSCRIPTION_LABELS[plan.subscription],
      monthlyPrice: plan.price,
      includedCredits: plan.credits,
      seats: plan.seats,
      stripePriceId: SUBSCRIPTION_PRICE_IDS[plan.subscription] ?? null,
      pros: prosBySubscription.get(plan.subscription) ?? [],
    }));
  },
  getMembersByPro(proUuid: ProUuid) {
    return ContactRepository.getAllByPro(proUuid);
  },
  addCreditsToPro: ProAdminRepository.addCreditsToPro,
  updateStatusForAdmin: ProAdminRepository.updateStatusForAdmin,
  updateInternalStatusForAdmin: ProAdminRepository.updateInternalStatusForAdmin,
  updateStripeCustomerIdForAdmin:
    ProAdminRepository.updateStripeCustomerIdForAdmin,
  setAsTestAccount: ProAdminRepository.setAsTestAccount,
  unsetAsTestAccount: ProAdminRepository.unsetAsTestAccount,
  async setMainContactForAdmin({
    proUuid,
    contactUuid,
  }: {
    proUuid: ProUuid;
    contactUuid: ContactUuid;
  }) {
    const pro = await ProRepository.get(proUuid);
    if (!pro) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Aucun pro trouvé.",
      });
    }

    const contact = await ContactRepository.get(contactUuid);
    if (!contact) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Aucun contact trouvé.",
      });
    }

    return db.transaction(async (tx) => {
      const [existingMembership] = await tx
        .select({
          contactUuid: hsAssociationsContactsProsTable.contactUuid,
        })
        .from(hsAssociationsContactsProsTable)
        .where(
          and(
            eq(hsAssociationsContactsProsTable.proUuid, proUuid),
            eq(hsAssociationsContactsProsTable.contactUuid, contactUuid),
          ),
        )
        .limit(1);

      const wasAlreadyMember = Boolean(existingMembership);

      if (!wasAlreadyMember) {
        await tx.insert(hsAssociationsContactsProsTable).values({
          contactUuid,
          proUuid,
          associationTypeId: CONTACT_PRO_ASSOCIATIONS.NULL.id,
        });
      }

      await tx
        .delete(hsAssociationsContactsProsTable)
        .where(
          and(
            eq(hsAssociationsContactsProsTable.proUuid, proUuid),
            eq(hsAssociationsContactsProsTable.contactUuid, contactUuid),
          ),
        );

      await tx.insert(hsAssociationsContactsProsTable).values({
        contactUuid,
        proUuid,
        associationTypeId: CONTACT_PRO_ASSOCIATIONS.MAIN_CONTACT.id,
        associationLabel: CONTACT_PRO_ASSOCIATIONS.MAIN_CONTACT.label,
      });

      return {
        proUuid,
        contactUuid,
        wasAlreadyMember,
      };
    });
  },
  async deleteForAdmin(
    input: Parameters<typeof ProAdminRepository.deleteForAdmin>[0],
  ) {
    // This call may return authDeletionErrors that must be surfaced to admins.
    return ProAdminRepository.deleteForAdmin(input);
  },
};
