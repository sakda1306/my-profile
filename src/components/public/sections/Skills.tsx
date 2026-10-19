import Image from "next/image";
import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/public/motion/FadeIn";
import type { Section, Skill } from "@/lib/content/queries";
import { pick, type Locale } from "@/lib/locale/pick";
import { mediaUrl } from "@/lib/media/url";

const CATEGORIES = ["language", "framework", "tool", "ai_data", "soft"] as const;

function SkillIcon({ skill }: { skill: Skill }) {
  const custom = mediaUrl(skill.icon_path);
  if (custom) return <Image src={custom} alt="" width={28} height={28} className="size-7" />;
  if (skill.icon_slug) {
    return (
      <Image
        src={`https://skillicons.dev/icons?i=${encodeURIComponent(skill.icon_slug)}`}
        alt=""
        width={28}
        height={28}
        unoptimized
        className="size-7"
      />
    );
  }
  return null;
}

// A white "services" panel: one numbered row per skill category.
export function Skills({ section, skills, locale }: { section: Section; skills: Skill[]; locale: Locale }) {
  const t = useTranslations();
  const groups = CATEGORIES.map((cat) => ({ cat, list: skills.filter((s) => s.category === cat) })).filter((g) => g.list.length > 0);
  if (groups.length === 0) return null;
  const title = String(pick(section, "title", locale).value ?? "").trim() || t("sections.skills");

  return (
    <section
      id={section.slug}
      className="relative bg-paper px-5 py-20 text-ink rounded-t-[40px] sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <FadeIn as="h2" y={40} className="mb-16 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28">
        {title}
      </FadeIn>
      <ul className="mx-auto max-w-5xl">
        {groups.map(({ cat, list }, i) => (
          <FadeIn
            as="li"
            key={cat}
            delay={i * 0.1}
            className="flex items-start gap-6 border-t border-ink/15 py-8 last:border-b sm:gap-10 sm:py-10 md:py-12"
          >
            <span className="w-[1.6em] shrink-0 text-[clamp(3rem,10vw,140px)] font-black leading-none">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 pt-1 md:pt-4">
              <h3 className="text-[clamp(1rem,2.2vw,2.1rem)] font-medium uppercase">{t(`skillCategory.${cat}`)}</h3>
              <ul className="mt-3 flex max-w-2xl flex-wrap gap-x-4 gap-y-2 text-[clamp(0.85rem,1.6vw,1.25rem)] font-light leading-relaxed text-ink/70">
                {list.map((s) => {
                  const note = String(pick(s, "note", locale).value ?? "").trim();
                  return (
                    <li key={s.id} className="flex items-center gap-2" title={note || undefined}>
                      <SkillIcon skill={s} />
                      <span>{s.name}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </FadeIn>
        ))}
      </ul>
    </section>
  );
}
