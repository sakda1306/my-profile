import { z } from "zod";
import { withBilingual } from "@/lib/admin/bilingual";
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
    bio_th: z.string().trim().max(20000),
    bio_en: z.string().trim().max(20000),
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

// withBilingual builds its shape dynamically, so the parsed output is loosely typed.
// These mirror the schemas above; actions cast parsed.data to them.
type Bi<N extends string> = Record<`${N}_th` | `${N}_en`, string>;
export type ProfileInput = Bi<"full_name"> &
  Bi<"headline"> &
  Bi<"university"> &
  Bi<"location"> & {
    email: string;
    github_username: string;
    bio_th: string;
    bio_en: string;
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
