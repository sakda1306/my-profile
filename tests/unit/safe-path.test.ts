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

describe("safeRedirectPath normalization", () => {
  it("rejects dot-segment tricks that normalize to a protocol-relative path", () => {
    const bs = String.fromCharCode(92);
    const bad = ["/a/..//evil.com", "/.//evil.com", "/x/%2e%2e//evil.com", "/a/../" + bs + "evil.com"];
    for (const p of bad) expect(safeRedirectPath(p)).toBe("/th");
  });
  it("passes a normal path with query and hash unchanged", () => {
    expect(safeRedirectPath("/th/blog/x?y=1#z")).toBe("/th/blog/x?y=1#z");
  });
});
