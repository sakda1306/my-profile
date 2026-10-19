import type { ReactNode } from "react";
import { Localized } from "@/components/public/Localized";
import type { Section } from "@/lib/content/queries";
import type { Locale } from "@/lib/locale/pick";

// Shared section wrapper: heading (section title, or the template default) and subtitle.
export function Frame({
  section,
  locale,
  fallbackTitle,
  children,
}: {
  section: Section;
  locale: Locale;
  fallbackTitle: string;
  children: ReactNode;
}) {
  const hasTitle = Boolean(section.title_th.trim() || section.title_en.trim());
  const hasSubtitle = Boolean(section.subtitle_th.trim() || section.subtitle_en.trim());
  return (
    <section id={section.slug} className="mx-auto w-full max-w-4xl px-4 py-8">
      {hasTitle || fallbackTitle ? (
        <h2 className="text-2xl font-semibold">
          {hasTitle ? <Localized row={section} field="title" locale={locale} /> : fallbackTitle}
        </h2>
      ) : null}
      {hasSubtitle ? (
        <p className="mt-1 text-muted">
          <Localized row={section} field="subtitle" locale={locale} />
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
