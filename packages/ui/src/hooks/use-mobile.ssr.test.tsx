import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useIsMobile } from "./use-mobile.js";

function MobileSnapshot() {
  return <span>{useIsMobile() ? "mobile" : "desktop"}</span>;
}

afterEach(() => vi.unstubAllGlobals());

describe("useIsMobile", () => {
  it("uses a stable desktop snapshot during server rendering", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));

    expect(renderToString(<MobileSnapshot />)).toContain("desktop");
  });
});
