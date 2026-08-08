import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.."
);

/**
 * For each package, provide a real source file that ESLint will resolve a
 * config for.  The file must exist — ESLint uses the path to locate the
 * config, but does not need to read the contents.
 *
 * skipRTLBan: true  — packages/test-utils is the wrapper that deliberately
 * lifts the @testing-library/react ban for its own source files.  The base
 * config's "test-utils-allow-rtl" override applies to src/index.ts, so that
 * package correctly skips the RTL assertion.
 */
const FIXTURES = [
  { pkg: "packages/utils", file: "src/contrast.ts" },
  { pkg: "packages/types", file: "src/types.ts" },
  { pkg: "packages/constants", file: "src/constants.ts" },
  { pkg: "packages/form-options", file: "src/sign-in.ts" },
  { pkg: "packages/node-fn", file: "src/node-fn.ts" },
  { pkg: "packages/react-hooks", file: "src/react-hooks.ts" },
  // test-utils/src/index.ts is in the allowlist override — RTL ban intentionally lifted
  {
    pkg: "packages/test-utils",
    file: "src/index.ts",
    skipRTLBan: true,
    skipBarrelBan: true,
  },
  { pkg: "packages/ui", file: "src/utils/cn.ts" },
  { pkg: "apps/web", file: "src/routes/index.tsx" },
];

/**
 * Run `eslint --print-config <file>` in the package directory and return
 * the parsed JSON.
 */
function printConfig(pkg, file) {
  const cwd = path.resolve(ROOT, pkg);
  const out = execSync(`pnpm exec eslint --print-config ${file}`, {
    cwd,
    encoding: "utf-8",
  });
  return JSON.parse(out);
}

describe("eslint config inheritance — critical rules survive per package", () => {
  it.each(FIXTURES)(
    "$pkg keeps bannedPackages, ../* ban, and (where applicable) testing-library ban",
    ({ pkg, file, skipRTLBan, skipBarrelBan }) => {
      const cfg = printConfig(pkg, file);
      const restricted = cfg.rules?.["no-restricted-imports"];

      expect(
        cfg.rules?.["@typescript-eslint/no-deprecated"]?.[0],
        `${pkg}: deprecated API usage must be an error`
      ).toBe(2);

      expect(cfg.rules?.["turbo/no-undeclared-env-vars"]?.[0]).toBe(2);
      expect(cfg.rules?.["no-barrel-files/no-barrel-files"]?.[0]).toBe(
        skipBarrelBan ? 0 : 2
      );

      if (pkg === "apps/web") {
        expect(
          cfg.rules?.["@tanstack/router/create-route-property-order"]?.[0]
        ).toBe(2);
        expect(cfg.rules?.["template/no-raw-internal-navigation"]?.[0]).toBe(2);
      }

      expect(
        restricted,
        `${pkg}: no-restricted-imports rule is missing entirely`
      ).toBeDefined();

      // Flat config: rule value is [severity, ...options]
      // After normalisation ESLint encodes the severity as a number (2 = error).
      const severity = Array.isArray(restricted) ? restricted[0] : restricted;
      expect(severity, `${pkg}: no-restricted-imports should be an error`).toBe(
        2
      );

      const options = Array.isArray(restricted) ? restricted[1] : undefined;
      const paths = options?.paths ?? [];
      const patterns = options?.patterns ?? [];

      // bannedPackages must all survive
      expect(
        paths.some((p) => p.name === "redux"),
        `${pkg}: missing banned package "redux"`
      ).toBe(true);

      expect(
        paths.some((p) => p.name === "framer-motion"),
        `${pkg}: missing banned package "framer-motion"`
      ).toBe(true);

      expect(
        paths.some((p) => p.name === "mobx"),
        `${pkg}: missing banned package "mobx"`
      ).toBe(true);

      expect(
        paths.some((p) => p.name === "motion"),
        `${pkg}: missing banned package "motion"`
      ).toBe(true);

      expect(
        paths.some((p) => p.name === "react-hook-form"),
        `${pkg}: missing alternative form-library ban`
      ).toBe(true);

      if (!skipRTLBan) {
        // bannedTestingLibrary must survive for normal files
        expect(
          paths.some((p) => p.name === "@testing-library/react"),
          `${pkg}: missing @testing-library/react ban`
        ).toBe(true);
      } else {
        // For test-utils wrapper files the RTL ban is intentionally lifted —
        // verify that the ban is absent (confirming the override works)
        expect(
          paths.some((p) => p.name === "@testing-library/react"),
          `${pkg}: @testing-library/react should NOT be banned for test-utils source (allowlist override not working)`
        ).toBe(false);
      }

      // bannedRelativeParent must survive
      expect(
        patterns.some(
          (p) => Array.isArray(p.group) && p.group.includes("../*")
        ),
        `${pkg}: missing relative-parent (../*) import ban`
      ).toBe(true);
    }
  );

  it.each(FIXTURES)(
    "$pkg keeps className composition (no-restricted-syntax) rules",
    ({ pkg, file }) => {
      const cfg = printConfig(pkg, file);
      const restrictedSyntax = cfg.rules?.["no-restricted-syntax"];

      expect(
        restrictedSyntax,
        `${pkg}: no-restricted-syntax rule is missing`
      ).toBeDefined();

      const entries = Array.isArray(restrictedSyntax)
        ? restrictedSyntax.slice(1) // drop severity entry
        : [];

      const hasTemplateLiteralBan = entries.some(
        (e) =>
          typeof e === "object" &&
          typeof e.selector === "string" &&
          e.selector.includes("TemplateLiteral")
      );
      expect(
        hasTemplateLiteralBan,
        `${pkg}: missing className template-literal ban in no-restricted-syntax`
      ).toBe(true);

      const hasBinaryExpressionBan = entries.some(
        (e) =>
          typeof e === "object" &&
          typeof e.selector === "string" &&
          e.selector.includes("BinaryExpression")
      );
      expect(
        hasBinaryExpressionBan,
        `${pkg}: missing className binary-expression ban in no-restricted-syntax`
      ).toBe(true);

      const hasInlineZodEnumBan = entries.some(
        (entry) =>
          typeof entry === "object" &&
          typeof entry.selector === "string" &&
          entry.selector.includes("z'][callee.property.name='enum")
      );
      expect(
        hasInlineZodEnumBan,
        `${pkg}: missing inline z.enum array ban in no-restricted-syntax`
      ).toBe(true);
    }
  );

  it("lints UI elements with targeted generated-wrapper exceptions", () => {
    const cfg = printConfig("packages/ui", "src/elements/chart.tsx");

    expect(cfg.rules?.["no-barrel-files/no-barrel-files"]?.[0]).toBe(2);
    expect(cfg.rules?.["@typescript-eslint/no-deprecated"]?.[0]).toBe(2);
    expect(cfg.rules?.["@eslint-react/no-array-index-key"]?.[0]).toBe(0);
    expect(cfg.rules?.["react-hooks/set-state-in-effect"]?.[0]).toBe(0);
  });
});
