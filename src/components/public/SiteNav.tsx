import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/public/LanguageSwitcher";
import { FadeIn } from "@/components/public/motion/FadeIn";
import { Link } from "@/i18n/navigation";

const link = "transition-opacity duration-200 hover:opacity-70";

// Evenly spaced uppercase links; the anchors point at sections on the home page.
export function SiteNav() {
  const t = useTranslations("nav");
  return (
    <FadeIn as="header" y={-20} className="relative z-40 w-full px-6 pt-6 md:px-10 md:pt-8">
      <nav className="flex items-center justify-between gap-3 whitespace-nowrap text-sm font-medium uppercase tracking-wider text-ice md:text-lg lg:text-[1.4rem]">
        <Link href="/#about" className={link}>{t("about")}</Link>
        <Link href="/#skills" className={`${link} hidden sm:inline`}>{t("skills")}</Link>
        <Link href="/#projects" className={link}>{t("projects")}</Link>
        <Link href="/blog" className={link}>{t("blog")}</Link>
        <Link href="/#contact" className={`${link} hidden sm:inline`}>{t("contact")}</Link>
        <span className={`${link} rounded-full border border-ice/40 px-3 py-0.5 text-xs normal-case tracking-normal md:text-sm`}>
          <LanguageSwitcher />
        </span>
      </nav>
    </FadeIn>
  );
}
