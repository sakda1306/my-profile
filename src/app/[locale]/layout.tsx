import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { PreviewBanner } from "@/components/public/PreviewBanner";
import { SiteNav } from "@/components/public/SiteNav";
import { notoSansThai } from "@/app/fonts";
import { routing } from "@/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Personal profile",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${notoSansThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <Suspense>
            <PreviewBanner locale={locale} />
          </Suspense>
          <SiteNav />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
