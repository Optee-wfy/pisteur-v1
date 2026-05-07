import { getDurationRange } from "./index";

describe("getDurationRange", () => {
  it("should return -- if value is null", () => {
    expect(getDurationRange({ value: null, gap: 0.1 })).toBe("--");
  });
  it("should return a range with correct pluralization", () => {
    expect(getDurationRange({ value: 2, gap: 0.5 })).toBe("1.0 an < 3.0 ans");
  });
  it("should return a range with singular if only one year", () => {
    expect(getDurationRange({ value: 1, gap: 0 })).toBe("1.0 an < 1.0 an");
  });
  it("should throw on negative gap", () => {
    expect(() => getDurationRange({ value: 2, gap: -0.5 })).toThrow(
      "Gap must be a positive number",
    );
  });
  it("should handle negative value", () => {
    expect(getDurationRange({ value: -2, gap: 0.5 })).toBe(
      "-1.0 an < -3.0 ans",
    );
  });
  it("should handle value = 0 and gap > 0", () => {
    expect(getDurationRange({ value: 0, gap: 0.5 })).toBe("0.0 an < 0.0 an");
  });
});
