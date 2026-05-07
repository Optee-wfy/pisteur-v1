import type { SQL, SQLWrapper } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const buildValuesInCondition = (
  column: SQLWrapper,
  nafCodes: string[],
): SQL<unknown> => {
  const uniqueCodes = Array.from(new Set(nafCodes));
  const [first, ...rest] = uniqueCodes;
  if (!first) {
    return sql<boolean>`false`;
  }
  if (rest.length === 0) {
    return sql<boolean>`${column} = ${first}`;
  }
  const valuesList = sql.join(
    uniqueCodes.map((code) => sql`(${code})`),
    sql.raw(", "),
  );
  return sql<boolean>`
    exists (
      select 1
      from (values ${valuesList}) as naf(code)
      where naf.code = ${column}
    )
  `;
};
