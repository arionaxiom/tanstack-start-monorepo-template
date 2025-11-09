import { Trans } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className="space-y-2 p-2">
      <div className="text-gray-600 dark:text-gray-400">
        {children || (
          <p>
            <Trans>The page you are looking for does not exist.</Trans>
          </p>
        )}
      </div>
      <p className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => window.history.back()}
          className="rounded bg-emerald-500 px-2 py-1 text-sm font-black text-white uppercase"
        >
          <Trans>Go back</Trans>
        </button>
        <Link
          to="/"
          className="rounded bg-cyan-600 px-2 py-1 text-sm font-black text-white uppercase"
        >
          <Trans>Start Over</Trans>
        </Link>
      </p>
    </div>
  );
}
