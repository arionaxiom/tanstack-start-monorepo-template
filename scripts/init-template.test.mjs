import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const scriptPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "init-template.mjs"
);
const fixtureRoot = await mkdtemp(join(tmpdir(), "tanstack-template-init-"));

try {
  await mkdir(join(fixtureRoot, "packages", "example", "src"), {
    recursive: true,
  });
  await writeFile(
    join(fixtureRoot, "package.json"),
    '{"name":"__APP_NAME__","product":"__APP_DISPLAY_NAME__"}\n'
  );
  await writeFile(
    join(fixtureRoot, "pnpm-lock.yaml"),
    "dependencies:\n  '@__APP_NAME__/example': workspace:*\n"
  );
  await writeFile(
    join(fixtureRoot, "wrangler.jsonc"),
    '{"name":"tanstack-start-template"}\n'
  );
  await writeFile(
    join(fixtureRoot, "site.webmanifest"),
    '{"name":"__APP_DISPLAY_NAME__","short_name":"__APP_DISPLAY_NAME__"}\n'
  );
  await writeFile(
    join(fixtureRoot, "packages", "example", "src", "example.ts"),
    'import type { Example } from "@__APP_NAME__/types/example";\n'
  );

  const dryRun = await execFileAsync(process.execPath, [
    scriptPath,
    "--root",
    fixtureRoot,
    "--name",
    "acme-operations",
    "--dry-run",
  ]);
  assert.match(dryRun.stdout, /would update package\.json/);
  assert.match(
    await readFile(join(fixtureRoot, "package.json"), "utf8"),
    /__APP_NAME__/
  );

  const result = await execFileAsync(process.execPath, [
    scriptPath,
    "--root",
    fixtureRoot,
    "--name",
    "acme-operations",
  ]);
  assert.match(result.stdout, /updated pnpm-lock\.yaml/);
  assert.equal(
    await readFile(join(fixtureRoot, "package.json"), "utf8"),
    '{"name":"acme-operations","product":"Acme Operations"}\n'
  );
  assert.doesNotMatch(
    await readFile(join(fixtureRoot, "pnpm-lock.yaml"), "utf8"),
    /__APP_NAME__/
  );
  assert.equal(
    await readFile(join(fixtureRoot, "wrangler.jsonc"), "utf8"),
    '{"name":"acme-operations"}\n'
  );
  assert.equal(
    await readFile(join(fixtureRoot, "site.webmanifest"), "utf8"),
    '{"name":"Acme Operations","short_name":"Acme Operations"}\n'
  );

  await writeFile(
    join(fixtureRoot, "display-name.txt"),
    "__APP_NAME__ | __APP_DISPLAY_NAME__\n"
  );
  await execFileAsync(process.execPath, [
    scriptPath,
    "--root",
    fixtureRoot,
    "--name",
    "acme-operations",
    "--display-name",
    "Acme Control Center",
  ]);
  assert.equal(
    await readFile(join(fixtureRoot, "display-name.txt"), "utf8"),
    "acme-operations | Acme Control Center\n"
  );
  assert.doesNotMatch(
    await readFile(
      join(fixtureRoot, "packages", "example", "src", "example.ts"),
      "utf8"
    ),
    /__APP_NAME__/
  );

  await assert.rejects(
    execFileAsync(process.execPath, [scriptPath, "--name", "Invalid_Name"]),
    /--name must start with a lowercase letter/
  );
  await assert.rejects(
    execFileAsync(process.execPath, [
      scriptPath,
      "--name",
      "valid-name",
      "--display-name",
      "",
    ]),
    /--display-name must contain between 1 and 80 characters/
  );
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}
