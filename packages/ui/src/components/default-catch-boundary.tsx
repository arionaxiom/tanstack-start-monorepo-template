import { Trans } from "@lingui/react/macro";
import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";

import { Button } from "@__APP_NAME__/ui/elements/button";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <ErrorComponent error={error} />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => {
            router.invalidate();
          }}
        >
          <Trans>Try Again</Trans>
        </Button>
        {isRoot ? (
          <Link
            to="/"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-transparent px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Trans>Home</Trans>
          </Link>
        ) : (
          <Link
            to="/"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-transparent px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
          >
            <Trans>Go Back</Trans>
          </Link>
        )}
      </div>
    </div>
  );
}
