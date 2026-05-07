import type { SQL, SQLWrapper } from "drizzle-orm";
import { and, sql } from "drizzle-orm";

export const buildSqlRangeWhere = (
  expr: SQLWrapper,
  min: number | null,
  max: number | null,
): SQL<unknown> | undefined => {
  const parts = [
    min !== null ? sql`${expr} >= ${min}` : undefined,
    max !== null ? sql`${expr} <= ${max}` : undefined,
  ].filter((value): value is SQL => value !== undefined);

  return parts.length > 1 ? and(...parts) : parts[0];
};
