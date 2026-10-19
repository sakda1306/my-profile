"use server";

import type { ActionResult } from "@/lib/admin/result";
import { friendlyDbError } from "@/lib/admin/bilingual";
import { removeReplaced, str } from "@/lib/admin/replaced-files";
import { parseStack, projectSchema, type ProjectInput } from "@/lib/admin/schemas";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { revalidatePublic } from "@/lib/content/revalidate";
import type { Json } from "@/lib/supabase/database.types";
import { parseDocField } from "@/lib/admin/doc-field";

const IMAGE_FOLDER = "projects/";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BAD_ID = "ไม่พบรายการ";

export async function upsertProject(form: FormData): Promise<ActionResult<{ id: string }>> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = projectSchema.safeParse({
    title_th: str(form, "title_th"),
    title_en: str(form, "title_en"),
    summary_th: str(form, "summary_th"),
    summary_en: str(form, "summary_en"),
    my_role_th: str(form, "my_role_th"),
    my_role_en: str(form, "my_role_en"),
    slug: str(form, "slug"),
    stack: parseStack(str(form, "stack")),
    repo_url: str(form, "repo_url"),
    demo_url: str(form, "demo_url"),
    cover_path: str(form, "cover_path"),
    is_featured: form.get("is_featured") === "on",
    start_date: str(form, "start_date"),
    end_date: str(form, "end_date"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data as ProjectInput;
  const bodyTh = parseDocField(str(form, "body_th"));
  if (!bodyTh.ok) return { ok: false, error: bodyTh.error };
  const bodyEn = parseDocField(str(form, "body_en"));
  if (!bodyEn.ok) return { ok: false, error: bodyEn.error };
  const values = {
    title_th: v.title_th,
    title_en: v.title_en,
    summary_th: v.summary_th,
    summary_en: v.summary_en,
    my_role_th: v.my_role_th,
    my_role_en: v.my_role_en,
    body_th: bodyTh.doc as Json | null,
    body_en: bodyEn.doc as Json | null,
    slug: v.slug,
    stack: v.stack,
    repo_url: v.repo_url || null,
    demo_url: v.demo_url || null,
    cover_path: v.cover_path || null,
    is_featured: v.is_featured,
    start_date: v.start_date || null,
    end_date: v.end_date || null,
  };
  const id = str(form, "id");

  if (id) {
    if (!UUID.test(id)) return { ok: false, error: BAD_ID };
    const { data: old } = await auth.supabase
      .from("projects")
      .select("cover_path")
      .eq("id", id)
      .maybeSingle();
    const { error } = await auth.supabase.from("projects").update(values).eq("id", id);
    if (error) return { ok: false, error: friendlyDbError(error) };
    await removeReplaced(auth.supabase, [[old?.cover_path, values.cover_path]]);
    revalidatePublic();
    return { ok: true, data: { id } };
  }

  const { data: last } = await auth.supabase
    .from("projects")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order = (last?.[0]?.sort_order ?? -1) + 1;
  const { data: created, error } = await auth.supabase
    .from("projects")
    .insert({ ...values, sort_order })
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: friendlyDbError(error ?? {}) };
  revalidatePublic();
  return { ok: true, data: { id: created.id } };
}

export async function addProjectImage(projectId: string, path: string): Promise<ActionResult> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!UUID.test(projectId)) return { ok: false, error: BAD_ID };
  if (!path.startsWith(IMAGE_FOLDER) || path.includes("..") || path.length > 200) {
    return { ok: false, error: "ไฟล์รูปไม่ถูกต้อง" };
  }
  const { data: project } = await auth.supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return { ok: false, error: BAD_ID };

  const { data: last } = await auth.supabase
    .from("project_images")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order = (last?.[0]?.sort_order ?? -1) + 1;
  const { error } = await auth.supabase
    .from("project_images")
    .insert({ project_id: projectId, path, sort_order });
  if (error) return { ok: false, error: friendlyDbError(error) };
  revalidatePublic();
  return { ok: true };
}

export async function updateProjectImageCaption(
  id: string,
  caption_th: string,
  caption_en: string,
): Promise<ActionResult> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!UUID.test(id)) return { ok: false, error: BAD_ID };
  const th = caption_th.trim();
  const en = caption_en.trim();
  if (th.length > 200 || en.length > 200) {
    return { ok: false, error: "คำบรรยายยาวเกิน 200 ตัวอักษร" };
  }
  const { error } = await auth.supabase
    .from("project_images")
    .update({ caption_th: th, caption_en: en })
    .eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  revalidatePublic();
  return { ok: true };
}
