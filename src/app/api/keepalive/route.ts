import { timingSafeEqual } from "node:crypto";
import { createPublicClient } from "@/lib/supabase/public";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Daily ping so the free-tier Supabase project is not paused for inactivity.
export async function GET(request: Request) {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
  const { error } = await createPublicClient().from("profile").select("id").limit(1);
  if (error) {
    console.error("keepalive query failed:", error.message);
    return Response.json({ ok: false }, { status: 500 });
  }
  return Response.json({ ok: true });
}
