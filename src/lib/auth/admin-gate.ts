export function isLoginPath(pathname: string): boolean {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

// Pure proxy decision for /admin/** requests.
export function adminGateDecision(input: {
  pathname: string;
  hasUser: boolean;
  isAdmin: boolean | null | undefined;
}): "allow" | "redirect" {
  if (isLoginPath(input.pathname)) return "allow";
  return input.hasUser && input.isAdmin === true ? "allow" : "redirect";
}
