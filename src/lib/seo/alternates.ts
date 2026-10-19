import type { MetadataRoute } from "next";
import { LOCALES, type Locale } from "@/lib/locale/pick";

export type OwnContent = Record<Locale, boolean>;

export const ALL_OWN: OwnContent = { th: true, en: true };

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

function url(siteUrl: string, locale: Locale, path: string): string {
  return `${siteUrl}/${locale}${path === "/" ? "" : path}`;
}

export function buildAlternates(
  path: string,
  own: OwnContent,
  locale: Locale,
  siteUrl: string,
): { canonical: string; languages: Partial<Record<Locale, string>> } {
  const languages: Partial<Record<Locale, string>> = {};
  for (const l of LOCALES) if (own[l]) languages[l] = url(siteUrl, l, path);
  const canonicalLocale = own[locale] ? locale : (LOCALES.find((l) => own[l]) ?? locale);
  return { canonical: url(siteUrl, canonicalLocale, path), languages };
}

export function buildSitemapEntries(
  items: { path: string; own: OwnContent; updatedAt?: string }[],
  siteUrl: string,
): MetadataRoute.Sitemap {
  return items.flatMap((item) =>
    LOCALES.filter((l) => item.own[l]).map((l) => ({
      url: url(siteUrl, l, item.path),
      ...(item.updatedAt ? { lastModified: new Date(item.updatedAt) } : {}),
    })),
  );
}
