import {
  AlertCircleIcon,
  BotIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  MessageSquareIcon,
  PackageIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  UserIcon,
  XCircleIcon,
  ZapIcon,
} from "lucide-react";

import { SectionHeader } from "@__APP_NAME__/ui/components/section-header";
import { StatusBadge } from "@__APP_NAME__/ui/components/status-badge";
import { Surface } from "@__APP_NAME__/ui/components/surface";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@__APP_NAME__/ui/elements/alert";
import { Button } from "@__APP_NAME__/ui/elements/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@__APP_NAME__/ui/elements/empty";
import { Skeleton } from "@__APP_NAME__/ui/elements/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@__APP_NAME__/ui/elements/tabs";
import { cn } from "@__APP_NAME__/ui/utils/cn";

function SnapshotShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 text-kicker font-medium text-muted-foreground uppercase">
        {label}
      </div>
      <Surface
        elevation="card"
        bordered
        radius="lg"
        className="overflow-hidden p-4"
      >
        {children}
      </Surface>
    </div>
  );
}

/* ─── Chat snapshots ─────────────────────────────────────── */

function EmptyChatSnapshot() {
  return (
    <div className="flex h-72 flex-col">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <MessageSquareIcon
          className="size-4 text-muted-foreground"
          strokeWidth={1.5}
        />
        <span className="text-title font-semibold text-foreground">
          Conversation
        </span>
      </div>
      <div className="flex-1">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BotIcon strokeWidth={1.5} />
            </EmptyMedia>
            <EmptyTitle>No messages yet</EmptyTitle>
            <EmptyDescription>
              Start the conversation — ask about inventory, suppliers, or stock
              levels.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
      <div className="flex gap-2 border-t border-border pt-3">
        <div className="flex h-9 flex-1 items-center rounded-md border border-border bg-background px-3 text-small text-subtle-foreground">
          Ask anything…
        </div>
        <Button variant="default" size="sm">
          Send
        </Button>
      </div>
    </div>
  );
}

function FullChatSnapshot() {
  const messages = [
    { role: "user" as const, content: "How much jasmine rice do we have?" },
    {
      role: "ai" as const,
      content:
        "You currently have 48 kg of jasmine rice. Based on your average usage of 6 kg/day, that's about 8 days of stock.",
    },
    {
      role: "user" as const,
      content: "Create a reorder proposal for next week.",
    },
  ];

  return (
    <div className="flex h-80 flex-col">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <MessageSquareIcon
          className="size-4 text-muted-foreground"
          strokeWidth={1.5}
        />
        <span className="text-title font-semibold text-foreground">
          Conversation
        </span>
        <StatusBadge variant="agent" className="ml-auto">
          <BotIcon className="size-3" />
          AI active
        </StatusBadge>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={`${msg.role}:${msg.content}`}
            className={cn(
              "flex gap-2",
              msg.role === "user" && "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full",
                msg.role === "ai" ? "bg-primary/10" : "bg-muted"
              )}
            >
              {msg.role === "ai" ? (
                <BotIcon className="size-3.5 text-primary" strokeWidth={1.5} />
              ) : (
                <UserIcon
                  className="size-3.5 text-foreground"
                  strokeWidth={1.5}
                />
              )}
            </div>
            <div
              className={cn(
                "max-w-[75%] rounded-lg px-3 py-2 text-small",
                msg.role === "ai"
                  ? "bg-muted text-foreground"
                  : "bg-primary text-primary-foreground"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {/* Collapsed agent event stream */}
        <div className="flex items-center gap-2 pl-8 text-xs text-muted-foreground">
          <ChevronDownIcon className="size-3" strokeWidth={1.5} />
          <span>3 tool calls — expand</span>
        </div>
      </div>
      <div className="mt-3 flex gap-2 border-t border-border pt-3">
        <div className="flex h-9 flex-1 items-center rounded-md border border-border bg-background px-3 text-small text-subtle-foreground">
          Ask anything…
        </div>
        <Button variant="default" size="sm">
          Send
        </Button>
      </div>
    </div>
  );
}

/* ─── Proposal card snapshots ────────────────────────────── */

type ProposalLineItem = {
  name: string;
  qty: string;
  status: "ok" | "fail" | "warn";
};

function ProposalCard({
  title,
  items,
  variant,
}: {
  title: string;
  items: ProposalLineItem[];
  variant: "success" | "mixed" | "attention";
}) {
  const borderClass =
    variant === "attention"
      ? "border-l-4 border-l-spotlight"
      : "border border-border";

  return (
    <div className={cn("space-y-3 rounded-lg bg-card p-4", borderClass)}>
      <div className="flex items-center gap-2">
        {variant === "attention" ? (
          <ZapIcon
            className="size-4 text-spotlight-emphasis"
            strokeWidth={1.5}
          />
        ) : (
          <CheckCircle2Icon
            className="size-4 text-success-emphasis"
            strokeWidth={1.5}
          />
        )}
        <span className="text-title font-semibold text-foreground">
          {title}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-small">
            {item.status === "ok" && (
              <CheckCircle2Icon
                className="size-3.5 shrink-0 text-success-emphasis"
                strokeWidth={1.5}
              />
            )}
            {item.status === "fail" && (
              <XCircleIcon
                className="size-3.5 shrink-0 text-destructive-emphasis"
                strokeWidth={1.5}
              />
            )}
            {item.status === "warn" && (
              <AlertCircleIcon
                className="size-3.5 shrink-0 text-warning-emphasis"
                strokeWidth={1.5}
              />
            )}
            <span className="flex-1 text-foreground">{item.name}</span>
            <span className="text-mono text-muted-foreground">{item.qty}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="default" size="sm">
          Apply
        </Button>
        <Button variant="secondary" size="sm">
          Review
        </Button>
      </div>
    </div>
  );
}

/* ─── KPI widget snapshots ───────────────────────────────── */

function KpiCard({
  label,
  value,
  delta,
  state,
}: {
  label: string;
  value?: string;
  delta?: string;
  state: "loaded" | "loading" | "error" | "empty";
}) {
  return (
    <div className="min-w-0 flex-1 space-y-2 rounded-lg border border-border bg-card p-4">
      <div className="text-kicker font-medium text-muted-foreground uppercase">
        {label}
      </div>
      {state === "loading" && (
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      )}
      {state === "loaded" && (
        <>
          <div className="text-display font-bold text-foreground tabular-nums">
            {value}
          </div>
          <div className="flex items-center gap-1 text-small text-success-emphasis">
            <TrendingUpIcon className="size-3" strokeWidth={1.5} />
            {delta}
          </div>
        </>
      )}
      {state === "error" && (
        <div className="flex items-center gap-1 text-small text-destructive-emphasis">
          <AlertCircleIcon className="size-3.5" strokeWidth={1.5} />
          Failed to load
        </div>
      )}
      {state === "empty" && (
        <div className="text-small text-muted-foreground">No data yet</div>
      )}
    </div>
  );
}

/* ─── Entity drawer snapshot ────────────────────────────── */

function EntityDrawerSnapshot() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
          <PackageIcon className="size-5 text-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <div className="text-title font-semibold text-foreground">
            Jasmine Rice
          </div>
          <div className="text-small text-muted-foreground">
            SKU: JAR-001 · Stock
          </div>
        </div>
        <StatusBadge variant="warning" className="ml-auto">
          Low stock
        </StatusBadge>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="references">References</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="space-y-2 text-small">
            <div className="flex justify-between border-b border-border py-1">
              <span className="text-muted-foreground">Current stock</span>
              <span className="text-mono text-foreground">48 kg</span>
            </div>
            <div className="flex justify-between border-b border-border py-1">
              <span className="text-muted-foreground">Minimum level</span>
              <span className="text-mono text-foreground">50 kg</span>
            </div>
            <div className="flex justify-between border-b border-border py-1">
              <span className="text-muted-foreground">Supplier</span>
              <span className="text-foreground">Thai Rice Co.</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Last updated</span>
              <span className="text-foreground">Today 09:15</span>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="history">
          <p className="text-body text-muted-foreground">
            History timeline renders here.
          </p>
        </TabsContent>
        <TabsContent value="references">
          <p className="text-body text-muted-foreground">
            Referenced in 3 proposals.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function SurfaceSnapshots() {
  return (
    <section className="space-y-10">
      <SectionHeader
        kicker="SURFACES"
        title="Surface snapshots"
        description="Static composed examples — the most valuable for visual review. No live network."
      />

      {/* Chat */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SnapshotShell label="CHAT · EMPTY">
          <EmptyChatSnapshot />
        </SnapshotShell>
        <SnapshotShell label="CHAT · WITH MESSAGES">
          <FullChatSnapshot />
        </SnapshotShell>
      </div>

      {/* Proposal cards */}
      <div>
        <div className="mb-3 text-kicker font-medium text-muted-foreground uppercase">
          PROPOSAL CARD VARIANTS
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ProposalCard
            title="Reorder proposal"
            variant="success"
            items={[
              { name: "Jasmine Rice", qty: "25 kg", status: "ok" },
              { name: "Palm Oil", qty: "10 L", status: "ok" },
              { name: "Fish Sauce", qty: "5 bottles", status: "ok" },
            ]}
          />
          <ProposalCard
            title="Reorder proposal"
            variant="mixed"
            items={[
              { name: "Jasmine Rice", qty: "25 kg", status: "ok" },
              { name: "Palm Oil", qty: "10 L", status: "fail" },
              { name: "Fish Sauce", qty: "5 bottles", status: "warn" },
            ]}
          />
          <ProposalCard
            title="Reorder proposal"
            variant="attention"
            items={[
              { name: "Jasmine Rice", qty: "50 kg", status: "warn" },
              { name: "Sugar", qty: "20 kg", status: "warn" },
              { name: "Salt", qty: "10 kg", status: "ok" },
            ]}
          />
        </div>
      </div>

      {/* KPI widgets */}
      <div>
        <div className="mb-3 text-kicker font-medium text-muted-foreground uppercase">
          KPI WIDGET · 4 STATES
        </div>
        <div className="flex flex-wrap gap-4">
          <KpiCard label="TOTAL ITEMS" state="loading" />
          <KpiCard
            label="STOCK VALUE"
            value="฿84,200"
            delta="+8.2% wow"
            state="loaded"
          />
          <KpiCard label="LOW STOCK" state="error" />
          <KpiCard label="ORDERS TODAY" state="empty" />
        </div>
      </div>

      {/* Entity drawer */}
      <SnapshotShell label="ENTITY DRAWER · OVERVIEW">
        <div className="max-w-sm">
          <EntityDrawerSnapshot />
        </div>
      </SnapshotShell>

      {/* Alert panel with proposal-pending */}
      <SnapshotShell label="ALERT · PROPOSAL PENDING">
        <Alert variant="spotlight">
          <ZapIcon strokeWidth={1.5} />
          <AlertTitle>Agent needs attention</AlertTitle>
          <AlertDescription>
            A reorder proposal for 3 items is ready for your review. Approving
            now will place orders before the supplier cutoff at 17:00.
          </AlertDescription>
          <div className="mt-3 flex gap-2">
            <Button variant="spotlight" size="sm">
              <CheckCircle2Icon strokeWidth={1.5} />
              Approve
            </Button>
            <Button variant="secondary" size="sm">
              <RefreshCwIcon strokeWidth={1.5} />
              Review
            </Button>
          </div>
        </Alert>
      </SnapshotShell>
    </section>
  );
}
