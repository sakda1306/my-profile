import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/admin/slugify";

describe("slugify", () => {
  it("handles latin", () => expect(slugify("Auto Face Blur!", "project")).toBe("auto-face-blur"));
  it("drops thai", () => expect(slugify("ระบบ RAG ฟุตบอล", "post")).toBe("rag"));
  it("falls back to prefix + random", () =>
    expect(slugify("สวัสดีครับ", "post")).toMatch(/^post-[a-z0-9]{6}$/));
});
