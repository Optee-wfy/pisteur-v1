import type { LocationsBdnbLegalEntityProListInput } from "@optee/constants";
import type { ProUuid } from "@optee/models";
import { associationsProLegalEntityTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq, sql, type SQLWrapper } from "drizzle-orm";

/**
 * "show" filter (unlocked/new/all) expressed as a SQL EXISTS condition.
 */
export const buildShowFilter = ({
  show,
  proUuid,
  legalEntityUuidSql,
}: {
  show: LocationsBdnbLegalEntityProListInput["show"];
  proUuid: ProUuid;
  legalEntityUuidSql: SQLWrapper;
}) => {
  const proLegalEntityExists = sql<boolean>`EXISTS (
    ${db
      .select({ one: sql`1` })
      .from(associationsProLegalEntityTable)
      .where(
        and(
          eq(
            associationsProLegalEntityTable.legalEntityUuid,
            legalEntityUuidSql,
          ),
          eq(associationsProLegalEntityTable.proUuid, proUuid),
        ),
      )}
  )`;

  return show === "unlocked"
    ? proLegalEntityExists
    : show === "new"
      ? sql<boolean>`NOT ${proLegalEntityExists}`
      : sql<boolean>`true`;
};
