import { Frame } from "./Frame";
import { Localized } from "@/components/public/Localized";
import { MediaImage } from "@/components/public/MediaImage";
import { pick, type Locale } from "@/lib/locale/pick";
import type { Section, SectionItem } from "@/lib/content/queries";

export function Gallery({ section, items, locale }: { section: Section; items: SectionItem[]; locale: Locale }) {
  const list = items.filter((i) => i.image_path);
  if (list.length === 0) return null;
  return (
    <Frame section={section} locale={locale} fallbackTitle="">
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {list.map((i) => (
          <li key={i.id}>
            <MediaImage path={i.image_path} alt={String(pick(i, "title", locale).value ?? "")} className="rounded-card" />
            <p className="mt-1 text-sm text-muted">
              <Localized row={i} field="title" locale={locale} />
            </p>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
