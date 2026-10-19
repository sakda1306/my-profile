import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

config({ path: ".env.local", quiet: true });

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env.local`);
  return v;
}

const url = env("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const opts = { auth: { persistSession: false, autoRefreshToken: false } };

export function createAnonClient(): SupabaseClient {
  return createClient(url, anonKey, opts);
}

// Service role: tests only (fixtures and the admins row). Never used in src/.
export function createServiceClient(): SupabaseClient {
  return createClient(url, env("SUPABASE_SERVICE_ROLE_KEY"), opts);
}

/** Signs in the owner's test admin account and makes sure it is in `admins`. */
export async function createAdminClient(): Promise<SupabaseClient> {
  const client = createClient(url, anonKey, opts);
  const { data, error } = await client.auth.signInWithPassword({
    email: env("TEST_ADMIN_EMAIL"),
    password: env("TEST_ADMIN_PASSWORD"),
  });
  if (error || !data.user) {
    throw new Error(`Test admin sign-in failed: ${error?.message ?? "no user"}`);
  }
  const { error: upsertError } = await createServiceClient()
    .from("admins")
    .upsert({ user_id: data.user.id }, { onConflict: "user_id" });
  if (upsertError) throw new Error(`Cannot ensure admins row: ${upsertError.message}`);
  return client;
}
