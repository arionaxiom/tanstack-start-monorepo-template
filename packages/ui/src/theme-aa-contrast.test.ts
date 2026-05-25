import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { oklchContrast } from "@__APP_NAME__/utils/contrast";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const CSS_PATH = resolve(ROOT, "packages/tailwind-config/shared-styles.css");

const PAIRS_NORMAL: Array<[string, string]> = [
  ["foreground", "background"],
  ["muted-foreground", "background"],
  ["muted-foreground", "muted"],
  ["card-foreground", "card"],
  ["secondary-foreground", "secondary"],
  ["spotlight-foreground", "spotlight"],
  ["destructive-foreground", "destructive"],
  ["success-foreground", "success"],
  ["warning-foreground", "warning"],
  ["foreground", "card"],
];

// UI/large text: 3:1 minimum (WCAG AA for non-text contrast and large text).
// primary-foreground on primary is button-label text — a UI element, not body
// text — so 3:1 applies (WCAG 1.4.11, not 1.4.3).
const PAIRS_UI: Array<[string, string]> = [
  ["primary", "background"],
  ["spotlight", "background"],
  ["primary-foreground", "primary"],
];

const RAW_TIER1: Record<string, string> = {
  "ink-50": "0.99 0.004 85",
  "ink-100": "0.97 0.006 80",
  "ink-200": "0.93 0.008 75",
  "ink-300": "0.86 0.010 70",
  "ink-400": "0.68 0.012 65",
  "ink-500": "0.52 0.014 62",
  "ink-600": "0.38 0.016 60",
  "ink-700": "0.28 0.018 58",
  "ink-800": "0.20 0.020 56",
  "ink-900": "0.14 0.014 55",
  "ink-950": "0.09 0.010 55",
  "brand-400": "0.60 0.080 175",
  "brand-500": "0.42 0.072 174",
  "brand-700": "0.32 0.064 174",
  "spotlight-400": "0.74 0.180 40",
  "spotlight-500": "0.66 0.221 37",
  "success-500": "0.58 0.120 155",
  "warning-500": "0.78 0.150 80",
  "danger-500": "0.55 0.180 25",
};

function parseSemantic(scope: ":root" | ".dark"): Record<string, string> {
  const css = readFileSync(CSS_PATH, "utf-8");
  const blockRe = new RegExp(
    `${scope.replace(".", "\\.")}\\s*\\{([\\s\\S]*?)\\}`,
    "g"
  );
  const map: Record<string, string> = {};
  for (const match of css.matchAll(blockRe)) {
    const body = match[1]!;
    for (const line of body.split("\n")) {
      const m = line.match(/--([a-z0-9-]+)\s*:\s*([^;]+);/);
      if (!m) continue;
      const [, name, raw] = m;
      const v = raw!.trim();
      const varMatch = v.match(/^var\(--([a-z0-9-]+)\)$/);
      if (varMatch) {
        map[name!] = RAW_TIER1[varMatch[1]!] ?? map[varMatch[1]!] ?? v;
      } else {
        map[name!] = v;
      }
    }
  }
  return map;
}

function resolve2(map: Record<string, string>, name: string): string {
  const v = map[name];
  if (!v) throw new Error(`Token --${name} not found`);
  const varMatch = v.match(/^var\(--([a-z0-9-]+)\)$/);
  if (varMatch) return RAW_TIER1[varMatch[1]!] ?? map[varMatch[1]!] ?? v;
  return v.split("/")[0]!.trim();
}

describe.each([":root" as const, ".dark" as const])(
  "AA contrast in %s",
  (scope) => {
    const tokens = parseSemantic(scope);

    it.each(PAIRS_NORMAL)("%s on %s clears 4.5:1 (body text)", (fg, bg) => {
      const ratio = oklchContrast(resolve2(tokens, fg), resolve2(tokens, bg));
      expect(
        ratio,
        `${scope}: ${fg} on ${bg} → ${ratio.toFixed(2)}`
      ).toBeGreaterThanOrEqual(4.5);
    });

    it.each(PAIRS_UI)("%s on %s clears 3:1 (UI/large text)", (fg, bg) => {
      const ratio = oklchContrast(resolve2(tokens, fg), resolve2(tokens, bg));
      expect(
        ratio,
        `${scope}: ${fg} on ${bg} → ${ratio.toFixed(2)}`
      ).toBeGreaterThanOrEqual(3.0);
    });
  }
);
