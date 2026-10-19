import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { getHomeData } from "@/lib/content/queries";
import { routing } from "@/i18n/routing";
import { pick, type Locale } from "@/lib/locale/pick";
import { ALL_OWN } from "@/lib/seo/alternates";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const { profile } = await getHomeData();
  const name = profile ? String(pick(profile, "full_name", locale as Locale).value ?? "") : "";
  const headline = profile ? String(pick(profile, "headline", locale as Locale).value ?? "") : "";
  return buildMetadata({
    path: "/",
    own: ALL_OWN,
    locale,
    title: name || "Profile",
    description: headline,
    imagePath: profile?.avatar_path,
  });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const data = await getHomeData();
  return (
    <main>
      <SectionRenderer data={data} locale={locale} />
    </main>
  );
}
