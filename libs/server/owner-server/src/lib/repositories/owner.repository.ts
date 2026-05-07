import type { OwnerHsId } from "@optee/models";
import { hsOwnersTable } from "@optee/models";
import { db } from "@optee/supabase-server";
import { eq } from "drizzle-orm";

export const OwnerRepository = {
  async get(id: OwnerHsId) {
    const [owner] = await db
      .select()
      .from(hsOwnersTable)
      .where(eq(hsOwnersTable.id, id))
      .limit(1);

    return owner ?? null;
  },
};
