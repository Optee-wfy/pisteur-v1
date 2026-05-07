import { and, eq, gte, lte } from "drizzle-orm";
import type { AnyColumn, GetColumnData } from "drizzle-orm/column";
import type { SQL, SQLWrapper } from "drizzle-orm/sql";

type ColumnData<TColumn extends AnyColumn> = GetColumnData<TColumn, "raw">;

type RangeValue<TColumn extends AnyColumn> =
  | ColumnData<TColumn>
  | (ColumnData<TColumn> extends string ? Date : never)
  | null
  | undefined;

const isDateValue = (value: RangeValue<AnyColumn>): value is Date =>
  value instanceof Date;

const buildYearBounds = (value: Date) => {
  const utcYear = value.getUTCFullYear();
  const isUtcYearEnd = value.getUTCMonth() === 11 && value.getUTCDate() === 31;
  const year = isUtcYearEnd ? utcYear + 1 : utcYear;
  const start = new Date(Date.UTC(year, 0, 1));
  const endExclusive = new Date(Date.UTC(year + 1, 0, 1));
  const endInclusive = new Date(endExclusive.getTime() - 1);

  return { start, end: endInclusive };
};

const normalizeRangeValue = <TColumn extends AnyColumn>(
  column: TColumn | undefined,
  value: RangeValue<TColumn>,
): ColumnData<TColumn> => {
  if (value instanceof Date && column?.dataType === "string") {
    return value.toISOString() as ColumnData<TColumn>;
  }

  return value as ColumnData<TColumn>;
};

/**
 * Build a Drizzle WHERE clause for a range filter.
 *
 * Behavior is asymmetric by design:
 * - Single date: expand to the full year (inclusive bounds).
 * - Single number: exact equality.
 * - Both bounds: inclusive range (>= min AND <= max), unless
 *   expandDateRangeToYear is true for Date values.
 */
export function buildRangeWhere<TColumn extends AnyColumn>(params: {
  column: TColumn;
  min: RangeValue<TColumn>;
  max: RangeValue<TColumn>;
  expandDateRangeToYear?: boolean;
}): SQL | undefined;
export function buildRangeWhere<TValue>(params: {
  expression: SQL<TValue>;
  min: TValue | null | undefined;
  max: TValue | null | undefined;
}): SQL | undefined;
export function buildRangeWhere<TColumn extends AnyColumn, TValue>({
  column,
  expression,
  min,
  max,
  expandDateRangeToYear = false,
}: {
  column?: TColumn;
  expression?: SQL<TValue>;
  min: RangeValue<TColumn> | TValue | null | undefined;
  max: RangeValue<TColumn> | TValue | null | undefined;
  expandDateRangeToYear?: boolean;
}): SQL | undefined {
  if (!column && !expression) {
    return undefined;
  }

  const target: SQLWrapper = (expression ?? column) as SQLWrapper;

  if (min == null && max == null) {
    return undefined;
  }

  if (min != null && max == null) {
    if (column && isDateValue(min)) {
      const { start, end } = buildYearBounds(min);
      return and(
        gte(target, normalizeRangeValue(column, start)),
        lte(target, normalizeRangeValue(column, end)),
      );
    }
    return eq(target, normalizeRangeValue(column, min));
  }

  if (min == null && max != null) {
    if (column && isDateValue(max)) {
      const { start, end } = buildYearBounds(max);
      return and(
        gte(target, normalizeRangeValue(column, start)),
        lte(target, normalizeRangeValue(column, end)),
      );
    }
    return eq(target, normalizeRangeValue(column, max));
  }

  const normalizedMin =
    expandDateRangeToYear && column && isDateValue(min)
      ? buildYearBounds(min).start
      : min;
  const normalizedMax =
    expandDateRangeToYear && column && isDateValue(max)
      ? buildYearBounds(max).end
      : max;

  return and(
    gte(target, normalizeRangeValue(column, normalizedMin)),
    lte(target, normalizeRangeValue(column, normalizedMax)),
  );
}
