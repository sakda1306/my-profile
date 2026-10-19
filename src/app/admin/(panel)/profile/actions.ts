"use server";

import type { ActionResult } from "@/lib/admin/result";
import { friendlyDbError } from "@/lib/admin/bilingual";
import { removeReplaced, str } from "@/lib/admin/replaced-files";
import { profileSchema, type ProfileInput } from "@/lib/admin/schemas";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { revalidatePublic } from "@/lib/content/revalidate";
import { plainToDoc } from "@/lib/richtext/plain";

const FIELDS = [
  "full_name_th", "full_name_en", "headline_th", "headline_en", "university_th",
  "university_en", "location_th", "location_en", "email", "github_username",
  "bio_th", "bio_en", "avatar_path", "resume_path_th", "resume_path_en",
] as const;

export async function saveProfile(form: FormData): Promise<ActionResult> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };

  let links: unknown = [];
  try {
    links = JSON.parse(str(form, "links") || "[]");
  } catch {
    return { ok: false, error: "ข้อมูลลิงก์ไม่ถูกต้อง" };
  }
  const raw: Record<string, unknown> = { links };
  for (const f of FIELDS) raw[f] = str(form, f);
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data as ProfileInput;

  const { data: old } = await auth.supabase
    .from("profile")
    .select("avatar_path, resume_path_th, resume_path_en")
    .eq("id", true)
    .maybeSingle();

  const { error } = await auth.supabase.from("profile").upsert({
    id: true,
    full_name_th: v.full_name_th,
    full_name_en: v.full_name_en,
    headline_th: v.headline_th,
    headline_en: v.headline_en,
    university_th: v.university_th,
    university_en: v.university_en,
    location_th: v.location_th,
    location_en: v.location_en,
    email: v.email || null,
    github_username: v.github_username || null,
    bio_th: plainToDoc(v.bio_th),
    bio_en: plainToDoc(v.bio_en),
    links: v.links,
    avatar_path: v.avatar_path || null,
    resume_path_th: v.resume_path_th || null,
    resume_path_en: v.resume_path_en || null,
  });
  if (error) return { ok: false, error: friendlyDbError(error) };

  await removeReplaced(auth.supabase, [
    [old?.avatar_path, v.avatar_path || null],
    [old?.resume_path_th, v.resume_path_th || null],
    [old?.resume_path_en, v.resume_path_en || null],
  ]);
  revalidatePublic();
  return { ok: true };
}
