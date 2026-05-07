import type { ContactProAssociation } from "@optee/constants";
import type { ContactHsId, ContactUuid, ProHsId, ProUuid } from "@optee/models";
import { hsAssociationsContactsProsTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq } from "drizzle-orm";

export const ContactProRepository = {
  async create(
    contactUuid: ContactUuid,
    proUuid: ProUuid,
    associationType: ContactProAssociation,
  ) {
    await db.insert(hsAssociationsContactsProsTable).values({
      contactUuid,
      proUuid,
      associationTypeId: associationType.id,
      associationLabel: associationType.label,
    });
  },

  delete(
    data:
      | { contactHsId: ContactHsId; proHsId: ProHsId }
      | { contactUuid: ContactUuid; proUuid: ProUuid },
  ) {
    return db
      .delete(hsAssociationsContactsProsTable)
      .where(
        "contactHsId" in data
          ? and(
              eq(hsAssociationsContactsProsTable.contactId, data.contactHsId),
              eq(hsAssociationsContactsProsTable.proId, data.proHsId),
            )
          : and(
              eq(hsAssociationsContactsProsTable.contactUuid, data.contactUuid),
              eq(hsAssociationsContactsProsTable.proUuid, data.proUuid),
            ),
      )
      .returning();
  },
};
