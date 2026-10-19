"use server";

import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/admin/result";
import { createServerClient } from "@/lib/supabase/server";

const BAD_CREDENTIALS = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: BAD_CREDENTIALS };
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: BAD_CREDENTIALS };
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { ok: false, error: BAD_CREDENTIALS };
  }
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
