import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/public/LanguageSwitcher";
import { Link } from "@/i18n/navigation";

export function SiteNav() {
  const t = useTranslations("nav");
  return (
    <header className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3">
      <nav className="flex gap-4">
        <Link href="/">{t("home")}</Link>
        <Link href="/blog">{t("blog")}</Link>
      </nav>
      <LanguageSwitcher />
    </header>
  );
}
