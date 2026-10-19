import { z } from "zod";

const MESSAGE = "ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://";

function schemeUrl(allowed: string[], optional: boolean) {
  const url = z.string().trim().refine((v) => {
    try {
      return allowed.includes(new URL(v).protocol);
    } catch {
      return false;
    }
  }, MESSAGE);
  return optional ? z.union([z.literal(""), url]) : url;
}

// http/https only. Use for any URL that becomes a public href (repo, demo, credential...).
export const httpUrl = (opts: { optional?: boolean } = {}) =>
  schemeUrl(["http:", "https:"], opts.optional ?? false);

// http, https and mailto. Use for profile-style contact links.
export const linkUrl = (opts: { optional?: boolean } = {}) =>
  schemeUrl(["http:", "https:", "mailto:"], opts.optional ?? false);
