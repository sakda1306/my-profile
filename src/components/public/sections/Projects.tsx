import Image from "next/image";
import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/public/motion/FadeIn";
import { StackedCard } from "@/components/public/motion/StackedCard";
import { Link } from "@/i18n/navigation";
import type { Project, ProjectImage, Section } from "@/lib/content/queries";
import { pick, type Locale } from "@/lib/locale/pick";
import { mediaUrl } from "@/lib/media/url";

const pill =
  "inline-block whitespace-nowrap rounded-full border-2 border-ice px-6 py-2.5 text-sm font-medium uppercase tracking-widest text-ice transition hover:bg-ice/10 sm:px-8 sm:py-3 sm:text-base";

function Shot({ path, label, className }: { path: string | null; label: string; className: string }) {
  const src = mediaUrl(path);
  return (
    <div className={`relative overflow-hidden rounded-[40px] sm:rounded-[50px] md:rounded-[60px] ${className}`}>
      {src ? (
        <Image src={src} alt={label} fill sizes="(min-width: 768px) 50vw, 90vw" className="object-cover" />
      ) : (
        <div aria-hidden="true" className="poster-bg h-full w-full" />
      )}
    </div>
  );
}

// "Project" section: sticky cards that stack and shrink as you scroll.
export function Projects({
  section,
  projects,
  imagesByProject,
  locale,
}: {
  section: Section;
  projects: Project[];
  imagesByProject: Record<string, ProjectImage[]>;
  locale: Locale;
}) {
  const t = useTranslations();
  if (projects.length === 0) return null;
  const title = String(pick(section, "title", locale).value ?? "").trim() || t("sections.projects");

  return (
    <section
      id={section.slug}
      className="relative z-10 -mt-10 bg-bg px-4 pb-24 pt-20 rounded-t-[40px] [--stack-top:6rem] sm:-mt-12 sm:rounded-t-[50px] sm:px-8 md:-mt-14 md:rounded-t-[60px] md:px-10 md:[--stack-top:8rem]"
    >
      <FadeIn as="h2" y={40} className="hero-heading mb-12 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight md:mb-20">
        {title}
      </FadeIn>
      <div className="mx-auto max-w-6xl">
        {projects.map((p, i) => {
          const name = String(pick(p, "title", locale).value ?? p.slug);
          const summary = String(pick(p, "summary", locale).value ?? "");
          const shots = [p.cover_path, ...(imagesByProject[p.id] ?? []).map((img) => img.path)].filter((x): x is string => Boolean(x));
          return (
            <StackedCard key={p.id} index={i} total={projects.length}>
              <article className="rounded-[40px] border-2 border-ice bg-bg p-4 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-2 pb-5 md:pb-8">
                  <span className="text-[clamp(2.5rem,7vw,100px)] font-black leading-none">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-widest text-muted">{p.stack.slice(0, 3).join(" · ")}</p>
                    <h3 className="text-[clamp(1.2rem,2.6vw,2.2rem)] font-medium uppercase leading-tight">
                      <Link href={`/projects/${p.slug}`} locale={locale} className="hover:opacity-80">
                        {name}
                      </Link>
                    </h3>
                    {summary ? <p className="mt-1 line-clamp-2 text-sm font-light text-muted">{summary}</p> : null}
                  </div>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                    {p.demo_url ? (
                      <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className={pill}>
                        {t("projectCard.live")}
                      </a>
                    ) : null}
                    {p.repo_url ? (
                      <a href={p.repo_url} target="_blank" rel="noopener noreferrer" className={pill}>
                        {t("projectCard.code")}
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-3 md:gap-4">
                  <div className="flex w-[40%] flex-col gap-3 md:gap-4">
                    <Shot path={shots[0] ?? null} label={name} className="h-[clamp(130px,16vw,230px)]" />
                    <Shot path={shots[1] ?? null} label={name} className="h-[clamp(160px,22vw,340px)]" />
                  </div>
                  <Shot path={shots[2] ?? shots[0] ?? null} label={name} className="w-[60%]" />
                </div>
              </article>
            </StackedCard>
          );
        })}
      </div>
    </section>
  );
}
