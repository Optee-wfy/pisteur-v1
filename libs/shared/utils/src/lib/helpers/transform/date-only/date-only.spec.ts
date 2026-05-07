import { dateOnly } from "./date-only.fn";

describe("dateOnly", () => {
  it("should remove the time from a date object", () => {
    const date = new Date("2023-10-05T15:23:45Z");
    const result = dateOnly(date);
    expect(result.toISOString()).toBe("2023-10-05T00:00:00.000Z");
  });

  it("should handle dates at the start of the year", () => {
    const date = new Date("2023-01-01T12:00:00Z");
    const result = dateOnly(date);
    expect(result.toISOString()).toBe("2023-01-01T00:00:00.000Z");
  });

  it("should handle dates at the end of the year", () => {
    const date = new Date("2023-12-31T23:59:59Z");
    const result = dateOnly(date);
    expect(result.toISOString()).toBe("2023-12-31T00:00:00.000Z");
  });

  it("should handle leap year dates", () => {
    const date = new Date("2024-02-29T10:30:00Z");
    const result = dateOnly(date);
    expect(result.toISOString()).toBe("2024-02-29T00:00:00.000Z");
  });

  it("should handle dates before 1970", () => {
    const date = new Date("1969-07-20T20:18:00Z");
    const result = dateOnly(date);
    expect(result.toISOString()).toBe("1969-07-20T00:00:00.000Z");
  });
});
