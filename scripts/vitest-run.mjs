#!/usr/bin/env node
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

export function normalizeVitestArgs(args) {
  const separatorIndex = args.indexOf("--");
  if (separatorIndex === -1) return args;
  return [
    ...args.slice(0, separatorIndex),
    ...args.slice(separatorIndex + 1),
  ];
}

function isMain() {
  return import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isMain()) {
  const command = process.platform === "win32" ? "vitest.cmd" : "vitest";
  const child = spawn(
    command,
    ["run", ...normalizeVitestArgs(process.argv.slice(2))],
    {
      stdio: "inherit",
    }
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });

  child.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
}
