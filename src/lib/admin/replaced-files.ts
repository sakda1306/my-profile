import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v : "";
}

// After a row update succeeds, remove storage files that were replaced or cleared.
// Only storage paths (not http URLs) are removed. A failure is logged, never thrown.
export async function removeReplaced(
  supabase: SupabaseClient<Database>,
  pairs: Array<[old: string | null | undefined, next: string | null | undefined]>,
): Promise<void> {
  const paths = pairs
    .filter(([o, n]) => o && o !== n && !o.startsWith("http"))
    .map(([o]) => o as string);
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from("media").remove(paths);
  if (error) console.error("storage cleanup failed", error.message);
}
