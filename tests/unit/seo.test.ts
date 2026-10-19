import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildAlternates, buildSitemapEntries, getSiteUrl } from "@/lib/seo/alternates";

const SITE = "https://example.com";
const thOnly = { th: true, en: false };

describe("buildAlternates", () => {
  it("points canonical at the locale that has content", () => {
    expect(buildAlternates("/blog/x", thOnly, "en", SITE)).toEqual({
      canonical: `${SITE}/th/blog/x`,
      languages: { th: `${SITE}/th/blog/x` },
    });
  });
  it("uses the current locale when both exist", () => {
    const a = buildAlternates("/blog/x", { th: true, en: true }, "en", SITE);
    expect(a.canonical).toBe(`${SITE}/en/blog/x`);
    expect(a.languages).toEqual({ th: `${SITE}/th/blog/x`, en: `${SITE}/en/blog/x` });
  });
  it("handles the home path", () => {
    expect(buildAlternates("", { th: true, en: true }, "th", SITE).canonical).toBe(`${SITE}/th`);
  });
});

describe("buildSitemapEntries", () => {
  it("only lists locales with own content", () => {
    expect(buildSitemapEntries([{ path: "/blog/x", own: thOnly }], SITE).map((e) => e.url)).toEqual([
      `${SITE}/th/blog/x`,
    ]);
  });
  it("carries updatedAt as lastModified", () => {
    const [e] = buildSitemapEntries([{ path: "/a", own: thOnly, updatedAt: "2026-01-02T00:00:00Z" }], SITE);
    expect(e.lastModified).toEqual(new Date("2026-01-02T00:00:00Z"));
  });
});

describe("getSiteUrl", () => {
  const keys = ["NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "SITE_URL"] as const;
  const saved: Record<string, string | undefined> = {};
  beforeEach(() => {
    for (const k of keys) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
  });
  afterEach(() => {
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
    vi.restoreAllMocks();
  });

  it("prefers NEXT_PUBLIC_SITE_URL and trims trailing slashes", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://a.example/";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "b.example";
    expect(getSiteUrl()).toBe("https://a.example");
  });
  it("falls back to the Vercel production domain", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "b.example";
    expect(getSiteUrl()).toBe("https://b.example");
  });
  it("ignores the old SITE_URL variable", () => {
    process.env.SITE_URL = "https://old.example";
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
  it("warns once in production when the result is localhost", () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    getSiteUrl();
    getSiteUrl();
    vi.unstubAllEnvs();
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
