import { SectionHeader } from "@__APP_NAME__/ui/components/section-header";
import { cn } from "@__APP_NAME__/ui/utils/cn";

interface TypeSample {
  cls: string;
  /** Extra font-* classes needed since @theme --text-* tokens carry size/line-height/tracking only. */
  fontCls?: string;
  en: string;
  th: string;
}

const TYPE_SAMPLES: TypeSample[] = [
  {
    cls: "text-display-lg",
    fontCls: "font-bold",
    en: "Updated 1,247 items",
    th: "อัปเดต 1,247 รายการ",
  },
  {
    cls: "text-display",
    fontCls: "font-bold",
    en: "Stock",
    th: "สต็อก",
  },
  {
    cls: "text-headline",
    fontCls: "font-bold",
    en: "Today's activity",
    th: "กิจกรรมวันนี้",
  },
  {
    cls: "text-title",
    fontCls: "font-semibold",
    en: "Items low on stock",
    th: "รายการที่ใกล้หมด",
  },
  {
    cls: "text-body",
    en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    th: "ข้อความตัวอย่างของย่อหน้าทั่วไปสำหรับเนื้อหา",
  },
  {
    cls: "text-small",
    en: "Helper text describes the field.",
    th: "ข้อความช่วยเหลือสำหรับฟิลด์",
  },
  {
    cls: "text-kicker",
    fontCls: "font-medium uppercase",
    en: "STOCK · DASHBOARD",
    th: "สต็อก · แดชบอร์ด",
  },
  {
    cls: "text-mono",
    fontCls: "text-mono",
    en: "1,247  ↑ 12% wow",
    th: "1,247  ↑ 12% wow",
  },
];

export function TypeSpecimen() {
  return (
    <section className="space-y-6">
      <SectionHeader
        kicker="TYPOGRAPHY"
        title="Type scale"
        description="Inter Variable + IBM Plex Sans Thai. Disciplined sans — weight + size do the editorial work."
      />
      <div className="space-y-0">
        {TYPE_SAMPLES.map((s) => (
          <div
            key={s.cls}
            className="grid grid-cols-[160px_1fr_1fr] items-baseline gap-4 border-b border-border py-3 last:border-0"
          >
            <div className="shrink-0 text-mono text-xs text-muted-foreground">
              {s.cls}
            </div>
            <div className={cn(s.cls, s.fontCls, "min-w-0 text-foreground")}>
              {s.en}
            </div>
            <div
              className={cn(s.cls, s.fontCls, "min-w-0 text-foreground")}
              lang="th"
            >
              {s.th}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
