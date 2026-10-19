const BASE = "http://local.invalid";
const BAD_CHARS = /[\u0000- \u007f-\u009f\\]/;
const FALLBACK = "/th";

// Shape check, applied to the input and again to the normalized output.
function isPlainPath(p: string): boolean {
  if (!p.startsWith("/") || p.startsWith("//")) return false;
  let decoded: string;
  try {
    decoded = decodeURIComponent(p);
  } catch {
    return false;
  }
  return !BAD_CHARS.test(p) && !BAD_CHARS.test(decoded);
}

// Accepts only same-site absolute paths. Anything else (protocol-relative, backslash,
// full URLs, control characters or whitespace, even percent-encoded) falls back to /th.
// The URL parser strips tab and newline and collapses dot segments (so "/a/..//x"
// becomes "//x"), hence the second check on the normalized result.
export function safeRedirectPath(p: string | null): string {
  if (!p || !isPlainPath(p)) return FALLBACK;
  try {
    const u = new URL(p, BASE);
    if (u.origin !== BASE) return FALLBACK;
    const out = u.pathname + u.search + u.hash;
    return isPlainPath(out) ? out : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
