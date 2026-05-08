import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Button } from "@__APP_NAME__/ui/elements/button";

const getCurrentServerTime = createServerFn({
  method: "GET",
}).handler(async () => await new Date().toISOString());

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await getCurrentServerTime(),
});

function Home() {
  const originalTime = Route.useLoaderData();
  const [time, setTime] = useState(originalTime);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-8">
        <h1 className="mb-4 text-2xl font-bold text-card-foreground">
          Start Server Functions - Server Time
        </h1>
        <div className="flex flex-col gap-2">
          <div className="text-xl text-foreground">
            Starting Time: {originalTime}
          </div>
          <div className="text-xl text-foreground">Current Time: {time}</div>
          <Button onClick={async () => setTime(await getCurrentServerTime())}>
            <Trans>Refresh</Trans>
          </Button>
        </div>
      </div>
    </div>
  );
}
