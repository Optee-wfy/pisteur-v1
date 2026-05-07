import type { ProClientAssociation } from "@optee/constants";
import {
  hsAssociationProsClientsTable,
  type ClientHsId,
  type ClientUuid,
  type ProHsId,
  type ProUuid,
} from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq } from "drizzle-orm";

export const ProClientRepository = {
  async create({
    clientUuid,
    proUuid,
    associationType,
  }: {
    clientUuid: ClientUuid;
    proUuid: ProUuid;
    associationType: ProClientAssociation;
  }) {
    await db.insert(hsAssociationProsClientsTable).values({
      clientUuid,
      proUuid,
      associationTypeId: associationType.id,
      associationLabel: associationType.label,
    });
  },

  // @todo not used ?
  // getClientsByPro(proUuid: ProUuid) {
  //   return db
  //     .selectDistinct({ clientUuid: hsAssociationProsClientsTable.clientUuid })
  //     .from(hsAssociationProsClientsTable)
  //     .innerJoin(
  //       hsClientsTable,
  //       eq(hsAssociationProsClientsTable.clientUuid, hsClientsTable.uuid),
  //     )
  //     .where(eq(hsAssociationProsClientsTable.proUuid, proUuid))
  //     .orderBy(hsAssociationProsClientsTable.clientUuid);
  // },

  delete(
    data:
      | { clientHsId: ClientHsId; proHsId: ProHsId }
      | { clientUuid: ClientUuid; proUuid: ProUuid },
  ) {
    return db
      .delete(hsAssociationProsClientsTable)
      .where(
        "clientHsId" in data
          ? and(
              eq(hsAssociationProsClientsTable.clientId, data.clientHsId),
              eq(hsAssociationProsClientsTable.proId, data.proHsId),
            )
          : and(
              eq(hsAssociationProsClientsTable.clientUuid, data.clientUuid),
              eq(hsAssociationProsClientsTable.proUuid, data.proUuid),
            ),
      )
      .returning();
  },
};
