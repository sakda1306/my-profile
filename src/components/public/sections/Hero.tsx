import Image from "next/image";
import { useTranslations } from "next-intl";
import { ContactButton } from "@/components/public/ContactButton";
import { EmberCanvas } from "@/components/public/fx/EmberCanvas";
import { SmokeCanvas } from "@/components/public/fx/SmokeCanvas";
import { AnimatedText } from "@/components/public/motion/AnimatedText";
import { FadeIn } from "@/components/public/motion/FadeIn";
import { Magnet } from "@/components/public/motion/Magnet";
import { Marquee, type MarqueeTile } from "@/components/public/motion/Marquee";
import type { Profile, Project, ProjectImage, Skill } from "@/lib/content/queries";
import { otherLocale, pick, type Locale } from "@/lib/locale/pick";
import { mediaUrl } from "@/lib/media/url";
import { extractTexts, type TiptapDoc } from "@/lib/richtext/texts";

// "S RANK" -> a big glowing "S" and an italic "RANK"; longer first words stay plain.
function Badge({ text }: { text: string }) {
  const [first, ...rest] = text.trim().split(/\s+/);
  if (!first) return null;
  if (first.length > 2) return <span className="text-sm font-semibold italic tracking-wide">{text}</span>;
  return (
    <span className="flex items-center gap-2">
      <span className="badge-glyph text-4xl font-black leading-none">{first}</span>
      <span className="text-sm font-semibold italic tracking-wide">{rest.join(" ")}</span>
    </span>
  );
}

function SkillIcon({ skill, className }: { skill: Skill; className: string }) {
  const custom = mediaUrl(skill.icon_path);
  const src = custom ?? (skill.icon_slug ? `https://skillicons.dev/icons?i=${encodeURIComponent(skill.icon_slug)}` : null);
  if (!src) return null;
  return <Image src={src} alt={skill.name} width={220} height={220} unoptimized={!custom} className={className} />;
}

// One tile per project picture (cover first); a project with no pictures gets a named placeholder.
function marqueeTiles(projects: Project[], imagesByProject: Record<string, ProjectImage[]>, locale: Locale): MarqueeTile[] {
  return projects.flatMap((p) => {
    const label = String(pick(p, "title", locale).value ?? p.slug);
    const paths = [p.cover_path, ...(imagesByProject[p.id] ?? []).map((i) => i.path)].filter((x): x is string => Boolean(x));
    if (paths.length === 0) return [{ key: p.id, src: null, label }];
    return paths.map((path) => ({ key: `${p.id}:${path}`, src: mediaUrl(path), label }));
  });
}

const CORNERS = [
  { pos: "top-[4%] left-[1%] sm:left-[2%] md:left-[4%]", size: "w-[90px] sm:w-[120px] md:w-[150px]", x: -80, delay: 0.1 },
  { pos: "bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%]", size: "w-[70px] sm:w-[100px] md:w-[130px]", x: -80, delay: 0.25 },
  { pos: "top-[4%] right-[1%] sm:right-[2%] md:right-[4%]", size: "w-[90px] sm:w-[120px] md:w-[150px]", x: 80, delay: 0.15 },
  { pos: "bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%]", size: "w-[80px] sm:w-[110px] md:w-[140px]", x: 80, delay: 0.3 },
];

export function Hero({
  profile,
  locale,
  projects,
  imagesByProject,
  skills,
}: {
  profile: Profile | null;
  locale: Locale;
  projects: Project[];
  imagesByProject: Record<string, ProjectImage[]>;
  skills: Skill[];
}) {
  const t = useTranslations("hero");
  if (!profile) return null;

  const name = String(pick(profile, "full_name", locale).value ?? "");
  const otherName = String(profile[`full_name_${otherLocale(locale)}`] ?? "").trim();
  const headline = String(pick(profile, "headline", locale).value ?? "");
  const badge = String(pick(profile, "hero_badge", locale).value ?? "");
  const bioDoc = pick(profile, "bio", locale).value as TiptapDoc | null;
  const bio = bioDoc ? extractTexts(bioDoc).join(" ").replace(/\s+/g, " ").trim() : "";
  const firstName = (profile.full_name_en || name).trim().split(/\s+/)[0] ?? "";
  const photo = mediaUrl(
    profile.hero_image_path ??
      profile.avatar_path ??
      (profile.github_username ? `https://avatars.githubusercontent.com/${profile.github_username}` : null),
  );
  const contactHref = profile.email ? `mailto:${profile.email}` : "#contact";
  const cornerSkills = skills.filter((s) => s.icon_path || s.icon_slug).slice(0, 4);

  return (
    <>
      {/* 1. Poster */}
      <section id="hero" className="poster-bg relative isolate -mt-20 flex min-h-svh flex-col overflow-x-clip overflow-y-hidden pt-20 md:-mt-24 md:pt-24">
        <SmokeCanvas className="absolute inset-0 mix-blend-screen" count={16} size={0.35} alpha={0.4} wind={-0.04} />

        <div className="overflow-hidden">
          <FadeIn
            as="h1"
            delay={0.15}
            y={40}
            className="hero-heading mt-6 w-full whitespace-nowrap text-center text-[14vw] font-black uppercase leading-none tracking-tight sm:mt-4 sm:text-[15vw] md:-mt-2 md:text-[16vw] lg:text-[17.5vw]"
          >
            {t("greeting", { name: firstName })}
          </FadeIn>
        </div>

        {photo ? (
          <FadeIn
            delay={0.6}
            y={30}
            className="poster-photo absolute left-1/2 top-1/2 z-10 h-[62%] w-[280px] -translate-x-1/2 -translate-y-1/2 sm:bottom-0 sm:top-auto sm:h-[82%] sm:w-[360px] sm:translate-y-0 md:w-[440px] lg:w-[520px]"
          >
            <Magnet className="relative h-full w-full" padding={150} strength={3}>
              <Image src={photo} alt={name} fill priority sizes="(min-width: 1024px) 520px, (min-width: 768px) 440px, 360px" className="object-contain object-bottom" />
            </Magnet>
          </FadeIn>
        ) : null}

        {/* Darkens the lower poster so the text stays readable over the photo. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-2/5 bg-gradient-to-t from-night-deep/85 via-night-deep/40 to-transparent" />
        <EmberCanvas className="z-20" />

        <div className="relative z-30 mt-auto flex items-end justify-between gap-4 px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
          <FadeIn delay={0.35} y={20} className="max-w-[200px] sm:max-w-[260px] md:max-w-[320px]">
            {badge ? <Badge text={badge} /> : null}
            <p className="mt-2 text-[clamp(1.1rem,2.2vw,2rem)] font-black uppercase leading-tight">{name}</p>
            {otherName && otherName !== name ? <p className="text-sm font-light">({otherName})</p> : null}
            {headline ? (
              <p className="mt-2 text-[clamp(0.75rem,1.2vw,1.1rem)] font-light uppercase leading-snug tracking-wide text-ice">{headline}</p>
            ) : null}
          </FadeIn>
          <FadeIn delay={0.5} y={20}>
            <ContactButton href={contactHref} label={t("contact")} />
          </FadeIn>
        </div>
      </section>

      {/* 2. Marquee of project pictures */}
      <Marquee tiles={marqueeTiles(projects, imagesByProject, locale)} />

      {/* 3. About me */}
      <section id="about" className="relative flex min-h-screen flex-col items-center justify-center overflow-x-clip px-5 py-20 sm:px-8 md:px-10">
        {cornerSkills.map((s, i) => (
          <FadeIn key={s.id} delay={CORNERS[i].delay} x={CORNERS[i].x} y={0} duration={0.9} className={`pointer-events-none absolute ${CORNERS[i].pos} ${CORNERS[i].size}`}>
            <SkillIcon skill={s} className="h-auto w-full rotate-[-8deg] drop-shadow-[0_20px_40px_rgb(0_0_0/0.5)]" />
          </FadeIn>
        ))}
        <div className="relative z-10 flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
          <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
            <FadeIn as="h2" y={40} className="hero-heading text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight">
              {t("aboutTitle")}
            </FadeIn>
            {bio ? (
              <AnimatedText
                text={bio}
                locale={locale}
                className="max-w-[560px] text-center text-[clamp(1rem,2vw,1.35rem)] font-medium leading-relaxed text-ice"
              />
            ) : null}
          </div>
          <ContactButton href={contactHref} label={t("contact")} />
        </div>
      </section>
    </>
  );
}
