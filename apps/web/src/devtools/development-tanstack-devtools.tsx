import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

const TANSTACK_DEVTOOLS_STATE_KEY = "tanstack_devtools_state";
const TANSTACK_DEVTOOLS_SETTINGS_KEY = "tanstack_devtools_settings";

export const developmentTanStackDevtoolsConfig = {
  defaultOpen: false,
  triggerHidden: true,
  openHotkey: ["Control", "~"] as Array<"Control" | "~">,
  position: "bottom-right",
} as const;

export function resetTanStackDevtoolsPersistedOpenState(
  storage: Pick<Storage, "getItem" | "setItem">
): void {
  resetJsonStorageValue(storage, TANSTACK_DEVTOOLS_STATE_KEY, (value) => ({
    ...value,
    persistOpen: false,
  }));
  resetJsonStorageValue(storage, TANSTACK_DEVTOOLS_SETTINGS_KEY, (value) => ({
    ...value,
    defaultOpen: false,
    triggerHidden: true,
    openHotkey: developmentTanStackDevtoolsConfig.openHotkey,
  }));
}

if (typeof window !== "undefined") {
  resetTanStackDevtoolsPersistedOpenState(window.localStorage);
}

export function DevelopmentTanStackDevtools() {
  return (
    <TanStackDevtools
      config={developmentTanStackDevtoolsConfig}
      plugins={[
        {
          name: "Tanstack Router",
          render: <TanStackRouterDevtoolsPanel />,
        },
      ]}
    />
  );
}

function resetJsonStorageValue(
  storage: Pick<Storage, "getItem" | "setItem">,
  key: string,
  update: (value: Record<string, unknown>) => Record<string, unknown>
): void {
  try {
    const rawValue = storage.getItem(key);
    const parsed =
      rawValue === null
        ? {}
        : (JSON.parse(rawValue) as Record<string, unknown>);
    storage.setItem(key, JSON.stringify(update(parsed)));
  } catch {
    storage.setItem(key, JSON.stringify(update({})));
  }
}
