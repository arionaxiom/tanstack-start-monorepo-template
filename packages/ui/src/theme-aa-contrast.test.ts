import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { oklchContrast } from "@__APP_NAME__/utils/contrast";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const CSS_PATH = resolve(ROOT, "packages/tailwind-config/shared-styles.css");
const CSS = readFileSync(CSS_PATH, "utf-8");

const TEXT_PAIRS: Array<[string, string]> = [
  ["foreground", "background"],
  ["muted-foreground", "background"],
  ["muted-foreground", "muted"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["secondary-foreground", "secondary"],
  ["primary-foreground", "primary"],
  ["spotlight-foreground", "spotlight"],
  ["info-foreground", "info"],
  ["agent-foreground", "agent"],
  ["destructive-foreground", "destructive"],
  ["success-foreground", "success"],
  ["warning-foreground", "warning"],
  ["foreground", "card"],
];

const EMPHASIS_TOKENS = [
  "spotlight-emphasis",
  "info-emphasis",
  "agent-emphasis",
  "success-emphasis",
  "warning-emphasis",
  "destructive-emphasis",
];

const EMPHASIS_SURFACES = ["background", "surface", "card"];

const NON_TEXT_PAIRS: Array<[string, string]> = [
  ["primary", "background"],
  ["spotlight", "background"],
  ["input", "background"],
  ["input", "card"],
  ["input", "surface"],
  ["border-strong", "background"],
  ["border-strong", "card"],
  ["border-strong", "surface"],
  ["ring", "background"],
];

const INTERACTION_TEXT_PAIRS: Array<[string, string]> = [
  ["primary-foreground", "primary-hover"],
  ["primary-foreground", "primary-active"],
  ["spotlight-foreground", "spotlight-hover"],
  ["spotlight-foreground", "spotlight-active"],
  ["destructive-foreground", "destructive-hover"],
  ["destructive-foreground", "destructive-active"],
];

function declarationsFor(selector: ":root" | ".dark") {
  const selectorPattern = selector === ":root" ? ":root" : "\\.dark";
  const match = new RegExp(`${selectorPattern}\\s*\\{`).exec(CSS);

  if (!match) {
    throw new Error(`Could not find ${selector} token block`);
  }

  const bodyStart = match.index + match[0].length;
  let depth = 1;
  let bodyEnd = bodyStart;

  while (bodyEnd < CSS.length && depth > 0) {
    if (CSS[bodyEnd] === "{") depth += 1;
    if (CSS[bodyEnd] === "}") depth -= 1;
    bodyEnd += 1;
  }

  const declarations: Record<string, string> = {};
  const body = CSS.slice(bodyStart, bodyEnd - 1);

  for (const token of body.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    declarations[token[1]!] = token[2]!.trim();
  }

  return declarations;
}

const ROOT_TOKENS = declarationsFor(":root");
const DARK_TOKENS = { ...ROOT_TOKENS, ...declarationsFor(".dark") };

function resolveToken(
  tokens: Record<string, string>,
  name: string,
  seen = new Set<string>()
): string {
  if (seen.has(name)) {
    throw new Error(`Circular token reference involving --${name}`);
  }

  const value = tokens[name];
  if (!value) throw new Error(`Token --${name} not found`);

  const reference = value.match(/^var\(--([a-z0-9-]+)\)$/);
  if (!reference) return value;

  seen.add(name);
  return resolveToken(tokens, reference[1]!, seen);
}

describe.each([
  ["light", ROOT_TOKENS],
  ["dark", DARK_TOKENS],
] as const)("AA contrast in %s mode", (mode, tokens) => {
  it.each(TEXT_PAIRS)("%s on %s clears 4.5:1 for text", (fg, bg) => {
    const ratio = oklchContrast(
      resolveToken(tokens, fg),
      resolveToken(tokens, bg)
    );
    expect(
      ratio,
      `${mode}: ${fg} on ${bg} → ${ratio.toFixed(2)}`
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each(
    EMPHASIS_TOKENS.flatMap((token) =>
      EMPHASIS_SURFACES.map((surface) => [token, surface] as const)
    )
  )("%s on %s clears 4.5:1 for status text", (fg, bg) => {
    const ratio = oklchContrast(
      resolveToken(tokens, fg),
      resolveToken(tokens, bg)
    );
    expect(
      ratio,
      `${mode}: ${fg} on ${bg} → ${ratio.toFixed(2)}`
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each(NON_TEXT_PAIRS)("%s against %s clears 3:1", (fg, bg) => {
    const ratio = oklchContrast(
      resolveToken(tokens, fg),
      resolveToken(tokens, bg)
    );
    expect(
      ratio,
      `${mode}: ${fg} against ${bg} → ${ratio.toFixed(2)}`
    ).toBeGreaterThanOrEqual(3);
  });

  it.each(INTERACTION_TEXT_PAIRS)(
    "%s on %s clears 4.5:1 in interaction states",
    (fg, bg) => {
      const ratio = oklchContrast(
        resolveToken(tokens, fg),
        resolveToken(tokens, bg)
      );
      expect(
        ratio,
        `${mode}: ${fg} on ${bg} → ${ratio.toFixed(2)}`
      ).toBeGreaterThanOrEqual(4.5);
    }
  );
});
