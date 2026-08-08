import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Surface } from "@__APP_NAME__/ui/components/surface";
import { Button } from "@__APP_NAME__/ui/elements/button";
import { toast } from "@__APP_NAME__/ui/elements/sonner";

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
      <Surface
        elevation="card"
        bordered
        radius="xl"
        className="w-full max-w-2xl p-8"
      >
        <h1 className="mb-4 text-2xl font-bold text-card-foreground">
          Start Server Functions - Server Time
        </h1>
        <div className="flex flex-col gap-2">
          <div className="text-xl text-foreground">
            Starting Time: {originalTime}
          </div>
          <div className="text-xl text-foreground">Current Time: {time}</div>
          <div className="flex gap-2">
            <Button
              data-testid="server-time-refresh"
              onClick={async () => setTime(await getCurrentServerTime())}
            >
              <Trans>Refresh</Trans>
            </Button>
            <Button
              variant="secondary"
              data-testid="toast-show"
              onClick={() =>
                toast.success("Toaster is wired up", {
                  description: "Sonner from @__APP_NAME__/ui/elements/sonner.",
                })
              }
            >
              <Trans>Show toast</Trans>
            </Button>
          </div>
        </div>
      </Surface>
    </div>
  );
}
