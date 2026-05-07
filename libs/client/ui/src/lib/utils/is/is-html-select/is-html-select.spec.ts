import { isHTMLSelectElement } from "./is-html-select.fn";

describe("isHTMLSelectElement", () => {
  it("should return true for HTMLSelectElement", () => {
    const select = document.createElement("select");
    expect(isHTMLSelectElement(select)).toBe(true);
  });
  it("should return false for other elements", () => {
    const div = document.createElement("div");
    expect(isHTMLSelectElement(div)).toBe(false);
  });
  it("should return false for null", () => {
    expect(isHTMLSelectElement(null)).toBe(false);
  });
});
