import { isNotNullish } from "./is-not-nullish.fn";

describe("isNotNullish", () => {
  it("should return true for non-nullish values", () => {
    expect(isNotNullish(1)).toBe(true);
    expect(isNotNullish("string")).toBe(true);
    expect(isNotNullish(true)).toBe(true);
    expect(isNotNullish({})).toBe(true);
    expect(isNotNullish([])).toBe(true);
  });

  it("should return false for nullish values", () => {
    expect(isNotNullish(null)).toBe(false);
    expect(isNotNullish(undefined)).toBe(false);
  });

  it("should return false for NaN", () => {
    expect(isNotNullish(NaN)).toBe(false);
  });

  it("should return true for zero", () => {
    expect(isNotNullish(0)).toBe(true);
  });

  it("should return true for empty string", () => {
    expect(isNotNullish("")).toBe(true);
  });

  it("should return true for false boolean", () => {
    expect(isNotNullish(false)).toBe(true);
  });
});
