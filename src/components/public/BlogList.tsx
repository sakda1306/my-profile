"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FallbackBadge } from "@/components/public/FallbackBadge";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

export type PostCard = {
  slug: string;
  title: string;
  excerpt: string;
  isFallback: boolean;
  date: string;
  tags: string[];
};

// Tag filtering happens here, from ?tag=, so the /blog route itself stays static.
export function BlogList({ cards, locale }: { cards: PostCard[]; locale: string }) {
  const t = useTranslations("blog");
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tag = params.get("tag");
  const allTags = [...new Set(cards.flatMap((c) => c.tags))].sort();
  const shown = tag ? cards.filter((c) => c.tags.includes(tag)) : cards;

  function select(next: string | null) {
    router.replace(next ? `${pathname}?tag=${encodeURIComponent(next)}` : pathname, { locale });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      {allTags.length > 0 ? (
        <ul className="flex flex-wrap gap-2 text-sm">
          <li>
            <button
              type="button"
              onClick={() => select(null)}
              className={`rounded-card border border-border px-3 py-1 ${tag ? "" : "bg-accent text-on-accent"}`}
            >
              {t("all")}
            </button>
          </li>
          {allTags.map((x) => (
            <li key={x}>
              <button
                type="button"
                onClick={() => select(x)}
                className={`rounded-card border border-border px-3 py-1 ${tag === x ? "bg-accent text-on-accent" : ""}`}
              >
                {x}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {shown.length === 0 ? <p className="text-muted">{t("empty")}</p> : null}
      <ul className="space-y-6">
        {shown.map((c) => (
          <li key={c.slug}>
            <h2 className="text-xl font-semibold">
              <Link href={`/blog/${c.slug}`} locale={locale as "th" | "en"}>
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
