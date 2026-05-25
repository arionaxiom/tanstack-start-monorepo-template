import eslintReact from "@eslint-react/eslint-plugin";

function warningsAsErrors(rules) {
  return Object.fromEntries(
    Object.entries(rules).map(([name, ruleConfig]) => {
      const severity = Array.isArray(ruleConfig) ? ruleConfig[0] : ruleConfig;
      if (severity !== "warn" && severity !== 1) return [name, ruleConfig];
      return [
        name,
        Array.isArray(ruleConfig) ? ["error", ...ruleConfig.slice(1)] : "error",
      ];
    })
  );
}

// The repo runs ESLint with --max-warnings 0, so React preset warnings are
// failures already. Normalize them to errors to make the policy explicit.
export const eslintReactRecommended = {
  ...eslintReact.configs["recommended-typescript"],
  rules: warningsAsErrors(eslintReact.configs["recommended-typescript"].rules),
};
