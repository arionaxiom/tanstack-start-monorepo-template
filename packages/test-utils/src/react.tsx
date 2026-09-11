import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import type { ReactNode } from "react";
import {
  type ComponentRenderOptions,
  type RenderHookOptions,
  type RenderHookResult,
  type RenderResult,
  renderHook as renderBrowserHook,
  render as renderComponent,
} from "vitest-browser-react";

function TestProviders({ children }: { children: ReactNode }) {
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}

export function render(
  ui: ReactNode,
  options?: Omit<ComponentRenderOptions, "wrapper">
): Promise<RenderResult> {
  return renderComponent(ui, { ...options, wrapper: TestProviders });
}

export function renderHook<Props, Result>(
  hook: (props?: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, "wrapper">
): Promise<RenderHookResult<Result, Props>> {
  return renderBrowserHook(hook, { ...options, wrapper: TestProviders });
}
