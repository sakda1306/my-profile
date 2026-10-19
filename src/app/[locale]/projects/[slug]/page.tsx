import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { FallbackBadge } from "@/components/public/FallbackBadge";
import { Localized } from "@/components/public/Localized";
import { MediaImage } from "@/components/public/MediaImage";
import { RichTextView } from "@/components/public/RichTextView";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { safeHref } from "@/lib/content/format";
import { getAllSlugs, getProjectBySlug, type ProjectDetail } from "@/lib/content/queries";
import { pick, type Locale } from "@/lib/locale/pick";
import type { TiptapDoc } from "@/lib/richtext/texts";

export async function generateStaticParams() {
  const { projects } = await getAllSlugs();
  const params = routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
  // Cache Components needs at least one entry; the placeholder renders a 404.
  return params.length > 0 ? params : routing.locales.map((locale) => ({ locale, slug: "_" }));
}

function Project({ detail, locale }: { detail: ProjectDetail; locale: Locale }) {
  const t = useTranslations("project");
  const nav = useTranslations("nav");
  const { project, images } = detail;
  const body = pick(project, "body", locale);
  const repo = safeHref(project.repo_url);
  const demo = safeHref(project.demo_url);
  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
      <Link href="/" locale={locale} className="text-sm text-accent underline">
        {"<"} {nav("home")}
      </Link>
      <h1 className="text-3xl font-bold">
        <Localized row={project} field="title" locale={locale} />
      </h1>
      <p className="text-muted">
        <Localized row={project} field="summary" locale={locale} />
      </p>
      {project.my_role_th || project.my_role_en ? (
        <p>
          <strong>{t("role")}:</strong> <Localized row={project} field="my_role" locale={locale} />
        </p>
      ) : null}
      {project.stack.length > 0 ? (
        <p>
          <strong>{t("stack")}:</strong> {project.stack.join(", ")}
        </p>
      ) : null}
      <div className="flex gap-4">
        {repo ? (
          <a href={repo} rel="noopener noreferrer" className="text-accent underline">
            {t("repo")}
          </a>
        ) : null}
        {demo ? (
          <a href={demo} rel="noopener noreferrer" className="text-accent underline">
            {t("demo")}
          </a>
        ) : null}
      </div>
      <MediaImage path={project.cover_path} alt={String(pick(project, "title", locale).value ?? "")} className="rounded-card" />
      {body.value ? (
        <div>
          <RichTextView doc={body.value as TiptapDoc} />
          {body.isFallback ? <FallbackBadge /> : null}
        </div>
      ) : null}
      {images.length > 0 ? (
        <section>
          <h2 className="mb-2 text-xl font-semibold">{t("gallery")}</h2>
          <ul className="grid grid-cols-2 gap-4">
            {images.map((img) => (
              <li key={img.id}>
                <MediaImage path={img.path} alt={String(pick(img, "caption", locale).value ?? "")} className="rounded-card" />
                <p className="mt-1 text-sm text-muted">
                  <Localized row={img} field="caption" locale={locale} />
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const detail = await getProjectBySlug(slug);
  if (!detail) notFound();
  return <Project detail={detail} locale={locale} />;
}
