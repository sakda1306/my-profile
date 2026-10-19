// Copies all site content and media from the dev project to the prod project.
// Usage: npm run copy-to-prod [-- --dry-run]
//
// Reads dev from .env.local and prod from .env.prod.local (service role keys, local only).
// Rows are upserted by id, so running it again overwrites prod rows with dev's version;
// rows that exist only in prod are left alone. Media files are uploaded with upsert.
// Admins are not copied (auth users differ per project): the prod ADMIN_EMAIL user is
// added to prod's admins table instead.
import { readFileSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parse } from "dotenv";

const TABLES = [
  "profile",
  "sections",
  "section_items",
  "skills",
  "projects",
  "project_images",
  "certificates",
  "posts",
] as const;
const BUCKET = "media";

function client(file: string): { db: SupabaseClient; url: string; adminEmail?: string } {
  const env = parse(readFileSync(file));
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(`Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in ${file}.`);
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return { db, url, adminEmail: env.ADMIN_EMAIL?.toLowerCase() };
}

async function listFiles(db: SupabaseClient, prefix = ""): Promise<string[]> {
  const out: string[] = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await db.storage.from(BUCKET).list(prefix, { limit: 100, offset });
    if (error) throw new Error(`list ${prefix || "/"}: ${error.message}`);
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      // Folders come back without an id.
      if (item.id) out.push(path);
      else out.push(...(await listFiles(db, path)));
    }
    if (data.length < 100) return out;
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const dev = client(".env.local");
  const prod = client(".env.prod.local");
  if (dev.url === prod.url) {
    console.error("Dev and prod point at the same project. Check .env.prod.local.");
    process.exit(1);
  }
  console.log(`dev  ${dev.url}\nprod ${prod.url}${dryRun ? "\n(dry run: nothing is written)" : ""}\n`);

  // 1. Tables, parents before children so foreign keys resolve.
  for (const table of TABLES) {
    const { data, error } = await dev.db.from(table).select("*");
    if (error) throw new Error(`read ${table}: ${error.message}`);
    const before = await prod.db.from(table).select("*", { count: "exact", head: true });
    if (before.error) throw new Error(`count prod ${table}: ${before.error.message}`);
    console.log(`${table.padEnd(15)} dev ${String(data.length).padStart(3)}  prod before ${before.count}`);
    if (dryRun || data.length === 0) continue;
    const { error: upErr } = await prod.db.from(table).upsert(data, { onConflict: "id" });
    if (upErr) throw new Error(`write ${table}: ${upErr.message}`);
  }

  // 2. Media files, same paths so the copied rows point at them.
  const files = await listFiles(dev.db);
  console.log(`\nmedia files in dev: ${files.length}`);
  if (!dryRun) {
    for (const path of files) {
      const { data, error } = await dev.db.storage.from(BUCKET).download(path);
      if (error) throw new Error(`download ${path}: ${error.message}`);
      const { error: upErr } = await prod.db.storage
        .from(BUCKET)
        .upload(path, data, { upsert: true, contentType: data.type || undefined });
      if (upErr) throw new Error(`upload ${path}: ${upErr.message}`);
      console.log(`  copied ${path}`);
    }
  }

  // 3. Prod admin: the ADMIN_EMAIL user must already exist in prod's Auth.
  if (!prod.adminEmail) {
    console.log("\nADMIN_EMAIL is not set in .env.prod.local; skipping the admins row.");
    return;
  }
  let userId: string | null = null;
  for (let page = 1; !userId; page++) {
    const { data, error } = await prod.db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    userId = data.users.find((u) => u.email?.toLowerCase() === prod.adminEmail)?.id ?? null;
    if (data.users.length < 200) break;
  }
  if (!userId) {
    console.log("\nNo ADMIN_EMAIL user in prod Auth yet: create it, then run this again to add the admin.");
    return;
  }
  console.log(`\nprod admin user: found`);
  if (!dryRun) {
    const { error } = await prod.db.from("admins").upsert({ user_id: userId }, { onConflict: "user_id" });
    if (error) throw new Error(`admins: ${error.message}`);
    console.log("admins row: added");
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
