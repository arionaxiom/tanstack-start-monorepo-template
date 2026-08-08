import { Linter } from "eslint";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import rule from "../rules/no-raw-internal-navigation.js";

function lint(
  code,
  filename = join("repo", "apps", "web", "src", "routes", "root.tsx")
) {
  const linter = new Linter({ configType: "flat" });
  return linter.verify(
    code,
    [
      {
        files: ["**/*.{js,mjs,ts,tsx}"],
        languageOptions: {
          ecmaVersion: "latest",
          parserOptions: { ecmaFeatures: { jsx: true } },
          sourceType: "module",
        },
        plugins: {
          project: {
            rules: {
              "no-raw-internal-navigation": rule,
            },
          },
        },
        rules: {
          "project/no-raw-internal-navigation": "error",
        },
      },
    ],
    { filename }
  );
}

describe("no-raw-internal-navigation", () => {
  it("allows router links and statically non-route destinations", () => {
    expect(
      lint(`
        <Link to="/jobs">Jobs</Link>;
        <a href="https://example.com">External</a>;
        <a href="mailto:hello@example.com">Email</a>;
        <a href={\`tel:\${phone}\`}>Phone</a>;
        <a href="#main-content">Skip</a>;
        <a href="/export.csv" download>Export</a>;
        window.open("https://example.com");
      `)
    ).toEqual([]);
  });

  it("requires an explicit marker for dynamic external hrefs", () => {
    expect(
      lint(`<a href={externalHref} data-allow-raw-navigation>External</a>;`)
    ).toEqual([]);

    const messages = lint(`<a href={externalHref}>External</a>;`);
    expect(messages).toHaveLength(1);
    expect(messages[0]?.messageId).toBe("ambiguousRawNavigation");
  });

  it("does not allow the external marker to bypass internal links", () => {
    const messages = lint(
      `<a href="/jobs" data-allow-raw-navigation>Jobs</a>;`
    );
    expect(messages).toHaveLength(1);
    expect(messages[0]?.messageId).toBe("rawInternalNavigation");
  });

  it("bans raw and imperative internal navigation", () => {
    const messages = lint(`
      <a href="/jobs">Jobs</a>;
      <NavigationMenuLink href="jobs">Jobs</NavigationMenuLink>;
      <BreadcrumbLink href="/jobs">Jobs</BreadcrumbLink>;
      window.location.assign("/jobs");
      window.open(destination);
      location.href = "/jobs";
    `);

    expect(messages.map((message) => message.messageId)).toEqual([
      "rawInternalNavigation",
      "rawInternalNavigation",
      "rawInternalNavigation",
      "rawImperativeNavigation",
      "rawImperativeNavigation",
      "rawImperativeNavigation",
    ]);
  });

  it("does not govern tests or low-level primitives", () => {
    expect(
      lint(
        `<a href="/jobs">Test helper</a>;`,
        join("repo", "packages", "ui", "src", "components", "link.test.tsx")
      )
    ).toEqual([]);
    expect(
      lint(
        `<a href="/jobs">Primitive</a>;`,
        join("repo", "packages", "ui", "src", "elements", "link.tsx")
      )
    ).toEqual([]);
  });
});
