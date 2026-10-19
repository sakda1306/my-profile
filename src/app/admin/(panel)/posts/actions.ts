"use server";

import type { ActionResult } from "@/lib/admin/result";
import { friendlyDbError } from "@/lib/admin/bilingual";
import { parseDocField } from "@/lib/admin/doc-field";
import { removeReplaced, str } from "@/lib/admin/replaced-files";
import { parseStack, postSchema, type PostInput } from "@/lib/admin/schemas";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { revalidatePublic } from "@/lib/content/revalidate";
import type { Json } from "@/lib/supabase/database.types";

const COVER_FOLDER = "posts/";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BAD_ID = "ไม่พบรายการ";

export async function upsertPost(form: FormData): Promise<ActionResult<{ id: string }>> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };

  const cover_path = str(form, "cover_path");
  if (cover_path && (!cover_path.startsWith(COVER_FOLDER) || cover_path.includes(".."))) {
    return { ok: false, error: "ไฟล์รูปไม่ถูกต้อง" };
  }
  const th = parseDocField(str(form, "content_th"));
  if (!th.ok) return { ok: false, error: th.error };
  const en = parseDocField(str(form, "content_en"));
  if (!en.ok) return { ok: false, error: en.error };

  const parsed = postSchema.safeParse({
    title_th: str(form, "title_th"),
    title_en: str(form, "title_en"),
    excerpt_th: str(form, "excerpt_th"),
    excerpt_en: str(form, "excerpt_en"),
    slug: str(form, "slug"),
    cover_path,
    tags: parseStack(str(form, "tags")),
    content_th: th.doc,
    content_en: en.doc,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data as PostInput;
  const values = {
    title_th: v.title_th,
    title_en: v.title_en,
    excerpt_th: v.excerpt_th,
    excerpt_en: v.excerpt_en,
    content_th: v.content_th as Json | null,
    content_en: v.content_en as Json | null,
    slug: v.slug,
    tags: v.tags,
    cover_path: v.cover_path || null,
  };
  const id = str(form, "id");

  if (id) {
    if (!UUID.test(id)) return { ok: false, error: BAD_ID };
    const { data: old } = await auth.supabase
      .from("posts")
      .select("cover_path")
      .eq("id", id)
      .maybeSingle();
    if (!old) return { ok: false, error: BAD_ID };
    const { error } = await auth.supabase.from("posts").update(values).eq("id", id);
    if (error) return { ok: false, error: friendlyDbError(error) };
    await removeReplaced(auth.supabase, [[old.cover_path, values.cover_path]]);
    revalidatePublic();
    return { ok: true, data: { id } };
  }

  // New posts always start as drafts.
  const { data: created, error } = await auth.supabase
    .from("posts")
    .insert({ ...values, status: "draft" })
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: friendlyDbError(error ?? {}) };
  revalidatePublic();
  return { ok: true, data: { id: created.id } };
}

export async function setPostStatus(
  id: string,
  status: "draft" | "published",
): Promise<ActionResult> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };
  if (!UUID.test(id)) return { ok: false, error: BAD_ID };
  // `status` comes from the client, so the TS type alone is not enough.
  if (status !== "draft" && status !== "published") {
    return { ok: false, error: "สถานะไม่ถูกต้อง" };
  }
  const { data: post } = await auth.supabase
    .from("posts")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();
  if (!post) return { ok: false, error: BAD_ID };

  // published_at is set the first time only and is never cleared on unpublish.
  const values: { status: "draft" | "published"; published_at?: string } = { status };
  if (status === "published" && !post.published_at) values.published_at = new Date().toISOString();
  const { error } = await auth.supabase.from("posts").update(values).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  revalidatePublic();
  return { ok: true };
}
