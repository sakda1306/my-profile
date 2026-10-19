// Accepts only same-site absolute paths. Anything else (protocol-relative,
// backslash tricks, full URLs, empty) falls back to the default locale home.
export function safeRedirectPath(p: string | null): string {
  if (!p || !p.startsWith("/") || p.startsWith("//") || p.startsWith("/\\")) {
    return "/th";
  }
  return p;
}
