"use server";

import type { ActionResult } from "@/lib/admin/result";
import { friendlyDbError } from "@/lib/admin/bilingual";
import { removeReplaced, str } from "@/lib/admin/replaced-files";
import { skillSchema, type SkillInput } from "@/lib/admin/schemas";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { revalidatePublic } from "@/lib/content/revalidate";

export async function upsertSkill(form: FormData): Promise<ActionResult> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = skillSchema.safeParse({
    name: str(form, "name"),
    category: str(form, "category"),
    icon_slug: str(form, "icon_slug"),
    icon_path: str(form, "icon_path"),
    note_th: str(form, "note_th"),
    note_en: str(form, "note_en"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data as SkillInput;
  const values = {
    name: v.name,
    category: v.category,
    icon_slug: v.icon_slug || null,
    icon_path: v.icon_path || null,
    note_th: v.note_th,
    note_en: v.note_en,
  };
  const id = str(form, "id");

  if (id) {
    const { data: old } = await auth.supabase
      .from("skills")
      .select("icon_path")
      .eq("id", id)
      .maybeSingle();
    const { error } = await auth.supabase.from("skills").update(values).eq("id", id);
    if (error) return { ok: false, error: friendlyDbError(error) };
    await removeReplaced(auth.supabase, [[old?.icon_path, values.icon_path]]);
  } else {
    const { data: last } = await auth.supabase
      .from("skills")
      .select("sort_order")
      .eq("category", v.category)
      .order("sort_order", { ascending: false })
      .limit(1);
    const sort_order = (last?.[0]?.sort_order ?? -1) + 1;
    const { error } = await auth.supabase.from("skills").insert({ ...values, sort_order });
    if (error) return { ok: false, error: friendlyDbError(error) };
  }
  revalidatePublic();
  return { ok: true };
}
