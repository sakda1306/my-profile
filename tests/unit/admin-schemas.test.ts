import { describe, expect, it } from "vitest";
import {
  certificateSchema,
  parseStack,
  profileSchema,
  projectSchema,
  skillSchema,
} from "@/lib/admin/schemas";
import { slugify } from "@/lib/admin/slugify";

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

const project = {
  title_th: "",
  title_en: "Football Assistant",
  summary_th: "",
  summary_en: "",
  my_role_th: "",
  my_role_en: "",
  slug: "",
  stack: ["Next.js", "Supabase"],
  repo_url: "",
  demo_url: "",
  cover_path: "",
  is_featured: false,
  start_date: "",
  end_date: "",
};

describe("projectSchema", () => {
  it("accepts valid", () => expect(projectSchema.safeParse(project).success).toBe(true));
  it("rejects 16 stack items", () =>
    expect(
      projectSchema.safeParse({ ...project, stack: Array.from({ length: 16 }, (_, i) => `s${i}`) })
        .success,
    ).toBe(false));
  it("accepts 15 stack items", () =>
    expect(
      projectSchema.safeParse({ ...project, stack: Array.from({ length: 15 }, (_, i) => `s${i}`) })
        .success,
    ).toBe(true));
  it("rejects missing title in both languages", () =>
    expect(projectSchema.safeParse({ ...project, title_en: "" }).success).toBe(false));
  it("rejects javascript: repo url", () =>
    expect(projectSchema.safeParse({ ...project, repo_url: "javascript:alert(1)" }).success).toBe(
      false,
    ));
  it("rejects end_date before start_date", () =>
    expect(
      projectSchema.safeParse({ ...project, start_date: "2025-06-01", end_date: "2025-01-01" })
        .success,
    ).toBe(false));
  it("accepts end_date equal to start_date", () =>
    expect(
      projectSchema.safeParse({ ...project, start_date: "2025-06-01", end_date: "2025-06-01" })
        .success,
    ).toBe(true));
  it("rejects bad date", () =>
    expect(projectSchema.safeParse({ ...project, start_date: "x" }).success).toBe(false));
  it("empty slug falls back to slugified English title", () => {
    const d = projectSchema.parse(project) as { slug: string };
    expect(d.slug).toBe("football-assistant");
    expect(slugify(project.title_en, "project")).toBe("football-assistant");
  });
  it("normalises a user slug", () => {
    const d = projectSchema.parse({ ...project, slug: " My Slug_1! " }) as { slug: string };
    expect(d.slug).toBe("my-slug-1");
  });
});

describe("parseStack", () => {
  it("trims, drops empties", () => expect(parseStack(" a, ,b ,,c")).toEqual(["a", "b", "c"]));
  it("empty gives []", () => expect(parseStack("")).toEqual([]));
});
