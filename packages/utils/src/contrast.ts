/**
 * Compute WCAG 2.1 contrast ratio between two OKLCH color strings.
 *
 * Input format: "L C H" or "L C H / A" (Tailwind v4 / oklch() syntax).
 * Examples: "0.42 0.072 174", "0.20 0.020 56 / 0.6"
 */

type Oklch = { l: number; c: number; h: number; a: number };

function parseOklch(input: string): Oklch {
  const [body, alpha] = input.split("/").map((s) => s.trim());
  const parts = body!.split(/\s+/).map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(`Invalid OKLCH string: "${input}"`);
  }
  const [l, c, h] = parts as [number, number, number];
  return { l, c, h, a: alpha ? Number(alpha) : 1 };
}

function oklchToLinearSrgb({ l, c, h }: Oklch): [number, number, number] {
  // OKLCH → OKLab
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  // OKLab → linear sRGB (Björn Ottosson, https://bottosson.github.io/posts/oklab/)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const lc = l_ * l_ * l_;
  const mc = m_ * m_ * m_;
  const sc = s_ * s_ * s_;

  const r = 4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc;
  const g = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc;
  const bl = -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc;
  return [clamp01(r), clamp01(g), clamp01(bl)];
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  // r/g/b are linear-sRGB; relative luminance = 0.2126R + 0.7152G + 0.0722B
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Returns the WCAG 2.1 contrast ratio between two OKLCH color strings.
 * Result is in [1.0, 21.0]. AA passes at >= 4.5 for body text, >= 3.0 for large/UI.
 */
export function oklchContrast(fg: string, bg: string): number {
  const lFg = relativeLuminance(oklchToLinearSrgb(parseOklch(fg)));
  const lBg = relativeLuminance(oklchToLinearSrgb(parseOklch(bg)));
  const lighter = Math.max(lFg, lBg);
  const darker = Math.min(lFg, lBg);
  return (lighter + 0.05) / (darker + 0.05);
}
