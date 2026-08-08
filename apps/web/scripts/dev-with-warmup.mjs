#!/usr/bin/env node
/**
 * Wraps `vite dev` to work around the known TanStack Start +
 * Cloudflare Workers + Lingui SSR race where the first dev start
 * sometimes serves 500s until the process is restarted.
 *
 * What it does:
 *   1. Spawn `vite dev <forwarded args>` as a child with inherited stdio.
 *   2. Probe `/healthz` repeatedly. The route is trivial — any 5xx means
 *      the SSR bundle itself is broken (lingui catalog not ready yet, etc.).
 *      Connection refused (code 0) means the server is still starting.
 *   3. If `/healthz` keeps returning 5xx for `WARMUP_TIMEOUT_MS` after the
 *      first response, kill the child and respawn (up to `MAX_ATTEMPTS`).
 *   4. As soon as a 2xx (or any non-5xx) comes back, stop probing and let
 *      the child run normally — wrapper exits with the child's exit code.
 *   5. Forward SIGINT/SIGTERM so Ctrl+C cleans up the child.
 *
 * This keeps the recovery behavior local to the dev process, so the template
 * does not need external orchestration infrastructure for a reliable startup.
 */
import { spawn } from "node:child_process";

const PORT = parsePort(process.argv) ?? 3000;
const PROBE_PATH = "/healthz";
const PROBE_INTERVAL_MS = 1000;
const STARTUP_TIMEOUT_MS = 90_000;
const WARMUP_TIMEOUT_MS = 25_000;
const MAX_ATTEMPTS = 3;

let child = null;
let stopping = false;

function parsePort(argv) {
  const i = argv.indexOf("--port");
  if (i !== -1 && argv[i + 1]) {
    const n = Number(argv[i + 1]);
    return Number.isFinite(n) ? n : null;
  }
  const eq = argv.find((a) => a.startsWith("--port="));
  if (eq) {
    const n = Number(eq.split("=")[1]);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function spawnVite(args) {
  return spawn("vite", ["dev", ...args], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
}

function killChild(signal = "SIGTERM") {
  return new Promise((resolve) => {
    if (!child || child.killed || child.exitCode !== null) {
      resolve();
      return;
    }
    const onExit = () => resolve();
    child.once("exit", onExit);
    try {
      child.kill(signal);
    } catch {
      child.removeListener("exit", onExit);
      resolve();
      return;
    }
    setTimeout(() => {
      try {
        if (child && child.exitCode === null) child.kill("SIGKILL");
      } catch {
        // ignore
      }
    }, 3000);
  });
}

async function probeOnce() {
  try {
    const r = await fetch(`http://localhost:${PORT}${PROBE_PATH}`, {
      redirect: "follow",
    });
    return r.status;
  } catch {
    return 0;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function log(message) {
  process.stderr.write(`[dev-warmup] ${message}\n`);
}

async function attempt(attemptNo, args) {
  log(`attempt ${attemptNo}/${MAX_ATTEMPTS}: starting vite dev`);
  child = spawnVite(args);

  const startedAt = Date.now();
  let firstResponseAt = null;
  let firstFailureAt = null;

  while (!stopping) {
    if (child.exitCode !== null) {
      log(
        `vite child exited with code ${child.exitCode} before becoming ready`
      );
      return "exited";
    }

    const code = await probeOnce();

    if (code === 0) {
      // Connection refused — server still starting
      if (Date.now() - startedAt > STARTUP_TIMEOUT_MS) {
        log(
          `server never started accepting connections within ${STARTUP_TIMEOUT_MS / 1000}s — restarting`
        );
        await killChild("SIGTERM");
        return "retry";
      }
      await sleep(PROBE_INTERVAL_MS);
      continue;
    }

    // Got a real HTTP response from this point on
    if (firstResponseAt === null) {
      firstResponseAt = Date.now();
    }

    if (code >= 200 && code < 500) {
      // 2xx/3xx/4xx — server is responding from app code, not the broken-SSR state
      log(`ready: GET ${PROBE_PATH} -> ${code}`);
      return "ready";
    }

    // 5xx — probable SSR/lingui race
    if (firstFailureAt === null) {
      firstFailureAt = Date.now();
      log(`${PROBE_PATH} -> ${code} (probable SSR/lingui race; warming up)`);
    }
    if (Date.now() - firstFailureAt >= WARMUP_TIMEOUT_MS) {
      log(
        `${PROBE_PATH} kept returning ${code} for ${WARMUP_TIMEOUT_MS / 1000}s — restarting`
      );
      await killChild("SIGTERM");
      return "retry";
    }
    await sleep(PROBE_INTERVAL_MS);
  }

  return "stopped";
}

async function main() {
  const args = process.argv.slice(2);

  process.on("SIGINT", async () => {
    stopping = true;
    await killChild("SIGINT");
    process.exit(130);
  });
  process.on("SIGTERM", async () => {
    stopping = true;
    await killChild("SIGTERM");
    process.exit(143);
  });

  let lastResult = "exited";
  for (let i = 1; i <= MAX_ATTEMPTS; i++) {
    lastResult = await attempt(i, args);
    if (lastResult === "stopped" || lastResult === "ready") break;
    if (lastResult === "exited") break;
    // lastResult === "retry"
    if (i < MAX_ATTEMPTS) await sleep(1000);
  }

  if (lastResult === "retry") {
    log(
      `still failing after ${MAX_ATTEMPTS} attempts — letting the last child run anyway`
    );
  }

  // Wait for child to exit and propagate code
  if (child && child.exitCode === null) {
    await new Promise((resolve) => child.once("exit", resolve));
  }
  process.exit(child?.exitCode ?? 0);
}

main().catch((err) => {
  process.stderr.write(`[dev-warmup] fatal: ${err.stack ?? err}\n`);
  process.exit(1);
});
