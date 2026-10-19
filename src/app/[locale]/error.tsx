"use client";

import { useTranslations } from "next-intl";

export default function LocaleError({ retry }: { error: Error; retry: () => void }) {
  const t = useTranslations("errors");
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">{t("errorTitle")}</h1>
      <p className="mt-2 text-muted">{t("errorBody")}</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-card bg-accent px-4 py-2 text-on-accent"
      >
        {t("retry")}
      </button>
    </main>
  );
}
