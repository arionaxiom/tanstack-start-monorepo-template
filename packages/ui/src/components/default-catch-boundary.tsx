import { Trans } from "@lingui/react/macro";
import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";

import { Button, buttonVariants } from "@__APP_NAME__/ui/elements/button";
import { cn } from "@__APP_NAME__/ui/utils/cn";

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
          data-testid="error-retry-button"
          onClick={() => {
            router.invalidate();
          }}
        >
          <Trans>Try Again</Trans>
        </Button>
        {isRoot ? (
          <Link
            to="/"
            data-testid="error-home-link"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            <Trans>Home</Trans>
          </Link>
        ) : (
          <Link
            to="/"
            data-testid="error-back-link"
            className={cn(buttonVariants({ variant: "secondary" }))}
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
