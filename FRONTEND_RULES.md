# Frontend Rules

This document defines how frontend code must be structured in this template. **Read this before doing any frontend work.**

---

## Theme Token Rules (R1–R7)

The codebase uses a three-tier OKLCH token system defined in `packages/tailwind-config/shared-styles.css`:

| Tier                | Purpose                              | Location                      | Example                                  |
| ------------------- | ------------------------------------ | ----------------------------- | ---------------------------------------- |
| 1 — Raw palette     | Abstract OKLCH color channels        | `:root` CSS custom properties | `--ink-700: 0.28 0.018 58`               |
| 2 — Semantic tokens | Role-named aliases of tier-1         | `:root` and `.dark` selectors | `--primary`, `--foreground`              |
| 3 — Tailwind bridge | `oklch(var(--semantic))` in `@theme` | `@theme {}` block             | `--color-primary: oklch(var(--primary))` |

**R1 — Token consumption.** Components MUST use Tailwind semantic color classes (`bg-primary`, `text-muted-foreground`, etc.). Never reference CSS custom properties directly in className, never use raw color values (`#hex`, `rgb()`, `oklch()` literals), never use default Tailwind palette colors (`text-gray-900`, `bg-blue-500`).

**R2 — Color function consistency.** When arbitrary Tailwind values must reference tier-2 tokens, use `oklch(var(--token))` — never `hsl(var(--token))`. The palette is defined in OKLCH; mixing color spaces causes perceptual inconsistencies. Enforced at test time by `packages/ui/src/theme-compliance.test.ts`.

**R3 — Dark mode overrides.** Use `dark:` Tailwind prefix only for adjustments that can't be expressed via tier-2 token swaps alone (typically opacity modifiers like `dark:bg-destructive/60`).

**R4 — New token workflow.** To add a new design token: (1) add a tier-1 raw value if no existing palette color fits, (2) add a tier-2 semantic name in both `:root` and `.dark`, (3) promote to tier-3 in `@theme {}`, (4) consume via Tailwind class.

**R5 — Variant styling.** Components with visual variants (size, color, state) MUST use CVA (`class-variance-authority`). Variant class strings reference only semantic tokens. Define the `cva()` call in the same file as the component.

**R6 — Class composition.** Always use `cn()` (from `@__APP_NAME__/ui/utils`) to merge class names. Never use string concatenation or template literals.

**R7 — No default Tailwind palette.** Never use Tailwind's built-in color palette (`red-500`, `slate-200`, etc.) in component code. All colors flow through the semantic token system. Enforced at test time by `packages/ui/src/theme-compliance.test.ts`.

---

## Test-IDs and Playwright (R8–R13)

**Naming pattern: `{scope}-{element}[-{qualifier}]`**

| Scope        | Element                          | Qualifier                   | Example                                    |
| ------------ | -------------------------------- | --------------------------- | ------------------------------------------ |
| Feature area | Interactive element type or role | Optional dynamic identifier | `sign-in-email`, `nav-home`, `entity-edit` |

**R8 — Mandatory `data-testid` elements:**

| Element type                                      | Required? |
| ------------------------------------------------- | --------- |
| Form inputs (`<Input>`, `<Textarea>`, `<Select>`) | YES       |
| Submit buttons                                    | YES       |
| Navigation links/tabs                             | YES       |
| Action buttons (delete, edit, approve, toggle)    | YES       |
| Modal/dialog containers                           | YES       |
| Modal close buttons                               | YES       |
| Error message containers                          | YES       |
| Dropdown triggers                                 | YES       |
| Display-only text, structural wrappers, icons     | NO        |

This is enforced by the `template/require-testid-on-action-elements` ESLint rule (see `packages/eslint-config/rules/require-testid-on-action-elements.cjs`).

**R9 — Use `testId()` for dynamic IDs.** When the test ID includes a runtime value (slug, key), use the `testId()` utility from `@__APP_NAME__/ui/utils`. For static IDs on form fields, inline `data-testid="..."` strings are acceptable.

**R10 — Kebab-case only.** All `data-testid` values use kebab-case. No camelCase, no underscores.

**R11 — Form component passthrough.** All `packages/ui/src/form/elements/*` components MUST accept and forward `data-testid` to their underlying DOM element.

**R12 — Selector priority.** In Playwright interactions, prefer selectors in this order: (1) `[data-testid="..."]`; (2) `role=...` with `name=...`; (3) CSS class selectors (last resort).

**R13 — Playwright is mandatory for frontend PRs.** Every PR touching `apps/web/**`, `packages/ui/**`, or `packages/react-hooks/**` MUST include a golden-path Playwright verification, at least one edge case, two viewports for layout changes, and zero console errors after hydration.

---

## Color Enforcement (R14–R15)

**R14 — Lint elements.** `packages/ui/eslint.config.mjs` must NOT exempt element files. Elements must pass the same lint rules as everything else.

**R14a — Use `ui/elements` for interactive primitives.** High-level code (`apps/web/src`, `packages/ui/src/components`) must never use raw HTML interactive elements (`<button>`, `<input>`, `<textarea>`, `<select>`, `<dialog>`, etc.) — always compose from `@__APP_NAME__/ui/elements/*` instead. Direct `@base-ui/react` imports are forbidden outside `packages/ui/src/elements/`. Enforced at test time by `packages/ui/src/elements-usage-compliance.test.ts`.

**R15 — Banned Tailwind color patterns.** Components must not use raw Tailwind palette color classes (`red-500`, `blue-200`, etc.) or `hsl(var(--`)) references. Enforced by `packages/ui/src/theme-compliance.test.ts`.

---

## Loading States (R16–R18)

**R16 — Route pending components.** Every route with a data loader MUST set `pendingMs: 200` (show loading after 200ms to avoid flicker on fast navigations). Routes should set `pendingComponent` with a skeleton that mirrors the page layout.

**R17 — Skeleton over spinner.** Use `<Skeleton>` for content areas (preserves layout shape). Use `<Spinner>` only for inline indicators (button loading state). Never show a full-page centered spinner. Enforced at test time by `packages/ui/src/theme-compliance.test.ts` (bans `animate-pulse`+`bg-muted` and raw `animate-spin` outside `elements/`).

**R18 — Loading state consistency.** All skeleton compositions must use the same `animate-pulse` animation from `<Skeleton>`. No custom loading animations. Enforced at test time by `packages/ui/src/theme-compliance.test.ts`.

---

## Animation Conventions (R19–R21)

**R19 — Animation approach.** Use Tailwind transition utilities and `tw-animate-css` keyframes only. Do not add Framer Motion or any JS animation library. (Enforced by ESLint banned-imports.)

**R20 — Base UI state transitions.** All Base UI overlay components (Dialog, Sheet, Popover, DropdownMenu, Tooltip) MUST use the standardized enter/exit pattern:

```text
data-open:animate-in data-closed:animate-out
fade-in-0 fade-out-0 zoom-in-95 zoom-out-95
```

With directional slide variants for side-anchored components (`slide-in-from-top-2`, etc.).

**R21 — No page transitions.** Route changes render instantly. No enter/exit animations on route components.

---

## Client State Management (R22)

**R22 — Defaults and escalation.** Default to TanStack Query + `useState` + React Context. Reach for Zustand only when you have **client-only** state that meets at least one of:

- Frequent updates where multiple components subscribe to different slices
- State that needs to be read outside the React tree (`store.getState()`)
- Complex derived state where Context re-renders are measurably expensive

When using Zustand: one store per domain concern, never a single global app store. Zustand stores must not duplicate server state that belongs in TanStack Query.

**Banned (enforced by ESLint):** Redux, `@reduxjs/toolkit`, MobX.

---

## Asset Handling (R23–R24)

**R23 — Lazy loading for images.** All `<img>` tags MUST include `loading="lazy"` except above-the-fold content (e.g., logo).

**R24 — No image optimization pipeline.** Do not add `sharp`, `next/image`, or Vite image optimization plugins out of the box. Cloudflare Workers Image Resizing is an opt-in concern.

---

## Performance (R25–R27)

**R25 — Route-level code splitting is automatic.** TanStack Start + Vite handles this. Do not add `React.lazy` for route components.

**R26 — Lazy load heavy non-route components.** Components over ~50KB (chart libraries, rich text editors) MUST be loaded via `React.lazy` with a `<Suspense>` fallback.

**R27 — No barrel re-exports from `packages/ui`.** Each import path resolves to a single file. Never create an `index.ts` that re-exports all elements — it defeats tree-shaking. Enforced at test time by `packages/ui/src/theme-compliance.test.ts`.

---

## Internationalization (R28–R30)

**R28 — DirectionProvider wiring.** Wire `DirectionProvider` (from `@__APP_NAME__/ui/elements/direction`) in the root layout before adding any RTL locale. Set `<html dir={...}>` based on the active locale.

**R29 — Plural form configuration.** Update each locale's `messages.po` header with the appropriate `Plural-Forms` value. Without this header, Lingui's plural extraction is undefined.

**R30 — Dynamic locale loading.** The dynamic import pattern for locale messages must be guarded against arbitrary locale injection. Validate the locale against the `LOCALES` constant before dynamic import.

---

## Route Composition (R31)

**R31 — Route files are composition only.** Route files in `apps/web/src/routes/` wire up loaders, components, and error boundaries. They are the place where components from `packages/ui`, logic from `packages/react-hooks`, and utilities from other packages come together. No logic lives in route files.

**ALLOWED in route files:**

- `createFileRoute()` with `loader`, `component`, `errorComponent`, `pendingComponent`, `beforeLoad`
- A component function that imports and composes from `@__APP_NAME__/*` packages
- Simple destructuring of loader data
- Short inline callbacks (< 3 lines)

**NOT ALLOWED in route files:**

- Inline component definitions beyond simple wrappers
- Direct API calls (use TanStack Query)
- Business logic
- More than ~50 lines per route file
