import { normalize } from "./index";

describe("normalize", () => {
  it("should normalize accented characters", () => {
    expect(normalize("éàçöû")).toBe("eacou");
  });
  it("should replace spaces with dashes", () => {
    expect(normalize("hello world test")).toBe("hello-world-test");
  });
  it("should lowercase the string", () => {
    expect(normalize("HELLO")).toBe("hello");
  });
  it("should handle empty string", () => {
    expect(normalize("")).toBe("");
  });

  it("should keep already normalized string unchanged", () => {
    expect(normalize("foo-bar")).toBe("foo-bar");
  });

  it("should remove or keep special characters appropriately", () => {
    expect(normalize("hello@world!")).toBe("hello-world");
    expect(normalize("foo_bar")).toBe("foo-bar");
  });

  it("should handle multiple spaces and trim", () => {
    expect(normalize("  hello   world  ")).toBe("hello-world");
  });

  it("should handle null and undefined as input", () => {
    expect(normalize(null)).toBe("");
    expect(normalize(undefined)).toBe("");
  });

  it("should keep digits", () => {
    expect(normalize("héllo123")).toBe("hello123");
  });
});
