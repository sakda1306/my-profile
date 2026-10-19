import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";

// GET form (not a Link) so prefetching can never clear the draft cookie.
export async function PreviewBanner({ locale }: { locale: string }) {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  const t = await getTranslations({ locale, namespace: "preview" });
  return (
    <aside role="status" className="flex flex-wrap items-center gap-3 bg-accent px-4 py-2 text-sm text-on-accent">
      <span>{t("banner")}</span>
      <form method="GET" action="/api/preview/exit">
        <input type="hidden" name="path" value={`/${locale}`} />
        <button type="submit" className="underline">
          {t("exit")}
        </button>
      </form>
    </aside>
  );
}
