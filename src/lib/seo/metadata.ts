import type { Metadata } from "next";
import { mediaUrl } from "@/lib/media/url";
import { type Locale } from "@/lib/locale/pick";
import { buildAlternates, getSiteUrl, type OwnContent } from "./alternates";

export function buildMetadata(opts: {
  path: string;
  own: OwnContent;
  locale: Locale;
  title: string;
  description?: string;
  imagePath?: string | null;
  type?: "website" | "article";
}): Metadata {
  const siteUrl = getSiteUrl();
  const { canonical, languages } = buildAlternates(opts.path, opts.own, opts.locale, siteUrl);
  const image = mediaUrl(opts.imagePath ?? null);
  const description = opts.description?.trim() || undefined;
  return {
    metadataBase: new URL(siteUrl),
    title: opts.title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title: opts.title,
      description,
      url: canonical,
      locale: opts.locale === "th" ? "th_TH" : "en_US",
      type: opts.type ?? "website",
      ...(image ? { images: [image] } : {}),
    },
    twitter: { card: image ? "summary_large_image" : "summary", title: opts.title, description },
  };
}
