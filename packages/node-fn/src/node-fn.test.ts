import { describe, expect, it } from "vitest";

import { nodeFn } from "./node-fn";

describe("nodeFn", () => {
  it("should return true", () => {
    expect(nodeFn()).toEqual({ nodeFn: true });
  });
});
