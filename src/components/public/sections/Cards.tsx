import { Frame } from "./Frame";
import { Localized } from "@/components/public/Localized";
import { MediaImage } from "@/components/public/MediaImage";
import { safeHref } from "@/lib/content/format";
import { pick, type Locale } from "@/lib/locale/pick";
import type { Section, SectionItem } from "@/lib/content/queries";

export function Cards({ section, items, locale }: { section: Section; items: SectionItem[]; locale: Locale }) {
  if (items.length === 0) return null;
  return (
    <Frame section={section} locale={locale} fallbackTitle="">
      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((i) => {
          const href = safeHref(i.link_url);
          const title = <Localized row={i} field="title" locale={locale} />;
          return (
            <li key={i.id} className="overflow-hidden rounded-card border border-border bg-surface">
              <MediaImage path={i.image_path} alt={String(pick(i, "title", locale).value ?? "")} />
              <div className="space-y-1 p-4">
                <h3 className="font-semibold">
                  {href ? (
                    <a href={href} rel="noopener noreferrer" className="text-accent underline">
                      {title}
                    </a>
                  ) : (
                    title
                  )}
                </h3>
                <p className="text-muted">
                  <Localized row={i} field="body" locale={locale} />
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}
