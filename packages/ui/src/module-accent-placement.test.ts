import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SCAN_DIRS = ["packages/ui/src", "apps/web/src"];

const FORBIDDEN_PATTERNS = [
  /\bbg-accent-(stock|leadgen|jobs)\b/,
  /\bfill-accent-(stock|leadgen|jobs)\b/,
  /\bshadow-accent-(stock|leadgen|jobs)\b/,
];

function findTsxFiles(dir: string): string[] {
  return readdirSync(resolve(ROOT, dir), { recursive: true, encoding: "utf-8" })
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => `${dir}/${f}`);
}

describe("module accent placement (R46)", () => {
  it("no bg-/fill-/shadow- usage of --accent-* tokens", () => {
    const violations: string[] = [];
    const files = SCAN_DIRS.flatMap(findTsxFiles);
    for (const rel of files) {
      const content = readFileSync(resolve(ROOT, rel), "utf-8");
      for (const re of FORBIDDEN_PATTERNS) {
        const m = content.match(re);
        if (m) violations.push(`${rel}: ${m[0]}`);
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });
});
