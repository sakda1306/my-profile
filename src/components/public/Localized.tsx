import { FallbackBadge } from "@/components/public/FallbackBadge";
import { pick, type Locale } from "@/lib/locale/pick";

// Renders a bilingual plain-text field with the fallback badge when needed.
export function Localized({
  row,
  field,
  locale,
}: {
  row: Record<string, unknown>;
  field: string;
  locale: Locale;
}) {
  const { value, isFallback } = pick(row, field, locale);
  if (!value) return null;
  return (
    <>
      {String(value)}
      {isFallback ? <FallbackBadge /> : null}
    </>
  );
}
