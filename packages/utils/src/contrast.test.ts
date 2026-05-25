import { describe, expect, it } from "vitest";

import { oklchContrast } from "./contrast.js";

describe("oklchContrast", () => {
  it("white on black is 21.0", () => {
    expect(oklchContrast("1 0 0", "0 0 0")).toBeCloseTo(21, 0);
  });

  it("identical colors return 1.0", () => {
    expect(oklchContrast("0.5 0.1 180", "0.5 0.1 180")).toBeCloseTo(1, 1);
  });

  it("ink-700 on ink-50 (light body text) clears AA", () => {
    expect(oklchContrast("0.28 0.018 58", "0.99 0.004 85")).toBeGreaterThan(
      4.5
    );
  });

  it("brand-400 (dark-mode primary) on ink-900 clears AA", () => {
    expect(oklchContrast("0.60 0.080 175", "0.14 0.014 55")).toBeGreaterThan(
      4.5
    );
  });
});
