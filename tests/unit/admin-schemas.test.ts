import { describe, expect, it } from "vitest";
import {
  CREATABLE_TYPES,
  certificateSchema,
  createSectionSchema,
  pickSettings,
  sectionItemSchema,
  sectionSchema,
  sectionSettingsSchema,
  parseStack,
  profileSchema,
  postSchema,
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

describe("createSectionSchema", () => {
  const ok = { type: "timeline", title_th: "การศึกษา", title_en: "" };
  it("accepts every creatable type", () => {
    for (const type of CREATABLE_TYPES)
      expect(createSectionSchema.safeParse({ ...ok, type }).success).toBe(true);
  });
  it("rejects hero and other system types", () => {
    for (const type of ["hero", "skills", "projects", "certificates", "latest_posts", "contact"])
      expect(createSectionSchema.safeParse({ ...ok, type }).success).toBe(false);
  });
  it("requires a title in at least one language", () =>
    expect(createSectionSchema.safeParse({ ...ok, title_th: " " }).success).toBe(false));
});

describe("sectionSettingsSchema", () => {
  it("accepts columns 1-4", () => {
    expect(sectionSettingsSchema.safeParse({ columns: 1 }).success).toBe(true);
    expect(sectionSettingsSchema.safeParse({ columns: 4 }).success).toBe(true);
  });
  it("rejects columns 5 and 0", () => {
    expect(sectionSettingsSchema.safeParse({ columns: 5 }).success).toBe(false);
    expect(sectionSettingsSchema.safeParse({ columns: 0 }).success).toBe(false);
  });
  it("limit is 1-12", () => {
    expect(sectionSettingsSchema.safeParse({ limit: 12 }).success).toBe(true);
    expect(sectionSettingsSchema.safeParse({ limit: 13 }).success).toBe(false);
    expect(sectionSettingsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });
  it("rejects non-integers", () =>
    expect(sectionSettingsSchema.safeParse({ columns: 2.5 }).success).toBe(false));
});

describe("pickSettings", () => {
  it("keeps columns only for gallery and cards", () => {
    expect(pickSettings("gallery", { columns: 3, limit: 5 })).toEqual({ columns: 3 });
    expect(pickSettings("cards", { columns: 2 })).toEqual({ columns: 2 });
    expect(pickSettings("timeline", { columns: 2, limit: 3 })).toEqual({});
  });
  it("keeps limit only for latest_posts", () =>
    expect(pickSettings("latest_posts", { columns: 3, limit: 5 })).toEqual({ limit: 5 }));
});

describe("sectionSchema", () => {
  const base = { title_th: "", title_en: "Edu", subtitle_th: "", subtitle_en: "", slug: "" };
  it("empty slug falls back to the English title", () =>
    expect((sectionSchema.parse(base) as { slug: string }).slug).toBe("edu"));
  it("normalises a typed slug", () =>
    expect((sectionSchema.parse({ ...base, slug: " My Part! " }) as { slug: string }).slug).toBe(
      "my-part",
    ));
  it("requires a title", () =>
    expect(sectionSchema.safeParse({ ...base, title_en: "" }).success).toBe(false));
});

describe("sectionItemSchema", () => {
  const item = {
    title_th: "",
    title_en: "",
    body_th: "",
    body_en: "",
    image_path: "",
    link_url: "",
    start_date: "",
    end_date: "",
  };
  it("timeline without start_date fails", () =>
    expect(
      sectionItemSchema("timeline").safeParse({ ...item, title_th: "ม.ปลาย" }).success,
    ).toBe(false));
  it("timeline with title and start_date passes", () =>
    expect(
      sectionItemSchema("timeline").safeParse({
        ...item,
        title_th: "ม.ปลาย",
        start_date: "2020-05-01",
      }).success,
    ).toBe(true));
  it("timeline without title fails", () =>
    expect(
      sectionItemSchema("timeline").safeParse({ ...item, start_date: "2020-05-01" }).success,
    ).toBe(false));
  it("timeline end before start fails", () =>
    expect(
      sectionItemSchema("timeline").safeParse({
        ...item,
        title_en: "x",
        start_date: "2020-05-01",
        end_date: "2019-01-01",
      }).success,
    ).toBe(false));
  it("gallery needs image_path", () => {
    expect(sectionItemSchema("gallery").safeParse(item).success).toBe(false);
    expect(
      sectionItemSchema("gallery").safeParse({ ...item, image_path: "sections/a.webp" }).success,
    ).toBe(true);
  });
  it("cards need a title", () => {
    expect(sectionItemSchema("cards").safeParse(item).success).toBe(false);
    expect(sectionItemSchema("cards").safeParse({ ...item, title_en: "Card" }).success).toBe(true);
  });
  it("rejects non-http link_url", () =>
    expect(
      sectionItemSchema("cards").safeParse({
        ...item,
        title_en: "x",
        link_url: "javascript:alert(1)",
      }).success,
    ).toBe(false));
  it("accepts https link_url", () =>
    expect(
      sectionItemSchema("cards").safeParse({
        ...item,
        title_en: "x",
        link_url: "https://example.com",
      }).success,
    ).toBe(true));
});

const validPost = {
  title_th: "บทความ",
  title_en: "",
  excerpt_th: "",
  excerpt_en: "",
  slug: "",
  cover_path: "",
  tags: [] as string[],
  content_th: null,
  content_en: null,
};

describe("postSchema", () => {
  it("accepts valid", () => expect(postSchema.safeParse(validPost).success).toBe(true));
  it("lowercases tags", () =>
    expect(postSchema.safeParse({ ...validPost, tags: ["RAG", "AI"] }).data?.tags).toEqual([
      "rag",
      "ai",
    ]));
  it("trims and dedupes tags", () =>
    expect(
      postSchema.safeParse({ ...validPost, tags: [" AI ", "ai", "", "Ml"] }).data?.tags,
    ).toEqual(["ai", "ml"]));
  it("rejects 11 tags", () =>
    expect(
      postSchema.safeParse({ ...validPost, tags: Array.from({ length: 11 }, (_, i) => `t${i}`) })
        .success,
    ).toBe(false));
  it("accepts 10 tags", () =>
    expect(
      postSchema.safeParse({ ...validPost, tags: Array.from({ length: 10 }, (_, i) => `t${i}`) })
        .success,
    ).toBe(true));
  it("rejects a 31 character tag", () =>
    expect(postSchema.safeParse({ ...validPost, tags: ["a".repeat(31)] }).success).toBe(false));
  it("requires a title in one language", () =>
    expect(postSchema.safeParse({ ...validPost, title_th: "" }).success).toBe(false));
  it("rejects a title over 160", () =>
    expect(postSchema.safeParse({ ...validPost, title_th: "ก".repeat(161) }).success).toBe(false));
  it("rejects an excerpt over 300", () =>
    expect(postSchema.safeParse({ ...validPost, excerpt_en: "a".repeat(301) }).success).toBe(
      false,
    ));
  it("derives slug from the English title, then the Thai title", () => {
    expect(postSchema.safeParse({ ...validPost, title_en: "Hello RAG" }).data?.slug).toBe(
      "hello-rag",
    );
    expect(postSchema.safeParse(validPost).data?.slug).toMatch(/^post-/);
  });
  it("keeps an explicit slug normalised", () =>
    expect(postSchema.safeParse({ ...validPost, slug: "My Post" }).data?.slug).toBe("my-post"));
  it("accepts a doc and rejects a non-doc", () => {
    const doc = { type: "doc", content: [{ type: "paragraph" }] };
    expect(postSchema.safeParse({ ...validPost, content_th: doc }).success).toBe(true);
    expect(postSchema.safeParse({ ...validPost, content_th: { type: "x" } }).success).toBe(false);
  });
});
