import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export const RELOGIN_MESSAGE = "กรุณาล็อกอินใหม่";

type AdminContext = { supabase: SupabaseClient<Database>; userId: string };

// Pure decision: only a real user id plus an explicit `true` from is_admin passes.
export function isAdminResult(
  userId: string | null | undefined,
  isAdmin: boolean | null | undefined,
): userId is string {
  return Boolean(userId) && isAdmin === true;
}

// Non-redirecting check, for route handlers that must answer 401 themselves.
export async function checkAdmin(): Promise<AdminContext | null> {
  const supabase = await createServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdminResult(userId, isAdmin)) return null;
  return { supabase, userId };
}

// For pages and layouts: redirects to the login page when not an admin.
export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await checkAdmin();
  if (!ctx) redirect("/admin/login");
  return ctx;
}

// For server actions: returns an error instead of throwing.
export async function requireAdminAction(): Promise<
  AdminContext | { error: string }
> {
  return (await checkAdmin()) ?? { error: RELOGIN_MESSAGE };
}
