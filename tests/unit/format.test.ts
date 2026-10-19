import { describe, expect, it } from "vitest";
import { formatDate, formatRange, safeHref } from "@/lib/content/format";

describe("safeHref", () => {
  it("allows http, https and mailto", () => {
    expect(safeHref("https://a.com")).toBe("https://a.com");
    expect(safeHref("mailto:a@b.com")).toBe("mailto:a@b.com");
  });
  it("rejects other schemes and junk", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("not a url")).toBeNull();
    expect(safeHref(null)).toBeNull();
  });
});

describe("dates", () => {
  it("returns empty for missing or invalid dates", () => {
    expect(formatDate(null, "en")).toBe("");
    expect(formatDate("nope", "en")).toBe("");
  });
  it("formats a range with an open end", () => {
    expect(formatRange("2024-01-15", null, "en", "Present")).toContain("Present");
    expect(formatRange(null, null, "en", "Present")).toBe("");
  });
});
