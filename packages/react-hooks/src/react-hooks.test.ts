import { describe, expect, it } from "vitest";

import { useReactHooks } from "./react-hooks";

describe("useReactHooks", () => {
  it("should return true", () => {
    expect(useReactHooks()).toEqual({ useReactHooks: true });
  });
});
