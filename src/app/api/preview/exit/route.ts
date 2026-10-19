import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { safeRedirectPath } from "@/lib/safe-path";

export async function GET(request: Request) {
  (await draftMode()).disable();
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(safeRedirectPath(url.searchParams.get("path")), url));
}
