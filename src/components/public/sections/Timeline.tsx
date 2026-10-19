import { useTranslations } from "next-intl";
import { Frame } from "./Frame";
import { Localized } from "@/components/public/Localized";
import { formatRange } from "@/lib/content/format";
import type { Section, SectionItem } from "@/lib/content/queries";
import type { Locale } from "@/lib/locale/pick";

export function Timeline({ section, items, locale }: { section: Section; items: SectionItem[]; locale: Locale }) {
  const t = useTranslations("common");
  if (items.length === 0) return null;
  return (
    <Frame section={section} locale={locale} fallbackTitle="">
      <ol className="space-y-4 border-l border-border pl-4">
        {items.map((i) => (
          <li key={i.id}>
            <p className="text-sm text-muted">{formatRange(i.start_date, i.end_date, locale, t("present"))}</p>
            <h3 className="font-semibold">
              <Localized row={i} field="title" locale={locale} />
            </h3>
            <p className="text-muted">
              <Localized row={i} field="body" locale={locale} />
            </p>
          </li>
        ))}
      </ol>
    </Frame>
  );
}
