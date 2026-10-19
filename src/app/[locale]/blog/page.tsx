import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BlogList, type PostCard } from "@/components/public/BlogList";
import { routing } from "@/i18n/routing";
import { formatDate } from "@/lib/content/format";
import { getPosts } from "@/lib/content/queries";
import { pick } from "@/lib/locale/pick";

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
      isFallback: title.isFallback,
      date: p.published_at ? formatDate(p.published_at, locale) : "",
      tags: p.tags,
    };
  });
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      {/* useSearchParams in BlogList needs a boundary; the page itself stays static. */}
      <Suspense>
        <BlogList cards={cards} locale={locale} />
      </Suspense>
    </main>
  );
}
