import { describe, expect, it } from "vitest";

import {
  normalizeVitestArgs,
  withStableVitestDefaults,
} from "../../../scripts/vitest-run.mjs";

describe("shared Vitest runner", () => {
  it("normalizes forwarded pnpm arguments", () => {
    expect(
      normalizeVitestArgs(["--silent=true", "--", "example.test.ts"])
    ).toEqual(["--silent=true", "example.test.ts"]);
  });

  it("adds stable defaults without overriding explicit choices", () => {
    expect(withStableVitestDefaults(["--", "example.test.ts"])).toEqual([
      "--testTimeout=15000",
      "--maxWorkers=2",
      "example.test.ts",
    ]);
    expect(
      withStableVitestDefaults(["--test-timeout=9000", "--maxWorkers", "7"])
    ).toEqual(["--test-timeout=9000", "--maxWorkers", "7"]);
  });
});
