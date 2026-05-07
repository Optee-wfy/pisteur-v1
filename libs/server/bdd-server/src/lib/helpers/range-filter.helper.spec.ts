import { describe, expect, it } from "vitest";
import { date, integer, pgTable } from "drizzle-orm/pg-core";
import { buildRangeWhere } from "./range-filter.helper";

const rangeTestTable = pgTable("range_test", {
  createdAt: date("created_at"),
  amount: integer("amount"),
});

const buildQuery = (condition: ReturnType<typeof buildRangeWhere>) =>
  condition?.toQuery({
    escapeName: (name) => `"${name}"`,
    escapeParam: (num) => `$${num}`,
    escapeString: (value) => `'${value.replace(/'/g, "''")}'`,
  });

describe("buildRangeWhere", () => {
  it("returns undefined when no bounds are provided", () => {
    expect(
      buildRangeWhere({
        column: rangeTestTable.amount,
        min: null,
        max: undefined,
      }),
    ).toBeUndefined();
  });

  it("returns undefined when bounds are undefined", () => {
    expect(
      buildRangeWhere({
        column: rangeTestTable.amount,
        min: undefined,
        max: undefined,
      }),
    ).toBeUndefined();
  });

  it("builds an exact match for a single numeric bound", () => {
    const query = buildQuery(
      buildRangeWhere({
        column: rangeTestTable.amount,
        min: 42,
        max: undefined,
      }),
    );

    expect(query?.sql).toContain(`"range_test"."amount" = $1`);
    expect(query?.params).toEqual([42]);
  });

  it("builds an inclusive numeric range when both bounds are set", () => {
    const query = buildQuery(
      buildRangeWhere({
        column: rangeTestTable.amount,
        min: 10,
        max: 20,
      }),
    );

    expect(query?.sql).toContain(`"range_test"."amount" >= $1`);
    expect(query?.sql).toContain(`"range_test"."amount" <= $2`);
    expect(query?.params).toEqual([10, 20]);
  });

  it("expands a single date to the full year in UTC (leap year)", () => {
    const query = buildQuery(
      buildRangeWhere({
        column: rangeTestTable.createdAt,
        min: new Date("2020-02-29T12:00:00.000Z"),
        max: undefined,
      }),
    );

    const params = query?.params ?? [];
    const isoParams = params.map((param) =>
      param instanceof Date ? param.toISOString() : String(param),
    );

    expect(query?.sql).toContain(`"range_test"."created_at" >= $1`);
    expect(query?.sql).toContain(`"range_test"."created_at" <= $2`);
    expect(isoParams).toEqual([
      "2020-01-01T00:00:00.000Z",
      "2020-12-31T23:59:59.999Z",
    ]);
  });

  it("adjusts UTC year-end timestamps to the expected local year", () => {
    const query = buildQuery(
      buildRangeWhere({
        column: rangeTestTable.createdAt,
        min: new Date("2019-12-31T23:00:00.000Z"),
        max: undefined,
      }),
    );

    const params = query?.params ?? [];
    const isoParams = params.map((param) =>
      param instanceof Date ? param.toISOString() : String(param),
    );

    expect(isoParams).toEqual([
      "2020-01-01T00:00:00.000Z",
      "2020-12-31T23:59:59.999Z",
    ]);
  });

  it("expands date range bounds to full years when requested", () => {
    const query = buildQuery(
      buildRangeWhere({
        column: rangeTestTable.createdAt,
        min: new Date("2020-02-29T12:00:00.000Z"),
        max: new Date("2021-07-10T00:00:00.000Z"),
        expandDateRangeToYear: true,
      }),
    );

    const params = query?.params ?? [];
    const isoParams = params.map((param) =>
      param instanceof Date ? param.toISOString() : String(param),
    );

    expect(query?.sql).toContain(`"range_test"."created_at" >= $1`);
    expect(query?.sql).toContain(`"range_test"."created_at" <= $2`);
    expect(isoParams).toEqual([
      "2020-01-01T00:00:00.000Z",
      "2021-12-31T23:59:59.999Z",
    ]);
  });
});
