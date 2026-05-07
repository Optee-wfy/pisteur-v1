import { getDaysDiff } from "./index";

describe("getDaysDiff", () => {
  it("should return 0 for same date", () => {
    const d = new Date();
    expect(getDaysDiff(d, d)).toBe(0);
  });
  it("should return positive for future date", () => {
    const d1 = new Date("2023-01-01");
    const d2 = new Date("2023-01-10");
    expect(getDaysDiff(d1, d2)).toBe(9);
  });
  it("should return negative for past date", () => {
    const d1 = new Date("2023-01-10");
    const d2 = new Date("2023-01-01");
    expect(getDaysDiff(d1, d2)).toBe(-9);
  });
});
