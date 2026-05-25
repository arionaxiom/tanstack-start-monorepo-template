import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Tailwind-merge extended with our custom typography utilities.
 * The utilities are registered in `@theme` as `--text-*` tokens (shared-styles.css),
 * making them first-class Tailwind v4 utilities. However, tailwind-merge still needs
 * to know they belong to the `font-size` group (not `text-color`) so it does not drop
 * them when paired with classes like `text-foreground`.
 */
// `text-mono` is treated as a font-family-level utility (it sets
// font-family + tabular-nums + a default size in shared-styles.css), not a
// pure size token. Putting it in its own custom class group keeps it from
// conflicting with `text-xs` / `text-sm` etc. — so `text-mono text-xs`
// survives merge and renders mono at 12px instead of dropping the family.
// extendTailwindMerge's typed `extend` only accepts existing group IDs,
// so we cast to opt into a custom group name.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Custom typography utilities are font-size class. They must compose
      // with text-color classes (`text-foreground` etc.) without being
      // dropped by tailwind-merge.
      "font-size": [
        "text-display-lg",
        "text-display",
        "text-headline",
        "text-title",
        "text-body",
        "text-small",
        "text-kicker",
      ],
      "font-mono-treatment": ["text-mono"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
