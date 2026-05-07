import { getCurrencyRange } from "./index";

describe("getCurrencyRange", () => {
  it("should return -- if value is null", () => {
    expect(getCurrencyRange({ value: null, gap: 0.1 })).toBe("--");
  });
  it("should return a single value if bounds are equal", () => {
    expect(getCurrencyRange({ value: 100, gap: 0 })).toBe("100 €");
  });
  it("should return a range if bounds differ", () => {
    expect(getCurrencyRange({ value: 100, gap: 0.1 })).toBe("90 € < 110 €");
  });
  it("should handle negative gap", () => {
    expect(getCurrencyRange({ value: 100, gap: -0.1 })).toBe("90 € < 110 €");
  });
  it("should handle value = 0 and gap > 0", () => {
    expect(getCurrencyRange({ value: 0, gap: 0.5 })).toBe("0 €");
  });
  it("should handle negative value", () => {
    expect(getCurrencyRange({ value: -100, gap: 0.1 })).toBe("-110 € < -90 €");
  });
});
