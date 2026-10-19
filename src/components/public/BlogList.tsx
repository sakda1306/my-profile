import { useTranslations } from "next-intl";
import { FallbackBadge } from "@/components/public/FallbackBadge";
import { Link } from "@/i18n/navigation";

export type PostCard = {
  slug: string;
  title: string;
  excerpt: string;
  isFallback: boolean;
  date: string;
  tags: string[];
};

// Server component: the full list and the tag links are in the static HTML.
// TagFilter (client, ?tag=) only hides non-matching cards afterwards.
export function BlogList({ cards, locale }: { cards: PostCard[]; locale: "th" | "en" }) {
  const t = useTranslations("blog");
  const allTags = [...new Set(cards.flatMap((c) => c.tags))].sort();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      {allTags.length > 0 ? (
        <ul className="flex flex-wrap gap-2 text-sm">
          <li>
            <Link href="/blog" locale={locale} className="rounded-card border border-border px-3 py-1">
              {t("all")}
            </Link>
          </li>
          {allTags.map((x) => (
            <li key={x}>
              <Link
                href={{ pathname: "/blog", query: { tag: x } }}
                locale={locale}
                data-tag-link={x}
                className="rounded-card border border-border px-3 py-1"
              >
                {x}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {cards.length === 0 ? <p className="text-muted">{t("empty")}</p> : null}
      <ul className="space-y-6" id="post-list">
        {cards.map((c) => (
          <li key={c.slug} data-tags={`|${c.tags.join("|")}|`}>
            <h2 className="text-xl font-semibold">
              <Link href={`/blog/${c.slug}`} locale={locale}>
                {c.title}
              </Link>
              {c.isFallback ? <FallbackBadge /> : null}
            </h2>
            <p className="text-sm text-muted">
              {c.date}
              {c.tags.length > 0 ? ` | ${c.tags.join(", ")}` : ""}
            </p>
            {c.excerpt ? <p className="text-muted">{c.excerpt}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
