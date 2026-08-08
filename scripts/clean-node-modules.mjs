#!/usr/bin/env node

import { readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

const parsed = parseArgs({
  allowPositionals: false,
  options: {
    root: { type: "string", default: process.cwd() },
  },
});
const repositoryRoot = resolve(parsed.values.root);
const skippedDirectories = new Set([
  ".git",
  ".turbo",
  ".vercel",
  "build",
  "coverage",
  "dist",
  "out",
]);

await removeNodeModules(repositoryRoot);

async function removeNodeModules(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const childPath = join(directory, entry.name);
    if (entry.name === "node_modules") {
      await rm(childPath, { recursive: true, force: true });
      continue;
    }
    if (!skippedDirectories.has(entry.name)) {
      await removeNodeModules(childPath);
    }
  }
}
