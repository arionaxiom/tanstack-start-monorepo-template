#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";

const PLACEHOLDER = "__APP_NAME__";
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
  ".yaml",
  ".yml",
]);

const options = parseTemplateArguments(process.argv.slice(2));
const repositoryRoot = resolve(options.root ?? process.cwd());
const appName = requirePackageSlug(options.name);
const changedPaths = [];

for await (const filePath of walk(repositoryRoot)) {
  if (!isTextFile(filePath)) continue;

  const before = await readFile(filePath, "utf8").catch(() => undefined);
  if (before === undefined || !before.includes(PLACEHOLDER)) continue;

  if (!options.dryRun) {
    await writeFile(filePath, before.replaceAll(PLACEHOLDER, appName));
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
      help: { type: "boolean", short: "h", default: false },
      name: { type: "string" },
      root: { type: "string" },
    },
  });

  if (parsed.values.help) printUsageAndExit(0);
  if (!parsed.values.name) printUsageAndExit(1);

  return {
    dryRun: parsed.values["dry-run"],
    name: parsed.values.name,
    root: parsed.values.root,
  };
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
      "Usage: pnpm template:init -- --name <app-slug> [--root <path>] [--dry-run]",
      "",
      "Examples:",
      "  pnpm template:init -- --name acme-operations",
      "  pnpm template:init -- --name acme-operations --dry-run",
    ].join("\n")
  );
  process.exit(code);
}
