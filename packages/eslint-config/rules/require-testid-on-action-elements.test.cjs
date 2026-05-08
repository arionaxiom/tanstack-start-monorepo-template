"use strict";

const { RuleTester } = require("eslint");
const rule = require("./require-testid-on-action-elements.cjs");

const tester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
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
      code: `<div role="button">Click</div>`,
      filename: "/repo/packages/ui/src/components/foo.tsx",
      errors: [{ messageId: "missingTestId" }],
    },
  ],
});
