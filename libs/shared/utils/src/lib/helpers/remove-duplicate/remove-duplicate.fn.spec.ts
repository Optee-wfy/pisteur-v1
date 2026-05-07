import { removeDuplicate } from "./remove-duplicate.fn";

describe("Remove duplicate function", () => {
  it("should remove duplicate from array", () => {
    const array = [
      { uuid: "duplicate", name: "Hello" },
      { uuid: "duplicate", name: "World" },
    ];
    const filtered = removeDuplicate(array);
    expect(filtered.length === 1);
  });

  it("should ONLY remove duplicate from array", () => {
    const array = [
      { uuid: "duplicate", name: "Hello" },
      { uuid: "cool", name: "Hola" },
      { uuid: "duplicate", name: "World" },
      { uuid: "coolio", name: "Mundo" },
    ];
    const filtered = removeDuplicate(array);
    expect(filtered.length === 3);
  });

  it("should NOT remove anything from array without no duplicate", () => {
    const array = [
      { uuid: "cool", name: "Hola" },
      { uuid: "coolio", name: "Mundo" },
    ];
    const filtered = removeDuplicate(array);
    expect(filtered.length === 2);
  });
});
