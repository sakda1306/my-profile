import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LocaleNotFound() {
  const t = useTranslations("errors");
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">{t("notFoundTitle")}</h1>
      <p className="mt-2 text-muted">{t("notFoundBody")}</p>
      <p className="mt-6">
        <Link href="/" className="text-accent underline">
          {t("home")}
        </Link>
      </p>
    </main>
  );
}
