/// <reference types="node" />
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const HIGH_LEVEL_FRONTEND_DIRS = ["apps/web/src", "packages/ui/src/components"];

const RAW_INTERACTIVE_TAG_REGEX =
  /<(button|input|textarea|select|option|dialog|details|summary)\b/;
const BASE_UI_IMPORT_REGEX = /from\s+["']@base-ui\/react/;

function findTsxFiles(dir: string): string[] {
  const abs = resolve(ROOT, dir);
  return readdirSync(abs, { recursive: true, encoding: "utf-8" })
    .filter((file) => file.endsWith(".tsx"))
    .filter((file) => !file.includes(".test."))
    .filter((file) => !file.includes("__test__/"))
    .map((file) => `${dir}/${file}`);
}

function isCommentOnly(line: string): boolean {
  const trimmed = line.trimStart();
  return (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*")
  );
}

describe("frontend element usage compliance", () => {
  const highLevelFiles = HIGH_LEVEL_FRONTEND_DIRS.flatMap(findTsxFiles);
  const allFrontendFiles = [
    ...findTsxFiles("apps/web/src"),
    ...findTsxFiles("packages/ui/src"),
    ...findTsxFiles("packages/react-hooks/src"),
  ];

  it("finds frontend files to scan", () => {
    expect(highLevelFiles.length).toBeGreaterThan(0);
  });

  it("keeps direct Base UI imports inside ui/elements", () => {
    const violations: string[] = [];

    for (const relPath of allFrontendFiles) {
      if (relPath.startsWith("packages/ui/src/elements/")) {
        continue;
      }

      const lines = readFileSync(resolve(ROOT, relPath), "utf-8").split("\n");
      lines.forEach((line, index) => {
        if (BASE_UI_IMPORT_REGEX.test(line)) {
          violations.push(`${relPath}:${index + 1} — ${line.trim()}`);
        }
      });
    }

    expect(
      violations,
      `Import Base UI through @__APP_NAME__/ui/elements wrappers instead of directly:\n${violations.join("\n")}`
    ).toHaveLength(0);
  });

  it("uses ui/elements for interactive primitives in high-level frontend code", () => {
    const violations: string[] = [];

    for (const relPath of highLevelFiles) {
      const lines = readFileSync(resolve(ROOT, relPath), "utf-8").split("\n");
      lines.forEach((line, index) => {
        if (isCommentOnly(line)) {
          return;
        }

        const match = RAW_INTERACTIVE_TAG_REGEX.exec(line);
        if (match) {
          violations.push(
            `${relPath}:${index + 1} — use @__APP_NAME__/ui/elements instead of raw <${match[1]}>`
          );
        }
      });
    }

    expect(
      violations,
      `Raw interactive primitives found in high-level frontend code:\n${violations.join("\n")}`
    ).toHaveLength(0);
  });
});
