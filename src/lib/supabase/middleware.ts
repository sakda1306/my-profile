import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { adminGateDecision, isLoginPath } from "../auth/admin-gate";
import type { Database } from "./database.types";

// Refreshes the Supabase session cookies for /admin/** requests.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Real 307 for signed-out visitors and non-admins (the layout guard can
  // only redirect inside a streamed response, which stays 200).
  let isAdmin: boolean | null = null;
  if (data.user && !isLoginPath(pathname)) {
    const rpc = await supabase.rpc("is_admin");
    isAdmin = rpc.data;
  }
  if (adminGateDecision({ pathname, hasUser: !!data.user, isAdmin }) === "redirect") {
    const redirectResponse = NextResponse.redirect(
      new URL("/admin/login", request.url),
    );
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c));
    return redirectResponse;
  }
  return response;
}
