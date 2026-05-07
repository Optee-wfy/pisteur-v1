import { getTailwindBreakpoint } from "./index";

describe("getTailwindBreakpoint", () => {
  it("should return 2xl for >= 1536", () => {
    expect(getTailwindBreakpoint(1536)).toBe("2xl");
    expect(getTailwindBreakpoint(2000)).toBe("2xl");
  });
  it("should return xl for >= 1280", () => {
    expect(getTailwindBreakpoint(1280)).toBe("xl");
  });
  it("should return lg for >= 1024", () => {
    expect(getTailwindBreakpoint(1024)).toBe("lg");
  });
  it("should return md for >= 768", () => {
    expect(getTailwindBreakpoint(768)).toBe("md");
  });
  it("should return sm for >= 640", () => {
    expect(getTailwindBreakpoint(640)).toBe("sm");
  });
  it("should return xs for >= 480", () => {
    expect(getTailwindBreakpoint(480)).toBe("xs");
  });
  it("should return xs for < 480", () => {
    expect(getTailwindBreakpoint(320)).toBe("xs");
  });
  it("should return xs for negative values", () => {
    expect(getTailwindBreakpoint(-100)).toBe("xs");
  });
  it("should return xs for NaN", () => {
    expect(getTailwindBreakpoint(NaN)).toBe("xs");
  });
});
