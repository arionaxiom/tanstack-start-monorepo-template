import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import {
  type RenderHookResult,
  type RenderOptions,
  type RenderResult,
  render,
  renderHook,
} from "@testing-library/react";
import type { ReactElement } from "react";

function TestProviders({ children }: { children: React.ReactNode }) {
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): RenderResult {
  return render(ui, { wrapper: TestProviders, ...options });
}

function customRenderHook<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: Omit<Parameters<typeof renderHook>[1], "wrapper"> & {
    initialProps?: TProps;
  }
): RenderHookResult<TResult, TProps> {
  return renderHook(hook, { wrapper: TestProviders, ...options });
}

export { customRender as render, customRenderHook as renderHook };
export { fireEvent, screen, act } from "@testing-library/react";
