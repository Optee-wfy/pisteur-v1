import { formatDuration } from "./index";

describe("formatDuration", () => {
  it("should format 0 as immédiat", () => {
    expect(formatDuration(0)).toBe("immédiat");
  });
  it("should format 1 as 1 an", () => {
    expect(formatDuration(1)).toBe("1 an");
  });
  it("should format 2 as 2 ans", () => {
    expect(formatDuration(2)).toBe("2 ans");
  });
  it("should format 1.5 as 1 an et 6 mois", () => {
    expect(formatDuration(1.5)).toBe("1 an et 6 mois");
  });
  it("should format 0.5 as 6 mois", () => {
    expect(formatDuration(0.5)).toBe("6 mois");
  });
  it("should format < 1 month as immédiat", () => {
    expect(formatDuration(0.01)).toBe("immédiat");
  });
  it("should format negative values as 0 mois", () => {
    expect(formatDuration(-1)).toBe("0 mois");
  });
  it("should format undefined as immédiat", () => {
    expect(formatDuration(undefined)).toBe("immédiat");
  });
});
