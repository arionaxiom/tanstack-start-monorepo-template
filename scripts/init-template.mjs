#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";

const APP_NAME_PLACEHOLDER = "__APP_NAME__";
const DISPLAY_NAME_PLACEHOLDER = "__APP_DISPLAY_NAME__";
const DEFAULT_WORKER_NAME = "tanstack-start-template";
const SKIPPED_DIRECTORIES = new Set([
  ".git",
  ".turbo",
  ".vercel",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
]);
const TEXT_EXTENSIONS = new Set([
  "",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".jsx",
  ".md",
  ".mjs",
  ".mts",
  ".po",
  ".sh",
  ".svg",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".webmanifest",
  ".yaml",
  ".yml",
]);

const options = parseTemplateArguments(process.argv.slice(2));
const repositoryRoot = resolve(options.root ?? process.cwd());
const appName = requirePackageSlug(options.name);
const displayName = requireDisplayName(
  options.displayName ?? humanizePackageSlug(appName)
);
const replacements = new Map([
  [APP_NAME_PLACEHOLDER, appName],
  [DISPLAY_NAME_PLACEHOLDER, displayName],
  [DEFAULT_WORKER_NAME, appName],
]);
const changedPaths = [];

for await (const filePath of walk(repositoryRoot)) {
  if (!isTextFile(filePath)) continue;

  const before = await readFile(filePath, "utf8").catch(() => undefined);
  if (
    before === undefined ||
    !Array.from(replacements.keys()).some((placeholder) =>
      before.includes(placeholder)
    )
  ) {
    continue;
  }

  if (!options.dryRun) {
    let after = before;
    for (const [placeholder, replacement] of replacements) {
      after = after.replaceAll(placeholder, replacement);
    }
    await writeFile(filePath, after);
  }
  changedPaths.push(relative(repositoryRoot, filePath));
}

for (const changedPath of changedPaths.sort((left, right) =>
  left.localeCompare(right)
)) {
  console.log(`${options.dryRun ? "would update" : "updated"} ${changedPath}`);
}

if (changedPaths.length === 0) {
  console.log("No template placeholders found.");
}

async function* walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(entry.name)) yield* walk(filePath);
      continue;
    }
    if (entry.isFile()) yield filePath;
  }
}

function isTextFile(filePath) {
  const name = basename(filePath);
  return (
    name === ".editorconfig" ||
    name === ".gitignore" ||
    name === ".prettierignore" ||
    name === ".prettierrc" ||
    TEXT_EXTENSIONS.has(extname(name))
  );
}

function parseTemplateArguments(args) {
  const parsed = parseArgs({
    args,
    allowPositionals: false,
    options: {
      "dry-run": { type: "boolean", default: false },
      "display-name": { type: "string" },
      help: { type: "boolean", short: "h", default: false },
      name: { type: "string" },
      root: { type: "string" },
    },
  });

  if (parsed.values.help) printUsageAndExit(0);
  if (!parsed.values.name) printUsageAndExit(1);

  return {
    dryRun: parsed.values["dry-run"],
    displayName: parsed.values["display-name"],
    name: parsed.values.name,
    root: parsed.values.root,
  };
}

function humanizePackageSlug(value) {
  return value
    .split("-")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function requireDisplayName(value) {
  const displayName = value.trim();
  if (displayName.length === 0 || displayName.length > 80) {
    throw new Error("--display-name must contain between 1 and 80 characters.");
  }
  return displayName;
}

function requirePackageSlug(value) {
  if (!/^[a-z][a-z0-9-]*$/.test(value)) {
    throw new Error(
      "--name must start with a lowercase letter and contain only lowercase letters, numbers, and dashes."
    );
  }
  return value;
}

function printUsageAndExit(code) {
  console.log(
    [
      "Usage: pnpm template:init -- --name <app-slug> [--display-name <name>] [--root <path>] [--dry-run]",
      "",
      "Examples:",
      "  pnpm template:init -- --name acme-operations",
      '  pnpm template:init -- --name acme-operations --display-name "Acme Control Center"',
      "  pnpm template:init -- --name acme-operations --dry-run",
    ].join("\n")
  );
  process.exit(code);
}
