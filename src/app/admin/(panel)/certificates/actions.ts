"use server";

import type { ActionResult } from "@/lib/admin/result";
import { friendlyDbError } from "@/lib/admin/bilingual";
import { removeReplaced, str } from "@/lib/admin/replaced-files";
import { certificateSchema, type CertificateInput } from "@/lib/admin/schemas";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { revalidatePublic } from "@/lib/content/revalidate";

export async function upsertCertificate(form: FormData): Promise<ActionResult> {
  const auth = await requireAdminAction();
  if ("error" in auth) return { ok: false, error: auth.error };

  const parsed = certificateSchema.safeParse({
    title_th: str(form, "title_th"),
    title_en: str(form, "title_en"),
    issuer: str(form, "issuer"),
    issued_on: str(form, "issued_on"),
    expires_on: str(form, "expires_on"),
    credential_url: str(form, "credential_url"),
    image_path: str(form, "image_path"),
    file_path: str(form, "file_path"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data as CertificateInput;
  const values = {
    title_th: v.title_th,
    title_en: v.title_en,
    issuer: v.issuer,
    issued_on: v.issued_on,
    expires_on: v.expires_on || null,
    credential_url: v.credential_url || null,
    image_path: v.image_path || null,
    file_path: v.file_path || null,
  };
  const id = str(form, "id");

  if (id) {
    const { data: old } = await auth.supabase
      .from("certificates")
      .select("image_path, file_path")
      .eq("id", id)
      .maybeSingle();
    const { error } = await auth.supabase.from("certificates").update(values).eq("id", id);
    if (error) return { ok: false, error: friendlyDbError(error) };
    await removeReplaced(auth.supabase, [
      [old?.image_path, values.image_path],
      [old?.file_path, values.file_path],
    ]);
  } else {
    const { data: last } = await auth.supabase
      .from("certificates")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const sort_order = (last?.[0]?.sort_order ?? -1) + 1;
    const { error } = await auth.supabase.from("certificates").insert({ ...values, sort_order });
    if (error) return { ok: false, error: friendlyDbError(error) };
  }
  revalidatePublic();
  return { ok: true };
}
