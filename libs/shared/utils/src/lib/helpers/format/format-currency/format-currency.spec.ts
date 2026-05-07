import { formatCurrency } from "./index";

describe("formatCurrency", () => {
  it("should format euros by default", () => {
    expect(formatCurrency(123)).toBe("123 €");
  });
  it("should format thousands as K", () => {
    expect(formatCurrency(5_000)).toBe("5K €");
  });
  it("should format millions as M", () => {
    expect(formatCurrency(2_000_000)).toBe("2M €");
  });
  it("should format billions as B", () => {
    expect(formatCurrency(3_000_000_000)).toBe("3B €");
  });
  it("should format trillions as T", () => {
    expect(formatCurrency(4_000_000_000_000)).toBe("4T €");
  });
  it("should support custom currency", () => {
    expect(formatCurrency(100, "$ ")).toBe("100 $ ");
  });
  it("should format negative values", () => {
    expect(formatCurrency(-100)).toBe("-100 €");
  });
  it("should floor decimal values", () => {
    expect(formatCurrency(123.99)).toBe("123 €");
  });
  it("should format zero", () => {
    expect(formatCurrency(0)).toBe("0 €");
  });
  it("should format very small values", () => {
    expect(formatCurrency(0.0001)).toBe("0 €");
  });
  it("should handle NaN as input", () => {
    expect(formatCurrency(NaN)).toBe("NaN €");
  });
  it("should handle Infinity as input", () => {
    expect(formatCurrency(Infinity)).toBe("NaN €"); // Math.floor(Infinity) === Infinity, but formatted string will be 'NaN €'
  });
});
