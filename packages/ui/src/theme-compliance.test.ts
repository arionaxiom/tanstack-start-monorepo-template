/// <reference types="node" />
/**
 * Theme compliance test (R7, R2, R27, R17, R18).
 *
 * Scans all .tsx files in packages/ui/src/ and apps/web/src/ and
 * asserts none contain raw Tailwind palette color classes. This
 * prevents hardcoded colors from sneaking past code review.
 *
 * Allowed exceptions:
 *  - CSS attribute selectors matching third-party inline styles
 *    (e.g. Recharts `[stroke='#ccc']`) — these are selectors, not
 *    applied colors.
 *  - Comments and string literals that aren't className props.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const PALETTE_PREFIXES = [
  "red",
  "blue",
  "green",
  "gray",
  "slate",
  "zinc",
  "neutral",
  "stone",
  "orange",
  "amber",
  "yellow",
  "lime",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

// Raw single-color utilities like `bg-black`, `text-white` (no shade suffix)
// also bypass the semantic token system and are forbidden.
const RAW_SINGLE_COLOR_PREFIXES = ["black", "white"];

// Matches Tailwind utility patterns like `text-red-500`, `bg-gray-100/50`,
// `hover:bg-blue-600`, `dark:text-slate-200`, plus raw `bg-black` /
// `text-white` (no shade). Captures the palette reference for the error
// message.
const PALETTE_REGEX = new RegExp(
  `(?:^|\\s|"|'|\`)(?:(?:hover|focus|active|dark|group-hover|peer-hover|disabled|data-\\[[^\\]]+\\]|aria-\\[[^\\]]+\\]):)*(?:bg|text|border|ring|shadow|fill|stroke|outline|decoration|accent|caret|divide|from|via|to|placeholder)-(?:(${PALETTE_PREFIXES.join("|")})-(\\d{1,3}(?:/\\d+)?)|(${RAW_SINGLE_COLOR_PREFIXES.join("|")})(?![a-zA-Z0-9-]))`,
  "g"
);

// CSS attribute selectors (e.g. `[stroke='#ccc']`) are not violations —
// they match third-party inline styles, not apply colors.
const CSS_ATTR_SELECTOR_REGEX = /\[[a-z-]+=['"][^'"]+['"]\]/;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function findTsxFiles(dir: string): string[] {
  const abs = resolve(ROOT, dir);
  return readdirSync(abs, { recursive: true, encoding: "utf-8" })
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => `${dir}/${f}`);
}

describe("theme compliance (R7)", () => {
  const allFiles = [
    ...findTsxFiles("packages/ui/src"),
    ...findTsxFiles("apps/web/src"),
  ];

  it("should find .tsx files to scan", () => {
    expect(allFiles.length).toBeGreaterThan(0);
  });

  it("no .tsx files contain raw Tailwind palette color classes", () => {
    const violations: string[] = [];

    for (const relPath of allFiles) {
      const absPath = resolve(ROOT, relPath);
      const content = readFileSync(absPath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;

        // Skip comment-only lines
        if (
          line.trimStart().startsWith("//") ||
          line.trimStart().startsWith("*")
        )
          continue;

        // Skip CSS attribute selectors (Recharts style overrides)
        if (CSS_ATTR_SELECTOR_REGEX.test(line)) continue;

        let match: RegExpExecArray | null;
        PALETTE_REGEX.lastIndex = 0;
        while ((match = PALETTE_REGEX.exec(line)) !== null) {
          violations.push(
            `${relPath}:${i + 1} — found "${match[1] ? `${match[1]}-${match[2]}` : match[3]}" in: ${line.trim().slice(0, 120)}`
          );
        }
      }
    }

    expect(
      violations,
      `Raw Tailwind palette colors found:\n${violations.join("\n")}`
    ).toHaveLength(0);
  });

  it("no .tsx files use hsl() for token references", () => {
    const violations: string[] = [];

    for (const relPath of allFiles) {
      const absPath = resolve(ROOT, relPath);
      const content = readFileSync(absPath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        if (
          line.trimStart().startsWith("//") ||
          line.trimStart().startsWith("*")
        )
          continue;

        if (line.includes("hsl(var(--")) {
          violations.push(
            `${relPath}:${i + 1} — use oklch(var(--…)) instead: ${line.trim().slice(0, 120)}`
          );
        }
      }
    }

    expect(
      violations,
      `hsl() token references found:\n${violations.join("\n")}`
    ).toHaveLength(0);
  });
});

const SPOTLIGHT_OCCURRENCE_LIMIT = 3;
const SPOTLIGHT_REGEX =
  /\b(?:bg|text|border|ring|fill|stroke|outline)-spotlight(?:\/\d+)?\b/g;

describe("theme compliance — design system (R2, R17, R18, R27)", () => {
  const allFiles = [
    ...findTsxFiles("packages/ui/src"),
    ...findTsxFiles("apps/web/src"),
  ];

  it("no non-test .tsx file uses Tailwind shadow-sm/shadow-md utilities (R51)", () => {
    // R51: in-page surfaces use hairline borders, not shadow. True overlays
    // (popover/dialog/sheet/dropdown/tooltip/hover-card) must consume
    // `--shadow-popover` or `--shadow-modal` via `shadow-[var(--shadow-...)]`,
    // not Tailwind's default `shadow-sm` / `shadow-md` (which point at tokens
    // we don't override and contradict the editorial elevation system).
    const SHADOW_REGEX =
      /\b(?:hover|focus|active|dark|group-hover|peer-hover|disabled|data-\[[^\]]+\]|aria-\[[^\]]+\]|md|lg|xl|sm)?:?shadow-(?:sm|md|lg|xl|2xl)\b/;
    const violations: string[] = [];
    for (const relPath of allFiles) {
      if (relPath.includes(".test.")) continue;
      const absPath = resolve(ROOT, relPath);
      const content = readFileSync(absPath, "utf-8");
      const m = content.match(SHADOW_REGEX);
      if (m) violations.push(`${relPath}: ${m[0]}`);
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("spotlight is rationed (R40): no non-test file uses bg/text/border-spotlight more than 3 times", () => {
    const violations: string[] = [];
    for (const relPath of allFiles) {
      if (relPath.includes(".test.")) continue;
      const absPath = resolve(ROOT, relPath);
      const content = readFileSync(absPath, "utf-8");
      const matches = content.match(SPOTLIGHT_REGEX) ?? [];
      if (matches.length > SPOTLIGHT_OCCURRENCE_LIMIT) {
        violations.push(`${relPath}: ${matches.length} occurrences`);
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("no .tsx file outside elements/ uses animate-pulse with bg-muted (use <Skeleton>)", () => {
    const violations: string[] = [];
    for (const relPath of allFiles) {
      if (relPath.includes(".test.")) continue;
      if (relPath.includes("packages/ui/src/elements/")) continue; // primitive itself
      const absPath = resolve(ROOT, relPath);
      const content = readFileSync(absPath, "utf-8");
      // Match `animate-pulse` with `bg-muted` (or `bg-muted/N`) in the same className
      const re =
        /\banimate-pulse\b[^"'`]{0,80}\bbg-muted(?:\/\d+)?\b|\bbg-muted(?:\/\d+)?\b[^"'`]{0,80}\banimate-pulse\b/;
      if (re.test(content)) violations.push(relPath);
    }
    expect(
      violations,
      `Use <Skeleton> from @__APP_NAME__/ui/elements/skeleton:\n${violations.join("\n")}`
    ).toEqual([]);
  });

  it("no .tsx file outside elements/ uses raw font-mono (use text-mono)", () => {
    // `text-mono` is the project's complete monospace utility — it bundles
    // font-family + font-feature-settings (tabular-nums, lining-nums) +
    // size + line-height. Raw `font-mono` is allowed only inside the
    // primitive layer (`packages/ui/src/elements/`) where primitives
    // establish their own typographic baselines (kbd, input-otp, chart
    // tooltip, pagination). Anywhere else, use `text-mono` (optionally
    // with `text-[size]` override for non-default sizes — text-mono is
    // in its own tailwind-merge group so size overrides don't drop the
    // family).
    const violations: string[] = [];
    for (const relPath of allFiles) {
      if (relPath.includes(".test.")) continue;
      if (relPath.includes("packages/ui/src/elements/")) continue;
      const absPath = resolve(ROOT, relPath);
      const content = readFileSync(absPath, "utf-8");
      // Match `font-mono` as a Tailwind utility token. Exclude `--font-mono`
      // CSS variable references (legitimate token consumption).
      const re = /(?<!-)\bfont-mono\b/;
      if (re.test(content)) violations.push(relPath);
    }
    expect(
      violations,
      `Use text-mono instead of raw font-mono:\n${violations.join("\n")}`
    ).toEqual([]);
  });

  it("no .tsx file outside elements/ uses animate-spin (use <Spinner>)", () => {
    const violations: string[] = [];
    for (const relPath of allFiles) {
      if (relPath.includes(".test.")) continue;
      if (relPath.includes("packages/ui/src/elements/")) continue;
      const absPath = resolve(ROOT, relPath);
      const content = readFileSync(absPath, "utf-8");
      if (/\banimate-spin\b/.test(content)) violations.push(relPath);
    }
    expect(
      violations,
      `Use <Spinner> from @__APP_NAME__/ui/elements/spinner:\n${violations.join("\n")}`
    ).toEqual([]);
  });

  it("no .tsx file uses raw <hr> (use <Separator>)", () => {
    const violations: string[] = [];
    for (const relPath of allFiles) {
      if (relPath.includes(".test.")) continue;
      if (relPath.includes("packages/ui/src/elements/")) continue;
      const absPath = resolve(ROOT, relPath);
      const content = readFileSync(absPath, "utf-8");
      if (/<hr\b/.test(content)) violations.push(relPath);
    }
    expect(
      violations,
      `Use <Separator> from @__APP_NAME__/ui/elements/separator:\n${violations.join("\n")}`
    ).toEqual([]);
  });
});

describe("no barrel re-exports (R27)", () => {
  const bannedDirs = [
    "packages/ui/src/elements",
    "packages/ui/src/components",
    "packages/ui/src/form",
    "packages/ui/src/form/elements",
    "packages/ui/src/form/components",
    "packages/ui/src/hooks",
    "packages/ui/src/utils",
  ];

  it("no index.ts barrel files exist in packages/ui subdirectories", () => {
    const found: string[] = [];
    for (const dir of bannedDirs) {
      for (const ext of ["index.ts", "index.tsx"]) {
        const candidate = resolve(ROOT, dir, ext);
        try {
          readFileSync(candidate);
          found.push(`${dir}/${ext}`);
        } catch {
          // File doesn't exist — good
        }
      }
    }

    expect(
      found,
      `Barrel re-export files defeat tree-shaking. Import directly from individual files instead.\nFound: ${found.join(", ")}`
    ).toHaveLength(0);
  });
});
