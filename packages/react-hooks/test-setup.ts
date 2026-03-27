import { i18n } from "@lingui/core";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";

import { messages } from "@__APP_NAME__/locale/locales/en";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Activate English locale for i18n in tests
i18n.loadAndActivate({ locale: "en", messages });

// Cleanup after each test
afterEach(() => {
  cleanup();
});
