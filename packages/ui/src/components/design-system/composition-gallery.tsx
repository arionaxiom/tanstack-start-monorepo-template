import { BellIcon, CheckIcon, PackageIcon, ZapIcon } from "lucide-react";

import { PageScaffold } from "@__APP_NAME__/ui/components/page-scaffold";
import { SectionHeader } from "@__APP_NAME__/ui/components/section-header";
import { StatusBadge } from "@__APP_NAME__/ui/components/status-badge";
import { Surface } from "@__APP_NAME__/ui/components/surface";
import { Button } from "@__APP_NAME__/ui/elements/button";
import { Separator } from "@__APP_NAME__/ui/elements/separator";

function Subsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-title font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

const ELEVATION_LABELS = [
  { elevation: "page" as const, label: "page" },
  { elevation: "section" as const, label: "section" },
  { elevation: "card" as const, label: "card" },
  { elevation: "elevated" as const, label: "elevated" },
  { elevation: "inverse" as const, label: "inverse" },
] as const;

export function CompositionGallery() {
  return (
    <section className="space-y-10">
      <SectionHeader
        kicker="COMPOSITION"
        title="Composed primitives"
        description="Platform-level compositions — Surface, SectionHeader, StatusBadge, PageScaffold."
      />

      {/* Surface elevations */}
      <Subsection title="Surface elevations">
        <div className="flex flex-wrap gap-3">
          {ELEVATION_LABELS.map(({ elevation, label }) => (
            <Surface
              key={elevation}
              elevation={elevation}
              bordered
              radius="lg"
              className="w-36 p-4 text-center"
            >
              <div className="text-mono text-small">{label}</div>
            </Surface>
          ))}
        </div>
      </Subsection>

      {/* SectionHeader variants */}
      <Subsection title="SectionHeader variants">
        <div className="space-y-6 rounded-lg border border-border p-4">
          <SectionHeader
            kicker="SECTION KICKER"
            title="With kicker + description + actions"
            description="Describes the section purpose. Appears below the headline."
            actions={
              <Button variant="secondary" size="sm">
                Action
              </Button>
            }
          />
          <Separator />
          <SectionHeader title="No kicker, no description" />
          <Separator />
          <SectionHeader
            kicker="STOCK"
            title="With kicker, no description"
            actions={
              <Button variant="ghost" size="icon">
                <BellIcon strokeWidth={1.5} />
              </Button>
            }
          />
          <Separator />
          <SectionHeader
            title="Page-size header"
            description="Used for top-of-page section titles with display text."
            size="page"
          />
        </div>
      </Subsection>

      {/* StatusBadge variants */}
      <Subsection title="StatusBadge variants">
        <div className="flex flex-wrap gap-2">
          {(
            [
              "default",
              "primary",
              "spotlight",
              "success",
              "warning",
              "destructive",
              "agent",
              "info",
              "outline",
            ] as const
          ).map((variant) => (
            <StatusBadge
              key={variant}
              variant={variant}
              icon={<CheckIcon className="size-3" />}
            >
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </StatusBadge>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusBadge
            variant="success"
            icon={<CheckIcon className="size-3" />}
          >
            Applied
          </StatusBadge>
          <StatusBadge variant="warning" icon={<ZapIcon className="size-3" />}>
            Low stock
          </StatusBadge>
          <StatusBadge
            variant="spotlight"
            icon={<ZapIcon className="size-3" />}
          >
            Pending review
          </StatusBadge>
          <StatusBadge
            variant="agent"
            icon={<PackageIcon className="size-3" />}
          >
            AI processing
          </StatusBadge>
        </div>
      </Subsection>

      {/* PageScaffold */}
      <Subsection title="PageScaffold">
        <div className="overflow-hidden rounded-lg border border-border">
          <PageScaffold
            kicker="STOCK"
            title="Inventory"
            description="Manage your inventory — items, suppliers, and stock levels."
            actions={
              <>
                <Button variant="secondary" size="sm">
                  Export
                </Button>
                <Button variant="default" size="sm">
                  <PackageIcon strokeWidth={1.5} />
                  Add item
                </Button>
              </>
            }
          >
            <p className="text-body text-muted-foreground">
              Page content renders here.
            </p>
          </PageScaffold>
        </div>
      </Subsection>
    </section>
  );
}
