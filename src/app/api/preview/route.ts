import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/auth/require-admin";
import { safeRedirectPath } from "@/lib/safe-path";

// Enables draft mode for the signed-in admin only. Never redirects non-admins.
export async function GET(request: Request) {
  const admin = await checkAdmin();
  if (!admin) return new Response("Unauthorized", { status: 401 });
  const url = new URL(request.url);
  (await draftMode()).enable();
  return NextResponse.redirect(new URL(safeRedirectPath(url.searchParams.get("path")), url));
}
