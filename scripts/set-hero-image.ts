// Uploads a local image as the home page poster photo and points profile.hero_image_path at it.
// Usage: npm run hero-image -- <path-to-image.webp|.gif>
// The old poster file (if it was in the media bucket) is removed after the update succeeds.
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { createClient } from "@supabase/supabase-js";

const TYPES: Record<string, string> = { ".webp": "image/webp", ".gif": "image/gif" };

function env(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing ${name}. Set it in .env.local (see .env.example).`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const file = process.argv[2];
  const type = file ? TYPES[extname(file).toLowerCase()] : undefined;
  if (!file || !type) {
    console.error("Usage: npm run hero-image -- <image.webp|image.gif> (the media bucket accepts only these image types).");
    process.exit(1);
  }
  const db = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const old = await db.from("profile").select("hero_image_path").maybeSingle();
  if (old.error) throw new Error(`read profile (did you run \`npx supabase db push\`?): ${old.error.message}`);
  if (!old.data) throw new Error("No profile row yet. Run `npm run seed` first.");

  const path = `profile/${randomUUID()}${extname(file).toLowerCase()}`;
  const up = await db.storage.from("media").upload(path, readFileSync(file), { contentType: type, upsert: false });
  if (up.error) throw new Error(`upload: ${up.error.message}`);

  const upd = await db.from("profile").update({ hero_image_path: path }).eq("id", true);
  if (upd.error) {
    await db.storage.from("media").remove([path]);
    throw new Error(`update profile: ${upd.error.message}`);
  }

  const prev = old.data.hero_image_path;
  if (prev && !/^https?:/.test(prev)) {
    const rm = await db.storage.from("media").remove([prev]);
    if (rm.error) console.warn(`Could not remove the old poster file ${prev}: ${rm.error.message}`);
  }
  console.log(`Poster photo set to ${path}.`);
  console.log("NOTE: delete the .next folder and restart `next dev` / `next start` (and redeploy production) to see it.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : "Setting the poster photo failed");
  process.exit(1);
});
