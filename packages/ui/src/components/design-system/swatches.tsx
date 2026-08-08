import { SectionHeader } from "@__APP_NAME__/ui/components/section-header";

interface TokenSwatch {
  name: string;
  value: string;
}

interface TokenGroup {
  name: string;
  tokens: TokenSwatch[];
}

const TOKEN_GROUPS: TokenGroup[] = [
  {
    name: "Ink scale",
    tokens: [
      { name: "ink-50", value: "0.99 0.004 85" },
      { name: "ink-100", value: "0.97 0.006 80" },
      { name: "ink-200", value: "0.93 0.008 75" },
      { name: "ink-300", value: "0.86 0.010 70" },
      { name: "ink-400", value: "0.68 0.012 65" },
      { name: "ink-450", value: "0.64 0.013 63" },
      { name: "ink-500", value: "0.52 0.014 62" },
      { name: "ink-600", value: "0.38 0.016 60" },
      { name: "ink-700", value: "0.28 0.018 58" },
      { name: "ink-800", value: "0.20 0.020 56" },
      { name: "ink-900", value: "0.14 0.014 55" },
      { name: "ink-950", value: "0.09 0.010 55" },
    ],
  },
  {
    name: "Brand",
    tokens: [
      { name: "brand-300", value: "0.68 0.075 175" },
      { name: "brand-400", value: "0.60 0.080 175" },
      { name: "brand-500", value: "0.42 0.072 174" },
      { name: "brand-700", value: "0.32 0.064 174" },
    ],
  },
  {
    name: "Spotlight",
    tokens: [
      { name: "spotlight-400", value: "0.74 0.180 40" },
      { name: "spotlight-500", value: "0.66 0.221 37" },
      { name: "spotlight-700", value: "0.40 0.140 37" },
    ],
  },
  {
    name: "State",
    tokens: [
      { name: "success-400", value: "0.72 0.100 155" },
      { name: "success-500", value: "0.58 0.120 155" },
      { name: "success-700", value: "0.40 0.100 155" },
      { name: "warning-400", value: "0.82 0.130 80" },
      { name: "warning-500", value: "0.78 0.150 80" },
      { name: "warning-700", value: "0.40 0.100 80" },
      { name: "danger-400", value: "0.70 0.140 25" },
      { name: "danger-500", value: "0.55 0.180 25" },
      { name: "danger-700", value: "0.40 0.140 25" },
    ],
  },
  {
    name: "Module accents",
    tokens: [
      { name: "accent-stock", value: "0.50 0.06 50" },
      { name: "accent-leadgen", value: "0.50 0.06 220" },
      { name: "accent-jobs", value: "0.50 0.06 290" },
    ],
  },
];

export function Swatches() {
  return (
    <section className="space-y-8">
      <SectionHeader
        kicker="TOKENS"
        title="Color palette"
        description="Raw OKLCH palette — tier 1. All semantic tokens are mapped from these."
      />
      {TOKEN_GROUPS.map((group) => (
        <div key={group.name}>
          <h3 className="mb-3 text-title font-semibold text-foreground">
            {group.name}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {group.tokens.map((tok) => (
              <div key={tok.name} className="flex min-w-0 flex-col gap-1">
                <div
                  className="size-12 rounded-md border border-border"
                  style={{ backgroundColor: `oklch(${tok.value})` }}
                />
                <div className="text-mono text-xs text-foreground">
                  --{tok.name}
                </div>
                <div className="text-mono text-xs text-muted-foreground">
                  {tok.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
