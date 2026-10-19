"use server";

import type { ActionResult } from "@/lib/admin/result";
import { friendlyDbError } from "@/lib/admin/bilingual";
import { removeReplaced, str } from "@/lib/admin/replaced-files";
import {
  createSectionSchema,
  isCreatableType,
  pickSettings,
  sectionItemSchema,
  sectionSchema,
  sectionSettingsSchema,
  type CreatableType,
  type SectionInput,
  type SectionItemInput,
} from "@/lib/admin/schemas";
import { slugify } from "@/lib/admin/slugify";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { revalidatePublic } from "@/lib/content/revalidate";
import type { Json } from "@/lib/supabase/database.types";
import { parseDocField } from "@/lib/admin/doc-field";

const IMAGE_FOLDER = "sections/";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BAD_ID = "ไม่พบรายการ";

export async function createSection(
  type: CreatableType,
  title: { th: string; en: string },
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };
  // `type` comes from the client, so the TS type alone is not enough.
  if (!isCreatableType(type)) return { ok: false, error: "ประเภทหมวดไม่ถูกต้อง" };
  const parsed = createSectionSchema.safeParse({
    type,
    title_th: title?.th ?? "",
    title_en: title?.en ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data as { title_th: string; title_en: string };

  const { data: last } = await auth.supabase
    .from("sections")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order = (last?.[0]?.sort_order ?? -1) + 1;
  const { data: created, error } = await auth.supabase
    .from("sections")
    .insert({
      type,
      slug: slugify(v.title_en || v.title_th, "section"),
      title_th: v.title_th,
      title_en: v.title_en,
      is_system: false,
      sort_order,
    })
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: friendlyDbError(error ?? {}) };
  revalidatePublic();
  return { ok: true, data: { id: created.id } };
}

function num(form: FormData, key: string): number | undefined {
  const s = str(form, key).trim();
  return s === "" ? undefined : Number(s);
}

// Never writes `type` or `is_system`. The section type is read from the DB, not the form.
export async function updateSection(form: FormData): Promise<ActionResult> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };
  const id = str(form, "id");
  if (!UUID.test(id)) return { ok: false, error: BAD_ID };
  const { data: section } = await auth.supabase
    .from("sections")
    .select("type, settings")
    .eq("id", id)
    .maybeSingle();
  if (!section) return { ok: false, error: BAD_ID };

  const parsed = sectionSchema.safeParse({
    title_th: str(form, "title_th"),
    title_en: str(form, "title_en"),
    subtitle_th: str(form, "subtitle_th"),
    subtitle_en: str(form, "subtitle_en"),
    slug: str(form, "slug"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data as SectionInput;

  const settingsParsed = sectionSettingsSchema.safeParse({
    columns: num(form, "columns"),
    limit: num(form, "limit"),
  });
  if (!settingsParsed.success) return { ok: false, error: settingsParsed.error.issues[0].message };
  const prev =
    section.settings && typeof section.settings === "object" && !Array.isArray(section.settings)
      ? { ...(section.settings as Record<string, Json>) }
      : {};
  delete prev.columns;
  delete prev.limit;
  const settings = { ...prev, ...pickSettings(section.type, settingsParsed.data) } as Json;

  const values: {
    title_th: string;
    title_en: string;
    subtitle_th: string;
    subtitle_en: string;
    slug: string;
    settings: Json;
    body_th?: Json | null;
    body_en?: Json | null;
  } = {
    title_th: v.title_th,
    title_en: v.title_en,
    subtitle_th: v.subtitle_th,
    subtitle_en: v.subtitle_en,
    slug: v.slug,
    settings,
  };
  if (section.type === "rich_text") {
    const bodyTh = parseDocField(str(form, "body_th"));
    if (!bodyTh.ok) return { ok: false, error: bodyTh.error };
    const bodyEn = parseDocField(str(form, "body_en"));
    if (!bodyEn.ok) return { ok: false, error: bodyEn.error };
    values.body_th = bodyTh.doc as Json | null;
    values.body_en = bodyEn.doc as Json | null;
  }
  const { error } = await auth.supabase.from("sections").update(values).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  revalidatePublic();
  return { ok: true };
}

export async function upsertSectionItem(form: FormData): Promise<ActionResult> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };
  const sectionId = str(form, "section_id");
  if (!UUID.test(sectionId)) return { ok: false, error: BAD_ID };
  const { data: section } = await auth.supabase
    .from("sections")
    .select("type")
    .eq("id", sectionId)
    .maybeSingle();
  if (!section) return { ok: false, error: BAD_ID };
  const type = section.type;
  if (type !== "gallery" && type !== "cards" && type !== "timeline") {
    return { ok: false, error: "หมวดนี้ไม่มีรายการย่อย" };
  }

  const image_path = str(form, "image_path");
  if (image_path && (!image_path.startsWith(IMAGE_FOLDER) || image_path.includes(".."))) {
    return { ok: false, error: "ไฟล์รูปไม่ถูกต้อง" };
  }
  const parsed = sectionItemSchema(type).safeParse({
    title_th: str(form, "title_th"),
    title_en: str(form, "title_en"),
    body_th: str(form, "body_th"),
    body_en: str(form, "body_en"),
    image_path,
    link_url: str(form, "link_url"),
    start_date: str(form, "start_date"),
    end_date: str(form, "end_date"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data as SectionItemInput;
  const values = {
    title_th: v.title_th,
    title_en: v.title_en,
    body_th: v.body_th,
    body_en: v.body_en,
    image_path: v.image_path || null,
    link_url: v.link_url || null,
    start_date: v.start_date || null,
    end_date: v.end_date || null,
  };

  const id = str(form, "id");
  if (id) {
    if (!UUID.test(id)) return { ok: false, error: BAD_ID };
    const { data: old } = await auth.supabase
      .from("section_items")
      .select("image_path")
      .eq("id", id)
      .eq("section_id", sectionId)
      .maybeSingle();
    if (!old) return { ok: false, error: BAD_ID };
    const { error } = await auth.supabase
      .from("section_items")
      .update(values)
      .eq("id", id)
      .eq("section_id", sectionId);
    if (error) return { ok: false, error: friendlyDbError(error) };
    await removeReplaced(auth.supabase, [[old.image_path, values.image_path]]);
    revalidatePublic();
    return { ok: true };
  }

  const { data: last } = await auth.supabase
    .from("section_items")
    .select("sort_order")
    .eq("section_id", sectionId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order = (last?.[0]?.sort_order ?? -1) + 1;
  const { error } = await auth.supabase
    .from("section_items")
    .insert({ ...values, section_id: sectionId, sort_order });
  if (error) return { ok: false, error: friendlyDbError(error) };
  revalidatePublic();
  return { ok: true };
}
