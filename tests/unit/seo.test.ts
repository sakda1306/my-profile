import { describe, expect, it } from "vitest";
import { buildAlternates, buildSitemapEntries } from "@/lib/seo/alternates";

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
