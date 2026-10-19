import { describe, expect, it } from "vitest";
import { z } from "zod";
import { atLeastOne, bilingual, friendlyDbError, withBilingual } from "@/lib/admin/bilingual";

const schema = z
  .object(bilingual("title", { max: 100 }))
  .superRefine(atLeastOne("title"));

describe("bilingual", () => {
  it("rejects both empty", () =>
    expect(schema.safeParse({ title_th: "", title_en: " " }).error?.issues[0].message).toBe(
      "กรอกอย่างน้อยหนึ่งภาษา",
    ));
  it("accepts one language", () =>
    expect(schema.safeParse({ title_th: "ก", title_en: "" }).success).toBe(true));
  it("friendlyDbError", () => {
    expect(friendlyDbError({ code: "23505" })).toBe("slug หรือค่านี้ถูกใช้แล้ว");
    expect(friendlyDbError({ code: "x" })).toBe("บันทึกไม่สำเร็จ ลองอีกครั้ง");
  });

  it("combined schema: required title + optional summary + other fields", () => {
    const combined = withBilingual({ slug: z.string(), url: z.string() }, [
      { name: "title", required: true, max: 100 },
      { name: "summary", required: false, max: 400 },
    ]);
    const ok = { slug: "a", url: "", title_th: "", title_en: "x", summary_th: "", summary_en: "" };
    expect(combined.safeParse(ok).success).toBe(true);
    const bad = combined.safeParse({ ...ok, title_en: "" });
    expect(bad.error?.issues[0].message).toBe("กรอกอย่างน้อยหนึ่งภาษา");
    expect(bad.error?.issues[0].path).toEqual(["title_th"]);
    expect(combined.safeParse({ ...ok, title_en: "x", summary_en: "" }).success).toBe(true);
  });
});
