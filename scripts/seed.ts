// Seeds the initial bilingual content. Usage: npm run seed [-- --force]
//
// Exit codes: 0 = seeded; 1 = error; 2 = profile already exists (nothing changed, pass --force).
// --force never touches the profile row (it is inserted only when none exists).
// --force DELETES AND RECREATES skills, projects and the is_system sections. This discards
// owner edits to the system sections' titles, visibility and order, and cascades away their
// section_items. Custom sections, posts, certificates, the profile and admins are never touched.
import { createClient } from "@supabase/supabase-js";
import { profile, projects, sections, skills } from "./seed-data";

function env(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing ${name}. Set it in .env.local (see .env.example).`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const force = process.argv.includes("--force");
  const db = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const adminEmail = env("ADMIN_EMAIL").toLowerCase();

  const existing = await db.from("profile").select("id").maybeSingle();
  if (existing.error) throw new Error(`read profile: ${existing.error.message}`);
  if (existing.data && !force) {
    console.log("Profile already exists, nothing changed. Use `npm run seed -- --force` to DELETE AND RECREATE skills, projects and system sections (owner edits to them are lost).");
    process.exit(2);
  }

  // 1. admins
  let userId: string | null = null;
  for (let page = 1; !userId; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    userId = data.users.find((u) => u.email?.toLowerCase() === adminEmail)?.id ?? null;
    if (data.users.length < 200) break;
  }
  if (!userId) {
    console.error(`No auth user with email ADMIN_EMAIL found. Create the user in Supabase Auth first.`);
    process.exit(1);
  }
  const a = await db.from("admins").upsert({ user_id: userId }, { onConflict: "user_id" });
  if (a.error) throw new Error(`admins: ${a.error.message}`);

  // 2. profile: only when none exists (never overwritten, not even with --force)
  if (!existing.data) {
    const pr = await db.from("profile").insert({ id: true, ...profile });
    if (pr.error) throw new Error(`profile: ${pr.error.message}`);
  }

  // 3. clear (force only). Deletes AND recreates system sections (owner edits are lost). section_items cascade from sections; project_images from projects.
  if (existing.data) {
    for (const [label, q] of [
      ["skills", db.from("skills").delete().not("id", "is", null)],
      ["projects", db.from("projects").delete().not("id", "is", null)],
      ["system sections", db.from("sections").delete().eq("is_system", true)],
    ] as const) {
      const r = await q;
      if (r.error) throw new Error(`delete ${label}: ${r.error.message}`);
    }
  }

  // 4. system sections, then skills and projects
  const s = await db
    .from("sections")
    .insert(sections.map((x, i) => ({ ...x, is_system: true, sort_order: i, is_visible: true })));
  if (s.error) throw new Error(`sections: ${s.error.message}`);
  const sk = await db.from("skills").insert(skills);
  if (sk.error) throw new Error(`skills: ${sk.error.message}`);
  const pj = await db.from("projects").insert(projects);
  if (pj.error) throw new Error(`projects: ${pj.error.message}`);

  console.log(`Seeded: profile, ${sections.length} sections, ${skills.length} skills, ${projects.length} projects.`);
  console.log("NOTE: the public site keeps persisted use-cache entries in the .next folder. Delete the .next folder, then restart `next dev` / `next start` (and redeploy production) to see the seeded data.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : "Seed failed");
  console.error("If this failed after deleting rows, re-run with `npm run seed -- --force` to recover.");
  process.exit(1);
});
