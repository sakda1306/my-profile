export type Locale = "th" | "en";

export const LOCALES: Locale[] = ["th", "en"];

export function otherLocale(l: Locale): Locale {
  return l === "th" ? "en" : "th";
}

function hasText(node: unknown): boolean {
  if (node === null || typeof node !== "object") return false;
  const n = node as { type?: unknown; text?: unknown; content?: unknown };
  if (n.type === "text") {
    return typeof n.text === "string" && n.text.trim() !== "";
  }
  return Array.isArray(n.content) && n.content.some(hasText);
}

export function isEmptyValue(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (typeof v === "object") return !hasText(v);
  return false;
}

export function pick<T extends Record<string, unknown>>(
  row: T,
  field: string,
  locale: Locale,
): { value: any; lang: Locale; isFallback: boolean } { // eslint-disable-line @typescript-eslint/no-explicit-any
  const wanted = row[`${field}_${locale}`];
  if (!isEmptyValue(wanted)) {
    return { value: wanted, lang: locale, isFallback: false };
  }
  const other = otherLocale(locale);
  const fallback = row[`${field}_${other}`];
  if (!isEmptyValue(fallback)) {
    return { value: fallback, lang: other, isFallback: true };
  }
  return { value: null, lang: locale, isFallback: false };
}

export function hasOwnContent(
  row: Record<string, unknown>,
  fields: string[],
  locale: Locale,
): boolean {
  return fields.every((f) => !isEmptyValue(row[`${f}_${locale}`]));
}
