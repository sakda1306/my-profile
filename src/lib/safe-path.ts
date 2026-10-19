const BASE = "http://local.invalid";
const BAD_CHARS = /[\u0000- \u007f-\u009f\\]/;

// Accepts only same-site absolute paths. Anything else (protocol-relative, backslash,
// full URLs, control characters or whitespace, even percent-encoded) falls back to /th.
// The WHATWG URL parser strips tab and newline, so those must be rejected up front.
export function safeRedirectPath(p: string | null): string {
  const fallback = "/th";
  if (!p || !p.startsWith("/") || p.startsWith("//")) return fallback;
  let decoded: string;
  try {
    decoded = decodeURIComponent(p);
  } catch {
    return fallback;
  }
  if (BAD_CHARS.test(p) || BAD_CHARS.test(decoded)) return fallback;
  try {
    const u = new URL(p, BASE);
    if (u.origin !== BASE) return fallback;
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
}
