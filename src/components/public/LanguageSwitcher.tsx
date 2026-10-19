"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { otherLocale, type Locale } from "@/lib/locale/pick";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("language");
  const target = otherLocale(locale);
  return (
    <Link href={pathname} locale={target} hrefLang={target}>
      {t("switch")}
    </Link>
  );
}
