import { describe, expect, it } from "vitest";
import { httpUrl, linkUrl } from "@/lib/admin/url-schema";
import { certificateSchema, profileSchema } from "@/lib/admin/schemas";

const bad = ["javascript:alert(1)", "data:text/html,x", "file:///c"];

describe("httpUrl", () => {
  it.each(bad)("rejects %s", (u) => expect(httpUrl().safeParse(u).success).toBe(false));
  it("rejects mailto", () => expect(httpUrl().safeParse("mailto:a@b.co").success).toBe(false));
  it("accepts https", () => expect(httpUrl().safeParse("https://x.dev").success).toBe(true));
  it("accepts http", () => expect(httpUrl().safeParse("http://x.dev").success).toBe(true));
  it("empty only when optional", () => {
    expect(httpUrl().safeParse("").success).toBe(false);
    expect(httpUrl({ optional: true }).safeParse("").success).toBe(true);
  });
  it("Thai error message", () =>
    expect(httpUrl().safeParse("javascript:alert(1)").error?.issues[0].message).toBe(
      "ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://",
    ));
});

describe("linkUrl", () => {
  it.each(bad)("rejects %s", (u) => expect(linkUrl().safeParse(u).success).toBe(false));
  it("accepts mailto", () => expect(linkUrl().safeParse("mailto:a@b.co").success).toBe(true));
  it("accepts https", () => expect(linkUrl().safeParse("https://x.dev").success).toBe(true));
  it("empty only when optional", () => {
    expect(linkUrl().safeParse("").success).toBe(false);
    expect(linkUrl({ optional: true }).safeParse("").success).toBe(true);
  });
});

describe("schemas use them", () => {
  const cert = { title_th: "ก", title_en: "", issuer: "", issued_on: "2025-01-01", expires_on: "", image_path: "", file_path: "" };
  it("credential_url rejects javascript:", () =>
    expect(certificateSchema.safeParse({ ...cert, credential_url: "javascript:alert(1)" }).success).toBe(false));
  it("credential_url empty ok", () =>
    expect(certificateSchema.safeParse({ ...cert, credential_url: "" }).success).toBe(true));
  const prof = { full_name_th: "ก", full_name_en: "", headline_th: "", headline_en: "", university_th: "", university_en: "", location_th: "", location_en: "", email: "", github_username: "", bio_th: "", bio_en: "", avatar_path: "", hero_image_path: "", hero_badge_th: "", hero_badge_en: "", resume_path_th: "", resume_path_en: "" };
  it("profile link rejects data:", () =>
    expect(profileSchema.safeParse({ ...prof, links: [{ label: "a", url: "data:text/html,x", icon: "" }] }).success).toBe(false));
  it("profile link accepts mailto", () =>
    expect(profileSchema.safeParse({ ...prof, links: [{ label: "a", url: "mailto:a@b.co", icon: "" }] }).success).toBe(true));
});
