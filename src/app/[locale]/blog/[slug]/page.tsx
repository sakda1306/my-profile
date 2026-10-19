import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { FallbackBadge } from "@/components/public/FallbackBadge";
import { Localized } from "@/components/public/Localized";
import { MediaImage } from "@/components/public/MediaImage";
import { RichTextView } from "@/components/public/RichTextView";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { formatDate } from "@/lib/content/format";
import { getAllSlugs, getPostBySlug, type Post } from "@/lib/content/queries";
import { pick, type Locale } from "@/lib/locale/pick";
import type { TiptapDoc } from "@/lib/richtext/texts";

export async function generateStaticParams() {
  const { posts } = await getAllSlugs();
  const params = routing.locales.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
  // Cache Components needs at least one entry; the placeholder renders a 404.
  return params.length > 0 ? params : routing.locales.map((locale) => ({ locale, slug: "_" }));
}

function PostView({ post, locale }: { post: Post; locale: Locale }) {
  const t = useTranslations("blog");
  const content = pick(post, "content", locale);
  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
      <Link href="/blog" locale={locale} className="text-sm text-accent underline">
        {"<"} {t("back")}
      </Link>
      <h1 className="text-3xl font-bold">
        <Localized row={post} field="title" locale={locale} />
      </h1>
      <p className="text-sm text-muted">
        {post.published_at ? formatDate(post.published_at, locale) : post.status}
        {post.tags.length > 0 ? ` | ${post.tags.join(", ")}` : ""}
      </p>
      <MediaImage path={post.cover_path} alt={String(pick(post, "title", locale).value ?? "")} className="rounded-card" />
      {content.value ? (
        <div>
          <RichTextView doc={content.value as TiptapDoc} />
          {content.isFallback ? <FallbackBadge /> : null}
        </div>
      ) : null}
    </main>
  );
}

export default async function PostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  return <PostView post={post} locale={locale} />;
}
