import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/safe-path";

describe("safeRedirectPath", () => {
  it("keeps a same-site path", () => {
    expect(safeRedirectPath("/th/blog/x")).toBe("/th/blog/x");
  });
  it("rejects protocol-relative, backslash, absolute and empty values", () => {
    const bad: (string | null)[] = ["//evil.com", "/" + String.fromCharCode(92) + "evil.com", "https://evil.com", "evil.com", "", null];
    for (const p of bad) expect(safeRedirectPath(p)).toBe("/th");
  });
});
