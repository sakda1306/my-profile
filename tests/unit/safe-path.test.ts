import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/safe-path";

describe("safeRedirectPath", () => {
  it("keeps a same-site path", () => {
    expect(safeRedirectPath("/th/blog/x")).toBe("/th/blog/x");
    expect(safeRedirectPath("/en/blog?tag=a#top")).toBe("/en/blog?tag=a#top");
  });
  it("rejects protocol-relative, backslash, absolute and empty values", () => {
    const bad: (string | null)[] = ["//evil.com", "/" + String.fromCharCode(92) + "evil.com", "https://evil.com", "evil.com", "", null];
    for (const p of bad) expect(safeRedirectPath(p)).toBe("/th");
  });
  it("rejects tab, newline and encoded control characters", () => {
    const bad = [
      "/" + String.fromCharCode(9) + "/evil.com",
      "/" + String.fromCharCode(10) + "/evil.com",
      "/" + String.fromCharCode(13, 10) + "//evil.com",
      "/%09/evil.com",
      "/%0a/evil.com",
      "/th/ x",
    ];
    for (const p of bad) expect(safeRedirectPath(p)).toBe("/th");
  });
});
