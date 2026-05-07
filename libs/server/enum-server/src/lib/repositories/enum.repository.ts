import type { AppEnum } from "@optee/constants";
import { db } from "@optee/supabase-server";
import { sql } from "drizzle-orm";

const enumCache = new Map<AppEnum, { values: string[]; ts: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 min

export const EnumRepository = {
  async getAllByName(enumName: AppEnum) {
    const cached = enumCache.get(enumName);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return cached.values;
    }

    const statement = sql`
      SELECT unnest(enum_range(NULL::"${sql.raw(enumName)}"))::text AS value;
    `;
    const rows = await db.execute(statement);
    const values = rows.map((r) => r["value"] as string);

    const cacheEntry = { values, ts: Date.now() };
    enumCache.set(enumName, cacheEntry);

    return values;
  },
};
