import { useTranslations } from "next-intl";
import { Frame } from "./Frame";
import { Localized } from "@/components/public/Localized";
import { MediaImage } from "@/components/public/MediaImage";
import { Link } from "@/i18n/navigation";
import type { Project, Section } from "@/lib/content/queries";
import { pick, type Locale } from "@/lib/locale/pick";

export function Projects({ section, projects, locale }: { section: Section; projects: Project[]; locale: Locale }) {
  const t = useTranslations("sections");
  if (projects.length === 0) return null;
  return (
    <Frame section={section} locale={locale} fallbackTitle={t("projects")}>
      <ul className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <li key={p.id} className="overflow-hidden rounded-card border border-border bg-surface">
            <MediaImage path={p.cover_path} alt={String(pick(p, "title", locale).value ?? "")} />
            <div className="space-y-2 p-4">
              <h3 className="text-lg font-semibold">
                <Link href={`/projects/${p.slug}`} locale={locale}>
                  <Localized row={p} field="title" locale={locale} />
                </Link>
              </h3>
              <p className="text-muted">
                <Localized row={p} field="summary" locale={locale} />
              </p>
              {p.stack.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5 text-xs">
                  {p.stack.map((s) => (
                    <li key={s} className="rounded-card border border-border px-2 py-0.5">
                      {s}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
