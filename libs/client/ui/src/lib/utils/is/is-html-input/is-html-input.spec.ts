import { isHTMLInputElement } from "./is-html-input.fn";

describe("isHTMLInputElement", () => {
  it("should return true for HTMLInputElement", () => {
    const input = document.createElement("input");
    expect(isHTMLInputElement(input)).toBe(true);
  });
  it("should return false for other elements", () => {
    const div = document.createElement("div");
    expect(isHTMLInputElement(div)).toBe(false);
  });
  it("should return false for null", () => {
    expect(isHTMLInputElement(null)).toBe(false);
  });
});
