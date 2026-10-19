import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createServerClient: vi.fn() }));

import { isAdminResult } from "@/lib/auth/require-admin";

describe("isAdminResult", () => {
  it("passes only with a user id and is_admin === true", () => {
    expect(isAdminResult("u1", true)).toBe(true);
    expect(isAdminResult("u1", false)).toBe(false);
    expect(isAdminResult("u1", null)).toBe(false);
    expect(isAdminResult(undefined, true)).toBe(false);
    expect(isAdminResult(null, true)).toBe(false);
  });
});
