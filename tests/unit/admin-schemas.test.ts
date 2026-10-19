import { describe, expect, it } from "vitest";
import { certificateSchema, profileSchema, skillSchema } from "@/lib/admin/schemas";

const cert = {
  title_th: "ใบประกาศ",
  title_en: "",
  issuer: "X",
  issued_on: "2025-05-01",
  expires_on: "",
  credential_url: "",
  image_path: "",
  file_path: "",
};
const profile = {
  full_name_th: "ก",
  full_name_en: "",
  headline_th: "",
  headline_en: "",
  university_th: "",
  university_en: "",
  location_th: "",
  location_en: "",
  email: "",
  github_username: "",
  bio_th: "",
  bio_en: "",
  links: [],
  avatar_path: "",
  resume_path_th: "",
  resume_path_en: "",
};
const skill = {
  name: "Python",
  category: "language",
  icon_slug: "python",
  icon_path: "",
  note_th: "",
  note_en: "",
};

describe("certificateSchema", () => {
  it("accepts valid", () => expect(certificateSchema.safeParse(cert).success).toBe(true));
  it("rejects expires_on before issued_on", () =>
    expect(certificateSchema.safeParse({ ...cert, expires_on: "2025-01-01" }).success).toBe(false));
  it("rejects missing title in both languages", () =>
    expect(certificateSchema.safeParse({ ...cert, title_th: "" }).success).toBe(false));
  it("rejects bad credential url", () =>
    expect(certificateSchema.safeParse({ ...cert, credential_url: "nope" }).success).toBe(false));
});

describe("skillSchema", () => {
  it("accepts valid", () => expect(skillSchema.safeParse(skill).success).toBe(true));
  it("rejects icon_slug Python!", () =>
    expect(skillSchema.safeParse({ ...skill, icon_slug: "Python!" }).success).toBe(false));
  it("accepts empty icon_slug", () =>
    expect(skillSchema.safeParse({ ...skill, icon_slug: "" }).success).toBe(true));
});

describe("profileSchema", () => {
  it("accepts valid", () => expect(profileSchema.safeParse(profile).success).toBe(true));
  it("rejects invalid link url", () =>
    expect(
      profileSchema.safeParse({ ...profile, links: [{ label: "a", url: "x", icon: "" }] }).success,
    ).toBe(false));
  it("rejects more than 10 links", () =>
    expect(
      profileSchema.safeParse({
        ...profile,
        links: Array.from({ length: 11 }, () => ({ label: "a", url: "https://a.io", icon: "" })),
      }).success,
    ).toBe(false));
  it("requires a name in one language", () =>
    expect(profileSchema.safeParse({ ...profile, full_name_th: "" }).success).toBe(false));
});
