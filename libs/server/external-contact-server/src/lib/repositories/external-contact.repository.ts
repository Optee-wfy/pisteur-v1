import {
  AssociationProExternalContactStatus,
  AssociationProExternalContactType,
  type ExternalContactFilters,
  type ExternalContactListInput,
} from "@optee/constants";
import type {
  ContactUuid,
  ExternalContactUuid,
  LegalEntityUuid,
  NewExternalContact,
  ProUuid,
} from "@optee/models";
import {
  associationsLegalEntityExternalContactTable,
  associationsProExternalContactTable,
  externalContactTable,
  hsContactsTable,
  legalEntityTable,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { removeNullishProps } from "@optee/utils";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const buildLegalEntityJsonAgg = () =>
  sql<Array<{
    uuid: LegalEntityUuid;
    name: string | null;
    type: string | null;
  }> | null>`
    jsonb_agg(
      distinct jsonb_build_object(
        'uuid', ${legalEntityTable.uuid},
        'name', ${legalEntityTable.name},
        'type', ${legalEntityTable.type}
      )
    )
  `.as("legalEntities");

export const ExternalContactRepository = {
  async create(input: NewExternalContact, legalEntityUuid: LegalEntityUuid) {
    if (input.firstName && input.lastName) {
      const existingByEmail = input.email
        ? await db
            .select()
            .from(externalContactTable)
            .where(
              and(
                eq(externalContactTable.email, input.email),
                eq(externalContactTable.firstName, input.firstName),
                eq(externalContactTable.lastName, input.lastName),
              ),
            )
            .then((r) => r[0] ?? null)
        : null;
      // If the contact already exists, we want to update it instead of creating a duplicate
      if (existingByEmail) {
        // Only update fields that aren't null or undefined in the input
        return {
          contact: await ExternalContactRepository.update(
            existingByEmail.uuid,
            { ...removeNullishProps(input), updatedAt: new Date() },
          ),
          status: "exist-email" as const,
        };
      }

      const existingByCompany = await db
        .select({ contact: externalContactTable })
        .from(externalContactTable)
        .innerJoin(
          associationsLegalEntityExternalContactTable,
          and(
            eq(
              externalContactTable.uuid,
              associationsLegalEntityExternalContactTable.externalContactUuid,
            ),
            eq(
              associationsLegalEntityExternalContactTable.legalEntityUuid,
              legalEntityUuid,
            ),
          ),
        )
        .where(
          and(
            eq(externalContactTable.firstName, input.firstName),
            eq(externalContactTable.lastName, input.lastName),
          ),
        )
        .then((r) => r[0]?.contact ?? null);
      if (existingByCompany) {
        // Only update fields that aren't null or undefined in the input

        return {
          contact: await ExternalContactRepository.update(
            existingByCompany.uuid,
            { ...removeNullishProps(input), updatedAt: new Date() },
          ),
          status: "exist-company" as const,
        };
      }
    }

    // Create new contact
    const [data] = await db
      .insert(externalContactTable)
      .values(input)
      .returning();
    return { contact: data ?? null, status: "new" as const };
  },

  async update(
    uuid: ExternalContactUuid,
    updates: Partial<NewExternalContact>,
  ) {
    const [data] = await db
      .update(externalContactTable)
      .set(updates)
      .where(eq(externalContactTable.uuid, uuid))
      .returning();
    return data ?? null;
  },

  async associateWithLegalEntity(
    legalEntityUuid: LegalEntityUuid,
    externalContactUuid: ExternalContactUuid,
  ) {
    const existing =
      await ExternalContactRepository.getAssociationWithLegalEntity({
        legalEntityUuid,
        externalContactUuid,
      });
    if (existing) {
      return existing?.uuid ?? null;
    }
    const [created] = await db
      .insert(associationsLegalEntityExternalContactTable)
      .values({
        legalEntityUuid,
        externalContactUuid,
      })
      .returning();
    return created?.uuid ?? null;
  },

  async associateWithPro(
    proUuid: ProUuid,
    externalContactUuid: ExternalContactUuid,
    type: AssociationProExternalContactType,
    contactUuid?: ContactUuid,
  ) {
    // We may already have an association for this pro/contact with a different type.
    // Merge existing + requested type into one final type to keep a single row.
    const mergeAssociationTypes = (
      types: AssociationProExternalContactType[],
    ) => {
      let hasMail = false;
      let hasPhone = false;
      for (const associationType of types) {
        if (
          associationType === AssociationProExternalContactType.MAIL ||
          associationType === AssociationProExternalContactType.BOTH
        ) {
          hasMail = true;
        }
        if (
          associationType === AssociationProExternalContactType.PHONE ||
          associationType === AssociationProExternalContactType.BOTH
        ) {
          hasPhone = true;
        }
      }
      if (hasMail && hasPhone) {
        return AssociationProExternalContactType.BOTH;
      }
      if (hasMail) {
        return AssociationProExternalContactType.MAIL;
      }
      if (hasPhone) {
        return AssociationProExternalContactType.PHONE;
      }
      return type;
    };

    const existing = await ExternalContactRepository.getAssociationWithPro({
      proUuid,
      externalContactUuid,
    });

    // Combine existing type and the requested type (if not NONE) into one canonical value.
    const mergedType = mergeAssociationTypes([
      ...(existing ? [existing.associationType] : []),
      ...(type === AssociationProExternalContactType.NONE ? [] : [type]),
    ]);

    if (existing) {
      if (existing.associationType === mergedType) {
        return existing.uuid;
      }
      // Update the single existing row to the merged type.
      const [updated] = await db
        .update(associationsProExternalContactTable)
        .set(
          removeNullishProps({
            associationType: mergedType,
            updatedAt: new Date(),
            addedByContactUuid: contactUuid,
          }),
        )
        .where(eq(associationsProExternalContactTable.uuid, existing.uuid))
        .returning();
      return updated?.uuid ?? null;
    }

    try {
      // Create a single row; a unique constraint should prevent duplicates.
      return await db
        .insert(associationsProExternalContactTable)
        .values(
          removeNullishProps({
            proUuid,
            externalContactUuid,
            associationType: mergedType,
            createdAt: new Date(),
            addedByContactUuid: contactUuid,
          }),
        )
        .returning()
        .then((r) => r[0]?.uuid ?? null);
    } catch (error) {
      // Check if this is a unique constraint violation
      const isUniqueViolation =
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"; // PostgreSQL unique_violation code

      if (!isUniqueViolation) {
        throw error;
      }
      // If another request created the row first, read it back and merge types.
      const existingAfter =
        await ExternalContactRepository.getAssociationWithPro({
          proUuid,
          externalContactUuid,
        });
      if (!existingAfter) {
        throw error;
      }
      const mergedAfterType = mergeAssociationTypes([
        existingAfter.associationType,
        ...(type === AssociationProExternalContactType.NONE ? [] : [type]),
      ]);
      if (existingAfter.associationType === mergedAfterType) {
        return existingAfter.uuid;
      }
      const [updated] = await db
        .update(associationsProExternalContactTable)
        .set(
          removeNullishProps({
            associationType: mergedAfterType,
            updatedAt: new Date(),
            addedByContactUuid: contactUuid,
          }),
        )
        .where(eq(associationsProExternalContactTable.uuid, existingAfter.uuid))
        .returning();
      return updated?.uuid ?? null;
    }
  },

  async disassociateFromPro(
    proUuid: ProUuid,
    externalContactUuid: ExternalContactUuid,
  ) {
    await db
      .delete(associationsProExternalContactTable)
      .where(
        and(
          eq(associationsProExternalContactTable.proUuid, proUuid),
          eq(
            associationsProExternalContactTable.externalContactUuid,
            externalContactUuid,
          ),
        ),
      );
  },

  async get(uuid: ExternalContactUuid) {
    return db
      .select()
      .from(externalContactTable)
      .where(eq(externalContactTable.uuid, uuid))
      .then((rows) => rows[0] || null);
  },

  async getByUuids(externalContactUuids: ExternalContactUuid[]) {
    if (!externalContactUuids.length) {
      return [];
    }

    return db
      .select()
      .from(externalContactTable)
      .where(inArray(externalContactTable.uuid, externalContactUuids));
  },

  async getAllByLegalEntity(legalEntityUuid: LegalEntityUuid) {
    const rows = await db
      .select({ contact: externalContactTable })
      .from(externalContactTable)
      .innerJoin(
        associationsLegalEntityExternalContactTable,
        eq(
          externalContactTable.uuid,
          associationsLegalEntityExternalContactTable.externalContactUuid,
        ),
      )
      .where(
        eq(
          associationsLegalEntityExternalContactTable.legalEntityUuid,
          legalEntityUuid,
        ),
      );

    return rows.map((r) => r.contact);
  },

  async getAllByUuidForPro({
    proUuid,
    externalContactUuids,
  }: {
    proUuid: ProUuid;
    externalContactUuids: ExternalContactUuid[];
  }) {
    if (!externalContactUuids.length) {
      return [];
    }

    const filtered = db.$with("filtered").as(
      db
        .select({
          contactUuid: associationsProExternalContactTable.externalContactUuid,
          contactStatus: associationsProExternalContactTable.status,
          associationUuid: associationsProExternalContactTable.uuid,
          associationType: associationsProExternalContactTable.associationType,
          legalEntityUuid:
            associationsLegalEntityExternalContactTable.legalEntityUuid,
        })
        .from(associationsProExternalContactTable)
        .where(
          and(
            eq(associationsProExternalContactTable.proUuid, proUuid),
            inArray(
              associationsProExternalContactTable.externalContactUuid,
              externalContactUuids,
            ),
          ),
        )
        .innerJoin(
          associationsLegalEntityExternalContactTable,
          eq(
            associationsProExternalContactTable.externalContactUuid,
            associationsLegalEntityExternalContactTable.externalContactUuid,
          ),
        ),
    );

    const grouped = db.$with("grouped").as(
      db
        .select({
          contactUuid: filtered.contactUuid,
          associationType: filtered.associationType,
          legalEntities: buildLegalEntityJsonAgg(),
        })
        .from(filtered)
        .innerJoin(
          legalEntityTable,
          eq(filtered.legalEntityUuid, legalEntityTable.uuid),
        )
        .groupBy(filtered.contactUuid, filtered.associationType),
    );

    return db
      .with(filtered, grouped)
      .select({
        contact: { ...externalContactTable, status: filtered.contactStatus },
        legalEntities: grouped.legalEntities,
        associationUuid: filtered.associationUuid,
        associationType: grouped.associationType,
      })
      .from(grouped)
      .innerJoin(
        externalContactTable,
        eq(grouped.contactUuid, externalContactTable.uuid),
      )
      .innerJoin(
        filtered,
        and(
          eq(grouped.contactUuid, filtered.contactUuid),
          eq(grouped.associationType, filtered.associationType),
        ),
      );
  },

  async getOwnersForPro(proUuid: ProUuid) {
    const ownerContact = alias(hsContactsTable, "owner_contact");

    const rows = await db
      .selectDistinctOn([ownerContact.uuid], {
        uuid: ownerContact.uuid,
        firstName: ownerContact.firstName,
        lastName: ownerContact.lastName,
      })
      .from(associationsProExternalContactTable)
      .innerJoin(
        ownerContact,
        eq(
          associationsProExternalContactTable.addedByContactUuid,
          ownerContact.uuid,
        ),
      )
      .where(eq(associationsProExternalContactTable.proUuid, proUuid));
    return rows;
  },

  async getLegalEntitiesForPro(proUuid: ProUuid) {
    const rows = await db
      .selectDistinct({
        uuid: legalEntityTable.uuid,
        name: legalEntityTable.name,
      })
      .from(associationsProExternalContactTable)
      .innerJoin(
        associationsLegalEntityExternalContactTable,
        eq(
          associationsProExternalContactTable.externalContactUuid,
          associationsLegalEntityExternalContactTable.externalContactUuid,
        ),
      )
      .innerJoin(
        legalEntityTable,
        eq(
          associationsLegalEntityExternalContactTable.legalEntityUuid,
          legalEntityTable.uuid,
        ),
      )
      .where(eq(associationsProExternalContactTable.proUuid, proUuid))
      .orderBy(legalEntityTable.name);

    return rows;
  },

  buildFilteredExternalContactsCte({
    filters,
    proUuid,
    ignoreStatus = false,
  }: {
    filters: ExternalContactListInput;
    proUuid: ProUuid;
    ignoreStatus?: boolean;
  }) {
    const baseFilters = filters;
    const filtersWithoutStatus: ExternalContactListInput = {
      ...filters,
      status: null,
    };

    const effectiveFilters = ignoreStatus ? filtersWithoutStatus : baseFilters;

    const filtersConditions = ExternalContactRepository.buildFiltersSQL({
      filters: effectiveFilters,
    });

    const associationProCondition = [
      eq(associationsProExternalContactTable.proUuid, proUuid),
      // Exclude "SEARCHED" associations from the paginated listing.
      sql<boolean>`
        ${associationsProExternalContactTable.associationType} <> ${AssociationProExternalContactType.SEARCHED}
      `,
    ];

    const associationLegalEntityCondition = [];

    if (effectiveFilters.legalEntityUuids?.length) {
      associationLegalEntityCondition.push(
        inArray(
          associationsLegalEntityExternalContactTable.legalEntityUuid,
          effectiveFilters.legalEntityUuids,
        ),
      );
    }

    if (!ignoreStatus && baseFilters.status?.length) {
      if (baseFilters.status.length === 1) {
        associationProCondition.push(
          eq(
            associationsProExternalContactTable.status,
            baseFilters.status[0] as AssociationProExternalContactStatus,
          ),
        );
      } else if (baseFilters.status.length > 1) {
        associationProCondition.push(
          inArray(
            associationsProExternalContactTable.status,
            baseFilters.status as AssociationProExternalContactStatus[],
          ),
        );
      }
    }

    if (effectiveFilters.associationProExternalContacts?.length) {
      associationProCondition.push(
        inArray(
          associationsProExternalContactTable.associationType,
          effectiveFilters.associationProExternalContacts,
        ),
      );
    }
    if (effectiveFilters.ownerUuid?.length) {
      associationProCondition.push(
        inArray(
          associationsProExternalContactTable.addedByContactUuid,
          effectiveFilters.ownerUuid,
        ),
      );
    }

    return db.$with("filtered").as(
      db
        .selectDistinctOn(
          [associationsProExternalContactTable.externalContactUuid],
          {
            contactUuid:
              associationsProExternalContactTable.externalContactUuid,
            contactStatus: associationsProExternalContactTable.status,
            associationUuid: associationsProExternalContactTable.uuid,
            associationType:
              associationsProExternalContactTable.associationType,
            legalEntityUuid:
              associationsLegalEntityExternalContactTable.legalEntityUuid,
            addedByContactUuid:
              associationsProExternalContactTable.addedByContactUuid,
          },
        )
        .from(associationsProExternalContactTable)
        .where(and(...associationProCondition))
        .innerJoin(
          associationsLegalEntityExternalContactTable,
          and(
            eq(
              associationsProExternalContactTable.externalContactUuid,
              associationsLegalEntityExternalContactTable.externalContactUuid,
            ),
            ...associationLegalEntityCondition,
          ),
        )
        .innerJoin(
          externalContactTable,
          and(
            eq(
              associationsProExternalContactTable.externalContactUuid,
              externalContactTable.uuid,
            ),
            ...filtersConditions,
          ),
        ),
    );
  },

  async countByStatusForPro({
    filters,
    proUuid,
  }: {
    filters: ExternalContactListInput;
    proUuid: ProUuid;
  }) {
    const filtered = ExternalContactRepository.buildFilteredExternalContactsCte(
      {
        filters,
        proUuid,
        ignoreStatus: true,
      },
    );

    const rows = await db
      .with(filtered)
      .select({
        status: filtered.contactStatus,
        total: sql<number>`count(distinct ${filtered.contactUuid})`,
      })
      .from(filtered)
      .groupBy(filtered.contactStatus);

    const result: Record<AssociationProExternalContactStatus, number> = {
      [AssociationProExternalContactStatus.NEW]: 0,
      [AssociationProExternalContactStatus.IN_PROGRESS]: 0,
      [AssociationProExternalContactStatus.CLOSED_WON]: 0,
      [AssociationProExternalContactStatus.CLOSED_LOST]: 0,
      [AssociationProExternalContactStatus.ARCHIVED]: 0,
    };

    for (const row of rows) {
      if (row.status) {
        result[row.status] = Number(row.total ?? 0);
      }
    }

    return result;
  },

  async getAllForProPaginated({
    filters,
    proUuid,
  }: {
    filters: ExternalContactListInput;
    proUuid: ProUuid;
  }) {
    const filtered = ExternalContactRepository.buildFilteredExternalContactsCte(
      {
        filters,
        proUuid,
        ignoreStatus: false,
      },
    );

    const grouped = db.$with("grouped").as(
      db
        .select({
          contactUuid: filtered.contactUuid,
          associationType: filtered.associationType,
          legalEntities: buildLegalEntityJsonAgg(),
        })
        .from(filtered)
        .innerJoin(
          legalEntityTable,
          eq(filtered.legalEntityUuid, legalEntityTable.uuid),
        )
        .groupBy(filtered.contactUuid, filtered.associationType),
    );

    const [counter] = await db
      .with(filtered)
      .select({
        total: sql<number>`count(distinct ${filtered.contactUuid})`,
      })
      .from(filtered);

    const ownerContact = alias(hsContactsTable, "owner_contact");

    const rows = await db
      .with(filtered, grouped)
      .select({
        contact: { ...externalContactTable, status: filtered.contactStatus },
        legalEntities: grouped.legalEntities,
        associationUuid: filtered.associationUuid,
        associationType: grouped.associationType,
        owner: {
          uuid: ownerContact.uuid,
          firstName: ownerContact.firstName,
          lastName: ownerContact.lastName,
        },
      })
      .from(grouped)
      .innerJoin(
        externalContactTable,
        eq(grouped.contactUuid, externalContactTable.uuid),
      )
      .innerJoin(filtered, eq(grouped.contactUuid, filtered.contactUuid))
      .leftJoin(
        ownerContact,
        eq(filtered.addedByContactUuid, ownerContact.uuid),
      )
      .orderBy(
        filtered.contactStatus,
        externalContactTable.lastName,
        externalContactTable.firstName,
        externalContactTable.uuid,
      )
      .limit(filters.pageSize)
      .offset(filters.page * filters.pageSize);

    return {
      items: rows,
      total: counter?.total ?? 0,
    };
  },

  async getLegalEntitiesByExternalContactUuids(
    externalContactUuids: ExternalContactUuid[],
  ) {
    if (!externalContactUuids.length) {
      return [];
    }

    const rows = await db
      .select({
        externalContactUuid:
          associationsLegalEntityExternalContactTable.externalContactUuid,
        legalEntities: buildLegalEntityJsonAgg(),
      })
      .from(associationsLegalEntityExternalContactTable)
      .innerJoin(
        legalEntityTable,
        eq(
          associationsLegalEntityExternalContactTable.legalEntityUuid,
          legalEntityTable.uuid,
        ),
      )
      .where(
        inArray(
          associationsLegalEntityExternalContactTable.externalContactUuid,
          externalContactUuids,
        ),
      )
      .groupBy(associationsLegalEntityExternalContactTable.externalContactUuid);

    return rows.map((row) => ({
      externalContactUuid: row.externalContactUuid,
      legalEntities: row.legalEntities ?? [],
    }));
  },

  getAllAssociationsByLegalEntityUuid(legalEntityUuid: LegalEntityUuid) {
    return db
      .select()
      .from(associationsLegalEntityExternalContactTable)
      .where(
        eq(
          associationsLegalEntityExternalContactTable.legalEntityUuid,
          legalEntityUuid,
        ),
      );
  },

  async getAssociationWithLegalEntity({
    legalEntityUuid,
    externalContactUuid,
  }: {
    legalEntityUuid: LegalEntityUuid;
    externalContactUuid: ExternalContactUuid;
  }) {
    return db
      .select()
      .from(associationsLegalEntityExternalContactTable)
      .where(
        and(
          eq(
            associationsLegalEntityExternalContactTable.legalEntityUuid,
            legalEntityUuid,
          ),
          eq(
            associationsLegalEntityExternalContactTable.externalContactUuid,
            externalContactUuid,
          ),
        ),
      )
      .then((r) => r[0] ?? null);
  },

  getAssociationWithPro({
    proUuid,
    externalContactUuid,
  }: {
    proUuid: ProUuid;
    externalContactUuid: ExternalContactUuid;
  }) {
    return db
      .select({
        contactUuid: associationsProExternalContactTable.externalContactUuid,
        uuid: associationsProExternalContactTable.uuid,
        associationType: associationsProExternalContactTable.associationType,
        status: associationsProExternalContactTable.status,
      })
      .from(associationsProExternalContactTable)
      .where(
        and(
          eq(associationsProExternalContactTable.proUuid, proUuid),
          eq(
            associationsProExternalContactTable.externalContactUuid,
            externalContactUuid,
          ),
        ),
      )
      .then((r) => r[0] ?? null);
  },

  getAssociationsWithPro({
    proUuid,
    externalContactUuids,
  }: {
    proUuid: ProUuid;
    externalContactUuids: ExternalContactUuid[];
  }) {
    if (!externalContactUuids.length) {
      return Promise.resolve([]);
    }
    return db
      .select({
        contactUuid: associationsProExternalContactTable.externalContactUuid,
        uuid: associationsProExternalContactTable.uuid,
        associationType: associationsProExternalContactTable.associationType,
        status: associationsProExternalContactTable.status,
      })
      .from(associationsProExternalContactTable)
      .where(
        and(
          eq(associationsProExternalContactTable.proUuid, proUuid),
          inArray(
            associationsProExternalContactTable.externalContactUuid,
            externalContactUuids,
          ),
        ),
      );
  },

  buildFiltersSQL({ filters }: { filters: ExternalContactFilters }) {
    const filtersConditions = [];

    const termRaw = filters.search?.trim();
    if (termRaw && termRaw.length >= 2) {
      const esc = termRaw.replace(/([\\%_])/g, "\\$1");
      const like = `%${esc.replace(/\s+/g, "%")}%`;
      filtersConditions.push(sql<boolean>`
        (
          ${externalContactTable.firstName} ILIKE ${like}
          OR ${externalContactTable.lastName} ILIKE ${like}
          OR ${externalContactTable.email} ILIKE ${like}
          OR ${externalContactTable.role} ILIKE ${like}
        )
      `);
    }

    const associationAvailabilityFilter =
      ExternalContactRepository.buildAssociationAvailabilityFilter(
        filters.associationProExternalContacts ?? [],
      );
    if (associationAvailabilityFilter) {
      filtersConditions.push(associationAvailabilityFilter);
    }

    return filtersConditions;
  },

  buildAssociationAvailabilityFilter(
    associationTypes: AssociationProExternalContactType[],
  ) {
    if (!associationTypes.length) {
      return null;
    }

    // Only enriched types require availability checks.
    // SEARCHED should return all matching association rows without extra data constraints.
    const filteredTypes = Array.from(new Set(associationTypes)).filter(
      (type) =>
        type !== AssociationProExternalContactType.NONE &&
        type !== AssociationProExternalContactType.SEARCHED,
    );

    if (!filteredTypes.length) {
      return null;
    }

    const hasEmail = sql<boolean>`
      nullif(trim(${externalContactTable.email}), '') is not null
    `;
    const hasPhone = sql<boolean>`
      nullif(trim(${externalContactTable.phone}), '') is not null
    `;

    const conditionByType: Partial<
      Record<AssociationProExternalContactType, ReturnType<typeof sql>>
    > = {
      [AssociationProExternalContactType.MAIL]: hasEmail,
      [AssociationProExternalContactType.PHONE]: hasPhone,
      [AssociationProExternalContactType.BOTH]: sql`${hasEmail} AND ${hasPhone}`,
    };

    let combined: ReturnType<typeof sql> | null = null;
    for (const type of filteredTypes) {
      const condition = conditionByType[type];
      if (!condition) {
        continue;
      }
      combined = combined ? sql`${combined} OR ${condition}` : condition;
    }

    return combined;
  },

  async countByLegalEntity(legalEntityUuid: LegalEntityUuid) {
    return db
      .select({ total: count() })
      .from(associationsLegalEntityExternalContactTable)
      .where(
        eq(
          associationsLegalEntityExternalContactTable.legalEntityUuid,
          legalEntityUuid,
        ),
      )
      .then((r) => r[0]?.total ?? 0);
  },

  updateAssociationStatus: async ({
    proUuid,
    associationUuid,
    status,
  }: {
    proUuid: ProUuid;
    associationUuid: string;
    status: AssociationProExternalContactStatus;
  }) => {
    const result = await db
      .update(associationsProExternalContactTable)
      .set({ status })
      .where(
        and(
          eq(associationsProExternalContactTable.uuid, associationUuid),
          eq(associationsProExternalContactTable.proUuid, proUuid),
        ),
      )
      .returning({ uuid: associationsProExternalContactTable.uuid });

    return { updated: result.length > 0 };
  },
};
