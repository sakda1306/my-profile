import { useTranslations } from "next-intl";
import { FallbackBadge } from "@/components/public/FallbackBadge";
import { Localized } from "@/components/public/Localized";
import { MediaImage } from "@/components/public/MediaImage";
import { RichTextView } from "@/components/public/RichTextView";
import type { Profile } from "@/lib/content/queries";
import { pick, type Locale } from "@/lib/locale/pick";
import { mediaUrl } from "@/lib/media/url";
import type { TiptapDoc } from "@/lib/richtext/texts";

export function Hero({ profile, locale }: { profile: Profile | null; locale: Locale }) {
  const t = useTranslations("hero");
  if (!profile) return null;
  const avatar =
    profile.avatar_path ??
    (profile.github_username ? `https://avatars.githubusercontent.com/${profile.github_username}` : null);
  const bio = pick(profile, "bio", locale);
  const own = locale === "th" ? profile.resume_path_th : profile.resume_path_en;
  const other = locale === "th" ? profile.resume_path_en : profile.resume_path_th;
  const resume = mediaUrl(own || other || null);
  const hasUniversity = Boolean(profile.university_th || profile.university_en);
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center">
      {avatar ? (
        <div className="w-32 shrink-0 overflow-hidden rounded-full md:w-40">
          <MediaImage path={avatar} alt="" width={160} height={160} className="aspect-square" />
        </div>
      ) : null}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          <Localized row={profile} field="full_name" locale={locale} />
        </h1>
        <p className="text-lg text-muted">
          <Localized row={profile} field="headline" locale={locale} />
        </p>
        <p className="text-sm text-muted">
          <Localized row={profile} field="university" locale={locale} />
          {hasUniversity ? " | " : ""}
          <Localized row={profile} field="location" locale={locale} />
        </p>
        {bio.value ? (
          <div>
            <RichTextView doc={bio.value as TiptapDoc} />
            {bio.isFallback ? <FallbackBadge /> : null}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3 pt-2">
          {resume ? (
            <a href={resume} className="rounded-card bg-accent px-4 py-2 text-on-accent">
              {t("resume")}
            </a>
          ) : null}
          {profile.email ? (
            <a href={`mailto:${profile.email}`} className="rounded-card border border-border px-4 py-2">
              {t("contact")}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
