import { i18n } from "@lingui/core";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, vi } from "vitest";

import { messages } from "@__APP_NAME__/locale/locales/en";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Activate English locale for i18n in tests
i18n.loadAndActivate({ locale: "en", messages });

// ─── JSDOM global mocks ──────────────────────────────────────────────────────
// These mock browser APIs that JSDOM doesn't implement but Radix UI and
// motion/react depend on.

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn().mockImplementation((_callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: "",
  thresholds: [],
  takeRecords: vi.fn().mockReturnValue([]),
}));

// @ts-expect-error - JSDOM doesn't support visualViewport
global.visualViewport = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  height: 800,
  width: 400,
};

global.HTMLElement.prototype.setPointerCapture = vi.fn();
global.HTMLElement.prototype.hasPointerCapture = vi.fn();

// Cleanup after each test
afterEach(() => {
  cleanup();
});

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  // @ts-expect-error - JSDOM doesn't support scrollIntoView
  delete Element.prototype.scrollIntoView;
});
