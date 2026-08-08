#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";

const repositoryRoot = resolve(process.cwd());
const skippedDirectories = new Set([
  ".git",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
]);
const moduleExtensions = new Set([".js", ".mjs", ".mts", ".ts", ".tsx"]);
const errors = [];

for await (const filePath of walk(repositoryRoot)) {
  const relativePath = relative(repositoryRoot, filePath);
  const fileName = basename(filePath);

  if (fileName === "package.json") {
    const manifest = JSON.parse(await readFile(filePath, "utf8"));
    if (manifest.type !== "module") {
      errors.push(
        `${relativePath}: package.json must declare \"type\": \"module\"`
      );
    }
    continue;
  }

  if (extname(fileName) === ".cjs") {
    errors.push(`${relativePath}: CommonJS .cjs files are not allowed`);
    continue;
  }

  if (
    !moduleExtensions.has(extname(fileName)) ||
    relativePath === "scripts/verify-esm.mjs"
  ) {
    continue;
  }

  const source = await readFile(filePath, "utf8");
  const commonJsPatterns = [
    [/(^|\W)require\s*\(/m, "require()"],
    [/(^|\W)module\.exports\b/m, "module.exports"],
    [/(^|\W)exports\.[A-Za-z_$]/m, "exports.*"],
  ];

  for (const [pattern, label] of commonJsPatterns) {
    if (pattern.test(source)) {
      errors.push(`${relativePath}: ${label} is not allowed in ESM source`);
    }
  }
}

if (errors.length > 0) {
  console.error(["ESM verification failed:", ...errors].join("\n"));
  process.exit(1);
}

console.log("ESM verification passed.");

async function* walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!skippedDirectories.has(entry.name)) yield* walk(filePath);
      continue;
    }
    if (entry.isFile()) yield filePath;
  }
}
