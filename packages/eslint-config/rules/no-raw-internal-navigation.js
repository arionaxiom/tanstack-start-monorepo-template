import { normalize, sep } from "node:path";

const TARGET_PATH_SEGMENTS = [
  ["apps", "web", "src"],
  ["packages", "ui", "src", "components"],
];

const RAW_LINK_COMPONENTS = new Set([
  "a",
  "BreadcrumbLink",
  "NavigationMenuLink",
]);

const NON_ROUTE_PROTOCOLS = [
  "blob:",
  "data:",
  "http:",
  "https:",
  "mailto:",
  "sms:",
  "tel:",
];

function filenameSegments(filename) {
  return normalize(filename).split(sep).filter(Boolean);
}

function includesSegments(segments, target) {
  for (let index = 0; index <= segments.length - target.length; index += 1) {
    if (
      target.every((segment, offset) => segments[index + offset] === segment)
    ) {
      return true;
    }
  }

  return false;
}

function isTestFile(filename) {
  return /\.(?:spec|test)\.[cm]?[jt]sx?$/.test(normalize(filename));
}

function isExempt(filename) {
  const segments = filenameSegments(filename);
  return (
    isTestFile(filename) ||
    !TARGET_PATH_SEGMENTS.some((target) => includesSegments(segments, target))
  );
}

function jsxIdentifierName(name) {
  return name.type === "JSXIdentifier" ? name.name : undefined;
}

function attributeName(attribute) {
  return attribute.name.type === "JSXIdentifier"
    ? attribute.name.name
    : undefined;
}

function findAttribute(node, name) {
  return node.attributes.find(
    (attribute) =>
      attribute.type === "JSXAttribute" && attributeName(attribute) === name
  );
}

function hasAttribute(node, name) {
  return Boolean(findAttribute(node, name));
}

function classifyString(value) {
  const normalized = value.trim().toLowerCase();
  if (
    normalized === "" ||
    normalized.startsWith("#") ||
    normalized.startsWith("//") ||
    NON_ROUTE_PROTOCOLS.some((protocol) => normalized.startsWith(protocol))
  ) {
    return "external";
  }

  return "internal";
}

function unwrapExpression(node) {
  let current = node;
  while (
    current &&
    [
      "ChainExpression",
      "TSAsExpression",
      "TSNonNullExpression",
      "TSSatisfiesExpression",
      "TSTypeAssertion",
    ].includes(current.type)
  ) {
    current = current.expression;
  }

  return current;
}

function templatePrefix(node) {
  return node.quasis[0]?.value.cooked ?? node.quasis[0]?.value.raw ?? "";
}

function classifyExpression(node) {
  const expression = unwrapExpression(node);
  if (!expression) return "dynamic";

  if (expression.type === "Literal" && typeof expression.value === "string") {
    return classifyString(expression.value);
  }

  if (expression.type !== "TemplateLiteral") return "dynamic";

  if (expression.expressions.length === 0) {
    return classifyString(templatePrefix(expression));
  }

  const prefix = templatePrefix(expression);
  return prefix ? classifyString(prefix) : "dynamic";
}

function classifyJsxAttributeValue(value) {
  if (!value) return "dynamic";

  if (value.type === "Literal" && typeof value.value === "string") {
    return classifyString(value.value);
  }

  if (value.type !== "JSXExpressionContainer") return "dynamic";
  return classifyExpression(value.expression);
}

function isRawLinkElement(node) {
  const name = jsxIdentifierName(node.name);
  return name ? RAW_LINK_COMPONENTS.has(name) : false;
}

function memberPropertyName(node) {
  if (!node.computed && node.property.type === "Identifier") {
    return node.property.name;
  }

  if (
    node.computed &&
    node.property.type === "Literal" &&
    typeof node.property.value === "string"
  ) {
    return node.property.value;
  }

  return undefined;
}

function isIdentifier(node, name) {
  const expression = unwrapExpression(node);
  return expression?.type === "Identifier" && expression.name === name;
}

function isLocationObject(node) {
  const expression = unwrapExpression(node);
  if (!expression) return false;
  if (isIdentifier(expression, "location")) return true;
  if (expression.type !== "MemberExpression") return false;

  return (
    (isIdentifier(expression.object, "window") ||
      isIdentifier(expression.object, "document")) &&
    memberPropertyName(expression) === "location"
  );
}

function isWindowOpen(node) {
  const expression = unwrapExpression(node);
  return (
    expression?.type === "MemberExpression" &&
    isIdentifier(expression.object, "window") &&
    memberPropertyName(expression) === "open"
  );
}

function isLocationNavigationCall(node) {
  const callee = unwrapExpression(node.callee);
  if (callee?.type !== "MemberExpression") return false;

  const propertyName = memberPropertyName(callee);
  return (
    (propertyName === "assign" || propertyName === "replace") &&
    isLocationObject(callee.object)
  );
}

function isLocationNavigationAssignment(node) {
  const left = unwrapExpression(node.left);
  if (!left) return false;
  if (isLocationObject(left)) return true;
  if (left.type !== "MemberExpression") return false;

  return memberPropertyName(left) === "href" && isLocationObject(left.object);
}

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow raw internal navigation in app and shared component code.",
    },
    messages: {
      ambiguousRawNavigation:
        "Dynamic raw href is ambiguous. Use the router Link for internal navigation, or add data-allow-raw-navigation when the value is guaranteed to be external.",
      rawImperativeNavigation:
        "Use router navigation for in-app destinations. Imperative browser navigation is only allowed for a statically external destination.",
      rawInternalNavigation:
        "Use the router Link for internal navigation. Raw href is reserved for external URLs, protocols, hashes, and downloads.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (isExempt(filename)) return {};

    return {
      JSXOpeningElement(node) {
        if (!isRawLinkElement(node) || hasAttribute(node, "download")) return;

        const hrefAttribute = findAttribute(node, "href");
        if (!hrefAttribute) return;

        const classification = classifyJsxAttributeValue(hrefAttribute.value);
        if (classification === "external") return;

        if (
          classification === "dynamic" &&
          hasAttribute(node, "data-allow-raw-navigation")
        ) {
          return;
        }

        context.report({
          node: hrefAttribute,
          messageId:
            classification === "internal"
              ? "rawInternalNavigation"
              : "ambiguousRawNavigation",
        });
      },
      CallExpression(node) {
        if (!isLocationNavigationCall(node) && !isWindowOpen(node.callee)) {
          return;
        }

        if (classifyExpression(node.arguments[0]) === "external") return;

        context.report({ node, messageId: "rawImperativeNavigation" });
      },
      AssignmentExpression(node) {
        if (!isLocationNavigationAssignment(node)) return;
        if (classifyExpression(node.right) === "external") return;

        context.report({ node, messageId: "rawImperativeNavigation" });
      },
    };
  },
};
