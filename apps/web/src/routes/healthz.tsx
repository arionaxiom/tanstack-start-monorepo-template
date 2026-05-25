/**
 * Liveness probe endpoint.
 *
 * This route exists primarily so `apps/web/scripts/dev-with-warmup.mjs`
 * can detect when the SSR pipeline is healthy, separate from any product
 * routing. It must:
 *
 *  - Return HTTP 200 unconditionally (no `beforeLoad`, no `loader`, no
 *    auth guard, no redirect).
 *  - Still exercise the SSR pipeline — so if Lingui catalogs haven't
 *    compiled yet, or the Cloudflare Workers SSR bundle is broken, the
 *    request 5xx's and the dev-warmup wrapper correctly restarts.
 *  - Be decoupled from product routing — so future role / auth / onboarding
 *    changes to `/` don't break the warmup probe.
 *
 * Do not add loaders, data dependencies, or product chrome here.
 * Keeping this route trivial is the point: the probe passes only when
 * the SSR pipeline itself is healthy, independent of feature logic.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/healthz")({
  component: HealthzPage,
});

function HealthzPage() {
  return <pre data-testid="healthz">ok</pre>;
}
