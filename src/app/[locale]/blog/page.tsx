import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BlogList, type PostCard } from "@/components/public/BlogList";
import { TagFilter } from "@/components/public/TagFilter";
import { routing } from "@/i18n/routing";
import { formatDate } from "@/lib/content/format";
import { getPosts } from "@/lib/content/queries";
import { isPostFallback, pick } from "@/lib/locale/pick";
import { ALL_OWN } from "@/lib/seo/alternates";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "nav" });
  return buildMetadata({ path: "/blog", own: ALL_OWN, locale, title: t("blog") });
}

export default async function BlogPage({ params }: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const posts = await getPosts();
  const cards: PostCard[] = posts.map((p) => {
    const title = pick(p, "title", locale);
    const excerpt = pick(p, "excerpt", locale);
    return {
      slug: p.slug,
      title: String(title.value ?? p.slug),
      excerpt: String(excerpt.value ?? ""),
      isFallback: isPostFallback(p, locale),
      date: p.published_at ? formatDate(p.published_at, locale) : "",
      tags: p.tags,
    };
  });
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      {/* Only the small client filter needs a boundary; the list itself is server-rendered. */}
      <Suspense>
        <TagFilter />
      </Suspense>
      <BlogList cards={cards} locale={locale} />
    </main>
  );
}
