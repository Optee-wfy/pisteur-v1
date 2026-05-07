import {
  AssociationProExternalContactStatus,
  CONTACT_PRO_ASSOCIATIONS,
  OPTEE_EMAIL_DOMAINS,
  ProSubscription,
} from "@optee/constants";
import type {
  AdminProSortField,
  AdminProSubscriptionActivityFilter,
  ProStatus,
} from "@optee/constants";
import type { ProUuid, UserUuid } from "@optee/models";
import {
  hsAssociationsContactsProsTable,
  hsContactsTable,
  hsProsTable,
} from "@optee/models";
import { AuthProvider, db } from "@optee/supabase-server";
import { isEmailFromOptee } from "@optee/utils";
import {
  and,
  asc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  not,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

type AdminProSort = {
  sortBy: AdminProSortField;
  sortOrder: "asc" | "desc";
};

type AdminProFilters = {
  status?: ProStatus | null;
  statusInterne?: AssociationProExternalContactStatus | null;
  subscriptionActivity?: AdminProSubscriptionActivityFilter | null;
  hubspotSubscription?: boolean | null;
};

type GetAllProsForAdminInput = {
  term?: string | null;
  page: number;
  pageSize: number;
  filters?: AdminProFilters | null;
  sort?: AdminProSort | null;
};

export type AdminProRow = {
  uuid: ProUuid;
  name: string | null;
  testAccount: boolean;
  mainContactName: string | null;
  mainContactEmail: string | null;
  status: ProStatus | null;
  statusInterne: AssociationProExternalContactStatus;
  subscription: ProSubscription | null;
  remainingCredits: number;
  hasActiveSubscription: boolean;
  hasActiveStripeSubscription: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeCurrentPlanPriceId: string | null;
  stripeSubscriptionStatus: string | null;
  lastNonOpteeSignInAt: Date | null;
  nonOpteeContactsCount: number;
};

export type AdminStripeProRow = {
  uuid: ProUuid;
  name: string | null;
  subscription: string | null;
  status: ProStatus | null;
  testAccount: boolean;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
};

export type AdminStripeAttachedProRow = {
  uuid: ProUuid;
  name: string | null;
  subscription: string | null;
  status: ProStatus | null;
  testAccount: boolean;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  stripeCurrentPlanPriceId: string;
};

const DEFAULT_SORT: AdminProSort = {
  sortBy: "lastNonOpteeSignInAt",
  sortOrder: "desc",
};

const MAX_CREDITS_TO_ADD = 100_000;
// legacy unaccented value from historical data
const LEGACY_RESIGNED_VALUE = "Resilie";

const INACTIVE_SUBSCRIPTION_TEXT_VALUES = [
  ProSubscription.UNPAID,
  ProSubscription.RESIGNED,
  LEGACY_RESIGNED_VALUE,
];
const PRO_SUBSCRIPTION_TEXT_EXPR = sql<string>`${hsProsTable.subscription}::text`;
const INACTIVE_SUBSCRIPTION_TEXT_MATCH_EXPR = inArray(
  PRO_SUBSCRIPTION_TEXT_EXPR,
  INACTIVE_SUBSCRIPTION_TEXT_VALUES,
);
const ACTIVE_SUBSCRIPTION_TEXT_MATCH_EXPR = not(
  INACTIVE_SUBSCRIPTION_TEXT_MATCH_EXPR,
);
const NON_FREE_SUBSCRIPTION_TEXT_MATCH_EXPR = not(
  eq(PRO_SUBSCRIPTION_TEXT_EXPR, ProSubscription.FREE),
);
const HUBSPOT_ONLY_SUBSCRIPTION_MATCH_EXPR = and(
  isNotNull(hsProsTable.subscription),
  ACTIVE_SUBSCRIPTION_TEXT_MATCH_EXPR,
  NON_FREE_SUBSCRIPTION_TEXT_MATCH_EXPR,
  isNull(hsProsTable.stripeSubscriptionId),
) as SQL;

const NON_OPTEE_CONTACT_EMAIL_DOMAIN_EXCLUSIONS = OPTEE_EMAIL_DOMAINS.map(
  (domain) => not(ilike(hsContactsTable.email, `%@${domain}`)),
);

const NON_OPTEE_CONTACT_CONDITION = and(
  isNotNull(hsContactsTable.email),
  ...NON_OPTEE_CONTACT_EMAIL_DOMAIN_EXCLUSIONS,
);

const HAS_ACTIVE_SUBSCRIPTION_EXPR = sql<boolean>`
  case
    when ${hsProsTable.subscription} is not null
      and ${ACTIVE_SUBSCRIPTION_TEXT_MATCH_EXPR}
    then true
    else false
  end
`;

const HAS_ACTIVE_STRIPE_SUBSCRIPTION_EXPR = sql<boolean>`
  case
    when ${hsProsTable.stripeSubscriptionId} is not null
      and (
        ${hsProsTable.stripeSubscriptionStatus} = 'trialing'
        or ${hsProsTable.stripeSubscriptionStatus} = 'active'
      )
    then true
    else false
  end
`;

const LAST_NON_OPTEE_SIGN_IN_AT_EXPR = sql<Date | null>`
  max(
    case
      when ${NON_OPTEE_CONTACT_CONDITION}
      then ${hsContactsTable.lastSignInAt}
      else null
    end
  )
`;

const NON_OPTEE_CONTACTS_COUNT_EXPR = sql<number>`
  count(
    distinct case
      when ${NON_OPTEE_CONTACT_CONDITION}
      then ${hsContactsTable.uuid}
      else null
    end
  )
`;

const MAIN_CONTACT_ID = CONTACT_PRO_ASSOCIATIONS.MAIN_CONTACT.id;

const MAIN_CONTACT_NAME_EXPR = sql<string | null>`
  max(
    case
      when ${hsAssociationsContactsProsTable.associationTypeId} = ${MAIN_CONTACT_ID}
      then nullif(
        trim(
          concat(
            coalesce(${hsContactsTable.firstName}, ''),
            ' ',
            coalesce(${hsContactsTable.lastName}, '')
          )
        ),
        ''
      )
      else null
    end
  )
`;

const MAIN_CONTACT_EMAIL_EXPR = sql<string | null>`
  max(
    case
      when ${hsAssociationsContactsProsTable.associationTypeId} = ${MAIN_CONTACT_ID}
      then ${hsContactsTable.email}
      else null
    end
  )
`;

const dedupeUserUuids = (userUuids: Array<UserUuid | null>) => {
  const nonNullUserUuids = userUuids.filter(
    (userUuid): userUuid is UserUuid => userUuid !== null,
  );
  return Array.from(new Set(nonNullUserUuids));
};

const buildWhereCondition = ({
  term,
  filters,
}: {
  term?: string | null;
  filters?: AdminProFilters | null;
}) => {
  const whereConditions: SQL[] = [];
  const trimmedTerm = term?.trim();

  if (trimmedTerm) {
    const escapedTerm = trimmedTerm
      .replaceAll("\\", "\\\\")
      .replaceAll("%", "\\%")
      .replaceAll("_", "\\_");
    whereConditions.push(
      sql<boolean>`${hsProsTable.name} ILIKE ${`%${escapedTerm}%`} ESCAPE '\\'`,
    );
  }

  if (filters?.status) {
    whereConditions.push(eq(hsProsTable.status, filters.status));
  }

  if (filters?.statusInterne) {
    whereConditions.push(eq(hsProsTable.statusInterne, filters.statusInterne));
  }

  if (filters?.subscriptionActivity === "active") {
    whereConditions.push(
      and(
        isNotNull(hsProsTable.subscription),
        ACTIVE_SUBSCRIPTION_TEXT_MATCH_EXPR,
      ) as SQL,
    );
  }

  if (filters?.subscriptionActivity === "inactive") {
    whereConditions.push(
      or(
        isNull(hsProsTable.subscription),
        INACTIVE_SUBSCRIPTION_TEXT_MATCH_EXPR,
      ) as SQL,
    );
  }

  if (filters?.hubspotSubscription === true) {
    whereConditions.push(HUBSPOT_ONLY_SUBSCRIPTION_MATCH_EXPR);
  }

  if (filters?.hubspotSubscription === false) {
    whereConditions.push(not(HUBSPOT_ONLY_SUBSCRIPTION_MATCH_EXPR));
  }

  return whereConditions.length > 0 ? and(...whereConditions) : undefined;
};

const getSortOrderFragment = (sortOrder: "asc" | "desc"): SQL => {
  if (sortOrder === "asc") {
    return sql`ASC`;
  }

  return sql`DESC`;
};

const setTestAccountFlag = async (
  { proUuid }: { proUuid: ProUuid },
  value: boolean,
) => {
  const [existingPro] = await db
    .select({
      uuid: hsProsTable.uuid,
      testAccount: hsProsTable.testAccount,
    })
    .from(hsProsTable)
    .where(eq(hsProsTable.uuid, proUuid))
    .limit(1);

  if (!existingPro) {
    throw new Error("Aucun pro trouvé.");
  }

  if (Boolean(existingPro.testAccount) === value) {
    return {
      uuid: existingPro.uuid,
      testAccount: value,
    };
  }

  const [updatedPro] = await db
    .update(hsProsTable)
    .set({ testAccount: value })
    .where(eq(hsProsTable.uuid, proUuid))
    .returning({
      uuid: hsProsTable.uuid,
      testAccount: hsProsTable.testAccount,
    });

  if (!updatedPro) {
    throw new Error("Aucun pro trouvé.");
  }

  return {
    uuid: updatedPro.uuid,
    testAccount: Boolean(updatedPro.testAccount),
  };
};

const buildOrderBy = (sort: AdminProSort | null | undefined) => {
  const { sortBy, sortOrder } = sort ?? DEFAULT_SORT;
  const sortOrderFragment = getSortOrderFragment(sortOrder);

  switch (sortBy) {
    case "activeSubscription":
      return [
        sql`${HAS_ACTIVE_SUBSCRIPTION_EXPR} ${sortOrderFragment} NULLS LAST`,
        sql`${hsProsTable.name} ASC NULLS LAST`,
      ];
    case "remainingCredits":
      return [
        sql`${hsProsTable.remainingCredits} ${sortOrderFragment} NULLS LAST`,
        sql`${hsProsTable.name} ASC NULLS LAST`,
      ];
    case "lastNonOpteeSignInAt":
      return [
        sql`${LAST_NON_OPTEE_SIGN_IN_AT_EXPR} ${sortOrderFragment} NULLS LAST`,
        sql`${hsProsTable.name} ASC NULLS LAST`,
      ];
    default:
      return [
        sql`${LAST_NON_OPTEE_SIGN_IN_AT_EXPR} DESC NULLS LAST`,
        sql`${hsProsTable.name} ASC NULLS LAST`,
      ];
  }
};

export const ProAdminRepository = {
  async getByStripeCurrentPlanPriceForAdmin() {
    const rows = await db
      .select({
        uuid: hsProsTable.uuid,
        name: hsProsTable.name,
        subscription: hsProsTable.subscription,
        status: hsProsTable.status,
        testAccount: hsProsTable.testAccount,
        stripeSubscriptionId: hsProsTable.stripeSubscriptionId,
        stripeSubscriptionStatus: hsProsTable.stripeSubscriptionStatus,
        stripeCurrentPlanPriceId: hsProsTable.stripeCurrentPlanPriceId,
      })
      .from(hsProsTable)
      .where(isNotNull(hsProsTable.stripeCurrentPlanPriceId))
      .orderBy(asc(hsProsTable.name));

    return rows
      .filter(
        (
          row,
        ): row is typeof row & {
          stripeCurrentPlanPriceId: string;
        } => row.stripeCurrentPlanPriceId !== null,
      )
      .map((row) => ({
        uuid: row.uuid,
        name: row.name ?? null,
        subscription: row.subscription ?? null,
        status: row.status ?? null,
        testAccount: Boolean(row.testAccount),
        stripeSubscriptionId: row.stripeSubscriptionId ?? null,
        stripeSubscriptionStatus: row.stripeSubscriptionStatus ?? null,
        stripeCurrentPlanPriceId: row.stripeCurrentPlanPriceId,
      }));
  },

  async getBySubscriptionsForAdmin() {
    const rows = await db
      .select({
        uuid: hsProsTable.uuid,
        name: hsProsTable.name,
        subscription: hsProsTable.subscription,
        status: hsProsTable.status,
        testAccount: hsProsTable.testAccount,
        stripeSubscriptionId: hsProsTable.stripeSubscriptionId,
        stripeSubscriptionStatus: hsProsTable.stripeSubscriptionStatus,
      })
      .from(hsProsTable)
      .where(isNotNull(hsProsTable.subscription))
      .orderBy(asc(hsProsTable.subscription), asc(hsProsTable.name));

    return rows.map((row) => ({
      uuid: row.uuid,
      name: row.name ?? null,
      subscription: row.subscription ?? null,
      status: row.status ?? null,
      testAccount: Boolean(row.testAccount),
      stripeSubscriptionId: row.stripeSubscriptionId ?? null,
      stripeSubscriptionStatus: row.stripeSubscriptionStatus ?? null,
    }));
  },

  async getAllForAdmin({
    term,
    page,
    pageSize,
    filters,
    sort,
  }: GetAllProsForAdminInput) {
    const whereCondition = buildWhereCondition({ term, filters });

    // Invariant: whereCondition must only reference hsProsTable columns.
    // The list query joins contacts and groups by pro, while the count query reads only hsProsTable.
    // If a future filter needs joined-table columns (e.g. contact fields), either keep filters hsProsTable-only
    // or update count to mirror joins/grouping (or count from a subquery) so total stays correct.
    const [rows, [countRow]] = await Promise.all([
      db
        .select({
          uuid: hsProsTable.uuid,
          name: hsProsTable.name,
          testAccount: hsProsTable.testAccount,
          mainContactName: MAIN_CONTACT_NAME_EXPR,
          mainContactEmail: MAIN_CONTACT_EMAIL_EXPR,
          status: hsProsTable.status,
          statusInterne: hsProsTable.statusInterne,
          subscription: hsProsTable.subscription,
          remainingCredits: hsProsTable.remainingCredits,
          stripeCustomerId: hsProsTable.stripeCustomerId,
          stripeSubscriptionId: hsProsTable.stripeSubscriptionId,
          stripeCurrentPlanPriceId: hsProsTable.stripeCurrentPlanPriceId,
          stripeSubscriptionStatus: hsProsTable.stripeSubscriptionStatus,
          hasActiveSubscription: HAS_ACTIVE_SUBSCRIPTION_EXPR,
          hasActiveStripeSubscription: HAS_ACTIVE_STRIPE_SUBSCRIPTION_EXPR,
          lastNonOpteeSignInAt: LAST_NON_OPTEE_SIGN_IN_AT_EXPR,
          nonOpteeContactsCount: NON_OPTEE_CONTACTS_COUNT_EXPR,
        })
        .from(hsProsTable)
        .leftJoin(
          hsAssociationsContactsProsTable,
          eq(hsProsTable.uuid, hsAssociationsContactsProsTable.proUuid),
        )
        .leftJoin(
          hsContactsTable,
          eq(hsAssociationsContactsProsTable.contactUuid, hsContactsTable.uuid),
        )
        .where(whereCondition)
        .groupBy(
          hsProsTable.uuid,
          hsProsTable.name,
          hsProsTable.testAccount,
          hsProsTable.status,
          hsProsTable.statusInterne,
          hsProsTable.subscription,
          hsProsTable.remainingCredits,
          hsProsTable.stripeCustomerId,
          hsProsTable.stripeSubscriptionId,
          hsProsTable.stripeCurrentPlanPriceId,
          hsProsTable.stripeSubscriptionStatus,
        )
        .orderBy(...buildOrderBy(sort))
        .limit(pageSize)
        .offset(page * pageSize),

      db
        .select({
          total: sql<number>`count(*)`,
        })
        .from(hsProsTable)
        .where(whereCondition),
    ]);

    const items: AdminProRow[] = rows.map((row) => ({
      uuid: row.uuid,
      name: row.name ?? null,
      testAccount: Boolean(row.testAccount),
      mainContactName: row.mainContactName ?? null,
      mainContactEmail: row.mainContactEmail ?? null,
      status: row.status ?? null,
      statusInterne:
        row.statusInterne ?? AssociationProExternalContactStatus.NEW,
      subscription: row.subscription ?? null,
      remainingCredits: Number(row.remainingCredits ?? 0),
      hasActiveSubscription: Boolean(row.hasActiveSubscription),
      hasActiveStripeSubscription: Boolean(row.hasActiveStripeSubscription),
      stripeCustomerId: row.stripeCustomerId ?? null,
      stripeSubscriptionId: row.stripeSubscriptionId ?? null,
      stripeCurrentPlanPriceId: row.stripeCurrentPlanPriceId ?? null,
      stripeSubscriptionStatus: row.stripeSubscriptionStatus ?? null,
      lastNonOpteeSignInAt: row.lastNonOpteeSignInAt ?? null,
      nonOpteeContactsCount: Number(row.nonOpteeContactsCount ?? 0),
    }));

    return {
      items,
      total: Number(countRow?.total ?? 0),
      page,
      pageSize,
    };
  },

  async addCreditsToPro({
    proUuid,
    creditsToAdd,
  }: {
    proUuid: ProUuid;
    creditsToAdd: number;
  }) {
    if (!Number.isInteger(creditsToAdd) || creditsToAdd <= 0) {
      throw new Error(
        "Le nombre de crédits à ajouter doit être un entier positif.",
      );
    }

    if (creditsToAdd > MAX_CREDITS_TO_ADD) {
      throw new Error(
        `Le nombre de crédits à ajouter ne peut pas dépasser ${MAX_CREDITS_TO_ADD}.`,
      );
    }

    const [updatedPro] = await db
      .update(hsProsTable)
      .set({
        remainingCredits: sql<number>`coalesce(${hsProsTable.remainingCredits}, 0) + ${creditsToAdd}`,
      })
      .where(eq(hsProsTable.uuid, proUuid))
      .returning({
        uuid: hsProsTable.uuid,
        remainingCredits: hsProsTable.remainingCredits,
      });

    if (!updatedPro) {
      throw new Error("Aucun pro trouvé.");
    }

    return {
      uuid: updatedPro.uuid,
      remainingCredits: Number(updatedPro.remainingCredits ?? 0),
    };
  },

  async updateStatusForAdmin({
    proUuid,
    status,
  }: {
    proUuid: ProUuid;
    status: ProStatus;
  }) {
    const [updatedPro] = await db
      .update(hsProsTable)
      .set({ status })
      .where(eq(hsProsTable.uuid, proUuid))
      .returning({
        uuid: hsProsTable.uuid,
        status: hsProsTable.status,
      });

    if (!updatedPro) {
      throw new Error("Aucun pro trouvé.");
    }

    return {
      uuid: updatedPro.uuid,
      status: updatedPro.status ?? null,
    };
  },

  async updateInternalStatusForAdmin({
    proUuid,
    statusInterne,
  }: {
    proUuid: ProUuid;
    statusInterne: AssociationProExternalContactStatus;
  }) {
    const [updatedPro] = await db
      .update(hsProsTable)
      .set({ statusInterne })
      .where(eq(hsProsTable.uuid, proUuid))
      .returning({
        uuid: hsProsTable.uuid,
        statusInterne: hsProsTable.statusInterne,
      });

    if (!updatedPro) {
      throw new Error("Aucun pro trouvé.");
    }

    return {
      uuid: updatedPro.uuid,
      statusInterne:
        updatedPro.statusInterne ?? AssociationProExternalContactStatus.NEW,
    };
  },

  async updateStripeCustomerIdForAdmin({
    proUuid,
    stripeCustomerId,
    stripeSubscriptionId,
    stripeCurrentPlanPriceId,
  }: {
    proUuid: ProUuid;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripeCurrentPlanPriceId: string;
  }) {
    const normalizedCustomerId = stripeCustomerId.trim();
    const normalizedSubscriptionId = stripeSubscriptionId.trim();
    const normalizedPriceId = stripeCurrentPlanPriceId.trim();
    if (!normalizedCustomerId) {
      throw new Error("Le customer_id Stripe est requis.");
    }
    if (!normalizedSubscriptionId) {
      throw new Error("Le subscription_id Stripe est requis.");
    }
    if (!normalizedPriceId) {
      throw new Error("Le price_id Stripe est requis.");
    }

    const [updatedPro] = await db
      .update(hsProsTable)
      .set({
        stripeCustomerId: normalizedCustomerId,
        stripeSubscriptionId: normalizedSubscriptionId,
        stripeCurrentPlanPriceId: normalizedPriceId,
        stripeSubscriptionStatus: "active",
      })
      .where(eq(hsProsTable.uuid, proUuid))
      .returning({
        uuid: hsProsTable.uuid,
        stripeCustomerId: hsProsTable.stripeCustomerId,
        stripeSubscriptionId: hsProsTable.stripeSubscriptionId,
        stripeCurrentPlanPriceId: hsProsTable.stripeCurrentPlanPriceId,
        stripeSubscriptionStatus: hsProsTable.stripeSubscriptionStatus,
      });

    if (!updatedPro) {
      throw new Error("Aucun pro trouvé.");
    }

    return {
      uuid: updatedPro.uuid,
      stripeCustomerId: updatedPro.stripeCustomerId ?? null,
      stripeSubscriptionId: updatedPro.stripeSubscriptionId ?? null,
      stripeCurrentPlanPriceId: updatedPro.stripeCurrentPlanPriceId ?? null,
      stripeSubscriptionStatus: updatedPro.stripeSubscriptionStatus ?? null,
    };
  },

  async setAsTestAccount({ proUuid }: { proUuid: ProUuid }) {
    return setTestAccountFlag({ proUuid }, true);
  },

  async unsetAsTestAccount({ proUuid }: { proUuid: ProUuid }) {
    return setTestAccountFlag({ proUuid }, false);
  },

  async deleteForAdmin({ proUuid }: { proUuid: ProUuid }) {
    const [pro] = await db
      .select({
        uuid: hsProsTable.uuid,
        name: hsProsTable.name,
      })
      .from(hsProsTable)
      .where(eq(hsProsTable.uuid, proUuid))
      .limit(1);

    if (!pro) {
      throw new Error("Aucun pro trouvé.");
    }

    const members = await db
      .selectDistinctOn([hsContactsTable.uuid], {
        contactUuid: hsContactsTable.uuid,
        email: hsContactsTable.email,
        userUuid: hsContactsTable.userUuid,
      })
      .from(hsAssociationsContactsProsTable)
      .innerJoin(
        hsContactsTable,
        eq(hsAssociationsContactsProsTable.contactUuid, hsContactsTable.uuid),
      )
      .where(eq(hsAssociationsContactsProsTable.proUuid, proUuid));

    const nonOpteeMembers = members.filter(
      (member) => !!member.email && !isEmailFromOptee(member.email),
    );
    const opteeMembersCount = members.length - nonOpteeMembers.length;

    const nonOpteeContactUuids = nonOpteeMembers.flatMap((member) =>
      member.contactUuid ? [member.contactUuid] : [],
    );

    const [deletedProRow, deletedContacts] = await db.transaction(
      async (tx) => {
        const [deletedPro] = await tx
          .delete(hsProsTable)
          .where(eq(hsProsTable.uuid, proUuid))
          .returning({
            uuid: hsProsTable.uuid,
          });

        const deletedContacts = nonOpteeContactUuids.length
          ? await tx
              .delete(hsContactsTable)
              .where(
                and(
                  inArray(hsContactsTable.uuid, nonOpteeContactUuids),
                  sql<boolean>`not exists (
                    select 1
                    from ${hsAssociationsContactsProsTable}
                    where ${hsAssociationsContactsProsTable.contactUuid} = ${hsContactsTable.uuid}
                      and ${hsAssociationsContactsProsTable.proUuid} <> ${proUuid}
                  )`,
                ),
              )
              .returning({
                uuid: hsContactsTable.uuid,
                userUuid: hsContactsTable.userUuid,
              })
          : [];

        return [deletedPro ?? null, deletedContacts] as const;
      },
    );

    if (!deletedProRow) {
      throw new Error("Aucun pro trouvé.");
    }

    const deletedContactsCount = deletedContacts.length;
    const userUuidsToDelete = dedupeUserUuids(
      deletedContacts.map((contact) => contact.userUuid),
    );

    const authDeletionErrors: string[] = [];
    const authDeletionResults = await Promise.allSettled(
      userUuidsToDelete.map((userUuid) =>
        AuthProvider.deleteUser({ userUuid }),
      ),
    );

    const deletedAuthUsersCount = authDeletionResults.filter(
      (result) => result.status === "fulfilled",
    ).length;

    for (const [index, result] of authDeletionResults.entries()) {
      if (result.status === "fulfilled") {
        continue;
      }

      const userUuid = userUuidsToDelete[index];
      authDeletionErrors.push(
        `Utilisateur ${userUuid}: ${result.reason instanceof Error ? result.reason.message : "Erreur inconnue"}`,
      );
    }

    return {
      pro: {
        uuid: pro.uuid,
        name: pro.name ?? null,
      },
      deletedContactsCount,
      deletedAuthUsersCount,
      preservedOpteeMembersCount: opteeMembersCount,
      authDeletionErrors,
    };
  },
};
