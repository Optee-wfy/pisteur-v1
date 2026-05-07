import type { TokenHsId } from "@optee/models";
import { hsTokensTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { and, eq } from "drizzle-orm";

export const TokenRepository = {
  async get(id: TokenHsId) {
    const res = await db
      .select()
      .from(hsTokensTable)
      .where(eq(hsTokensTable.id, id));

    const row = res[0];

    return row ?? null;
  },

  async insert(id: TokenHsId, accessToken: string, expiresAtMs: number) {
    const res = await db
      .insert(hsTokensTable)
      .values({
        id,
        accessToken,
        expiresAt: new Date(expiresAtMs).toISOString(),
      })
      .returning();

    return res[0];
  },

  async updateSafely(
    id: TokenHsId,
    accessToken: string,
    expiresAtMs: number,
    expectedPrevExpiresAt: string,
  ) {
    const res = await db
      .update(hsTokensTable)
      .set({
        accessToken,
        expiresAt: new Date(expiresAtMs).toISOString(),
      })
      .where(
        and(
          eq(hsTokensTable.id, id),
          // We only want to update the row if the token has not been updated yet (from another Cloud function instance for example)
          eq(hsTokensTable.expiresAt, expectedPrevExpiresAt),
        ),
      )
      .returning();

    return res[0] ?? null;
  },
};
