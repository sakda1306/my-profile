import { useTranslations } from "next-intl";
import { Frame } from "./Frame";
import { FallbackBadge } from "@/components/public/FallbackBadge";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/content/format";
import type { Post, Section } from "@/lib/content/queries";
import { isPostFallback, pick, type Locale } from "@/lib/locale/pick";

export function LatestPosts({ section, posts, locale }: { section: Section; posts: Post[]; locale: Locale }) {
  const t = useTranslations();
  const settings = section.settings as { limit?: unknown } | null;
  const limit = typeof settings?.limit === "number" && settings.limit > 0 ? settings.limit : 3;
  const list = posts.slice(0, limit);
  if (list.length === 0) return null;
  return (
    <Frame section={section} locale={locale} fallbackTitle={t("sections.latestPosts")}>
      <ul className="space-y-4">
        {list.map((p) => (
          <li key={p.id}>
            <h3 className="font-semibold">
              <Link href={`/blog/${p.slug}`} locale={locale}>
                {String(pick(p, "title", locale).value ?? p.slug)}
              </Link>
              {isPostFallback(p, locale) ? <FallbackBadge /> : null}
            </h3>
            {p.published_at ? <p className="text-sm text-muted">{formatDate(p.published_at, locale)}</p> : null}
            <p className="text-muted">
              {String(pick(p, "excerpt", locale).value ?? "")}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4">
        <Link href="/blog" locale={locale} className="text-accent underline">
          {t("nav.blog")}
        </Link>
      </p>
    </Frame>
  );
}
