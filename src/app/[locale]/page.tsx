import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { getHomeData } from "@/lib/content/queries";
import { routing } from "@/i18n/routing";

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
