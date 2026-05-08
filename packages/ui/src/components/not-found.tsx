import { Trans } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";

import { Button, buttonVariants } from "@__APP_NAME__/ui/elements/button";
import { cn } from "@__APP_NAME__/ui/utils/cn";

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className="space-y-2 p-2">
      <div className="text-muted-foreground">
        {children || (
          <p>
            <Trans>The page you are looking for does not exist.</Trans>
          </p>
        )}
      </div>
      <p className="flex flex-wrap items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => window.history.back()}
          data-testid="go-back-button"
        >
          <Trans>Go back</Trans>
        </Button>
        <Link
          to="/"
          data-testid="start-over-link"
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
        >
          <Trans>Start Over</Trans>
        </Link>
      </p>
    </div>
  );
}

NotFound.displayName = "NotFound";
