import { BriefcaseIcon, PackageIcon, TrendingUpIcon } from "lucide-react";
import { type ComponentType, type SVGAttributes } from "react";

import { SectionHeader } from "@__APP_NAME__/ui/components/section-header";

interface ModuleAccentConfig {
  key: "stock" | "leadgen" | "jobs";
  name: string;
  Icon: ComponentType<
    SVGAttributes<SVGElement> & { className?: string; strokeWidth?: number }
  >;
  kicker: string;
  emptyHeadline: string;
  emptyDesc: string;
}

const MODULES: ModuleAccentConfig[] = [
  {
    key: "stock",
    name: "Stock",
    Icon: PackageIcon,
    kicker: "STOCK · DASHBOARD",
    emptyHeadline: "No inventory items yet",
    emptyDesc: "Add your first item to start tracking stock levels.",
  },
  {
    key: "leadgen",
    name: "Lead Gen",
    Icon: TrendingUpIcon,
    kicker: "LEAD GEN · DASHBOARD",
    emptyHeadline: "No leads captured yet",
    emptyDesc: "Connect a source to start generating leads automatically.",
  },
  {
    key: "jobs",
    name: "Jobs",
    Icon: BriefcaseIcon,
    kicker: "JOBS · DASHBOARD",
    emptyHeadline: "No job postings yet",
    emptyDesc: "Create your first listing and start attracting candidates.",
  },
];

export function ModuleAccents() {
  return (
    <section className="space-y-8">
      <SectionHeader
        kicker="MODULE ACCENTS"
        title="Module accent tokens"
        description="Each module sets --accent-current via data-module-accent. Kicker, sidebar pill, and empty state inherit the color through CSS."
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {MODULES.map(
          ({ key, name, Icon, kicker, emptyHeadline, emptyDesc }) => (
            <div
              key={key}
              data-module-accent={key}
              className="overflow-hidden rounded-lg border border-border bg-card"
            >
              {/* Module identity strip */}
              <div className="space-y-3 border-b border-border p-4">
                {/* Icon + name */}
                <div className="flex items-center gap-2">
                  <Icon
                    className="module-accent-kicker size-5"
                    strokeWidth={1.5}
                  />
                  <span className="text-title font-semibold text-foreground">
                    {name}
                  </span>
                </div>

                {/* Dashboard kicker */}
                <div className="module-accent-kicker text-kicker font-medium uppercase">
                  {kicker}
                </div>
              </div>

              {/* Sidebar pill mock */}
              <div className="border-b border-border px-3 py-3">
                <div className="mb-2 text-mono text-xs text-muted-foreground">
                  sidebar pill
                </div>
                <div className="module-accent-border-l flex items-center gap-2 rounded-sm bg-muted px-2 py-1.5">
                  <Icon
                    className="module-accent-kicker size-4 shrink-0"
                    strokeWidth={1.5}
                  />
                  <span className="text-small text-foreground">{name}</span>
                </div>
              </div>

              {/* Empty state headline mock */}
              <div className="p-4">
                <div className="mb-2 text-mono text-xs text-muted-foreground">
                  empty state
                </div>
                <div className="rounded-md border border-dashed border-border p-4 text-center">
                  <Icon
                    className="module-accent-kicker mx-auto mb-2 size-6"
                    strokeWidth={1.5}
                  />
                  <div className="mb-1 text-title font-semibold text-foreground">
                    {emptyHeadline}
                  </div>
                  <p className="text-small text-muted-foreground">
                    {emptyDesc}
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
