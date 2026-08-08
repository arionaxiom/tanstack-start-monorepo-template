"use client";

import { useLingui } from "@lingui/react/macro";
import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@__APP_NAME__/ui/elements/button";

const subscribeToHydration = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { t } = useLingui();
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot
  );
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = mounted
    ? isDark
      ? t`Switch to light theme`
      : t`Switch to dark theme`
    : t`Change theme`;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      data-testid="theme-toggle"
      disabled={!mounted}
      onClick={() => setTheme(nextTheme)}
    >
      {!mounted ? (
        <SunMoonIcon aria-hidden="true" />
      ) : isDark ? (
        <SunIcon aria-hidden="true" />
      ) : (
        <MoonIcon aria-hidden="true" />
      )}
    </Button>
  );
}
