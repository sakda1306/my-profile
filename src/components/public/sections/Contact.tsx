import { useTranslations } from "next-intl";
import { Frame } from "./Frame";
import { safeHref } from "@/lib/content/format";
import type { Profile, Section } from "@/lib/content/queries";
import type { Locale } from "@/lib/locale/pick";

type LinkRow = { label?: unknown; url?: unknown };

export function Contact({ section, profile, locale }: { section: Section; profile: Profile | null; locale: Locale }) {
  const t = useTranslations("sections");
  if (!profile) return null;
  const rows = Array.isArray(profile.links) ? (profile.links as LinkRow[]) : [];
  const links: { label: string; href: string }[] = [];
  for (const l of rows) {
    const href = safeHref(typeof l.url === "string" ? l.url : null);
    if (href) links.push({ label: typeof l.label === "string" ? l.label : "", href });
  }
  if (links.length === 0 && !profile.email) return null;
  return (
    <Frame section={section} locale={locale} fallbackTitle={t("contact")}>
      <ul className="flex flex-wrap gap-3">
        {profile.email ? (
          <li>
            <a href={`mailto:${profile.email}`} className="text-accent underline">
              {profile.email}
            </a>
          </li>
        ) : null}
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} rel="noopener noreferrer" className="text-accent underline">
              {l.label || l.href}
            </a>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
