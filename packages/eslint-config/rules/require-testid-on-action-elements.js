// Path fragment that triggers this rule. Update if you restructure where shared UI components live.
const TARGET_PATH_FRAGMENT = "/packages/ui/src/components/";
const ACTION_TAGS = new Set(["button", "a"]);

function isExempt(filename) {
  return (
    !filename.includes(TARGET_PATH_FRAGMENT) ||
    filename.endsWith(".test.tsx") ||
    filename.endsWith(".spec.tsx") ||
    /\/_[^/]+\.tsx$/.test(filename) // _Private components
  );
}

function isActionElement(node) {
  if (node.name && node.name.type === "JSXIdentifier") {
    if (ACTION_TAGS.has(node.name.name)) return true;
  }
  return node.attributes.some(
    (attr) =>
      attr.type === "JSXAttribute" &&
      attr.name.name === "role" &&
      attr.value &&
      attr.value.type === "Literal" &&
      attr.value.value === "button"
  );
}

function hasOwnTestId(node) {
  return node.attributes.some(
    (attr) => attr.type === "JSXAttribute" && attr.name.name === "data-testid"
  );
}

function descendantHasTestId(jsxElement) {
  if (!jsxElement.children) return false;
  for (const child of jsxElement.children) {
    if (child.type !== "JSXElement") continue;
    if (hasOwnTestId(child.openingElement)) return true;
    if (descendantHasTestId(child)) return true;
  }
  return false;
}

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require data-testid on action elements (button, a, role=button) inside packages/ui/src/components/**",
    },
    messages: {
      missingTestId:
        "Action element is missing data-testid. Add it via testId(...) so e2e tests can target it without DOM scanning.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (isExempt(filename)) return {};
    return {
      JSXElement(node) {
        const opening = node.openingElement;
        if (!opening) return;
        if (!isActionElement(opening)) return;
        if (hasOwnTestId(opening)) return;
        if (descendantHasTestId(node)) return;
        context.report({ node: opening, messageId: "missingTestId" });
      },
    };
  },
};
