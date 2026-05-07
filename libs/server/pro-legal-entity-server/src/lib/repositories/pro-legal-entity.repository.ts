import type {
  ProLegalEntityAssociation,
  ProLegalEntityAssociationId,
  ProLocationAssociation,
} from "@optee/constants";
import type { LegalEntityUuid } from "@optee/models";
import { associationsProLegalEntityTable, type ProUuid } from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq, inArray, ne } from "drizzle-orm";

export const ProLegalEntityRepository = {
  async create(
    proUuid: ProUuid,
    legalEntityUuid: LegalEntityUuid,
    associationType: ProLegalEntityAssociation,
  ) {
    const [created] = await db
      .insert(associationsProLegalEntityTable)
      .values({
        proUuid,
        legalEntityUuid,
        associationTypeId: associationType.id,
        associationLabel: associationType.label,
      })
      .returning();
    return created?.uuid ?? null;
  },

  get({
    legalEntityUuid,
    proUuid,
    associationTypeId,
    excludeAssociationTypeId,
  }: {
    legalEntityUuid: LegalEntityUuid | LegalEntityUuid[];
    proUuid: ProUuid;
    associationTypeId?: ProLegalEntityAssociationId;
    excludeAssociationTypeId?: ProLegalEntityAssociationId;
  }) {
    const conditions = [
      Array.isArray(legalEntityUuid)
        ? inArray(
            associationsProLegalEntityTable.legalEntityUuid,
            legalEntityUuid,
          )
        : eq(associationsProLegalEntityTable.legalEntityUuid, legalEntityUuid),
      eq(associationsProLegalEntityTable.proUuid, proUuid),
    ];

    if (associationTypeId !== undefined) {
      conditions.push(
        eq(
          associationsProLegalEntityTable.associationTypeId,
          associationTypeId,
        ),
      );
    }

    if (excludeAssociationTypeId !== undefined) {
      conditions.push(
        ne(
          associationsProLegalEntityTable.associationTypeId,
          excludeAssociationTypeId,
        ),
      );
    }

    return db
      .select()
      .from(associationsProLegalEntityTable)
      .where(and(...conditions));
  },

  async update(
    association: { legalEntityUuid: LegalEntityUuid; proUuid: ProUuid },
    associationType: ProLegalEntityAssociation,
  ) {
    await db.transaction(async (tx) => {
      await tx
        .delete(associationsProLegalEntityTable)
        .where(
          and(
            eq(
              associationsProLegalEntityTable.legalEntityUuid,
              association.legalEntityUuid,
            ),
            eq(associationsProLegalEntityTable.proUuid, association.proUuid),
          ),
        );
      await tx.insert(associationsProLegalEntityTable).values({
        legalEntityUuid: association.legalEntityUuid,
        proUuid: association.proUuid,
        associationTypeId: associationType.id,
        associationLabel: associationType.label,
      });
    });
  },
};
