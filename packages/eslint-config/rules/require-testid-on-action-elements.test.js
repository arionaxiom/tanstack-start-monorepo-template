import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";
import { join } from "node:path";

import rule from "./require-testid-on-action-elements.js";

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run("require-testid-on-action-elements", rule, {
  valid: [
    {
      code: `<button data-testid="x">Go</button>`,
      filename: "/repo/packages/ui/src/components/foo.tsx",
    },
    {
      code: `<a href="/" data-testid="link">Home</a>`,
      filename: "/repo/packages/ui/src/components/foo.tsx",
    },
    {
      code: `<div role="button" data-testid="ghost">Click</div>`,
      filename: "/repo/packages/ui/src/components/foo.tsx",
    },
    {
      code: `<button><span data-testid="inner-label">Go</span></button>`,
      filename: "/repo/packages/ui/src/components/foo.tsx",
    },
    {
      code: `<button>Outside</button>`,
      filename: "/repo/apps/web/src/foo.tsx",
    },
  ],
  invalid: [
    {
      code: `<button>Go</button>`,
      filename: "/repo/packages/ui/src/components/foo.tsx",
      errors: [{ messageId: "missingTestId" }],
    },
    {
      code: `<a href="/x">Home</a>`,
      filename: "/repo/packages/ui/src/components/foo.tsx",
      errors: [{ messageId: "missingTestId" }],
    },
    {
      code: `<button>Go</button>`,
      filename: join("repo", "packages", "ui", "src", "components", "foo.tsx"),
      errors: [{ messageId: "missingTestId" }],
    },
    {
      code: `<div role="button">Click</div>`,
      filename: "/repo/packages/ui/src/components/foo.tsx",
      errors: [{ messageId: "missingTestId" }],
    },
  ],
});
