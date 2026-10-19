// Only http(s) and mailto links may become a public href.
export function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return ["http:", "https:", "mailto:"].includes(u.protocol) ? url : null;
  } catch {
    return null;
  }
}

export function formatDate(value: string | null | undefined, locale: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(d);
}

export function formatRange(
  start: string | null | undefined,
  end: string | null | undefined,
  locale: string,
  presentLabel: string,
): string {
  const s = formatDate(start, locale);
  const e = formatDate(end, locale);
  if (!s && !e) return "";
  return `${s} - ${e || presentLabel}`.trim();
}
