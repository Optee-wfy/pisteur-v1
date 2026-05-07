import { unreachable } from "./index";

describe("unreachable", () => {
  it("should throw an error with the given value", () => {
    expect(() => unreachable("fail" as never)).toThrowError(
      /Unreachable code: fail/,
    );
  });
});
