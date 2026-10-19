import Image from "next/image";
import { useTranslations } from "next-intl";
import { Frame } from "./Frame";
import { Localized } from "@/components/public/Localized";
import type { Section, Skill } from "@/lib/content/queries";
import type { Locale } from "@/lib/locale/pick";
import { mediaUrl } from "@/lib/media/url";

const CATEGORIES = ["language", "framework", "tool", "ai_data", "soft"] as const;

function SkillIcon({ skill }: { skill: Skill }) {
  const custom = mediaUrl(skill.icon_path);
  if (custom) {
    return <Image src={custom} alt="" width={24} height={24} className="size-6" />;
  }
  if (skill.icon_slug) {
    return (
      <Image
        src={`https://skillicons.dev/icons?i=${encodeURIComponent(skill.icon_slug)}`}
        alt=""
        width={24}
        height={24}
        unoptimized
        className="size-6"
      />
    );
  }
  return null;
}

export function Skills({ section, skills, locale }: { section: Section; skills: Skill[]; locale: Locale }) {
  const t = useTranslations();
  if (skills.length === 0) return null;
  return (
    <Frame section={section} locale={locale} fallbackTitle={t("sections.skills")}>
      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const list = skills.filter((s) => s.category === cat);
          if (list.length === 0) return null;
          return (
            <div key={cat}>
              <h3 className="mb-2 font-medium text-muted">{t(`skillCategory.${cat}`)}</h3>
              <ul className="flex flex-wrap gap-2">
                {list.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 rounded-card border border-border bg-surface px-3 py-1.5 text-sm"
                  >
                    <SkillIcon skill={s} />
                    <span>{s.name}</span>
                    {s.note_th || s.note_en ? (
                      <span className="text-muted">
                        (<Localized row={s} field="note" locale={locale} />)
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Frame>
  );
}
