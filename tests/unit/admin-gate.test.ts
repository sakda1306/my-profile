import { describe, expect, it } from "vitest";
import { adminGateDecision } from "@/lib/auth/admin-gate";

describe("adminGateDecision", () => {
  it("allows the login path", () => {
    expect(
      adminGateDecision({ pathname: "/admin/login", hasUser: false, isAdmin: null }),
    ).toBe("allow");
  });
  it("redirects when there is no user", () => {
    expect(
      adminGateDecision({ pathname: "/admin", hasUser: false, isAdmin: true }),
    ).toBe("redirect");
  });
  it("redirects a user who is not admin", () => {
    expect(
      adminGateDecision({ pathname: "/admin", hasUser: true, isAdmin: false }),
    ).toBe("redirect");
    expect(
      adminGateDecision({ pathname: "/admin", hasUser: true, isAdmin: null }),
    ).toBe("redirect");
  });
  it("allows an admin", () => {
    expect(
      adminGateDecision({ pathname: "/admin/posts", hasUser: true, isAdmin: true }),
    ).toBe("allow");
  });
  it("does not treat /admin/loginx as the login path", () => {
    expect(
      adminGateDecision({ pathname: "/admin/loginx", hasUser: false, isAdmin: null }),
    ).toBe("redirect");
  });
});
