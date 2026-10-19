import { useTranslations } from "next-intl";

// Shown next to text that is displayed in the other language because the requested one is empty.
export function FallbackBadge() {
  const t = useTranslations("fallback");
  return (
    <span className="ml-2 inline-block rounded-card border border-border bg-surface px-2 py-0.5 align-middle text-xs text-muted">
      {t("badge")}
    </span>
  );
}
