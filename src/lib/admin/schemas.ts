import { z } from "zod";
import { withBilingual } from "@/lib/admin/bilingual";
import { slugify } from "@/lib/admin/slugify";
import { httpUrl, linkUrl } from "@/lib/admin/url-schema";

const emptyOr = <T extends z.ZodType>(s: T) => z.union([z.literal(""), s]);

export const linkSchema = z.object({
  label: z.string().trim().min(1, "กรอกชื่อลิงก์").max(60),
  url: linkUrl(),
  icon: z.string().trim().max(40),
});

export const profileSchema = withBilingual(
  {
    email: emptyOr(z.email("อีเมลไม่ถูกต้อง")),
    github_username: z.string().trim().max(60),
    links: z.array(linkSchema).max(10, "เพิ่มลิงก์ได้ไม่เกิน 10 รายการ"),
    avatar_path: z.string(),
    resume_path_th: z.string(),
    resume_path_en: z.string(),
  },
  [
    { name: "full_name", required: true, max: 100 },
    { name: "headline", required: false, max: 160 },
    { name: "university", required: false, max: 160 },
    { name: "location", required: false, max: 160 },
  ],
);

export const SKILL_CATEGORIES = ["language", "framework", "tool", "ai_data", "soft"] as const;
export const CATEGORY_LABEL: Record<(typeof SKILL_CATEGORIES)[number], string> = {
  language: "ภาษา",
  framework: "เฟรมเวิร์ก",
  tool: "เครื่องมือ",
  ai_data: "AI และข้อมูล",
  soft: "ทักษะอื่น ๆ",
};

export const skillSchema = withBilingual(
  {
    name: z.string().trim().min(1, "กรอกชื่อ").max(60),
    category: z.enum(SKILL_CATEGORIES),
    icon_slug: emptyOr(z.string().regex(/^[a-z0-9]+$/, "ใช้ได้เฉพาะ a-z และตัวเลข")),
    icon_path: z.string(),
  },
  [{ name: "note", required: false, max: 160 }],
);

export const certificateSchema = withBilingual(
  {
    issuer: z.string().trim().max(120),
    issued_on: z.iso.date("วันที่ไม่ถูกต้อง"),
    expires_on: emptyOr(z.iso.date("วันที่ไม่ถูกต้อง")),
    credential_url: httpUrl({ optional: true }),
    image_path: z.string(),
    file_path: z.string(),
  },
  [{ name: "title", required: true, max: 160 }],
).superRefine((v, ctx) => {
  if (v.expires_on && v.issued_on && v.expires_on < v.issued_on) {
    ctx.addIssue({
      code: "custom",
      message: "วันหมดอายุต้องไม่ก่อนวันที่ออก",
      path: ["expires_on"],
    });
  }
});

export const MAX_STACK = 15;

// "a, b,,c" -> ["a","b","c"]
export function parseStack(raw: string): string[] {
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export const projectSchema = withBilingual(
  {
    slug: z.string().trim().max(80),
    stack: z.array(z.string().trim().min(1).max(40)).max(MAX_STACK, "เพิ่มเทคโนโลยีได้ไม่เกิน 15 รายการ"),
    repo_url: httpUrl({ optional: true }),
    demo_url: httpUrl({ optional: true }),
    cover_path: z.string(),
    is_featured: z.boolean(),
    start_date: emptyOr(z.iso.date("วันที่ไม่ถูกต้อง")),
    end_date: emptyOr(z.iso.date("วันที่ไม่ถูกต้อง")),
  },
  [
    { name: "title", required: true, max: 120 },
    { name: "summary", required: false, max: 300 },
    { name: "my_role", required: false, max: 300 },
  ],
)
  .superRefine((v, ctx) => {
    if (v.start_date && v.end_date && v.end_date < v.start_date) {
      ctx.addIssue({
        code: "custom",
        message: "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม",
        path: ["end_date"],
      });
    }
  })
  .transform((v) => {
    const r = v as Record<string, unknown> & { slug: string; title_en: string; title_th: string };
    return { ...r, slug: slugify(r.slug || r.title_en || r.title_th, "project") };
  });

export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 30;
export const MAX_DOC_BYTES = 500_000;

// Tiptap document: an object with type "doc". Content is checked by sanitizeDoc and the editor schema.
export const tiptapDocSchema = z
  .object({ type: z.literal("doc"), content: z.array(z.looseObject({ type: z.string() })).optional() })
  .loose()
  .refine((d) => JSON.stringify(d).length <= MAX_DOC_BYTES, "เนื้อหายาวเกินไป");

// " AI, ai,Ml" -> ["ai","ml"]
export function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

export const postSchema = withBilingual(
  {
    slug: z.string().trim().max(80),
    cover_path: z.string().max(200),
    tags: z
      .array(z.string())
      .transform(normalizeTags)
      .pipe(
        z
          .array(z.string().max(MAX_TAG_LENGTH, "แท็กยาวได้ไม่เกิน 30 ตัวอักษร"))
          .max(MAX_TAGS, "เพิ่มแท็กได้ไม่เกิน 10 รายการ"),
      ),
    content_th: tiptapDocSchema.nullable(),
    content_en: tiptapDocSchema.nullable(),
  },
  [
    { name: "title", required: true, max: 160 },
    { name: "excerpt", required: false, max: 300 },
  ],
).transform((v): PostInput => {
  const r = v as unknown as PostInput;
  return { ...r, slug: slugify(r.slug || r.title_en || r.title_th, "post") };
});

export type PostInput = Bi<"title"> &
  Bi<"excerpt"> & {
    slug: string;
    cover_path: string;
    tags: string[];
    content_th: { type: "doc" } | null;
    content_en: { type: "doc" } | null;
  };

// withBilingual builds its shape dynamically, so the parsed output is loosely typed.
// These mirror the schemas above; actions cast parsed.data to them.
type Bi<N extends string> = Record<`${N}_th` | `${N}_en`, string>;
export type ProfileInput = Bi<"full_name"> &
  Bi<"headline"> &
  Bi<"university"> &
  Bi<"location"> & {
    email: string;
    github_username: string;
    links: z.infer<typeof linkSchema>[];
    avatar_path: string;
    resume_path_th: string;
    resume_path_en: string;
  };
export type SkillInput = Bi<"note"> & {
  name: string;
  category: (typeof SKILL_CATEGORIES)[number];
  icon_slug: string;
  icon_path: string;
};
export type CertificateInput = Bi<"title"> & {
  issuer: string;
  issued_on: string;
  expires_on: string;
  credential_url: string;
  image_path: string;
  file_path: string;
};
export type ProjectInput = Bi<"title"> &
  Bi<"summary"> &
  Bi<"my_role"> & {
    slug: string;
    stack: string[];
    repo_url: string;
    demo_url: string;
    cover_path: string;
    is_featured: boolean;
    start_date: string;
    end_date: string;
  };

// ---- Sections (Task 9) ----
export const CREATABLE_TYPES = ["rich_text", "gallery", "cards", "timeline"] as const;
export type CreatableType = (typeof CREATABLE_TYPES)[number];
export const TYPE_LABEL: Record<CreatableType, string> = {
  rich_text: "ข้อความ",
  gallery: "แกลเลอรี",
  cards: "การ์ด",
  timeline: "ไทม์ไลน์",
};

export function isCreatableType(v: unknown): v is CreatableType {
  return typeof v === "string" && (CREATABLE_TYPES as readonly string[]).includes(v);
}

export const createSectionSchema = withBilingual(
  { type: z.enum(CREATABLE_TYPES) },
  [{ name: "title", required: true, max: 120 }],
);

export const sectionSettingsSchema = z.object({
  columns: z.number().int("ต้องเป็นจำนวนเต็ม").min(1, "จำนวนคอลัมน์ต้องอยู่ระหว่าง 1-4").max(4, "จำนวนคอลัมน์ต้องอยู่ระหว่าง 1-4").optional(),
  limit: z.number().int("ต้องเป็นจำนวนเต็ม").min(1, "จำนวนต้องอยู่ระหว่าง 1-12").max(12, "จำนวนต้องอยู่ระหว่าง 1-12").optional(),
});
export type SectionSettings = z.infer<typeof sectionSettingsSchema>;

// Keep only the settings keys that make sense for the section type.
export function pickSettings(type: string, s: SectionSettings): SectionSettings {
  const out: SectionSettings = {};
  if ((type === "gallery" || type === "cards") && s.columns !== undefined) out.columns = s.columns;
  if (type === "latest_posts" && s.limit !== undefined) out.limit = s.limit;
  return out;
}

export const sectionSchema = withBilingual({ slug: z.string().trim().max(80) }, [
  { name: "title", required: true, max: 120 },
  { name: "subtitle", required: false, max: 300 },
]).transform((v) => {
  const r = v as Record<string, unknown> & { slug: string; title_en: string; title_th: string };
  return { ...r, slug: slugify(r.slug || r.title_en || r.title_th, "section") };
});

export function sectionItemSchema(type: "gallery" | "cards" | "timeline") {
  return withBilingual(
    {
      body_th: z.string().trim().max(2000),
      body_en: z.string().trim().max(2000),
      image_path: z.string().max(200),
      link_url: httpUrl({ optional: true }),
      start_date: emptyOr(z.iso.date("วันที่ไม่ถูกต้อง")),
      end_date: emptyOr(z.iso.date("วันที่ไม่ถูกต้อง")),
    },
    [{ name: "title", required: type !== "gallery", max: 160 }],
  ).superRefine((v, ctx) => {
    if (type === "gallery" && !v.image_path) {
      ctx.addIssue({ code: "custom", message: "เลือกรูปภาพ", path: ["image_path"] });
    }
    if (type === "timeline" && !v.start_date) {
      ctx.addIssue({ code: "custom", message: "กรอกวันที่เริ่ม", path: ["start_date"] });
    }
    if (v.start_date && v.end_date && v.end_date < v.start_date) {
      ctx.addIssue({
        code: "custom",
        message: "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม",
        path: ["end_date"],
      });
    }
  });
}

export type SectionInput = Bi<"title"> & Bi<"subtitle"> & { slug: string };
export type SectionItemInput = Bi<"title"> &
  Bi<"body"> & {
    image_path: string;
    link_url: string;
    start_date: string;
    end_date: string;
  };
